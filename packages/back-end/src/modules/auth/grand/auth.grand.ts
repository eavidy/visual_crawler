import { CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { Permission } from "../services/permission";
import type { FastifyRequest } from "fastify";
import { UserService } from "../../../services/db/user.db.service";
import { JwtService } from "@nestjs/jwt";

export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const headers = request.headers;

        const token = headers["access-token"];
        if (typeof token !== "string") throw new UnauthorizedException();

        let verifyRes: Awaited<ReturnType<AuthService["verifyToken"]>>;
        try {
            verifyRes = await this.authService.verifyToken(token).then();
        } catch (e) {
            let error = e as Error;
            throw new UnauthorizedException(error.message);
        }

        if (request.method !== "GET" && verifyRes.user.hasPermission(Permission.readonly)) {
            throw new ForbiddenException({ message: "你没有权限", report: true });
        }
        headers["user-id"] = verifyRes.payload.id;

        return true;
    }
}
export const authGuard = new AuthGuard(new AuthService(new UserService(), new JwtService()));
