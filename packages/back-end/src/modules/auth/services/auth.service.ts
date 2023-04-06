import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../../../services/db";
import { User } from "./auth";
import { JwtService } from "@nestjs/jwt";

const JWT_SECRET = "yyq";
@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) {}
    async verify(id: string, pwd: string, saveState = false) {
        const ONE_DAY = 24 * 60 * 60;
        let user = await this.userService.getUser(id);
        if (!user) throw new UnauthorizedException("用户不存在");
        if (user.password !== pwd) throw new UnauthorizedException("密码错误");
        return this.createAccessToken(user, saveState ? 3 * ONE_DAY : ONE_DAY);
    }
    private createAccessToken(user: User, expiresIn: number): string {
        let payload = { id: user.id };
        let token = this.jwtService.sign(payload, { secret: JWT_SECRET, expiresIn });
        return token;
    }

    auth() {}
}
