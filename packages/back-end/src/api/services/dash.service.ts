import { Injectable } from "@nestjs/common";
import { JobAnalysisDbService, MatchFilter } from "../../services/db";
import cityIdMap from "common/constants/city_id_map";
import { ApiReq } from "api/request/dashboard";
function mathRound(value: number, decimals = 0) {
    let dv = 10 ** decimals;
    return Math.round(value * dv) / dv;
}

@Injectable()
export class DashService {
    constructor(private jobAnalysisDbService: JobAnalysisDbService) {}
    /**
     * 平均薪资趋势、职位需求趋势
     */
    async getAnalysisByTime(matchFilter: Omit<ApiReq.MatchFilter, "">) {}
    /** 平均工资、职位需求 */
    async getAnalysisByCity(matchFilter: ApiReq.MatchFilter) {
        if (Object.keys(matchFilter).length === 0) return this.cache.analysisByCity;
        let initMatchFilter: MatchFilter = initReqMatchFilter(matchFilter);

        let scopeCitiesData = await this.jobAnalysisDbService.avgAndCountByCity(initMatchFilter);
        for (const item of scopeCitiesData) {
            item.cityName = cityIdMap[item.cityId];
            item.avgSalary = mathRound(item.avgSalary, 2);
        }

        return { data: scopeCitiesData };
    }
    async getAnalysisByJob(matchFilter: ApiReq.MatchFilter) {
        if (Object.keys(matchFilter).length === 0) return this.cache.analysisByJob;
        let initMatchFilter: MatchFilter = initReqMatchFilter(matchFilter);

        let data = await this.jobAnalysisDbService.avgAndCountByJob(initMatchFilter, 100); //范围职位排行榜
        for (const item of data) {
            item.avgSalary = mathRound(item.avgSalary, 2);
        }
        return { data };
    }
    async getGlobalBillboard() {
        // let allCityBillboard = await this.getAllCityBillboard_recentYear();
        // let allJobBillboard = await this.getAllJobBillboard_recentYear();

        let allCityBillboard = this.cache.allCityBillboard_recentYear;
        let allJobBillboard = this.cache.allJobBillboard_recentYear;

        return { allCityBillboard, allJobBillboard };
    }
    private async getAllJobBillboard_recentYear() {
        let allBillboard = await this.jobAnalysisDbService.avgAndTotalByJob_all(getTheCurrentYearDateScope(), 20);
        for (const data of Object.values(allBillboard)) {
            for (const item of data) {
                item.avgSalary = mathRound(item.avgSalary, 2);
            }
        }
        return {
            avgSalary: allBillboard[0],
            jobCount: allBillboard[1],
        };
    }
    private async getAllCityBillboard_recentYear() {
        let cityBillboard = await this.jobAnalysisDbService.avgAndTotalByCity_all(getTheCurrentYearDateScope(), 20); //所有城市近三年排行榜(前20)
        for (const list of cityBillboard) {
            for (const item of list) {
                item.cityName = cityIdMap[item.cityId];

                item.avgSalary = mathRound(item.avgSalary, 2);
            }
        }
        return {
            avgSalary: cityBillboard[0],
            jobCount: cityBillboard[1],
            companyCount: [],
        };
    }
    private cache = {
        allCityBillboard_recentYear: {
            avgSalary: [
                {
                    avgSalary: 35078.71,
                    jobCount: 841,
                    cityId: 101320300,
                    cityName: "香港",
                },
                {
                    avgSalary: 22010.33,
                    jobCount: 247,
                    cityId: 101310600,
                    cityName: "琼海",
                },
                {
                    avgSalary: 21185.78,
                    jobCount: 311025,
                    cityId: 101010100,
                    cityName: "北京",
                },
                {
                    avgSalary: 19822.39,
                    jobCount: 114,
                    cityId: 101071000,
                    cityName: "辽阳",
                },
                {
                    avgSalary: 19300.54,
                    jobCount: 60292,
                    cityId: 101210100,
                    cityName: "杭州",
                },
                {
                    avgSalary: 18513.88,
                    jobCount: 168964,
                    cityId: 101280600,
                    cityName: "深圳",
                },
                {
                    avgSalary: 18246.5,
                    jobCount: 264,
                    cityId: 101230700,
                    cityName: "龙岩",
                },
                {
                    avgSalary: 18155.89,
                    jobCount: 340758,
                    cityId: 101020100,
                    cityName: "上海",
                },
                {
                    avgSalary: 17899.55,
                    jobCount: 32696,
                    cityId: 101190100,
                    cityName: "南京",
                },
                {
                    avgSalary: 17853.98,
                    jobCount: 114,
                    cityId: 101100300,
                    cityName: "阳泉",
                },
                {
                    avgSalary: 17446.26,
                    jobCount: 35896,
                    cityId: 101190400,
                    cityName: "苏州",
                },
                {
                    avgSalary: 17321.22,
                    jobCount: 5776,
                    cityId: 101280700,
                    cityName: "珠海",
                },
                {
                    avgSalary: 17079.8,
                    jobCount: 657,
                    cityId: 101121200,
                    cityName: "东营",
                },
                {
                    avgSalary: 17073.32,
                    jobCount: 12281,
                    cityId: 101210400,
                    cityName: "宁波",
                },
                {
                    avgSalary: 16902.94,
                    jobCount: 21804,
                    cityId: 101110100,
                    cityName: "西安",
                },
                {
                    avgSalary: 16319.4,
                    jobCount: 16050,
                    cityId: 101280800,
                    cityName: "佛山",
                },
                {
                    avgSalary: 16293.03,
                    jobCount: 10401,
                    cityId: 101230100,
                    cityName: "福州",
                },
                {
                    avgSalary: 16274.19,
                    jobCount: 5589,
                    cityId: 101090200,
                    cityName: "保定",
                },
                {
                    avgSalary: 16025.51,
                    jobCount: 34520,
                    cityId: 101200100,
                    cityName: "武汉",
                },
                {
                    avgSalary: 15970.33,
                    jobCount: 641,
                    cityId: 101080200,
                    cityName: "包头",
                },
            ].reverse(),
            jobCount: [
                {
                    avgSalary: 18155.89,
                    jobCount: 340758,
                    cityId: 101020100,
                    cityName: "上海",
                },
                {
                    avgSalary: 21185.78,
                    jobCount: 311025,
                    cityId: 101010100,
                    cityName: "北京",
                },
                {
                    avgSalary: 18513.88,
                    jobCount: 168964,
                    cityId: 101280600,
                    cityName: "深圳",
                },
                {
                    avgSalary: 15848.91,
                    jobCount: 104815,
                    cityId: 101280100,
                    cityName: "广州",
                },
                {
                    avgSalary: 15681.12,
                    jobCount: 81538,
                    cityId: 101270100,
                    cityName: "成都",
                },
                {
                    avgSalary: 19300.54,
                    jobCount: 60292,
                    cityId: 101210100,
                    cityName: "杭州",
                },
                {
                    avgSalary: 14285.67,
                    jobCount: 56916,
                    cityId: 101040100,
                    cityName: "重庆",
                },
                {
                    avgSalary: 17446.26,
                    jobCount: 35896,
                    cityId: 101190400,
                    cityName: "苏州",
                },
                {
                    avgSalary: 16025.51,
                    jobCount: 34520,
                    cityId: 101200100,
                    cityName: "武汉",
                },
                {
                    avgSalary: 17899.55,
                    jobCount: 32696,
                    cityId: 101190100,
                    cityName: "南京",
                },
                {
                    avgSalary: 14457.58,
                    jobCount: 24051,
                    cityId: 101250100,
                    cityName: "长沙",
                },
                {
                    avgSalary: 16902.94,
                    jobCount: 21804,
                    cityId: 101110100,
                    cityName: "西安",
                },
                {
                    avgSalary: 14666.03,
                    jobCount: 19054,
                    cityId: 101030100,
                    cityName: "天津",
                },
                {
                    avgSalary: 13030.78,
                    jobCount: 18844,
                    cityId: 101281600,
                    cityName: "东莞",
                },
                {
                    avgSalary: 15678.37,
                    jobCount: 18763,
                    cityId: 101220100,
                    cityName: "合肥",
                },
                {
                    avgSalary: 16319.4,
                    jobCount: 16050,
                    cityId: 101280800,
                    cityName: "佛山",
                },
                {
                    avgSalary: 15071.63,
                    jobCount: 15495,
                    cityId: 101120200,
                    cityName: "青岛",
                },
                {
                    avgSalary: 15129.1,
                    jobCount: 14634,
                    cityId: 101190200,
                    cityName: "无锡",
                },
                {
                    avgSalary: 14601.32,
                    jobCount: 13855,
                    cityId: 101120100,
                    cityName: "济南",
                },
                {
                    avgSalary: 15958.31,
                    jobCount: 12912,
                    cityId: 101230200,
                    cityName: "厦门",
                },
            ].reverse(),
            companyCount: [],
        },
        allJobBillboard_recentYear: {
            avgSalary: [
                {
                    avgSalary: 57914.89,
                    jobCount: 105,
                    jobName: "首席执行官CEO/总裁/总经理",
                },
                {
                    avgSalary: 56030.52,
                    jobCount: 278,
                    jobName: "区域总经理",
                },
                {
                    avgSalary: 52935.1,
                    jobCount: 238,
                    jobName: "医学总监",
                },
                {
                    avgSalary: 48570.31,
                    jobCount: 140,
                    jobName: "副总裁/副总经理",
                },
                {
                    avgSalary: 48090.75,
                    jobCount: 644,
                    jobName: "营业部总经理",
                },
                {
                    avgSalary: 47883.72,
                    jobCount: 432,
                    jobName: "财富中心总经理",
                },
                {
                    avgSalary: 47500,
                    jobCount: 357,
                    jobName: "区域总经理（财富端&基金）",
                },
                {
                    avgSalary: 47359.55,
                    jobCount: 356,
                    jobName: "城市总经理（财富端&基金）",
                },
                {
                    avgSalary: 45134.78,
                    jobCount: 120,
                    jobName: "销售副总经理",
                },
                {
                    avgSalary: 44772.26,
                    jobCount: 395,
                    jobName: "城市分公司总经理",
                },
                {
                    avgSalary: 44636.11,
                    jobCount: 206,
                    jobName: "项目总经理",
                },
                {
                    avgSalary: 43430.11,
                    jobCount: 1793,
                    jobName: "分公司总经理",
                },
                {
                    avgSalary: 43292.05,
                    jobCount: 470,
                    jobName: "总经理",
                },
                {
                    avgSalary: 42892.36,
                    jobCount: 153,
                    jobName: "集团财务总监",
                },
                {
                    avgSalary: 42578.13,
                    jobCount: 128,
                    jobName: "私行分公司总经理",
                },
                {
                    avgSalary: 42295.08,
                    jobCount: 133,
                    jobName: "技术/研发总监",
                },
                {
                    avgSalary: 42154.4,
                    jobCount: 530,
                    jobName: "研发总监",
                },
                {
                    avgSalary: 42122.73,
                    jobCount: 558,
                    jobName: "城市总经理",
                },
                {
                    avgSalary: 40520.55,
                    jobCount: 461,
                    jobName: "技术总监",
                },
                {
                    avgSalary: 40425.12,
                    jobCount: 219,
                    jobName: "事业部总经理",
                },
            ].reverse(),
            jobCount: [
                {
                    avgSalary: 14434,
                    jobCount: 13969,
                    jobName: "销售经理",
                },
                {
                    avgSalary: 9461.97,
                    jobCount: 8008,
                    jobName: "销售代表",
                },
                {
                    avgSalary: 20124.97,
                    jobCount: 6283,
                    jobName: "产品经理",
                },
                {
                    avgSalary: 17761.07,
                    jobCount: 5833,
                    jobName: "项目经理",
                },
                {
                    avgSalary: 15004.19,
                    jobCount: 4577,
                    jobName: "区域销售经理",
                },
                {
                    avgSalary: 11366.54,
                    jobCount: 4574,
                    jobName: "销售工程师",
                },
                {
                    avgSalary: 15475.28,
                    jobCount: 4471,
                    jobName: "大客户销售",
                },
                {
                    avgSalary: 12705.03,
                    jobCount: 4090,
                    jobName: "客户经理",
                },
                {
                    avgSalary: 28430.63,
                    jobCount: 4053,
                    jobName: "销售总监",
                },
                {
                    avgSalary: 13579.35,
                    jobCount: 3724,
                    jobName: "电气工程师",
                },
                {
                    avgSalary: 18951.79,
                    jobCount: 3386,
                    jobName: "硬件工程师",
                },
                {
                    avgSalary: 20114.29,
                    jobCount: 3050,
                    jobName: "嵌入式软件工程师",
                },
                {
                    avgSalary: 17556.2,
                    jobCount: 2798,
                    jobName: "大客户销售经理",
                },
                {
                    avgSalary: 14717.14,
                    jobCount: 2706,
                    jobName: "测试工程师",
                },
                {
                    avgSalary: 16915.37,
                    jobCount: 2608,
                    jobName: "财务经理",
                },
                {
                    avgSalary: 14394.35,
                    jobCount: 2591,
                    jobName: "机械工程师",
                },
                {
                    avgSalary: 7571.74,
                    jobCount: 2532,
                    jobName: "会计",
                },
                {
                    avgSalary: 7337.12,
                    jobCount: 2500,
                    jobName: "销售助理",
                },
                {
                    avgSalary: 12196.98,
                    jobCount: 2340,
                    jobName: "工艺工程师",
                },
                {
                    avgSalary: 17765.32,
                    jobCount: 2263,
                    jobName: "java开发工程师",
                },
            ].reverse(),
        },
        analysisByCity: {
            data: [
                {
                    avgSalary: 35078.71,
                    jobCount: 841,
                    cityId: 101320300,
                    cityName: "香港",
                },
                {
                    avgSalary: 32571.95,
                    jobCount: 45,
                    cityId: 101330100,
                    cityName: "澳门",
                },
                {
                    avgSalary: 21185.78,
                    jobCount: 311025,
                    cityId: 101010100,
                    cityName: "北京",
                },
                {
                    avgSalary: 19300.54,
                    jobCount: 60292,
                    cityId: 101210100,
                    cityName: "杭州",
                },
                {
                    avgSalary: 18155.89,
                    jobCount: 340758,
                    cityId: 101020100,
                    cityName: "上海",
                },
                {
                    avgSalary: 17899.55,
                    jobCount: 32696,
                    cityId: 101190100,
                    cityName: "南京",
                },
                {
                    avgSalary: 16902.94,
                    jobCount: 21804,
                    cityId: 101110100,
                    cityName: "西安",
                },
                {
                    avgSalary: 16293.03,
                    jobCount: 10401,
                    cityId: 101230100,
                    cityName: "福州",
                },
                {
                    avgSalary: 16025.51,
                    jobCount: 34520,
                    cityId: 101200100,
                    cityName: "武汉",
                },
                {
                    avgSalary: 15848.91,
                    jobCount: 104815,
                    cityId: 101280100,
                    cityName: "广州",
                },
                {
                    avgSalary: 15681.12,
                    jobCount: 81538,
                    cityId: 101270100,
                    cityName: "成都",
                },
                {
                    avgSalary: 15678.37,
                    jobCount: 18763,
                    cityId: 101220100,
                    cityName: "合肥",
                },
                {
                    avgSalary: 15313.03,
                    jobCount: 1176,
                    cityId: 101150100,
                    cityName: "西宁",
                },
                {
                    avgSalary: 15107.61,
                    jobCount: 1546,
                    cityId: 101170100,
                    cityName: "银川",
                },
                {
                    avgSalary: 14851.39,
                    jobCount: 407,
                    cityId: 101140100,
                    cityName: "拉萨",
                },
                {
                    avgSalary: 14666.03,
                    jobCount: 19054,
                    cityId: 101030100,
                    cityName: "天津",
                },
                {
                    avgSalary: 14655.79,
                    jobCount: 2922,
                    cityId: 101160100,
                    cityName: "兰州",
                },
                {
                    avgSalary: 14601.32,
                    jobCount: 13855,
                    cityId: 101120100,
                    cityName: "济南",
                },
                {
                    avgSalary: 14457.58,
                    jobCount: 24051,
                    cityId: 101250100,
                    cityName: "长沙",
                },
                {
                    avgSalary: 14457.01,
                    jobCount: 4207,
                    cityId: 101100100,
                    cityName: "太原",
                },
                {
                    avgSalary: 14330.36,
                    jobCount: 12875,
                    cityId: 101180100,
                    cityName: "郑州",
                },
                {
                    avgSalary: 14325.07,
                    jobCount: 7709,
                    cityId: 101240100,
                    cityName: "南昌",
                },
                {
                    avgSalary: 14321.17,
                    jobCount: 7044,
                    cityId: 101090100,
                    cityName: "石家庄",
                },
                {
                    avgSalary: 14285.67,
                    jobCount: 56916,
                    cityId: 101040100,
                    cityName: "重庆",
                },
                {
                    avgSalary: 14235.72,
                    jobCount: 3306,
                    cityId: 101050100,
                    cityName: "哈尔滨",
                },
                {
                    avgSalary: 14163.25,
                    jobCount: 2574,
                    cityId: 101310100,
                    cityName: "海口",
                },
                {
                    avgSalary: 14123.44,
                    jobCount: 8080,
                    cityId: 101070100,
                    cityName: "沈阳",
                },
                {
                    avgSalary: 14103.02,
                    jobCount: 5597,
                    cityId: 101300100,
                    cityName: "南宁",
                },
                {
                    avgSalary: 13840.7,
                    jobCount: 6093,
                    cityId: 101290100,
                    cityName: "昆明",
                },
                {
                    avgSalary: 13758.07,
                    jobCount: 4320,
                    cityId: 101060100,
                    cityName: "长春",
                },
                {
                    avgSalary: 13575.72,
                    jobCount: 2542,
                    cityId: 101130100,
                    cityName: "乌鲁木齐",
                },
                {
                    avgSalary: 12777.38,
                    jobCount: 4737,
                    cityId: 101260100,
                    cityName: "贵阳",
                },
            ].reverse(),
        },
        analysisByJob: {
            data: [
                {
                    avgSalary: 56677.22,
                    jobCount: 190,
                    jobName: "区域总经理",
                },
                {
                    avgSalary: 53907.22,
                    jobCount: 224,
                    jobName: "医学总监",
                },
                {
                    avgSalary: 50019.8,
                    jobCount: 111,
                    jobName: "副总裁/副总经理",
                },
                {
                    avgSalary: 49708.33,
                    jobCount: 119,
                    jobName: "事业部总经理",
                },
                {
                    avgSalary: 46325.78,
                    jobCount: 313,
                    jobName: "总经理",
                },
                {
                    avgSalary: 46247.75,
                    jobCount: 224,
                    jobName: "财富中心总经理",
                },
                {
                    avgSalary: 45307.69,
                    jobCount: 120,
                    jobName: "项目总经理",
                },
                {
                    avgSalary: 43710.74,
                    jobCount: 130,
                    jobName: "集团财务总监",
                },
                {
                    avgSalary: 43219.77,
                    jobCount: 788,
                    jobName: "分公司总经理",
                },
                {
                    avgSalary: 42070.12,
                    jobCount: 185,
                    jobName: "融资总监",
                },
                {
                    avgSalary: 40862.86,
                    jobCount: 372,
                    jobName: "技术总监",
                },
                {
                    avgSalary: 40840.99,
                    jobCount: 303,
                    jobName: "营业部总经理",
                },
                {
                    avgSalary: 40711.19,
                    jobCount: 285,
                    jobName: "城市总经理",
                },
                {
                    avgSalary: 40384.97,
                    jobCount: 354,
                    jobName: "研发总监",
                },
                {
                    avgSalary: 39953.7,
                    jobCount: 111,
                    jobName: "销售总经理",
                },
                {
                    avgSalary: 39794.84,
                    jobCount: 305,
                    jobName: "模拟芯片设计工程师",
                },
                {
                    avgSalary: 39607.95,
                    jobCount: 102,
                    jobName: "咨询总监",
                },
                {
                    avgSalary: 39380.33,
                    jobCount: 564,
                    jobName: "产品总监",
                },
                {
                    avgSalary: 39368.64,
                    jobCount: 133,
                    jobName: "董事会秘书",
                },
                {
                    avgSalary: 38832.02,
                    jobCount: 276,
                    jobName: "法务总监",
                },
                {
                    avgSalary: 38593.25,
                    jobCount: 293,
                    jobName: "投资总监",
                },
                {
                    avgSalary: 38156.74,
                    jobCount: 192,
                    jobName: "模拟电路设计工程师",
                },
                {
                    avgSalary: 37110.47,
                    jobCount: 182,
                    jobName: "供应链总监",
                },
                {
                    avgSalary: 36931.58,
                    jobCount: 124,
                    jobName: "数字后端工程师",
                },
                {
                    avgSalary: 36393.75,
                    jobCount: 244,
                    jobName: "大数据架构师",
                },
                {
                    avgSalary: 36061.64,
                    jobCount: 161,
                    jobName: "数字IC设计工程师",
                },
                {
                    avgSalary: 35309.28,
                    jobCount: 106,
                    jobName: "数据科学家",
                },
                {
                    avgSalary: 35106.67,
                    jobCount: 241,
                    jobName: "品牌总监",
                },
                {
                    avgSalary: 34985.61,
                    jobCount: 142,
                    jobName: "java架构师",
                },
                {
                    avgSalary: 34937.57,
                    jobCount: 271,
                    jobName: "IC验证工程师",
                },
                {
                    avgSalary: 34842.66,
                    jobCount: 306,
                    jobName: "副总经理",
                },
                {
                    avgSalary: 34788.73,
                    jobCount: 545,
                    jobName: "架构师",
                },
                {
                    avgSalary: 34754.55,
                    jobCount: 144,
                    jobName: "模拟IC设计工程师",
                },
                {
                    avgSalary: 34711.48,
                    jobCount: 1028,
                    jobName: "财务总监",
                },
                {
                    avgSalary: 34372.93,
                    jobCount: 371,
                    jobName: "大区经理",
                },
                {
                    avgSalary: 34251.15,
                    jobCount: 224,
                    jobName: "私人银行家",
                },
                {
                    avgSalary: 34127.71,
                    jobCount: 104,
                    jobName: "数字电路设计工程师",
                },
                {
                    avgSalary: 34073.68,
                    jobCount: 102,
                    jobName: "电商总监",
                },
                {
                    avgSalary: 33949.52,
                    jobCount: 218,
                    jobName: "高级算法工程师",
                },
                {
                    avgSalary: 33169.17,
                    jobCount: 282,
                    jobName: "电商运营总监",
                },
                {
                    avgSalary: 33090.31,
                    jobCount: 721,
                    jobName: "人力资源总监",
                },
                {
                    avgSalary: 32914.81,
                    jobCount: 152,
                    jobName: "营销副总",
                },
                {
                    avgSalary: 32868.1,
                    jobCount: 174,
                    jobName: "质量总监",
                },
                {
                    avgSalary: 32445.54,
                    jobCount: 213,
                    jobName: "解决方案架构师",
                },
                {
                    avgSalary: 32291.67,
                    jobCount: 216,
                    jobName: "采购总监",
                },
                {
                    avgSalary: 32142.76,
                    jobCount: 162,
                    jobName: "软件架构师",
                },
                {
                    avgSalary: 32018.75,
                    jobCount: 257,
                    jobName: "系统架构师",
                },
                {
                    avgSalary: 31758.62,
                    jobCount: 119,
                    jobName: "NLP算法工程师",
                },
                {
                    avgSalary: 30733.33,
                    jobCount: 169,
                    jobName: "分公司/代表处负责人",
                },
                {
                    avgSalary: 30642.94,
                    jobCount: 947,
                    jobName: "市场总监",
                },
                {
                    avgSalary: 30561.95,
                    jobCount: 117,
                    jobName: "控制算法工程师",
                },
                {
                    avgSalary: 30474.14,
                    jobCount: 120,
                    jobName: "分公司负责人",
                },
                {
                    avgSalary: 30473.7,
                    jobCount: 158,
                    jobName: "私人银行财富顾问",
                },
                {
                    avgSalary: 30367.09,
                    jobCount: 163,
                    jobName: "资深产品经理",
                },
                {
                    avgSalary: 30266.72,
                    jobCount: 655,
                    jobName: "运营总监",
                },
                {
                    avgSalary: 30241.07,
                    jobCount: 118,
                    jobName: "市场营销总监",
                },
                {
                    avgSalary: 30230.97,
                    jobCount: 158,
                    jobName: "深度学习算法工程师",
                },
                {
                    avgSalary: 29665.98,
                    jobCount: 249,
                    jobName: "大客户总监",
                },
                {
                    avgSalary: 29467.49,
                    jobCount: 334,
                    jobName: "商务总监",
                },
                {
                    avgSalary: 29227.34,
                    jobCount: 664,
                    jobName: "营销总监",
                },
                {
                    avgSalary: 28976.42,
                    jobCount: 214,
                    jobName: "解决方案专家",
                },
                {
                    avgSalary: 28914.09,
                    jobCount: 117,
                    jobName: "机器学习算法工程师",
                },
                {
                    avgSalary: 28736.16,
                    jobCount: 325,
                    jobName: "大客户销售总监",
                },
                {
                    avgSalary: 28720.59,
                    jobCount: 110,
                    jobName: "基金经理",
                },
                {
                    avgSalary: 28471.16,
                    jobCount: 3134,
                    jobName: "销售总监",
                },
                {
                    avgSalary: 28470.34,
                    jobCount: 121,
                    jobName: "大区总监",
                },
                {
                    avgSalary: 28415.38,
                    jobCount: 142,
                    jobName: "设计总监",
                },
                {
                    avgSalary: 28192.31,
                    jobCount: 106,
                    jobName: "视觉算法工程师",
                },
                {
                    avgSalary: 27988.41,
                    jobCount: 315,
                    jobName: "项目总监",
                },
                {
                    avgSalary: 27971.22,
                    jobCount: 156,
                    jobName: "招聘总监",
                },
                {
                    avgSalary: 27897.33,
                    jobCount: 118,
                    jobName: "量化研究员",
                },
                {
                    avgSalary: 27879.06,
                    jobCount: 356,
                    jobName: "渠道总监",
                },
                {
                    avgSalary: 27696.97,
                    jobCount: 136,
                    jobName: "AI算法工程师",
                },
                {
                    avgSalary: 27689.18,
                    jobCount: 101,
                    jobName: "科研人员",
                },
                {
                    avgSalary: 27628.74,
                    jobCount: 169,
                    jobName: "高级测试开发工程师",
                },
                {
                    avgSalary: 27478.24,
                    jobCount: 1367,
                    jobName: "算法工程师",
                },
                {
                    avgSalary: 27349.89,
                    jobCount: 933,
                    jobName: "区域销售总监",
                },
                {
                    avgSalary: 27232.56,
                    jobCount: 101,
                    jobName: "高级法务经理",
                },
                {
                    avgSalary: 27193.12,
                    jobCount: 195,
                    jobName: "大区销售总监",
                },
                {
                    avgSalary: 26731.43,
                    jobCount: 1090,
                    jobName: "高级产品经理",
                },
                {
                    avgSalary: 26686.39,
                    jobCount: 189,
                    jobName: "高级投资经理",
                },
                {
                    avgSalary: 26624.16,
                    jobCount: 156,
                    jobName: "生产总监",
                },
                {
                    avgSalary: 26500,
                    jobCount: 159,
                    jobName: "招商总监",
                },
                {
                    avgSalary: 26356.67,
                    jobCount: 151,
                    jobName: "高级ios开发工程师",
                },
                {
                    avgSalary: 26129.58,
                    jobCount: 462,
                    jobName: "图像算法工程师",
                },
                {
                    avgSalary: 25931.92,
                    jobCount: 236,
                    jobName: "研发经理",
                },
                {
                    avgSalary: 25893.2,
                    jobCount: 104,
                    jobName: "区域总监",
                },
                {
                    avgSalary: 25760.99,
                    jobCount: 185,
                    jobName: "高级android开发工程师",
                },
                {
                    avgSalary: 25756.33,
                    jobCount: 166,
                    jobName: "客户总监",
                },
                {
                    avgSalary: 25696.55,
                    jobCount: 152,
                    jobName: "测试经理",
                },
                {
                    avgSalary: 25502.1,
                    jobCount: 256,
                    jobName: "临床项目经理",
                },
                {
                    avgSalary: 25469.57,
                    jobCount: 115,
                    jobName: "机器视觉算法工程师",
                },
                {
                    avgSalary: 25370.75,
                    jobCount: 156,
                    jobName: "高级嵌入式软件工程师",
                },
                {
                    avgSalary: 25341.99,
                    jobCount: 246,
                    jobName: "高级软件工程师",
                },
                {
                    avgSalary: 25324.68,
                    jobCount: 398,
                    jobName: "数据产品经理",
                },
                {
                    avgSalary: 25322.64,
                    jobCount: 569,
                    jobName: "医学经理",
                },
                {
                    avgSalary: 25282.79,
                    jobCount: 129,
                    jobName: "行业销售总监",
                },
                {
                    avgSalary: 25276.86,
                    jobCount: 192,
                    jobName: "FPGA开发工程师",
                },
                {
                    avgSalary: 25253.38,
                    jobCount: 157,
                    jobName: "测试开发",
                },
                {
                    avgSalary: 25130.36,
                    jobCount: 595,
                    jobName: "高级硬件工程师",
                },
            ].reverse(),
        },
    };
    readonly provinceIdNameMap = provinceIdNameMap;
    get cityOption() {
        let option: { value: string; label: string }[] = Object.entries(cityIdMap).map(([value, label]) => ({
            label,
            value,
        }));
        return option;
    }
}

