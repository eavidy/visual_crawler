import axios from "axios";

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
