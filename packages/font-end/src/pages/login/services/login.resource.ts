import { $http } from "@/http/index.ts";
import type { ApiReq, ApiRes } from "common/request/login.d.ts";

class LoginResource {
  async login(params: ApiReq.Login) {
    const { data } = await $http.post<ApiRes.Login>("/auth/login", params);
    return data;
  }
  async getVisitor() {
    const { data } = await $http.get<ApiRes.Visitor>("/auth/visitor");
    return data;
  }
}

export const loginResource = new LoginResource();
