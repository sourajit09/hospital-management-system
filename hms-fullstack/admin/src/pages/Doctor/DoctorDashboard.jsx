import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const isPendingApproval = (item) =>
  item.accepted === false && !item.cancelled && !item.isCompleted;

const DoctorDashboard = () => {
  const {
    getDashData,
    dashData,
    dToken,
    acceptAppointment,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);
  const { slotDateFormat, currency } = useContext(AppContext);
  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);
  return (
    dashData && (
      <div className="m-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.earning_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {currency} {dashData.earnings}
              </p>
              <p className="text-gray-400">Earnings</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.appointments_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.appointments}
              </p>
              <p className="text-gray-400">Appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all">
            <img className="w-14" src={assets.patients_icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">
                {dashData.patients}
              </p>
              <p className="text-gray-400">Patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
            <img src={assets.list_icon} alt="" />
            <p className="font-semibold">Latest Bookings</p>
          </div>
          <div className="pt-4 border border-t-0">
            {dashData.latestAppointments.length !== 0 ? (
              dashData.latestAppointments.map((item, index) => (
                <div
                  className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100 flex-wrap"
                  key={item._id || index}
                >
                  <img
                    className="rounded-full w-10"
                    src={item.userData.image}
                    alt=""
                  />
                  <div className="flex-1 text-sm min-w-[140px]">
                    <p className="text-gray-800 font-medium">
                      {item.userData.name}
                    </p>
                    <p className="text-gray-600">
                      {slotDateFormat(item.slotDate)} ,{item.slotTime}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 w-20">
                    {item.cancelled ? (
                      <span className="text-red-500">Cancelled</span>
                    ) : item.isCompleted ? (
                      <span className="text-green-600">Done</span>
                    ) : isPendingApproval(item) ? (
                      <span className="text-amber-600">Pending</span>
                    ) : (
                      <span className="text-blue-600">Confirmed</span>
                    )}
                  </div>
                  {item.cancelled ? (
                    <p className="text-red-400 text-sm font-medium">—</p>
                  ) : item.isCompleted ? (
                    <p className="text-green-500 text-sm font-medium">—</p>
                  ) : isPendingApproval(item) ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-2 py-1 rounded bg-green-600 text-white text-xs"
                        onClick={() => acceptAppointment(item._id)}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded border border-red-300 text-red-600 text-xs"
                        onClick={() => cancelAppointment(item._id)}
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <div className="flex">
                      <img
                        className="w-10 cursor-pointer"
                        src={assets.cancel_icon}
                        alt=""
                        onClick={() => cancelAppointment(item._id)}
                      />
                      <img
                        className="w-10 cursor-pointer"
                        src={assets.tick_icon}
                        alt=""
                        onClick={() => completeAppointment(item._id)}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100">
                <h1 className="text-xl font-semibold text-red-500">
                  No Appointments Booked
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorDashboard;
