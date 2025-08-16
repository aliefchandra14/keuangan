import { toast } from "react-toastify";

export const alertSuccess = (msg) => {
  return toast.success(msg);
};
export const alertError = (msg) => {
  return toast.error(msg);
};