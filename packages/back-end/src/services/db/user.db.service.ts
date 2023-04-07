import { Injectable } from "@nestjs/common";
import { Document } from "mongodb";
import { UserBaseInfo, User } from "../../modules/auth/services";
import { userCollection } from "./db";
import { checkType, ExceptTypeMap, checkFx, optional } from "@asnc/tslib/lib/std/type_check";

@Injectable()
export class UserService {
    async getUser(id: string): Promise<null | User> {
        let resList = await userCollection
            .aggregate()
            .match({ _id: id })
            .limit(1)
            .project<UserBaseInfo>({ _id: 0 })
            .toArray();
        let userInfo = resList[0];
        if (!userInfo) return null;
        return new User(id, userInfo);
    }
    async removeUser(id: string) {
        await userCollection.deleteOne({ _id: id } as Document);
    }
    async createUser(id: string, userInfo: UserBaseInfo) {
        {
            let res = checkType(userInfo, userInfoExceptType);
            if (res) throw new Error("参数校验不通过", { cause: res });
        }
        let dbDoc = { _id: id, ...userInfo } as Document;
        await userCollection.insertOne(dbDoc);
    }
    async updateUser(id: string, userInfo: Partial<UserBaseInfo>) {
        if (Object.keys(userInfo).length === 0) throw new Error("用户信息不能为空");
        {
            let res = checkType(userInfo, userUpdateExceptType);
            if (res) throw new Error("参数校验不通过", { cause: res });
        }
        await userCollection.updateOne({ _id: id } as any, { $set: userInfo });
    }
}

let userInfoExceptType: ExceptTypeMap = {
    password: "string",
    name: "string",
    groupIds: optional(checkFx.arrayType("string")),
    roleIds: optional(checkFx.arrayType("string")),
    permissions: optional(checkFx.arrayType("string")),
};

let userUpdateExceptType: ExceptTypeMap = { ...userInfoExceptType, password: optional.string, name: optional.string };
