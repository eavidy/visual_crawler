import { CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { Permission } from "../services/permission";
import type { FastifyRequest } from "fastify";
import { UserService } from "../../../services/db/user.db.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../services";
import { IncomingHttpHeaders } from "node:http";

export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}
    canUpdate(user: User) {
        if (user.hasPermission(Permission.readonly)) {
            throw new ForbiddenException({ message: "你没有权限", report: true });
        }
    }
    async parseToken(headers: IncomingHttpHeaders) {
        const token = headers["access-token"];
        if (typeof token !== "string") throw new UnauthorizedException();
        try {
            return this.authService.verifyToken(token);
        } catch (e) {
            let error = e as Error;
            throw new UnauthorizedException(error.message);
        }
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const headers = request.headers;

        let verifyRes = await this.parseToken(headers);
        headers["user-id"] = verifyRes.payload.id;

        if (request.method !== "GET") this.canUpdate(verifyRes.user);

        return true;
    }
}
export const authGuard = new AuthGuard(new AuthService(new UserService(), new JwtService()));
