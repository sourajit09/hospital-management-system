import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  getApiBaseUrl,
  adminAuthHeaders,
  axiosErrorMessage,
} from "../apiBase.js";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const backendUrl = getApiBaseUrl();

  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/all-doctors`,
        {},
        { headers: adminAuthHeaders(aToken) }
      );
      if (data.success) {
        setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
      } else {
        console.error(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(axiosErrorMessage(error));
    }
  };

  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/change-availability`,
        { docId: String(docId) },
        { headers: adminAuthHeaders(aToken) }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        console.error(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(axiosErrorMessage(error));
    }
  };

  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/admin/appointments`,
        {
          headers: adminAuthHeaders(aToken),
        }
      );
      if (data.success) {
        setAppointments(
          Array.isArray(data.appointments) ? data.appointments : []
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(axiosErrorMessage(error));
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: adminAuthHeaders(aToken),
      });
      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(axiosErrorMessage(error));
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/admin/cancel-appointments`,
        { appointmentId },
        { headers: adminAuthHeaders(aToken) }
      );
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(axiosErrorMessage(error));
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    setDoctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    getDashData,
    dashData,
  };
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
