import { Injectable } from "@nestjs/common";
import { db } from "./db";

@Injectable()
export class JobSearchDbService {
    constructor() {}
    searchJobName(name: string) {}
}
