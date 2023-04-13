import { $http } from "@/http";
import { createPwdHash } from "@/pages/login/funcs/pwd_hash";
import { ApiReq, ApiRes } from "common/request/auth/user";
class UserResource {
    async getUserList() {
        const { data } = await $http.get<{ items: ApiRes.GetUserList[]; total: number }>("/auth/user/list");

        return data;
    }
    async deleteUsers(id: string) {
        // const query = "id=" + idList.join("&id=");
        return $http.delete("/auth/user", { params: { id } });
    }
    async createUser(info: ApiReq.CreateUser) {
        info.pwd = createPwdHash(info.pwd);
        return $http.put("/auth/user", info);
    }
}

export const userResource = new UserResource();
