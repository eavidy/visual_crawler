import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { checkType, type ExceptType } from "evlib";
@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private exceptType: ExceptType) {}
  transform(value: any, metadata: ArgumentMetadata) {
    let res = checkType(value, this.exceptType, {
      checkAll: true,
      policy: "delete",
    });
    if (res.error)
      throw new BadRequestException("Validation failed", res.error);

    return res.value;
  }
}
