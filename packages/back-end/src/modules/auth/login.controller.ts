import { ExceptType, checkType, optional } from "@asnc/tslib/lib/std";
import {
    ArgumentMetadata,
    BadRequestException,
    Body,
    Controller,
    Get,
    PipeTransform,
    Post,
    UsePipes,
} from "@nestjs/common";
import type { ApiReq, ApiRes } from "common/request/login";
import { AuthService } from "./services";
const validationPipe: PipeTransform = {
    transform(value: any, metadata: ArgumentMetadata) {
        let exceptType: Record<keyof ApiReq.Login, ExceptType> = {
            userId: "string",
            pwd: "string",
            saveState: optional("boolean"),
        };
        let checkRes = checkType(value, exceptType);
        if (checkRes) throw new BadRequestException({ message: "字段校验不通过", cause: checkRes });
        return value;
    },
};
@Controller()
export class LoginController {
    constructor(private authService: AuthService) {}

    @Post("login")
    @UsePipes(validationPipe)
    async login(@Body() body: ApiReq.Login): Promise<ApiRes.Login> {
        const token = await this.authService.verify(body.userId, body.pwd, body.saveState);

        return {
            userId: body.userId,
            accessToken: token,
        };
    }
    @Get("visitor")
    async getVisitor(): Promise<ApiRes.Visitor> {
        return {
            enable: true,
            message: "已开启访客账号",
            pwd: "123",
            userId: "visitor",
        };
    }
}
