import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../services";
import type { FastifyRequest } from "fastify";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const headers = request.headers;

        const token = headers["access-token"];
        if (typeof token !== "string") throw new UnauthorizedException();

        try {
            const payload = await this.authService.verifyToken(token);
            headers["user-id"] = payload.id;
        } catch (e) {
            let error = e as Error;
            throw new UnauthorizedException(error.message);
        }

        return true;
    }
}
