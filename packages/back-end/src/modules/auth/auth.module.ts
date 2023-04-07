import { Module, SetMetadata } from "@nestjs/common";
import { LoginController } from "./login.controller";
import { UserService } from "../../services/db";
import { AuthService } from "./services";
import { JwtService } from "@nestjs/jwt";
import { MODULE_PATH } from "@nestjs/common/constants";
import { UserController } from "./user.controller";

@SetMetadata(MODULE_PATH, "auth")
@Module({
    providers: [AuthService, UserService, JwtService],
    controllers: [LoginController, UserController],
    // imports: [
    //     JwtModule.register({
    //         global: true,
    //     }),
    // ],
    // exports: [AuthService],
})
export class AuthModule {
    constructor() {}
}
