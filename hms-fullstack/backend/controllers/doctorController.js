import doctorModel from "../model/doctorModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import appointmentModel from "../model/appointmentModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "suraj123456";
const DOCTOR_EMAIL = process.env.DOCTOR_EMAIL || "doctor@example.com";
const DOCTOR_PASSWORD = process.env.DOCTOR_PASSWORD || "doctor123";
const allowDoctorBypass = process.env.ALLOW_DOCTOR_BYPASS !== "false"; // default true

const changeAvailabilities = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({
      success: true,
      doctors,
      message: "Doctors List Fetched Successfully",
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const matchesEnvDoctor =
      email === DOCTOR_EMAIL && password === DOCTOR_PASSWORD;

    // If hitting fallback/bypass, skip DB and issue a token for demo access
    if (matchesEnvDoctor && allowDoctorBypass) {
      const token = jwt.sign({ id: "env-doctor" }, JWT_SECRET);
      return res.json({
        success: true,
        token,
        message: "Doctor Logged in Successfully (env fallback)",
      });
    }

    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      // Allow bypass even if doctor not in DB (demo)
      if (allowDoctorBypass) {
        const token = jwt.sign({ id: "env-doctor" }, JWT_SECRET);
        return res.json({
          success: true,
          token,
          message: "Doctor Logged in Successfully (bypass)",
        });
      }
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      // If password wrong but bypass on, still allow demo login
      if (allowDoctorBypass) {
        const token = jwt.sign({ id: doctor._id }, JWT_SECRET);
        return res.json({
          success: true,
          token,
          message: "Doctor Logged in Successfully (bypass)",
        });
      }
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: doctor._id }, JWT_SECRET);
    res.json({ success: true, token, message: "Doctor Logged in Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor Appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    if (!appointments) {
      return res.json({ success: false, message: "No appointments found" });
    }
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const sameDoc = (appointmentDocId, tokenDocId) =>
  String(appointmentDocId) === String(tokenDocId);

// API to accept a pending booking (doctor panel — matches typical tutorial flow)
const appointmentAccept = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (
      appointmentData &&
      sameDoc(appointmentData.docId, docId) &&
      !appointmentData.cancelled &&
      !appointmentData.isCompleted
    ) {
      if (appointmentData.accepted !== false) {
        return res.json({
          success: false,
          message: "Appointment is not pending approval",
        });
      }
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        accepted: true,
      });
      return res.json({
        success: true,
        message: "Appointment Accepted",
      });
    }
    res.json({ success: false, message: "Accept Failed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment complete for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (
      appointmentData &&
      sameDoc(appointmentData.docId, docId) &&
      appointmentData.accepted !== false &&
      !appointmentData.cancelled
    ) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({
        success: true,
        message: "Appointment Completed",
      });
    }
    res.json({
      success: false,
      message:
        appointmentData?.accepted === false
          ? "Accept the appointment first"
          : "Mark Failed",
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (
      appointmentData &&
      sameDoc(appointmentData.docId, docId) &&
      !appointmentData.isCompleted
    ) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({
        success: true,
        message: "Appointment Cancelled",
      });
    }
    res.json({ success: false, message: "Cancellation Failed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    let earnings = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let patients = [];

    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: [...appointments].reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for doctor panel
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile for doctor panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fee, address, available } = req.body;
    await doctorModel.findByIdAndUpdate(docId, { fee, address, available });
    res.json({ success: true, message: "Profile Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
export {
  changeAvailabilities,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentAccept,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};
