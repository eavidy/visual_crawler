import { Module } from "@nestjs/common";
import { LoginController } from "./login.controller";
import { UserService } from "../../services/db";
import { AuthService } from "./services";
import { JwtService } from "@nestjs/jwt";

@Module({
    providers: [AuthService, UserService, JwtService],
    controllers: [LoginController],
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
