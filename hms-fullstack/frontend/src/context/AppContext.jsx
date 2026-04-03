import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getApiBaseUrl, axiosErrorMessage } from "../apiBase.js";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") ?? false);
  const [userData, setUserData] = useState(false);

  const backendUrl = getApiBaseUrl();
  const currencySymbol =
    import.meta.env.VITE_CURRENCY_SYMBOL ||
    (import.meta.env.VITE_BACKEND_URL ? "₹" : "$");

  const getDoctorsData = async () => {
    setDoctorsLoading(true);
    setDoctorsError(null);
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
      } else {
        console.error(data.message);
        toast.error(data.message || "Could not load doctors");
        setDoctors([]);
      }
    } catch (error) {
      console.error(error);
      const msg = axiosErrorMessage(error);
      toast.error(msg);
      setDoctorsError(msg);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: { token },
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message || "Session expired, please login again");
        localStorage.removeItem("token");
        setToken(false);
        setUserData(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Session expired, please login again"
      );
      localStorage.removeItem("token");
      setToken(false);
      setUserData(false);
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
    } else {
      setUserData(false);
    }
  }, [token]);

  const value = {
    doctors,
    doctorsLoading,
    doctorsError,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    setUserData,
    loadUserProfileData,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
