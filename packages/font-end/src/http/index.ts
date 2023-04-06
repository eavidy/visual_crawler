import axios from "axios";

class LocalStore {
    constructor() {}
    get accessToken() {
        return localStorage.getItem("accessToken") ?? "";
    }
    set accessToken(val: string) {
        localStorage.setItem("accessToken", val);
    }
}
export const $localStore = new LocalStore();

export const $http = axios.create({});
$http.interceptors.request.use(function (config) {
    config.headers.set("access-token", $localStore.accessToken);
    return config;
});
