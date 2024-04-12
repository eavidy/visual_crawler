const cityIdMap: Record<number, string> = {
  101010100: "北京",
  101020100: "上海",
  101030100: "天津",
  101040100: "重庆",
  101050100: "哈尔滨",
  101050200: "齐齐哈尔",
  101050300: "牡丹江",
  101050400: "佳木斯",
  101050500: "绥化",
  101050600: "黑河",
  101050700: "伊春",
  101050800: "大庆",
  101050900: "七台河",
  101051000: "鸡西",
  101051100: "鹤岗",
  101051200: "双鸭山",
  101051300: "大兴安岭地区",
  101060100: "长春",
  101060300: "四平",
  101060400: "通化",
  101060500: "白城",
  101060600: "辽源",
  101060700: "松原",
  101060800: "白山",
  101060900: "延边朝鲜族自治州",
  101070100: "沈阳",
  101070200: "大连",
  101070300: "鞍山",
  101070400: "抚顺",
  101070500: "本溪",
  101070600: "丹东",
  101070700: "锦州",
  101070800: "营口",
  101070900: "阜新",
  101071000: "辽阳",
  101071100: "铁岭",
  101071200: "朝阳",
  101071300: "盘锦",
  101071400: "葫芦岛",
  101080100: "呼和浩特",
  101080200: "包头",
  101080300: "乌海",
  101080400: "通辽",
  101080500: "赤峰",
  101080600: "鄂尔多斯",
  101080700: "呼伦贝尔",
  101080800: "巴彦淖尔",
  101080900: "乌兰察布",
  101081000: "锡林郭勒盟",
  101081100: "兴安盟",
  101081200: "阿拉善盟",
  101090100: "石家庄",
  101090200: "保定",
  101090300: "张家口",
  101090400: "承德",
  101090500: "唐山",
  101090600: "廊坊",
  101090700: "沧州",
  101090800: "衡水",
  101090900: "邢台",
  101091000: "邯郸",
  101091100: "秦皇岛",
  101100100: "太原",
  101100200: "大同",
  101100300: "阳泉",
  101100400: "晋中",
  101100500: "长治",
  101100600: "晋城",
  101100700: "临汾",
  101100800: "运城",
  101100900: "朔州",
  101101000: "忻州",
  101101100: "吕梁",
  101110100: "西安",
  101110200: "咸阳",
  101110300: "延安",
  101110400: "榆林",
  101110500: "渭南",
  101110600: "商洛",
  101110700: "安康",
  101110800: "汉中",
  101110900: "宝鸡",
  101111000: "铜川",
  101120100: "济南",
  101120200: "青岛",
  101120300: "淄博",
  101120400: "德州",
  101120500: "烟台",
  101120600: "潍坊",
  101120700: "济宁",
  101120800: "泰安",
  101120900: "临沂",
  101121000: "菏泽",
  101121100: "滨州",
  101121200: "东营",
  101121300: "威海",
  101121400: "枣庄",
  101121500: "日照",
  101121700: "聊城",
  101130100: "乌鲁木齐",
  101130200: "克拉玛依",
  101130300: "昌吉回族自治州",
  101130400: "巴音郭楞蒙古自治州",
  101130500: "博尔塔拉蒙古自治州",
  101130600: "伊犁哈萨克自治州",
  101130800: "吐鲁番",
  101130900: "哈密",
  101131000: "阿克苏地区",
  101131100: "克孜勒苏柯尔克孜自治州",
  101131200: "喀什地区",
  101131300: "和田地区",
  101131400: "塔城地区",
  101131500: "阿勒泰地区",
  101131600: "石河子",
  101131700: "阿拉尔",
  101131800: "图木舒克",
  101131900: "五家渠",
  101132000: "铁门关",
  101132100: "北屯市",
  101132200: "可克达拉市",
  101132300: "昆玉市",
  101132400: "双河市",
  101132500: "新星市",
  101140100: "拉萨",
  101140200: "日喀则",
  101140300: "昌都",
  101140400: "林芝",
  101140500: "山南",
  101140600: "那曲",
  101140700: "阿里地区",
  101150100: "西宁",
  101150200: "海东",
  101150300: "海北藏族自治州",
  101150400: "黄南藏族自治州",
  101150500: "海南藏族自治州",
  101150600: "果洛藏族自治州",
  101150700: "玉树藏族自治州",
  101150800: "海西蒙古族藏族自治州",
  101160100: "兰州",
  101160200: "定西",
  101160300: "平凉",
  101160400: "庆阳",
  101160500: "武威",
  101160600: "金昌",
  101160700: "张掖",
  101160800: "酒泉",
  101160900: "天水",
  101161000: "白银",
  101161100: "陇南",
  101161200: "嘉峪关",
  101161300: "临夏回族自治州",
  101161400: "甘南藏族自治州",
  101170100: "银川",
  101170200: "石嘴山",
  101170300: "吴忠",
  101170400: "固原",
  101170500: "中卫",
  101180100: "郑州",
  101180200: "安阳",
  101180300: "新乡",
  101180400: "许昌",
  101180500: "平顶山",
  101180600: "信阳",
  101180700: "南阳",
  101180800: "开封",
  101180900: "洛阳",
  101181000: "商丘",
  101181100: "焦作",
  101181200: "鹤壁",
  101181300: "濮阳",
  101181400: "周口",
  101181500: "漯河",
  101181600: "驻马店",
  101181700: "三门峡",
  101181800: "济源",
  101190100: "南京",
  101190200: "无锡",
  101190300: "镇江",
  101190400: "苏州",
  101190500: "南通",
  101190600: "扬州",
  101190700: "盐城",
  101190800: "徐州",
  101190900: "淮安",
  101191000: "连云港",
  101191100: "常州",
  101191200: "泰州",
  101191300: "宿迁",
  101200100: "武汉",
  101200200: "襄阳",
  101200300: "鄂州",
  101200400: "孝感",
  101200500: "黄冈",
  101200600: "黄石",
  101200700: "咸宁",
  101200800: "荆州",
  101200900: "宜昌",
  101201000: "十堰",
  101201100: "随州",
  101201200: "荆门",
  101201300: "恩施土家族苗族自治州",
  101201400: "仙桃",
  101201500: "潜江",
  101201600: "天门",
  101201700: "神农架",
  101210100: "杭州",
  101210200: "湖州",
  101210300: "嘉兴",
  101210400: "宁波",
  101210500: "绍兴",
  101210600: "台州",
  101210700: "温州",
  101210800: "丽水",
  101210900: "金华",
  101211000: "衢州",
  101211100: "舟山",
  101220100: "合肥",
  101220200: "蚌埠",
  101220300: "芜湖",
  101220400: "淮南",
  101220500: "马鞍山",
  101220600: "安庆",
  101220700: "宿州",
  101220800: "阜阳",
  101220900: "亳州",
  101221000: "滁州",
  101221100: "淮北",
  101221200: "铜陵",
  101221300: "宣城",
  101221400: "六安",
  101221500: "池州",
  101221600: "黄山",
  101230100: "福州",
  101230200: "厦门",
  101230300: "宁德",
  101230400: "莆田",
  101230500: "泉州",
  101230600: "漳州",
  101230700: "龙岩",
  101230800: "三明",
  101230900: "南平",
  101240100: "南昌",
  101240200: "九江",
  101240300: "上饶",
  101240400: "抚州",
  101240500: "宜春",
  101240600: "吉安",
  101240700: "赣州",
  101240800: "景德镇",
  101240900: "萍乡",
  101241000: "新余",
  101241100: "鹰潭",
  101250100: "长沙",
  101250200: "湘潭",
  101250300: "株洲",
  101250400: "衡阳",
  101250500: "郴州",
  101250600: "常德",
  101250700: "益阳",
  101250800: "娄底",
  101250900: "邵阳",
  101251000: "岳阳",
  101251100: "张家界",
  101251200: "怀化",
  101251300: "永州",
  101251400: "湘西土家族苗族自治州",
  101260100: "贵阳",
  101260200: "遵义",
  101260300: "安顺",
  101260400: "铜仁",
  101260500: "毕节",
  101260600: "六盘水",
  101260700: "黔东南苗族侗族自治州",
  101260800: "黔南布依族苗族自治州",
  101260900: "黔西南布依族苗族自治州",
  101270100: "成都",
  101270200: "攀枝花",
  101270300: "自贡",
  101270400: "绵阳",
  101270500: "南充",
  101270600: "达州",
  101270700: "遂宁",
  101270800: "广安",
  101270900: "巴中",
  101271000: "泸州",
  101271100: "宜宾",
  101271200: "内江",
  101271300: "资阳",
  101271400: "乐山",
  101271500: "眉山",
  101271600: "雅安",
  101271700: "德阳",
  101271800: "广元",
  101271900: "阿坝藏族羌族自治州",
  101272000: "凉山彝族自治州",
  101272100: "甘孜藏族自治州",
  101280100: "广州",
  101280200: "韶关",
  101280300: "惠州",
  101280400: "梅州",
  101280500: "汕头",
  101280600: "深圳",
  101280700: "珠海",
  101280800: "佛山",
  101280900: "肇庆",
  101281000: "湛江",
  101281100: "江门",
  101281200: "河源",
  101281300: "清远",
  101281400: "云浮",
  101281500: "潮州",
  101281600: "东莞",
  101281700: "中山",
  101281800: "阳江",
  101281900: "揭阳",
  101282000: "茂名",
  101282100: "汕尾",
  101282200: "东沙群岛",
  101290100: "昆明",
  101290200: "曲靖",
  101290300: "保山",
  101290400: "玉溪",
  101290500: "普洱",
  101290700: "昭通",
  101290800: "临沧",
  101290900: "丽江",
  101291000: "西双版纳傣族自治州",
  101291100: "文山壮族苗族自治州",
  101291200: "红河哈尼族彝族自治州",
  101291300: "德宏傣族景颇族自治州",
  101291400: "怒江傈僳族自治州",
  101291500: "迪庆藏族自治州",
  101291600: "大理白族自治州",
  101291700: "楚雄彝族自治州",
  101300100: "南宁",
  101300200: "崇左",
  101300300: "柳州",
  101300400: "来宾",
  101300500: "桂林",
  101300600: "梧州",
  101300700: "贺州",
  101300800: "贵港",
  101300900: "玉林",
  101301000: "百色",
  101301100: "钦州",
  101301200: "河池",
  101301300: "北海",
  101301400: "防城港",
  101310100: "海口",
  101310200: "三亚",
  101310300: "三沙",
  101310400: "儋州",
  101310500: "五指山",
  101310600: "琼海",
  101310700: "文昌",
  101310800: "万宁",
  101310900: "东方",
  101311000: "定安",
  101311100: "屯昌",
  101311200: "澄迈",
  101311300: "临高",
  101311400: "白沙黎族自治县",
  101311500: "昌江黎族自治县",
  101311600: "乐东黎族自治县",
  101311700: "陵水黎族自治县",
  101311800: "保亭黎族苗族自治县",
  101311900: "琼中黎族苗族自治县",
  101320300: "香港",
  101330100: "澳门",
  101341100: "台湾",
};
export default cityIdMap;
