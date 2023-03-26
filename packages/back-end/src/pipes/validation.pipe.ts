import { checkType, ExceptType } from "@asnc/tslib/lib/std";
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
@Injectable()
export class ValidationPipe implements PipeTransform {
    constructor(private exceptType: ExceptType) {}
    transform(value: any, metadata: ArgumentMetadata) {
        let res = checkType(value, this.exceptType, { checkAll: true, deleteSurplus: true });
        if (res) throw new BadRequestException("Validation failed", res);

        return value;
    }
}
