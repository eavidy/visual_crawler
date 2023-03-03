import type { Education } from "api/model";

interface JobFilterOption {
    city?: number;
    emitTime?: Date;
    exp?: number;
    salary?: number;
    eduction?: Education;
    companyScale?: number;
}
