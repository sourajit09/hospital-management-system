import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

/** New bookings: accepted === false. Legacy rows without field: treat as already confirmed. */
const isPendingApproval = (item) =>
  item.accepted === false && !item.cancelled && !item.isCompleted;

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    acceptAppointment,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    dToken && getAppointments();
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <p className="mb-4 text-sm text-gray-500 max-w-2xl">
        New patient bookings appear as <span className="font-medium text-amber-700">Pending</span>.
        Use <span className="font-medium">Accept</span> to confirm the request, or{" "}
        <span className="font-medium">Decline</span> to cancel. After acceptance, use{" "}
        <span className="font-medium">Complete</span> when the visit is done.
      </p>
      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll min-h-[50vh]">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_3fr_1fr_1.2fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Status</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fee</p>
          <p>Action</p>
        </div>
        {appointments.slice().reverse().map((item, index) => (
          <div
            key={item._id || index}
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_1fr_3fr_1fr_1.2fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item.userData.image}
                alt=""
              />
              <p>{item.userData.name}</p>
            </div>
            <div>
              {item.cancelled ? (
                <span className="text-xs text-red-500 font-medium">Cancelled</span>
              ) : item.isCompleted ? (
                <span className="text-xs text-green-600 font-medium">Completed</span>
              ) : isPendingApproval(item) ? (
                <span className="text-xs text-amber-600 font-medium">Pending</span>
              ) : (
                <span className="text-xs text-blue-600 font-medium">Confirmed</span>
              )}
            </div>
            <div>
              <p className="text-sm inline border border-primary px-2 rounded-full">
                {item.payment ? "Online" : "Cash"}
              </p>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <p>
              {currency}
              {item.amount}
            </p>
            {item.cancelled ? (
              <p className="text-red-400 text-sm font-medium">—</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 text-sm font-medium">—</p>
            ) : isPendingApproval(item) ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-medium hover:bg-green-700"
                  onClick={() => acceptAppointment(item._id)}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50"
                  onClick={() => cancelAppointment(item._id)}
                >
                  Decline
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <img
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt="Cancel appointment"
                  title="Cancel"
                  onClick={() => cancelAppointment(item._id)}
                />
                <img
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt="Mark complete"
                  title="Complete visit"
                  onClick={() => completeAppointment(item._id)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
