import { message } from "antd";
import axios, { AxiosError, AxiosResponse } from "axios";
import { navigate } from "@/utils/global-navigate";

class LocalStore {
  constructor() {}
  get accessToken() {
    return localStorage.getItem("accessToken") ?? "";
  }
  get userId() {
    return localStorage.getItem("userId") ?? null;
  }
  setToken(id: string, token: string) {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userId", id);
  }
  clearToken() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
  }
}
export const $localStore = new LocalStore();

export const $http = axios.create();
$http.interceptors.request.use(function (config) {
  config.headers.set("access-token", $localStore.accessToken);
  return config;
});
$http.interceptors.response.use(undefined, function (error: AxiosError<any>) {
  let response:
    | AxiosResponse<{ report?: boolean; message?: string }>
    | undefined = error.response;
  if (response) {
    let errData = response.data;
    if (response.status === 401) {
      if (errData.message === "jwt expired") {
        navigate("/login");
      } else message.error("权限不足");
    }
    if (errData.report && errData.message) message.error(errData.message);
  }

  return Promise.reject(error);
});
