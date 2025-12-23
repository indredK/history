/**
 * 帝王Mock数据
 * Emperor Mock Data
 * 
 * 包含从五帝时期至清末的代表性帝王数据
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import type { Emperor } from './types';

/**
 * 帝王Mock数据
 * 按朝代和时间顺序排列
 */
export const emperorMockData: Emperor[] = [
  // 上古时期 - 五帝
  {
    id: 'huangdi',
    name: '黄帝',
    posthumousName: '轩辕氏',
    dynasty: '上古',
    reignStart: -2697,
    reignEnd: -2597,
    eraNames: [],
    achievements: [
      '统一华夏部落，被尊为中华民族的人文始祖',
      '发明指南车、舟车等器具',
      '创制历法、文字、音律',
      '开创中华文明的基础'
    ],
    failures: [],
    evaluations: [
      {
        source: '《史记·五帝本纪》',
        content: '黄帝者，少典之子，姓公孙，名曰轩辕。生而神灵，弱而能言，幼而徇齐，长而敦敏，成而聪明。',
        author: '司马迁'
      }
    ],
    biography: '黄帝，中国古代部落联盟首领，五帝之首。传说他统一了华夏各部落，被尊为中华民族的人文始祖。',
    sources: ['《史记》', '《山海经》']
  },
  {
    id: 'yao',
    name: '尧',
    posthumousName: '放勋',
    dynasty: '上古',
    reignStart: -2356,
    reignEnd: -2255,
    eraNames: [],
    achievements: [
      '制定历法，确定四季',
      '设立官职，建立政治制度',
      '禅让帝位给舜，开创禅让制度',
      '治理洪水，任用鲧治水'
    ],
    failures: [
      '任用鲧治水九年未成'
    ],
    evaluations: [
      {
        source: '《尚书·尧典》',
        content: '曰若稽古帝尧，曰放勋，钦明文思安安，允恭克让，光被四表，格于上下。',
        author: '佚名'
      }
    ],
    biography: '尧，上古时期部落联盟首领，以仁德著称，开创禅让制度。',
    sources: ['《尚书》', '《史记》']
  },
  // 秦朝
  {
    id: 'qinshihuang',
    name: '嬴政',
    templeName: '始皇帝',
    dynasty: '秦',
    reignStart: -221,
    reignEnd: -210,
    eraNames: [],
    achievements: [
      '统一六国，建立中国历史上第一个统一的中央集权国家',
      '统一文字、货币、度量衡',
      '修建万里长城，抵御匈奴',
      '建立郡县制，奠定中国两千年政治制度基础',
      '修建驰道，统一车轨'
    ],
    failures: [
      '焚书坑儒，摧残文化',
      '大兴土木，修建阿房宫、骊山陵墓，劳民伤财',
      '严刑峻法，导致民怨沸腾',
      '求仙问药，晚年昏聩'
    ],
    evaluations: [
      {
        source: '《史记·秦始皇本纪》',
        content: '秦王怀贪鄙之心，行自奋之智，不信功臣，不亲士民，废王道而立私爱，焚文书而酷刑法。',
        author: '司马迁'
      },
      {
        source: '《过秦论》',
        content: '及至始皇，奋六世之余烈，振长策而御宇内，吞二周而亡诸侯，履至尊而制六合。',
        author: '贾谊'
      }
    ],
    biography: '秦始皇嬴政，中国历史上第一位皇帝，统一六国，建立秦朝，开创皇帝制度。',
    sources: ['《史记》', '《汉书》', '《过秦论》']
  },
  // 西汉
  {
    id: 'hangaozu',
    name: '刘邦',
    templeName: '高祖',
    posthumousName: '高皇帝',
    dynasty: '西汉',
    dynastyPeriod: '西汉',
    reignStart: -202,
    reignEnd: -195,
    eraNames: [],
    achievements: [
      '推翻秦朝暴政，建立汉朝',
      '击败项羽，统一天下',
      '实行休养生息政策，恢复社会经济',
      '建立汉朝政治制度，奠定四百年基业'
    ],
    failures: [
      '诛杀功臣，如韩信、彭越等',
      '未能妥善处理吕后专权问题',
      '白登之围，被匈奴围困'
    ],
    evaluations: [
      {
        source: '《史记·高祖本纪》',
        content: '高祖为人，隆准而龙颜，美须髯，左股有七十二黑子。仁而爱人，喜施，意豁如也。',
        author: '司马迁'
      }
    ],
    biography: '汉高祖刘邦，汉朝开国皇帝，出身平民，以布衣之身取得天下。',
    sources: ['《史记》', '《汉书》']
  },
  {
    id: 'hanwudi',
    name: '刘彻',
    templeName: '世宗',
    posthumousName: '孝武皇帝',
    dynasty: '西汉',
    dynastyPeriod: '西汉',
    reignStart: -141,
    reignEnd: -87,
    eraNames: [
      { name: '建元', startYear: -140, endYear: -135 },
      { name: '元光', startYear: -134, endYear: -129 },
      { name: '元朔', startYear: -128, endYear: -123 },
      { name: '元狩', startYear: -122, endYear: -117 },
      { name: '元鼎', startYear: -116, endYear: -111 },
      { name: '元封', startYear: -110, endYear: -105 },
      { name: '太初', startYear: -104, endYear: -101 },
      { name: '天汉', startYear: -100, endYear: -97 },
      { name: '太始', startYear: -96, endYear: -93 },
      { name: '征和', startYear: -92, endYear: -89 },
      { name: '后元', startYear: -88, endYear: -87 }
    ],
    achievements: [
      '罢黜百家，独尊儒术，确立儒学正统地位',
      '派张骞出使西域，开辟丝绸之路',
      '北击匈奴，拓展疆域',
      '设立太学，推行察举制',
      '颁布推恩令，削弱诸侯势力'
    ],
    failures: [
      '穷兵黩武，国库空虚',
      '晚年迷信方术，追求长生',
      '巫蛊之祸，太子刘据被逼自杀',
      '任用酷吏，刑法严苛'
    ],
    evaluations: [
      {
        source: '《汉书·武帝纪》',
        content: '孝武初立，卓然罢黜百家，表章六经。遂畴咨海内，举其俊茂，与之立功。',
        author: '班固'
      },
      {
        source: '《资治通鉴》',
        content: '孝武穷奢极欲，繁刑重敛，内侈宫室，外事四夷，信惑神怪，巡游无度。',
        author: '司马光'
      }
    ],
    biography: '汉武帝刘彻，西汉第七位皇帝，在位54年，是中国历史上最伟大的皇帝之一。',
    sources: ['《史记》', '《汉书》', '《资治通鉴》']
  },
  // 唐朝
  {
    id: 'tangtaizong',
    name: '李世民',
    templeName: '太宗',
    posthumousName: '文皇帝',
    dynasty: '唐',
    reignStart: 626,
    reignEnd: 649,
    eraNames: [
      { name: '贞观', startYear: 627, endYear: 649 }
    ],
    achievements: [
      '开创贞观之治，政治清明，经济繁荣',
      '虚心纳谏，任用贤臣如魏征、房玄龄、杜如晦',
      '击败东突厥，被尊为"天可汗"',
      '完善科举制度，选拔人才',
      '修订律令，编纂《贞观律》'
    ],
    failures: [
      '玄武门之变，杀兄弟夺位',
      '晚年征高句丽失败',
      '晚年渐趋奢侈，不如初年节俭'
    ],
    evaluations: [
      {
        source: '《旧唐书·太宗本纪》',
        content: '太宗文武之才，高出前古。盖三代以还，中国之盛未之有也。',
        author: '刘昫'
      },
      {
        source: '《贞观政要》',
        content: '太宗皇帝圣德神功，超迈前古，虽尧舜禹汤，无以加焉。',
        author: '吴兢'
      }
    ],
    biography: '唐太宗李世民，唐朝第二位皇帝，开创贞观之治，被誉为中国历史上最杰出的皇帝之一。',
    sources: ['《旧唐书》', '《新唐书》', '《贞观政要》', '《资治通鉴》']
  },
  {
    id: 'tangxuanzong',
    name: '李隆基',
    templeName: '玄宗',
    posthumousName: '明皇帝',
    dynasty: '唐',
    reignStart: 712,
    reignEnd: 756,
    eraNames: [
      { name: '先天', startYear: 712, endYear: 713 },
      { name: '开元', startYear: 713, endYear: 741 },
      { name: '天宝', startYear: 742, endYear: 756 }
    ],
    achievements: [
      '开创开元盛世，唐朝国力达到鼎盛',
      '任用姚崇、宋璟等贤相',
      '改革吏治，整顿财政',
      '发展文化艺术，诗歌繁荣'
    ],
    failures: [
      '晚年宠信杨贵妃，荒废朝政',
      '任用李林甫、杨国忠等奸臣',
      '安史之乱爆发，唐朝由盛转衰',
      '逃往蜀地，太子即位'
    ],
    evaluations: [
      {
        source: '《旧唐书·玄宗本纪》',
        content: '玄宗少历民间，身经险难，故即位之初，知人疾苦，躬勤庶政。',
        author: '刘昫'
      },
      {
        source: '《资治通鉴》',
        content: '明皇之初，励精图治，至于开元之末，天下大治。及其晚节，委任非人，遂致大乱。',
        author: '司马光'
      }
    ],
    biography: '唐玄宗李隆基，唐朝第七位皇帝，前期开创开元盛世，后期因安史之乱导致唐朝衰落。',
    sources: ['《旧唐书》', '《新唐书》', '《资治通鉴》']
  },
  // 宋朝
  {
    id: 'songtaizu',
    name: '赵匡胤',
    templeName: '太祖',
    posthumousName: '启运立极英武睿文神德圣功至明大孝皇帝',
    dynasty: '北宋',
    dynastyPeriod: '北宋',
    reignStart: 960,
    reignEnd: 976,
    eraNames: [
      { name: '建隆', startYear: 960, endYear: 963 },
      { name: '乾德', startYear: 963, endYear: 968 },
      { name: '开宝', startYear: 968, endYear: 976 }
    ],
    achievements: [
      '陈桥兵变，建立宋朝',
      '杯酒释兵权，和平解除武将兵权',
      '统一南方诸国',
      '重文轻武，发展文治',
      '制定祖宗家法，防止武将专权'
    ],
    failures: [
      '未能收复燕云十六州',
      '重文轻武政策导致军事力量薄弱',
      '死因成谜，烛影斧声'
    ],
    evaluations: [
      {
        source: '《宋史·太祖本纪》',
        content: '太祖起介胄之中，践九五之位，原其得国，视晋、汉、周亦岂甚相绝哉？',
        author: '脱脱'
      }
    ],
    biography: '宋太祖赵匡胤，宋朝开国皇帝，通过陈桥兵变黄袍加身，结束五代十国分裂局面。',
    sources: ['《宋史》', '《续资治通鉴长编》']
  },
  // 元朝
  {
    id: 'yuanshizu',
    name: '忽必烈',
    templeName: '世祖',
    posthumousName: '圣德神功文武皇帝',
    dynasty: '元',
    reignStart: 1260,
    reignEnd: 1294,
    eraNames: [
      { name: '中统', startYear: 1260, endYear: 1264 },
      { name: '至元', startYear: 1264, endYear: 1294 }
    ],
    achievements: [
      '建立元朝，统一中国',
      '定都大都（北京），奠定北京作为首都的地位',
      '推行行省制度，加强中央集权',
      '发展海外贸易，促进中外交流',
      '重用汉族官员，推行汉法'
    ],
    failures: [
      '两次征日本失败',
      '民族歧视政策，将人分为四等',
      '晚年穷兵黩武，国库空虚'
    ],
    evaluations: [
      {
        source: '《元史·世祖本纪》',
        content: '世祖度量弘广，知人善任，信用儒术，用能以夏变夷，立经陈纪，所以为一代之制者，规模宏远矣。',
        author: '宋濂'
      }
    ],
    biography: '元世祖忽必烈，元朝开国皇帝，成吉思汗之孙，统一中国，建立元朝。',
    sources: ['《元史》', '《新元史》']
  },
  // 明朝
  {
    id: 'mingtaizu',
    name: '朱元璋',
    templeName: '太祖',
    posthumousName: '开天行道肇纪立极大圣至神仁文义武俊德成功高皇帝',
    dynasty: '明',
    reignStart: 1368,
    reignEnd: 1398,
    eraNames: [
      { name: '洪武', startYear: 1368, endYear: 1398 }
    ],
    achievements: [
      '推翻元朝统治，建立明朝',
      '驱逐蒙古，恢复汉族政权',
      '制定《大明律》，完善法制',
      '实行卫所制度，加强军事',
      '发展农业，减轻农民负担'
    ],
    failures: [
      '大肆诛杀功臣，如胡惟庸案、蓝玉案',
      '废除丞相制度，皇权过度集中',
      '实行海禁政策，限制对外贸易',
      '文字狱盛行，钳制思想'
    ],
    evaluations: [
      {
        source: '《明史·太祖本纪》',
        content: '太祖以聪明神武之资，抱济世安民之志，乘时应运，豪杰景从，戡乱摧强，十五载而成帝业。',
        author: '张廷玉'
      }
    ],
    biography: '明太祖朱元璋，明朝开国皇帝，出身贫农，从乞丐到皇帝，是中国历史上最具传奇色彩的皇帝之一。',
    sources: ['《明史》', '《明实录》']
  },
  {
    id: 'mingchengzu',
    name: '朱棣',
    templeName: '成祖',
    posthumousName: '启天弘道高明肇运圣武神功纯仁至孝文皇帝',
    dynasty: '明',
    reignStart: 1402,
    reignEnd: 1424,
    eraNames: [
      { name: '永乐', startYear: 1403, endYear: 1424 }
    ],
    achievements: [
      '迁都北京，奠定明清两代首都',
      '派郑和七下西洋，扬威海外',
      '编纂《永乐大典》，保存文化典籍',
      '五次亲征蒙古，巩固北方边防',
      '设立内阁制度'
    ],
    failures: [
      '靖难之役夺位，杀戮建文旧臣',
      '大兴土木，营建北京，劳民伤财',
      '设立东厂，加强特务统治'
    ],
    evaluations: [
      {
        source: '《明史·成祖本纪》',
        content: '文皇少长习兵，据幽燕形胜之地，乘建文孱弱，长驱内向，奄有四海。',
        author: '张廷玉'
      }
    ],
    biography: '明成祖朱棣，明朝第三位皇帝，通过靖难之役夺取皇位，开创永乐盛世。',
    sources: ['《明史》', '《明实录》']
  },
  // 清朝
  {
    id: 'qingshizu',
    name: '福临',
    templeName: '世祖',
    posthumousName: '体天隆运定统建极英睿钦文显武大德弘功至仁纯孝章皇帝',
    dynasty: '清',
    reignStart: 1643,
    reignEnd: 1661,
    eraNames: [
      { name: '顺治', startYear: 1644, endYear: 1661 }
    ],
    achievements: [
      '入关定鼎，统一中国',
      '任用汉族官员，推行满汉一体',
      '整顿吏治，惩治贪腐'
    ],
    failures: [
      '剃发易服令，引发民族矛盾',
      '扬州十日、嘉定三屠等屠杀事件',
      '晚年沉迷佛教，欲出家为僧'
    ],
    evaluations: [
      {
        source: '《清史稿·世祖本纪》',
        content: '世祖冲龄践阼，摄政睿亲王多尔衮定鼎燕京，抚绥中外。',
        author: '赵尔巽'
      }
    ],
    biography: '清世祖福临，清朝入关后第一位皇帝，年号顺治，在位期间完成统一中国大业。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'qingshengzu',
    name: '玄烨',
    templeName: '圣祖',
    posthumousName: '合天弘运文武睿哲恭俭宽裕孝敬诚信中和功德大成仁皇帝',
    dynasty: '清',
    reignStart: 1661,
    reignEnd: 1722,
    eraNames: [
      { name: '康熙', startYear: 1662, endYear: 1722 }
    ],
    achievements: [
      '平定三藩之乱，巩固统一',
      '收复台湾，统一全国',
      '三征噶尔丹，平定准噶尔叛乱',
      '签订《尼布楚条约》，划定中俄边界',
      '编纂《康熙字典》、《古今图书集成》',
      '在位61年，是中国历史上在位时间最长的皇帝'
    ],
    failures: [
      '晚年九子夺嫡，朝政混乱',
      '文字狱开始兴起',
      '闭关锁国政策延续'
    ],
    evaluations: [
      {
        source: '《清史稿·圣祖本纪》',
        content: '圣祖仁孝性成，智勇天锡。早承大业，勤政爱民。经文纬武，寰宇一统。',
        author: '赵尔巽'
      }
    ],
    biography: '清圣祖玄烨，年号康熙，清朝第四位皇帝，在位61年，开创康乾盛世。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'qinggaozong',
    name: '弘历',
    templeName: '高宗',
    posthumousName: '法天隆运至诚先觉体元立极敷文奋武钦明孝慈神圣纯皇帝',
    dynasty: '清',
    reignStart: 1735,
    reignEnd: 1796,
    eraNames: [
      { name: '乾隆', startYear: 1736, endYear: 1795 }
    ],
    achievements: [
      '平定准噶尔、大小金川等叛乱',
      '编纂《四库全书》，保存文化典籍',
      '十全武功，开疆拓土',
      '康乾盛世达到顶峰'
    ],
    failures: [
      '大兴文字狱，钳制思想',
      '六下江南，奢侈浪费',
      '晚年宠信和珅，贪腐盛行',
      '闭关锁国，错失发展机遇'
    ],
    evaluations: [
      {
        source: '《清史稿·高宗本纪》',
        content: '高宗运际郅隆，励精图治，开疆拓宇，四征不庭，揆文奋武，于斯为盛。',
        author: '赵尔巽'
      }
    ],
    biography: '清高宗弘历，年号乾隆，清朝第六位皇帝，在位60年，是中国历史上实际执政时间最长的皇帝。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'qingdezong',
    name: '载湉',
    templeName: '德宗',
    posthumousName: '同天崇运大中至正经文纬武仁孝睿智端俭宽勤景皇帝',
    dynasty: '清',
    reignStart: 1875,
    reignEnd: 1908,
    eraNames: [
      { name: '光绪', startYear: 1875, endYear: 1908 }
    ],
    achievements: [
      '支持戊戌变法，试图改革图强',
      '创办京师大学堂（北京大学前身）',
      '废除科举制度'
    ],
    failures: [
      '甲午战争失败，签订《马关条约》',
      '戊戌变法失败，被慈禧囚禁',
      '八国联军侵华，签订《辛丑条约》',
      '一生受制于慈禧太后'
    ],
    evaluations: [
      {
        source: '《清史稿·德宗本纪》',
        content: '德宗亲政之时，春秋方富，抱大有为之志，欲张挞伐，以湔国耻。',
        author: '赵尔巽'
      }
    ],
    biography: '清德宗载湉，年号光绪，清朝第十一位皇帝，一生受制于慈禧太后，是中国近代史上悲剧性的皇帝。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'puyi',
    name: '溥仪',
    templeName: '（无庙号）',
    posthumousName: '（无谥号）',
    dynasty: '清',
    reignStart: 1908,
    reignEnd: 1912,
    eraNames: [
      { name: '宣统', startYear: 1909, endYear: 1912 }
    ],
    achievements: [
      '和平退位，避免更大流血冲突',
      '新中国成立后改造成为公民'
    ],
    failures: [
      '年幼即位，无力挽救清朝',
      '后成为伪满洲国傀儡皇帝',
      '充当日本侵略中国的工具'
    ],
    evaluations: [
      {
        source: '《我的前半生》',
        content: '我是中国最后一个皇帝，也是一个被改造好的公民。',
        author: '溥仪'
      }
    ],
    biography: '溥仪，清朝末代皇帝，年号宣统，三岁即位，六岁退位，后成为伪满洲国皇帝，新中国成立后被改造为公民。',
    sources: ['《清史稿》', '《我的前半生》']
  }
];

/**
 * 获取所有帝王数据
 */
export async function getEmperors(): Promise<{ data: Emperor[] }> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: emperorMockData };
}

/**
 * 根据ID获取帝王
 */
export async function getEmperorById(id: string): Promise<{ data: Emperor | null }> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const emperor = emperorMockData.find(e => e.id === id) || null;
  return { data: emperor };
}

/**
 * 获取所有朝代列表
 */
export function getDynasties(): string[] {
  const dynasties = [...new Set(emperorMockData.map(e => e.dynasty))];
  return dynasties;
}
