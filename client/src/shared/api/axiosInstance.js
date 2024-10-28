import axios from "axios";
import { baseURL } from "../constants/misc";

const axiosInstance = axios.create({
  baseURL: baseURL,
});

export default axiosInstance;