const provincialCapital: number[] = [
    101010100, 101030100, 101020100, 101040100, 101090100, 101100100, 101110100, 101120100, 101180100, 101070100,
    101060100, 101050100, 101190100, 101210100, 101220100, 101240100, 101230100, 101200100, 101250100, 101270100,
    101260100, 101290100, 101280100, 101310100, 101160100, 101150100, 101080100, 101130100, 101140100, 101300100,
    101170100, 101320300, 101330100,
]; //省会、直辖市
const provinceMap: Record<string, number[]> = {
    "100": [
        101161000, 101160200, 101160600, 101160800, 101161200, 101160100, 101161100, 101160300, 101160400, 101160900,
        101160500, 101160700,
    ],
    "110": [
        101301000, 101301300, 101300200, 101301400, 101300500, 101300800, 101300700, 101301200, 101300300, 101300400,
        101300100, 101301100, 101300600, 101300900,
    ],
    "120": [101260300, 101260500, 101260100, 101260600, 101260400, 101260200],
    "130": [101310400, 101310900, 101310100, 101310600, 101310200, 101310300, 101310500, 101310700, 101310800],
    "140": [
        101090200, 101090400, 101090700, 101090800, 101091000, 101090600, 101091100, 101090100, 101090500, 101090900,
        101090300,
    ],
    "150": [
        101180200, 101181200, 101181100, 101181800, 101180800, 101180900, 101181500, 101180700, 101180500, 101181300,
        101181000, 101181700, 101180300, 101180400, 101180600, 101180100, 101181600,
    ],
    "160": [
        101050800, 101050100, 101050600, 101051100, 101050400, 101051000, 101050300, 101050200, 101050900, 101050500,
        101051200, 101050700,
    ],
    "170": [
        101200500, 101200600, 101200800, 101201200, 101201500, 101201000, 101201100, 101201700, 101201600, 101200100,
        101200200, 101200400, 101200700, 101201400, 101200900,
    ],
    "180": [
        101250100, 101250500, 101250600, 101250400, 101251200, 101250800, 101250900, 101250200, 101250700, 101251000,
        101251300, 101250300, 101251100,
    ],
    "190": [101060500, 101060800, 101060100, 101060600, 101060300, 101060700, 101060400],
    "200": [
        101240400, 101240700, 101240200, 101240600, 101240800, 101240100, 101240900, 101240300, 101241000, 101240500,
        101241100,
    ],
    "210": [
        101070300, 101070500, 101071200, 101070200, 101070600, 101070400, 101070900, 101071400, 101070700, 101071000,
        101071300, 101070100, 101071100, 101070800,
    ],
    "220": [
        101081200, 101080200, 101080800, 101080500, 101080600, 101080700, 101080400, 101080300, 101080900, 101081100,
    ],
    "230": [101170400, 101170200, 101170300, 101170100, 101170500],
    "240": [101150200, 101150100],
    "250": [
        101121100, 101120400, 101121200, 101121000, 101120100, 101120700, 101120900, 101121700, 101120200, 101121500,
        101120800, 101120600, 101121300, 101120500, 101120300, 101121400,
    ],
    "260": [
        101100500, 101100200, 101100400, 101100600, 101101100, 101100900, 101100100, 101101000, 101100300, 101100800,
    ],
    "270": [
        101110700, 101110900, 101110800, 101110600, 101111000, 101110500, 101110100, 101110200, 101110300, 101110400,
    ],
    "280": [
        101270900, 101270100, 101270600, 101271700, 101270800, 101271800, 101271000, 101271400, 101270400, 101271500,
        101270500, 101271200, 101270200, 101270700, 101271100, 101271600, 101270300, 101271300,
    ],
    "290": [101140300, 101140100, 101140400, 101140600, 101140500],
    "300": [101131700, 101130900, 101130200, 101131600, 101130800, 101131800, 101132000, 101130100, 101131900],
    "310": [101290300, 101290100, 101290800, 101290900, 101290500, 101290200, 101290400, 101290700],
    "340": [101341100],
    "050": [
        101281500, 101281600, 101280800, 101280100, 101280300, 101281200, 101281100, 101281900, 101280400, 101282000,
        101281300, 101280200, 101280500, 101280600, 101282100, 101281400, 101281800, 101280700, 101280900, 101281000,
        101281700,
    ],
    "060": [
        101191100, 101190900, 101191000, 101190100, 101190500, 101190400, 101191300, 101191200, 101190200, 101190600,
        101190700, 101190300,
    ],
    "070": [
        101210100, 101210200, 101210300, 101210900, 101210800, 101210400, 101211000, 101210500, 101210600, 101210700,
        101211100,
    ],
    "080": [
        101220600, 101220200, 101220900, 101221000, 101221500, 101220800, 101220100, 101220400, 101221100, 101221600,
        101221400, 101220500, 101220700, 101221200, 101220300, 101221300,
    ],
    "090": [101230100, 101230700, 101230300, 101230900, 101230400, 101230500, 101230800, 101230200, 101230600],
    a6: [101010100, 101020100, 101030100, 101040100, 101320300, 101330100],
};

