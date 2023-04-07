import { BadRequestException, Body, Controller, Get, Headers, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "./grand/auth.grand";
import { UserService } from "src/services/db";
import type { ApiReq } from "common/request/auth/user";
import { UserBaseInfo } from "./services";

@Controller("user")
@UseGuards(AuthGuard)
export class UserController {
    constructor(private userService: UserService) {}

    @Get("info")
    async getUserInfo(@Headers("user-id") userId: string) {
        let user = await this.userService.getUser(userId);
        if (!user) throw new BadRequestException("用户不存在");

        let json = user.toJson();
        Reflect.deleteProperty(json, "password");
        return {
            item: json,
        };
    }

    //todo: 参数校验
    @Post("info")
    async updateUserInfo(@Body() body: ApiReq.UpdateUserInfo) {
        let { id, pwd, ...info } = body;
        let userInfo: Partial<UserBaseInfo> = info;
        if (pwd) {
            const user = await this.userService.getUser(id);
            if (user?.password !== pwd.old) throw new BadRequestException("旧密码不正确");
            userInfo = { ...info, password: pwd.new };
        }
        try {
            await this.userService.updateUser(id, userInfo);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
