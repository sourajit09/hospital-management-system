import React, { useContext, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";

const SPECIALITIES = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
];

function normalizeSpecialityParam(raw) {
  if (raw == null || raw === "") return null;
  try {
    return decodeURIComponent(String(raw).replace(/\+/g, " ")).trim();
  } catch {
    return String(raw).trim();
  }
}

const Doctors = () => {
  const { speciality: specialityParam } = useParams();
  const speciality = normalizeSpecialityParam(specialityParam);

  const {
    doctors,
    doctorsLoading,
    doctorsError,
    getDoctorsData,
  } = useContext(AppContext);
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);

  const filteredDoctors = useMemo(() => {
    if (!doctors.length) return [];
    if (!speciality) return doctors;
    const s = speciality.toLowerCase();
    return doctors.filter(
      (doc) => (doc.speciality || "").toLowerCase() === s
    );
  }, [doctors, speciality]);

  const goSpeciality = (label) => {
    const isActive =
      speciality && speciality.toLowerCase() === label.toLowerCase();
    if (isActive) {
      navigate("/doctors");
    } else {
      navigate(`/doctors/${encodeURIComponent(label)}`);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-gray-600">
          Browse through the doctors specialist.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/doctors")}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !speciality
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-700 border-gray-300 hover:border-primary"
            }`}
          >
            All doctors
          </button>
        </div>
      </div>

      {doctorsLoading && (
        <p className="mt-6 text-gray-500 text-sm">Loading doctors…</p>
      )}

      {!doctorsLoading && doctorsError && (
        <div className="mt-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm">
          <p className="font-medium">Could not load doctors</p>
          <p className="mt-1">{doctorsError}</p>
          <button
            type="button"
            className="mt-3 px-4 py-2 bg-primary text-white rounded-full text-sm"
            onClick={() => getDoctorsData()}
          >
            Retry
          </button>
        </div>
      )}

      {!doctorsLoading && !doctorsError && doctors.length === 0 && (
        <p className="mt-6 text-gray-500 text-sm">
          No doctors are registered yet. Add doctors from the admin panel
          (localhost admin usually runs on port 5174).
        </p>
      )}

      {!doctorsLoading && !doctorsError && doctors.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
          <button
            className={`py-1 p-3 border rounded text-md transition-all sm:hidden ${
              showFilter ? "bg-primary text-white" : ""
            }`}
            type="button"
            onClick={() => setShowFilter((prev) => !prev)}
          >
            Filters
          </button>
          <div
            className={`flex-col gap-4 text-sm text-gray-600 ${
              showFilter ? "flex" : "hidden sm:flex"
            }`}
          >
            {SPECIALITIES.map((label) => {
              const active =
                speciality &&
                speciality.toLowerCase() === label.toLowerCase();
              return (
                <p
                  key={label}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      goSpeciality(label);
                  }}
                  onClick={() => goSpeciality(label)}
                  className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
                    active ? "bg-indigo-100 text-black" : ""
                  }`}
                >
                  {label}
                </p>
              );
            })}
          </div>
          <div className="w-full grid grid-cols-auto gap-4 gap-y-6">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg p-6">
                {speciality ? (
                  <>
                    No doctors found for{" "}
                    <span className="font-medium text-gray-700">
                      {speciality}
                    </span>
                    . Try another speciality or view{" "}
                    <button
                      type="button"
                      className="text-primary underline"
                      onClick={() => navigate("/doctors")}
                    >
                      all doctors
                    </button>
                    .
                  </>
                ) : (
                  "No doctors to display."
                )}
              </div>
            ) : (
              filteredDoctors.map((item) => (
                <div
                  key={item._id || item.id}
                  className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
                  onClick={() => navigate(`/appointment/${item._id}`)}
                >
                  <img
                    className="bg-blue-50 w-full aspect-[4/3] object-cover"
                    src={item.image}
                    alt=""
                  />
                  <div className="p-4">
                    <div
                      className={`flex items-center gap-2 text-sm text-center ${
                        item.available ? "text-green-500" : "text-gray-500"
                      }`}
                    >
                      <p
                        className={`w-2 h-2 ${
                          item.available ? "bg-green-500" : "bg-gray-500"
                        } rounded-full`}
                      />
                      <p>
                        {item.available ? "Available" : "Not Available"}
                      </p>
                    </div>
                    <p className="text-gray-900 text-lg font-medium">
                      {item.name}
                    </p>
                    <p className="text-gray-600 text-sm">{item.speciality}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