const provinceIdNameMap = [
    {
        value: "100",
        label: "甘肃",
    },
    {
        value: "110",
        label: "广西",
    },
    {
        value: "120",
        label: "贵州",
    },
    {
        value: "130",
        label: "海南",
    },
    {
        value: "140",
        label: "河北",
    },
    {
        value: "150",
        label: "河南",
    },
    {
        value: "160",
        label: "黑龙江",
    },
    {
        value: "170",
        label: "湖北",
    },
    {
        value: "180",
        label: "湖南",
    },
    {
        value: "190",
        label: "吉林",
    },
    {
        value: "200",
        label: "江西",
    },
    {
        value: "210",
        label: "辽宁",
    },
    {
        value: "220",
        label: "内蒙古",
    },
    {
        value: "230",
        label: "宁夏",
    },
    {
        value: "240",
        label: "青海",
    },
    {
        value: "250",
        label: "山东",
    },
    {
        value: "260",
        label: "山西",
    },
    {
        value: "270",
        label: "陕西",
    },
    {
        value: "280",
        label: "四川",
    },
    {
        value: "290",
        label: "西藏",
    },
    {
        value: "300",
        label: "新疆",
    },
    {
        value: "310",
        label: "云南",
    },
    {
        value: "340",
        label: "台湾",
    },
    {
        value: "050",
        label: "广东",
    },
    {
        value: "060",
        label: "江苏",
    },
    {
        value: "070",
        label: "浙江",
    },
    {
        value: "080",
        label: "安徽",
    },
    {
        value: "090",
        label: "福建",
    },
    {
        value: "a6",
        label: "直辖市、特别行政区",
    },
];
function initReqMatchFilter(rawMatchFilter: ApiReq.MatchFilter): MatchFilter {
    let matchFilter = { ...rawMatchFilter } as MatchFilter;
    let cityId: number | number[] | undefined = rawMatchFilter.cityId;
    if (!cityId || (cityId && Array.isArray(cityId) && cityId.length === 0)) {
        cityId = provincialCapital;
    }
    if (rawMatchFilter.startTime) matchFilter.startTime = new Date(rawMatchFilter.startTime);
    if (rawMatchFilter.endTime) matchFilter.startTime = new Date(rawMatchFilter.endTime);

    matchFilter.cityId = cityId;
    return matchFilter;
}
function getTheCurrentYearDateScope() {
    let endTime = new Date();
    let startTime = new Date();
    startTime.setFullYear(endTime.getFullYear() - 3);
    return { startTime, endTime };
}
