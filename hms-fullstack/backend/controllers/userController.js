import validator from "validator";
import bcrypt from "bcryptjs";
import userModel from "../model/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../model/doctorModel.js";
import appointmentModel from "../model/appointmentModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const currency = process.env.CURRENCY || "INR";
const JWT_SECRET = process.env.JWT_SECRET || "suraj123456";


// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaing that any fields are not empty
    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Vlaidating Email Format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Validating Password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password should be at least 8 characters long",
      });
    }

    // Check if user already exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hashing User Password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user.id }, JWT_SECRET);
      res.json({ success: true, message: "User Login successfully", token });
    } else {
      res.json({ success: false, message: "Incorrect Password" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get User Profile Data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update User Profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Some Data are Missing" });
    }
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // Upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }
    res.json({ success: true, message: "Profile Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book Appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor is not available for Appointment",
      });
    }
    let slots_booked = docData.slots_booked;

    // checking for slots availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slot is not available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: docData.fee,
      date: new Date().getTime(),
      accepted: false,
    };
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({
      success: true,
      message: "Appointment booked",
      appointmentId: newAppointment._id.toString(),
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get User Appointments for My Appointments Page
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel Appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    // Verify that the appointment is booked by this user
    if (String(appointmentData.userId) !== String(userId)) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // Releesing doctors slot
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Lazy Razorpay instance creator to avoid crashing server when keys are missing
const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    return null;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// API to expose public Razorpay key to authenticated clients
const getRazorpayKey = async (req, res) => {
  try {
    const key = process.env.RAZORPAY_KEY_ID?.trim();
    if (!key) {
      return res.json({
        success: false,
        message: "Razorpay key is not configured in backend .env",
      });
    }
    res.json({ success: true, key });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to create Razorpay order for an appointment
const paymentRazorpay = async (req, res) => {
  try {
    const razorpayInstance = getRazorpay();
    if (!razorpayInstance) {
      return res.json({
        success: false,
        message: "Payment gateway not configured. Add Razorpay keys in backend .env",
      });
    }

    const { userId, appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }
    if (String(appointment.userId) !== String(userId)) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }
    if (appointment.cancelled) {
      return res.json({
        success: false,
        message: "Appointment already cancelled",
      });
    }
    if (appointment.payment) {
      return res.json({ success: false, message: "Already paid" });
    }
    if (appointment.isCompleted) {
      return res.json({
        success: false,
        message: "Cannot pay for a completed appointment",
      });
    }

    const options = {
      amount: Math.round(appointment.amount * 100), // convert to paise
      currency,
      receipt: `appointment_${appointmentId}`,
      notes: {
        userId,
        docId: appointment.docId,
        slotDate: appointment.slotDate,
        slotTime: appointment.slotTime,
      },
    };

    const order = await razorpayInstance.orders.create(options);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      razorpayOrderId: order.id,
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify Razorpay payment signature
const verifyRazorpay = async (req, res) => {
  try {
    const razorpayInstance = getRazorpay();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!razorpayInstance || !keySecret) {
      return res.json({
        success: false,
        message: "Payment gateway not configured. Add Razorpay keys in backend .env",
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const { userId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.json({
        success: false,
        message: "Missing Razorpay response fields",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false, message: "Payment verification failed" });
    }

    const appointment = await appointmentModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found for this order" });
    }
    if (String(appointment.userId) !== String(userId)) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }
    if (appointment.payment) {
      return res.json({ success: true, message: "Payment already recorded" });
    }

    await appointmentModel.findByIdAndUpdate(appointment._id, {
      payment: true,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      razorpayOrderId: razorpay_order_id,
    });

    res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  getRazorpayKey,
};
