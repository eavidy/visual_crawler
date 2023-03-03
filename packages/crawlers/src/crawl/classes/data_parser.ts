import { cities } from "common/constants/cities";
import { Education } from "api/model/index";

export class DataParser {
    static cityNameToId(cityName: string) {
        return cities.find((item) => item.name === cityName)?._id;
    }
    static matchCityToId(cityStr: string) {
        let cityName: string | undefined;
        for (const city of cities) {
            if (cityStr.includes(city.name)) {
                if (!cityName) cityName = city.name;
                else return undefined;
            }
        }
        if (cityName) return this.cityNameToId(cityName);
        return undefined;
    }
    static matchEducation(str: string): Education | undefined {
        let list = Object.keys(Education);
        let res: string | undefined;
        for (const edu of list) {
            if (str.includes(edu)) {
                if (!res) res = edu;
                else return undefined;
            }
        }
        if (res) return Education[res as any] as any as Education;
        return undefined;
    }
    static paseExp(str: string) {
        switch (str) {
            case "在校生":
                return -2;
            case "实习生":
                return -2;

            case "应届生":
                return 0.5;
            case "1年以内":
                return 0.5;
            case "1-3年":
                return 2;
            case "3-5年":
                return 4;
            case "5-10年":
                return 7.5;
            case "10年以上":
                return 10;
            default: //经验不限
                return -1;
        }
    }
    static paseSalary(str: string) {
        //11-20K 20-30K·14薪 300-350元/天
        let res = str.match(/^(?<min>\d+)-(?<max>\d+)[Kk](·(?<salaryMonth>\d+)+.)?$/)?.groups;
        if (res)
            return {
                salaryMin: parseInt(res.min) * 1000,
                salaryMax: parseInt(res.max) * 1000,
                salaryMonth: res.salaryMonth ? parseInt(res.salaryMonth) : 12,
            };
        res = str.match(/(?<min>\d+)-(?<max>\d+)元\/天/)?.groups;
        if (res) return { salaryMin: parseInt(res.min) * 22, salaryMax: parseInt(res.max) * 22, salaryMonth: 12 };
        if (str.includes("面议")) {
            return null;
        }
    }
    static paseScale(str: string) {
        switch (str) {
            case "0-20人":
                return 10;
            case "20-99人":
                return 60;
            case "100-499人":
                return 300;
            case "500-999人":
                return 750;
            case "1000-9999人":
                return 5500;
            case "10000人以上":
                return 1000;
            default:
                return -1;
        }
    }
}
