import { Injectable } from "@nestjs/common";
import { Document, WithId } from "mongodb";
import { UserBaseInfo, User, Permission } from "../../modules/auth/services/index.js";
import { userCollection } from "./db.js";
import { checkType, ExceptType, typeChecker } from "evlib";
const { optional } = typeChecker;

@Injectable()
export class UserService {
  async getUserList() {
    const data = await userCollection
      .aggregate([{ $match: {} }])
      .project<WithId<{ name: string }>>({
        name: 1,
        permissions: 1,
      })
      .toArray();
    return data;
  }
  async getUser(id: string): Promise<null | User> {
    let resList = await userCollection
      .aggregate()
      .match({ _id: id })
      .limit(1)
      .project<UserBaseInfo>({ _id: 0, name: 1, permissions: 1, password: 1 })
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
      let res = checkType(userInfo, userInfoExceptType).error;
      if (res) throw new Error("参数校验不通过", { cause: res });
    }
    let dbDoc = { _id: id, ...userInfo } as Document;
    await userCollection.insertOne(dbDoc);
  }
  async updateUser(id: string, userInfo: Partial<UserBaseInfo>) {
    if (Object.keys(userInfo).length === 0) throw new Error("用户信息不能为空");
    {
      let res = checkType(userInfo, userUpdateExceptType).error;
      if (res) throw new Error("参数校验不通过", { cause: res });
    }
    await userCollection.updateOne({ _id: id } as any, { $set: userInfo });
  }

  async isEnableVisitor() {
    let id = "visitor";
    let match: Document = { _id: id };
    let res = await userCollection.findOne<UserBaseInfo & { pwd?: string }>(match);
    if (res) {
      let user = new User(id, res);
      if (user.hasPermission(Permission.readonly) && res.pwd) {
        return res.pwd;
      }
    }
  }
}

let userInfoExceptType: ExceptType = {
  password: "string",
  name: "string",
  groupIds: optional(typeChecker.arrayType("string")),
  roleIds: optional(typeChecker.arrayType("string")),
  permissions: optional(typeChecker.arrayType("string")),
};

let userUpdateExceptType: ExceptType = { ...userInfoExceptType, password: optional.string, name: optional.string };
