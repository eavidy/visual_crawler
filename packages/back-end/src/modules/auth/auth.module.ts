import { Module, SetMetadata } from "@nestjs/common";
import { LoginController } from "./login.controller";
import { UserService } from "../../services/db/user.db.service";
import { AuthService } from "./services";
import { JwtService } from "@nestjs/jwt";
import { MODULE_PATH } from "@nestjs/common/constants";
import { UserController } from "./user.controller";

@SetMetadata(MODULE_PATH, "auth")
@Module({
    providers: [AuthService, UserService, JwtService],
    controllers: [LoginController, UserController],
})
export class AuthModule {
    constructor() {}
}
