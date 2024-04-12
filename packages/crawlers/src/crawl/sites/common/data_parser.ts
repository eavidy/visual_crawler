import { cities } from "common/constants/cities.js";
import { Education, CompanyScale } from "common/model/index.js";

const EDU_KEYS: readonly string[] = Object.keys(Education).filter((k) => !/\d/.test(k));
export class DataParser {
    static cityNameToId(cityName: string) {
        return cities.find((item) => item.name === cityName)?._id;
    }
    static matchCityToId(cityStr: string) {
        if (typeof cityStr !== "string") return undefined;
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
        if (typeof str !== "string") return undefined;
        let res: string | undefined;
        for (const edu of EDU_KEYS) {
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
                return 0;
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
        if (typeof str !== "string") return undefined;
        //11-20K 20-30K·14薪
        let res = str.match(/^(?<min>\d+)-(?<max>\d+)[Kk](·(?<salaryMonth>\d+)+.)?$/)?.groups;
        if (res)
            return {
                salaryMin: parseInt(res.min) * 1000,
                salaryMax: parseInt(res.max) * 1000,
                salaryMonth: res.salaryMonth ? parseInt(res.salaryMonth) : 12,
            };
        //300-350元/天
        //200元/天
        res = str.match(/((?<min>\d+)-)?(?<max>\d+)元\/天/)?.groups;
        if (res) {
            if (res.min === undefined) res.min = res.max;
            return { salaryMin: parseInt(res.min) * 22, salaryMax: parseInt(res.max) * 22, salaryMonth: 12 };
        }

        if (str.includes("面议")) {
            return null;
        }
    }
    static paseScale(str: string) {
        let res = str.match(/(?<min>\d+)-(?<max>\d+)人/)?.groups;
        if (res) {
            let min = parseInt(res.min);
            let max = parseInt(res.max);
            let avg = Math.round(max + 1 - min) / 2 + min;
            if (avg >= 10000) return CompanyScale.gt_10000;
            else if (avg >= 1000) return CompanyScale.c1000_9999;
            else if (avg >= 500) return CompanyScale.c500_999;
            else if (avg >= 100) return CompanyScale.c100_499;
            else if (avg >= 20) return CompanyScale.c20_99;
            else return CompanyScale.c0_20;
        } else if (str === "10000人以上") return CompanyScale.gt_10000;

        return CompanyScale.unknown;
    }
    static paseJobName(name: string) {
        if (typeof name !== "string") return name;
        let val = NameParser.initJobName(name);
        return val === "" ? name : val;
    }
}

/**
 *
 */
class NameParser {
    static yesWord: (string | RegExp)[] = [
        "经理",
        "技术",
        "专员",
        "销售",
        "工程师",
        "开发",
        "总监",
        "marketing",
        "manager",
        "顾问",
        "人事",
        "程序员",
        "管理",
        "助理",
        "专家",
    ];
    static noWord: (string | RegExp)[] = ["分公司", /\d/, /包[吃住]/, "工资", "应届", "毕业生"];
    static preReplace = [/\d+-\d+k/gi, /\s*[\(（)].*?[\)>）]\s*/g];
    static initJobName(name: string) {
        for (const regExp of this.preReplace) {
            name = name.replace(regExp, "");
        }
        name = name.toLowerCase();
        if (/[-—_]/.test(name)) {
            let wordList = name.split(/[-—_]/);

            let lastResult = -2;
            for (let word of wordList) {
                if (word === "") continue;
                let foumartWord = word.replace(/\s/g, "");
                let res = 0;
                let temp = this.isCity(foumartWord);
                if (temp === 1) continue;
                res += this.wordIncludes(foumartWord);

                if (res > lastResult) {
                    lastResult = res;
                    name = word;
                }
            }
        }
        name = name.replace(/(?<=\W)\s+(?=\W)/g, "");
        return name.trim();
    }
    static wordIncludes(str: string) {
        let res = 0;
        for (const word of this.yesWord) {
            if (typeof word === "string") {
                if (str.includes(word)) res += 0.5;
            } else if (word.test(str)) {
                res += 0.5;
            }
        }
        for (const word of this.noWord) {
            if (typeof word === "string") {
                if (str.includes(word)) res -= 0.5;
            } else if (word.test(str)) {
                res -= 0.5;
            }
        }
        return res;
    }

    static isCity(str: string) {
        for (const { name } of cities) {
            if (name === str) return 1;
            if (name.includes(str)) {
                return 1;
            } else if (str.includes(name)) return (name.length / str.length) * 2 - 0.5;
        }
        return 0;
    }
}
