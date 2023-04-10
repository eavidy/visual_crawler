import axios, { AxiosError } from "axios";
import { message } from "antd";

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

export const $http = axios.create({});
$http.interceptors.request.use(function (config) {
    config.headers.set("access-token", $localStore.accessToken);
    return config;
});
$http.interceptors.response.use(undefined, function (error: AxiosError<any>) {
    if (error.response?.status === 401) {
        if (error.response.data?.message === "jwt expired") {
            // message.error("身份认证已过期");
            location.href = "/v/login";
        } else message.error("权限不足");
    }
    return Promise.reject(error);
});
