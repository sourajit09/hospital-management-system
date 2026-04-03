import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { axiosErrorMessage } from "../apiBase.js";
import {
  fetchRazorpayKeyId,
  startAppointmentPayment,
} from "../utils/razorpayClient.js";

const MyAppointments = () => {
  const { token, backendUrl, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [razorpayKeyId, setRazorpayKeyId] = useState(
    import.meta.env.VITE_RAZORPAY_KEY_ID?.trim() || ""
  );
  const navigate = useNavigate();
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return dateArray[0] + " " + months[dateArray[1]] + " " + dateArray[2];
  };

  const getUsersAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });
      if (data.success) {
        setAppointments(
          Array.isArray(data.appointments) ? [...data.appointments].reverse() : []
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(axiosErrorMessage(error));
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUsersAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(axiosErrorMessage(error));
    }
  };

  const runPayment = async (appointmentId) => {
    await startAppointmentPayment({
      appointmentId,
      token,
      backendUrl,
      keyId: razorpayKeyId,
      loadKey: async () => {
        const k = await fetchRazorpayKeyId(backendUrl, token);
        setRazorpayKeyId(k);
        return k;
      },
      onPaid: () => {
        getUsersAppointments();
        toast.success("Payment successful");
      },
      onError: (err) => {
        const msg = err?.message || "";
        if (msg.includes("closed") || msg.includes("window")) return;
        toast.error(msg || "Payment failed");
      },
    });
  };

  useEffect(() => {
    if (token) {
      getUsersAppointments();
      getDoctorsData();
      fetchRazorpayKeyId(backendUrl, token)
        .then((k) => setRazorpayKeyId(k))
        .catch(() => {
          /* optional: payments not configured */
        });
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zin-700 border-b">
        My Appointments
      </p>
      <p className="text-sm text-gray-500 mt-2 max-w-xl">
        Pay the doctor consultation fee online with Razorpay (configure{" "}
        <code className="text-xs bg-gray-100 px-1 rounded">RAZORPAY_KEY_ID</code>{" "}
        and{" "}
        <code className="text-xs bg-gray-100 px-1 rounded">
          RAZORPAY_KEY_SECRET
        </code>{" "}
        in the backend <code className="text-xs">.env</code>). You can pay
        anytime before the visit is completed.
      </p>
      <div>
        {appointments.length !== 0 ? (
          appointments.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={item._id || index}
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={item.docData.image}
                  alt=""
                />
              </div>
              <div className="flex-1 text-md text-zinc-600">
                <p className="font-medium text-neutral-800">
                  {item.docData.name}
                </p>
                <p>{item.docData.speciality}</p>
                <p className="font-semibold text-zinc-700 mt-1">Address:</p>
                <p className="text-sm">{item.docData.address.line1}</p>
                <p className="text-sm">{item.docData.address.line2}</p>
                <p className="text-sm mt-1">
                  <span className="text-md text-neutral-700 font-medium">
                    Date & Time:
                  </span>{" "}
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
                {item.accepted === false &&
                  !item.cancelled &&
                  !item.isCompleted && (
                    <p className="text-sm mt-2 text-amber-700 font-medium">
                      Awaiting doctor approval (you can still pay the fee
                      below).
                    </p>
                  )}
              </div>
              <div></div>
              <div className="flex flex-col gap-2 justify-end">
                {!item.cancelled &&
                  item.payment &&
                  !item.isCompleted && (
                  <button
                    type="button"
                    className="sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50 cursor-auto"
                  >
                    Paid online
                  </button>
                )}
                {!item.cancelled && !item.payment && !item.isCompleted && (
                  <button
                    type="button"
                    onClick={() => runPayment(item._id)}
                    className="text-md text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Pay online (Razorpay)
                  </button>
                )}
                {!item.cancelled && !item.isCompleted && (
                  <button
                    type="button"
                    onClick={() => cancelAppointment(item._id)}
                    disabled={Boolean(item.payment)}
                    className={`text-md text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300 ${
                      item.payment ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Cancel Appointment
                  </button>
                )}
                {item.cancelled && !item.isCompleted && (
                  <button
                    type="button"
                    className="sm:min-w-48 py-2 border border-red-500  rounded text-red-500 cursor-not-allowed"
                  >
                    Appointment Cancelled
                  </button>
                )}
                {item.isCompleted && (
                  <button
                    type="button"
                    className="sm:min-w-48 py-2 border border-green-500  rounded text-green-500 cursor-not-allowed"
                  >
                    Appointment Completed
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div>
            <div className="text-center text-2xl text-zinc-600 mt-4">
              No appointments found.
            </div>
            <div className="flex text-center sm:flex-col flex-row">
              <p className="mt-4 text-indigo-600 text-xl">
                Please Book an Appointment
              </p>
              <div>
                <button
                  className="mt-4 border py-4 px-6 rounded bg-primary text-white"
                  onClick={() => navigate("/doctors")}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
