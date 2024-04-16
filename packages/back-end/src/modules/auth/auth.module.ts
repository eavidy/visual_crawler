import { Module, SetMetadata } from "@nestjs/common";
import { LoginController } from "./login.controller.js";
import { UserService } from "../../services/db/user.db.service.js";
import { AuthService } from "./services/index.js";
import { JwtService } from "@nestjs/jwt";
import { MODULE_PATH } from "@nestjs/common/constants.js";
import { UserController } from "./user.controller.js";
import { AuthenticationController } from "./auth_check.controller.js";

@SetMetadata(MODULE_PATH, "auth")
@Module({
  providers: [AuthService, UserService, JwtService],
  controllers: [LoginController, UserController, AuthenticationController],
})
export class AuthModule {
  constructor() {}
}
