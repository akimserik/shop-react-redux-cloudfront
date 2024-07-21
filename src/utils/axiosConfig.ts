import axios from "axios";

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      alert("Unauthorized! Please check your credentials.");
    } else if (error.response.status === 403) {
      alert("Forbidden! You do not have permission to access this resource.");
    } else {
      console.error("Unhandled error!");
    }
    return Promise.reject(new Error(error));
  }
);

export default axiosInstance;
