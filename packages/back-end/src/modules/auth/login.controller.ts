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
import type { ApiReq, ApiRes } from "common/request/login.js";
import { AuthService } from "./services/index.js";
import { UserService } from "../../services/db/user.db.service.js";

import { checkType, ExceptType, typeChecker } from "evlib";
const { optional } = typeChecker;

const validationPipe: PipeTransform = {
  transform(value: any, metadata: ArgumentMetadata) {
    let exceptType: Record<keyof ApiReq.Login, ExceptType> = {
      userId: "string",
      pwd: "string",
      saveState: optional("boolean"),
    };
    let checkRes = checkType(value, exceptType).error;
    if (checkRes)
      throw new BadRequestException({
        message: "字段校验不通过",
        cause: checkRes,
      });
    return value;
  },
};
@Controller()
export class LoginController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post("login")
  @UsePipes(validationPipe)
  async login(@Body() body: ApiReq.Login): Promise<ApiRes.Login> {
    const token = await this.authService.verify(
      body.userId,
      body.pwd,
      body.saveState,
    );

    return {
      userId: body.userId,
      accessToken: token,
    };
  }
  @Get("visitor")
  async getVisitor(): Promise<ApiRes.Visitor> {
    let pwd = await this.userService.isEnableVisitor();
    if (pwd)
      return {
        enable: true,
        message: "已开启访客账号",
        pwd,
        userId: "visitor",
      };
    else
      return {
        enable: false,
        message: "Hello",
      };
  }
}
