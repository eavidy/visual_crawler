import { Test } from "@nestjs/testing";
import { LoginController } from "./login.controller";
import { describe, it, expect, vi } from "vitest";
import { AuthService, User } from "./services";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../services/db/user.db.service";

describe("CatsController", async function () {
    let loginController: LoginController;
    let userService: UserService;

    const moduleRef = await Test.createTestingModule({
        providers: [AuthService, UserService, JwtService],
        controllers: [LoginController],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    loginController = moduleRef.get<LoginController>(LoginController);

    vi.spyOn(userService, "getUser").mockImplementation(async function (id: string) {
        let users: Record<string, User> = {
            testUser: new User("测试id", { name: "testUser", password: "1234" }),
        };
        return users[id];
    });
    describe("login", () => {
        it("用户不存在", async () => {
            await expect(loginController.login({ userId: "yyq", pwd: "1234" })).rejects.toMatchObject({
                response: { message: "用户不存在" },
            });
        });
        it("密码错误", async () => {
            await expect(loginController.login({ userId: "testUser", pwd: "55" })).rejects.toMatchObject({
                response: { message: "密码错误" },
            });
        });
        it("成功登录", async () => {
            let res = await loginController.login({ userId: "testUser", pwd: "1234" });
            expect(res).toMatchObject({ userId: "testUser" });
        });
    });
});
