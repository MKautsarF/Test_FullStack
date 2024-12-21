import axios from "axios";

const services = axios.create({
  baseURL: "http://localhost:8080",
});
export default services;
