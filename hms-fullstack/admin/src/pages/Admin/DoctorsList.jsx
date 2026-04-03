import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } =
    useContext(AdminContext);
  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-2xl font-medium">All Doctors</h1>
      <div className="flex flex-wrap w-full gap-4 pt-5 gap-y-6">
        {doctors.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No doctors found. Add a doctor from the &quot;Add Doctor&quot; page,
            or check that the API is running and you are logged in as admin.
          </p>
        ) : (
          doctors.map((item) => {
            const id = String(item._id ?? item.id);
            return (
              <div
                className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer"
                key={id}
              >
                <img
                  className="bg-indigo-50 hover:bg-primary transition-all duration-500 w-full aspect-square object-cover"
                  src={item.image}
                  alt=""
                />
                <div className="p-4">
                  <p className="text-neutral-800 text-lg font-medium">
                    {item.name}
                  </p>
                  <p className="text-zinc-600 text-sm">{item.speciality}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(item.available)}
                      onChange={() => changeAvailability(id)}
                      id={`available${id}`}
                    />
                    <label htmlFor={`available${id}`}>Available</label>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
