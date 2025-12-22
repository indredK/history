/**
 * 宗教关系 Mock 数据
 * Religion Relationship Mock Data
 * 
 * Requirements: 4.3, 4.4, 4.5
 * 包含中国古代宗教体系和西游记神仙关系
 */

import type { ReligionGraphData } from './types';

export const mockReligionData: ReligionGraphData = {
  nodes: [
    // ============ 三清 (道教最高神) ============
    {
      id: 'yuanshi',
      name: '元始天尊',
      type: 'deity',
      sect: '阐教',
      title: '阐教教主',
      description: '道教三清之首，阐教创始人，居于玉虚宫。封神大战中支持周武王伐纣。',
      source: '《封神演义》《道藏》',
      attributes: {
        power: '开天辟地、万法归宗',
        weapon: '盘古幡',
      }
    },
    {
      id: 'lingbao',
      name: '灵宝天尊',
      type: 'deity',
      sect: '截教',
      title: '截教教主',
      description: '道教三清之一，又称通天教主，截教创始人，居于碧游宫。主张有教无类。',
      source: '《封神演义》《道藏》',
      attributes: {
        power: '诛仙剑阵',
        weapon: '诛仙四剑',
      }
    },
    {
      id: 'taishang',
      name: '太上老君',
      type: 'deity',
      sect: '人教',
      title: '人教教主',
      description: '道教三清之一，人教创始人，居于兜率宫。西游记中多次出场，炼制仙丹。',
      source: '《封神演义》《西游记》',
      attributes: {
        power: '炼丹术、八卦炉',
        weapon: '金刚琢',
        mount: '青牛',
      }
    },

    // ============ 阐教十二金仙 ============
    {
      id: 'guangchengzi',
      name: '广成子',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙之首',
      description: '阐教十二金仙之首，居于九仙山桃源洞，黄帝之师。',
      source: '《封神演义》',
      attributes: {
        weapon: '番天印',
      }
    },
    {
      id: 'chijingzi',
      name: '赤精子',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于太华山云霄洞，殷洪之师。',
      source: '《封神演义》',
      attributes: {
        weapon: '阴阳镜',
      }
    },
    {
      id: 'taiyi',
      name: '太乙真人',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于乾元山金光洞，哪吒之师。',
      source: '《封神演义》',
      attributes: {
        weapon: '九龙神火罩',
      }
    },
    {
      id: 'yuding',
      name: '玉鼎真人',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于玉泉山金霞洞，杨戬之师。',
      source: '《封神演义》',
    },
    {
      id: 'huanglong',
      name: '黄龙真人',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于二仙山麻姑洞，无徒弟。',
      source: '《封神演义》',
    },
    {
      id: 'wenshuguangfa',
      name: '文殊广法天尊',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于五龙山云霄洞，金吒之师，后入佛门为文殊菩萨。',
      source: '《封神演义》',
      attributes: {
        weapon: '遁龙桩',
      }
    },
    {
      id: 'puxianzhenren',
      name: '普贤真人',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于九宫山白鹤洞，木吒之师，后入佛门为普贤菩萨。',
      source: '《封神演义》',
      attributes: {
        weapon: '吴钩剑',
      }
    },
    {
      id: 'cihang',
      name: '慈航道人',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于普陀山落伽洞，后入佛门为观音菩萨。',
      source: '《封神演义》',
      attributes: {
        weapon: '清净琉璃瓶',
      }
    },
    {
      id: 'juxian',
      name: '惧留孙',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于夹龙山飞云洞，土行孙之师，后入佛门。',
      source: '《封神演义》',
      attributes: {
        weapon: '捆仙绳',
      }
    },
    {
      id: 'daoxing',
      name: '道行天尊',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于金庭山玉屋洞，韦护之师。',
      source: '《封神演义》',
      attributes: {
        weapon: '降魔杵',
      }
    },
    {
      id: 'qingxu',
      name: '清虚道德真君',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于青峰山紫阳洞，黄天化之师。',
      source: '《封神演义》',
      attributes: {
        weapon: '五火七禽扇',
      }
    },
    {
      id: 'lingbaofa',
      name: '灵宝大法师',
      type: 'deity',
      sect: '阐教',
      title: '十二金仙',
      description: '阐教十二金仙之一，居于崆峒山元阳洞。',
      source: '《封神演义》',
    },
    {
      id: 'yunzhongzi',
      name: '云中子',
      type: 'deity',
      sect: '阐教',
      title: '阐教仙人',
      description: '阐教仙人，居于终南山玉柱洞，元始天尊弟子，雷震子之师。曾献松木剑斩妲己未果。',
      source: '《封神演义》',
      attributes: {
        weapon: '照妖鉴、通天神火柱',
      }
    },

    // ============ 阐教弟子 ============
    {
      id: 'nezha',
      name: '哪吒',
      type: 'deity',
      sect: '阐教',
      title: '三坛海会大神',
      description: '太乙真人弟子，李靖三子，莲花化身，封神后为三坛海会大神。',
      source: '《封神演义》《西游记》',
      attributes: {
        power: '三头六臂',
        weapon: '乾坤圈、混天绫、风火轮',
      }
    },
    {
      id: 'yangjian',
      name: '杨戬',
      type: 'deity',
      sect: '阐教',
      title: '二郎显圣真君',
      description: '玉鼎真人弟子，玉帝外甥，拥有天眼，法力高强。',
      source: '《封神演义》《西游记》',
      attributes: {
        power: '八九玄功、天眼',
        weapon: '三尖两刃刀',
        mount: '哮天犬',
      }
    },
    {
      id: 'jinzha',
      name: '金吒',
      type: 'deity',
      sect: '阐教',
      title: '前部正神',
      description: '文殊广法天尊弟子，李靖长子，封神后为前部正神。',
      source: '《封神演义》',
      attributes: {
        weapon: '遁龙桩',
      }
    },
    {
      id: 'muzha',
      name: '木吒',
      type: 'deity',
      sect: '阐教',
      title: '惠岸行者',
      description: '普贤真人弟子，李靖次子，后随观音菩萨为惠岸行者。',
      source: '《封神演义》《西游记》',
      attributes: {
        weapon: '吴钩剑',
      }
    },
    {
      id: 'huangtianhua',
      name: '黄天化',
      type: 'deity',
      sect: '阐教',
      title: '炳灵公',
      description: '清虚道德真君弟子，黄飞虎之子，封神后为炳灵公。',
      source: '《封神演义》',
      attributes: {
        weapon: '攒心钉、莫邪宝剑',
      }
    },
    {
      id: 'tuxingsun',
      name: '土行孙',
      type: 'deity',
      sect: '阐教',
      title: '土府星君',
      description: '惧留孙弟子，身材矮小但善于土遁，封神后为土府星君。',
      source: '《封神演义》',
      attributes: {
        power: '土遁术',
        weapon: '捆仙绳',
      }
    },
    {
      id: 'weihu',
      name: '韦护',
      type: 'deity',
      sect: '阐教',
      title: '韦陀护法',
      description: '道行天尊弟子，后入佛门为韦陀护法。',
      source: '《封神演义》',
      attributes: {
        weapon: '降魔杵',
      }
    },
    {
      id: 'leizhenzi',
      name: '雷震子',
      type: 'deity',
      sect: '阐教',
      title: '雷部正神',
      description: '云中子弟子，文王第一百子，生有双翅，封神后为雷部正神。',
      source: '《封神演义》',
      attributes: {
        power: '风雷双翅',
        weapon: '黄金棍',
      }
    },

    // ============ 截教门人 ============
    {
      id: 'duobao',
      name: '多宝道人',
      type: 'deity',
      sect: '截教',
      title: '截教大弟子',
      description: '通天教主大弟子，法力高强，后入西方教化为如来佛祖。',
      source: '《封神演义》',
      attributes: {
        power: '万仙阵',
      }
    },
    {
      id: 'wudang',
      name: '无当圣母',
      type: 'deity',
      sect: '截教',
      title: '截教四大弟子',
      description: '通天教主四大弟子之一，后入西方教为黎山老母。',
      source: '《封神演义》',
    },
    {
      id: 'jinling',
      name: '金灵圣母',
      type: 'deity',
      sect: '截教',
      title: '截教四大弟子',
      description: '通天教主四大弟子之一，万仙阵中战死，封神为斗姆元君。',
      source: '《封神演义》',
      attributes: {
        weapon: '龙虎如意',
      }
    },
    {
      id: 'guiling',
      name: '龟灵圣母',
      type: 'deity',
      sect: '截教',
      title: '截教四大弟子',
      description: '通天教主四大弟子之一，万仙阵中被西方教收服。',
      source: '《封神演义》',
    },
    {
      id: 'yunxiao',
      name: '云霄',
      type: 'deity',
      sect: '截教',
      title: '三霄娘娘',
      description: '截教三霄之首，与碧霄、琼霄合称三霄娘娘，掌九曲黄河阵。',
      source: '《封神演义》',
      attributes: {
        weapon: '混元金斗',
      }
    },
    {
      id: 'bixiao',
      name: '碧霄',
      type: 'deity',
      sect: '截教',
      title: '三霄娘娘',
      description: '截教三霄之一，与云霄、琼霄合称三霄娘娘。',
      source: '《封神演义》',
      attributes: {
        weapon: '金蛟剪',
      }
    },
    {
      id: 'qiongxiao',
      name: '琼霄',
      type: 'deity',
      sect: '截教',
      title: '三霄娘娘',
      description: '截教三霄之一，与云霄、碧霄合称三霄娘娘。',
      source: '《封神演义》',
      attributes: {
        weapon: '金蛟剪',
      }
    },
    {
      id: 'zhaogongming',
      name: '赵公明',
      type: 'deity',
      sect: '截教',
      title: '财神',
      description: '截教门人，三霄之兄，法力高强，封神后为财神。',
      source: '《封神演义》',
      attributes: {
        weapon: '定海珠、缚龙索',
        mount: '黑虎',
      }
    },
    {
      id: 'shiji',
      name: '石矶娘娘',
      type: 'deity',
      sect: '截教',
      title: '截教散仙',
      description: '截教散仙，因弟子被哪吒所杀而与阐教结怨。',
      source: '《封神演义》',
    },
    {
      id: 'shenggongbao',
      name: '申公豹',
      type: 'deity',
      sect: '截教',
      title: '截教叛徒',
      description: '原为阐教弟子，后叛投截教，封神大战中挑拨离间。',
      source: '《封神演义》',
      attributes: {
        power: '唤神术',
      }
    },
    {
      id: 'wenyao',
      name: '闻仲',
      type: 'deity',
      sect: '截教',
      title: '太师',
      description: '截教金灵圣母弟子，商朝太师，封神后为九天应元雷声普化天尊。',
      source: '《封神演义》',
      attributes: {
        weapon: '雌雄双鞭',
        mount: '墨麒麟',
      }
    },

    // ============ 西方教/佛门 ============
    {
      id: 'jieyin',
      name: '接引道人',
      type: 'deity',
      sect: '西方教',
      title: '西方教教主',
      description: '西方教教主，后为阿弥陀佛，与准提道人共创西方极乐世界。',
      source: '《封神演义》',
      attributes: {
        power: '接引众生',
      }
    },
    {
      id: 'zhunti',
      name: '准提道人',
      type: 'deity',
      sect: '西方教',
      title: '西方教二教主',
      description: '西方教二教主，后为菩提老祖，孙悟空之师。',
      source: '《封神演义》《西游记》',
      attributes: {
        power: '七宝妙树',
      }
    },
    {
      id: 'rulai',
      name: '如来佛祖',
      type: 'deity',
      sect: '佛门',
      title: '佛祖',
      description: '佛教创始人，西天灵山雷音寺之主，镇压孙悟空于五行山下。',
      source: '《西游记》',
      attributes: {
        power: '如来神掌、五行山',
      }
    },
    {
      id: 'guanyin',
      name: '观音菩萨',
      type: 'deity',
      sect: '佛门',
      title: '南海观世音',
      description: '大慈大悲观世音菩萨，居于南海普陀山，西游记中多次帮助唐僧师徒。',
      source: '《西游记》',
      attributes: {
        power: '杨柳甘露',
        weapon: '净瓶杨柳',
      }
    },
    {
      id: 'wenshu',
      name: '文殊菩萨',
      type: 'deity',
      sect: '佛门',
      title: '文殊广法天尊',
      description: '四大菩萨之一，智慧第一，原为阐教文殊广法天尊。',
      source: '《封神演义》《西游记》',
      attributes: {
        mount: '青狮',
      }
    },
    {
      id: 'puxian',
      name: '普贤菩萨',
      type: 'deity',
      sect: '佛门',
      title: '普贤真人',
      description: '四大菩萨之一，原为阐教普贤真人。',
      source: '《封神演义》《西游记》',
      attributes: {
        mount: '白象',
      }
    },

    // ============ 天庭神仙 ============
    {
      id: 'yudi',
      name: '玉皇大帝',
      type: 'deity',
      sect: '天庭',
      title: '昊天上帝',
      description: '天庭之主，统领三界，西游记中派遣天兵天将捉拿孙悟空。',
      source: '《西游记》',
      attributes: {
        power: '统御三界',
      }
    },
    {
      id: 'wangmu',
      name: '王母娘娘',
      type: 'deity',
      sect: '天庭',
      title: '西王母',
      description: '天庭女仙之首，掌管蟠桃园，每年举办蟠桃盛会。',
      source: '《西游记》',
      attributes: {
        power: '蟠桃',
      }
    },
    {
      id: 'lijing',
      name: '李靖',
      type: 'deity',
      sect: '天庭',
      title: '托塔天王',
      description: '天庭托塔天王，哪吒之父，手持玲珑宝塔。',
      source: '《封神演义》《西游记》',
      attributes: {
        weapon: '玲珑宝塔',
      }
    },
    {
      id: 'taibai',
      name: '太白金星',
      type: 'deity',
      sect: '天庭',
      title: '太白金星',
      description: '天庭使者，多次下凡招安孙悟空。',
      source: '《西游记》',
    },
    {
      id: 'juling',
      name: '巨灵神',
      type: 'deity',
      sect: '天庭',
      title: '先锋官',
      description: '天庭先锋官，大闹天宫时第一个与孙悟空交战。',
      source: '《西游记》',
      attributes: {
        weapon: '宣花斧',
      }
    },
    {
      id: 'sitianjun',
      name: '四大天王',
      type: 'deity',
      sect: '天庭',
      title: '护法天王',
      description: '天庭四大护法天王，分别持剑、琵琶、伞、蛇。',
      source: '《西游记》',
    },
    {
      id: 'erlangshenjun',
      name: '二十八宿',
      type: 'deity',
      sect: '天庭',
      title: '星宿神',
      description: '天庭二十八位星宿神，各司其职。',
      source: '《西游记》',
    },
    {
      id: 'change',
      name: '嫦娥',
      type: 'deity',
      sect: '天庭',
      title: '月宫仙子',
      description: '月宫仙子，后羿之妻，因偷吃仙丹飞升月宫。',
      source: '《西游记》',
    },
    {
      id: 'wugang',
      name: '吴刚',
      type: 'deity',
      sect: '天庭',
      title: '月宫伐桂',
      description: '月宫中伐桂之人，因犯天条被罚永远砍桂树。',
      source: '民间传说',
    },

    // ============ 西游记主角 ============
    {
      id: 'sunwukong',
      name: '孙悟空',
      type: 'deity',
      sect: '佛门',
      title: '齐天大圣/斗战胜佛',
      description: '花果山美猴王，拜菩提祖师学艺，大闹天宫后被如来镇压，后保护唐僧西天取经，成斗战胜佛。',
      source: '《西游记》',
      attributes: {
        power: '七十二变、筋斗云',
        weapon: '如意金箍棒',
      }
    },
    {
      id: 'tangseng',
      name: '唐僧',
      type: 'deity',
      sect: '佛门',
      title: '旃檀功德佛',
      description: '金蝉子转世，大唐高僧，奉命西天取经，取经成功后成旃檀功德佛。',
      source: '《西游记》',
    },
    {
      id: 'zhubajie',
      name: '猪八戒',
      type: 'deity',
      sect: '佛门',
      title: '天蓬元帅/净坛使者',
      description: '原为天蓬元帅，因调戏嫦娥被贬下凡，后保护唐僧取经，成净坛使者。',
      source: '《西游记》',
      attributes: {
        weapon: '九齿钉耙',
      }
    },
    {
      id: 'shawujing',
      name: '沙悟净',
      type: 'deity',
      sect: '佛门',
      title: '卷帘大将/金身罗汉',
      description: '原为卷帘大将，因打碎琉璃盏被贬流沙河，后保护唐僧取经，成金身罗汉。',
      source: '《西游记》',
      attributes: {
        weapon: '降妖宝杖',
      }
    },
    {
      id: 'bailongma',
      name: '白龙马',
      type: 'deity',
      sect: '佛门',
      title: '八部天龙',
      description: '西海龙王三太子，因纵火烧毁明珠被贬，后化为白马驮唐僧取经，成八部天龙。',
      source: '《西游记》',
    },

    // ============ 门派节点 ============
    {
      id: 'sect_chanjiao',
      name: '阐教',
      type: 'sect',
      description: '以元始天尊为教主的道教门派，主张顺天应人，门下有十二金仙。封神大战中支持周武王。',
      source: '《封神演义》',
    },
    {
      id: 'sect_jiejiao',
      name: '截教',
      type: 'sect',
      description: '以通天教主为教主的道教门派，主张有教无类，门人众多。封神大战中支持商纣王。',
      source: '《封神演义》',
    },
    {
      id: 'sect_xifangjiao',
      name: '西方教',
      type: 'sect',
      description: '以接引道人和准提道人为教主，后发展为佛教。封神大战中收服大量截教门人。',
      source: '《封神演义》',
    },
    {
      id: 'sect_renjiao',
      name: '人教',
      type: 'sect',
      description: '以太上老君为教主的道教门派，门人稀少但实力强大。',
      source: '《封神演义》',
    },
    {
      id: 'sect_tianting',
      name: '天庭',
      type: 'sect',
      description: '以玉皇大帝为首的天界政权，统御三界神仙。',
      source: '《西游记》',
    },
    {
      id: 'sect_fomen',
      name: '佛门',
      type: 'sect',
      description: '以如来佛祖为首的佛教体系，西天灵山为总部。',
      source: '《西游记》',
    },
  ],

  edges: [
    // ============ 三清关系 ============
    { id: 'e1', source: 'yuanshi', target: 'lingbao', relationship: '兄弟', description: '三清同辈', bidirectional: true },
    { id: 'e2', source: 'yuanshi', target: 'taishang', relationship: '兄弟', description: '三清同辈', bidirectional: true },
    { id: 'e3', source: 'lingbao', target: 'taishang', relationship: '兄弟', description: '三清同辈', bidirectional: true },

    // ============ 阐教师徒关系 ============
    { id: 'e4', source: 'yuanshi', target: 'guangchengzi', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e5', source: 'yuanshi', target: 'chijingzi', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e6', source: 'yuanshi', target: 'taiyi', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e7', source: 'yuanshi', target: 'yuding', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e55', source: 'yuanshi', target: 'huanglong', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e56', source: 'yuanshi', target: 'wenshuguangfa', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e57', source: 'yuanshi', target: 'puxianzhenren', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e58', source: 'yuanshi', target: 'cihang', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e59', source: 'yuanshi', target: 'juxian', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e60', source: 'yuanshi', target: 'daoxing', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e61', source: 'yuanshi', target: 'qingxu', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e62', source: 'yuanshi', target: 'lingbaofa', relationship: '师徒', description: '元始天尊座下' },
    { id: 'e94', source: 'yuanshi', target: 'yunzhongzi', relationship: '师徒', description: '元始天尊座下' },
    
    // 阐教三代弟子
    { id: 'e8', source: 'taiyi', target: 'nezha', relationship: '师徒', description: '太乙真人收哪吒为徒' },
    { id: 'e9', source: 'yuding', target: 'yangjian', relationship: '师徒', description: '玉鼎真人收杨戬为徒' },
    { id: 'e63', source: 'wenshuguangfa', target: 'jinzha', relationship: '师徒', description: '文殊广法天尊收金吒为徒' },
    { id: 'e64', source: 'puxianzhenren', target: 'muzha', relationship: '师徒', description: '普贤真人收木吒为徒' },
    { id: 'e65', source: 'qingxu', target: 'huangtianhua', relationship: '师徒', description: '清虚道德真君收黄天化为徒' },
    { id: 'e66', source: 'juxian', target: 'tuxingsun', relationship: '师徒', description: '惧留孙收土行孙为徒' },
    { id: 'e67', source: 'daoxing', target: 'weihu', relationship: '师徒', description: '道行天尊收韦护为徒' },
    { id: 'e95', source: 'yunzhongzi', target: 'leizhenzi', relationship: '师徒', description: '云中子收雷震子为徒' },

    // ============ 阐教同门关系 ============
    { id: 'e10', source: 'guangchengzi', target: 'chijingzi', relationship: '同门', description: '十二金仙同门', bidirectional: true },
    { id: 'e11', source: 'guangchengzi', target: 'taiyi', relationship: '同门', description: '十二金仙同门', bidirectional: true },
    { id: 'e12', source: 'guangchengzi', target: 'yuding', relationship: '同门', description: '十二金仙同门', bidirectional: true },
    { id: 'e13', source: 'nezha', target: 'yangjian', relationship: '同门', description: '阐教三代弟子', bidirectional: true },
    { id: 'e68', source: 'jinzha', target: 'muzha', relationship: '兄弟', description: '李靖之子', bidirectional: true },
    { id: 'e69', source: 'jinzha', target: 'nezha', relationship: '兄弟', description: '李靖之子', bidirectional: true },
    { id: 'e70', source: 'muzha', target: 'nezha', relationship: '兄弟', description: '李靖之子', bidirectional: true },

    // ============ 截教师徒关系 ============
    { id: 'e14', source: 'lingbao', target: 'duobao', relationship: '师徒', description: '通天教主大弟子' },
    { id: 'e15', source: 'lingbao', target: 'wudang', relationship: '师徒', description: '通天教主座下' },
    { id: 'e16', source: 'lingbao', target: 'jinling', relationship: '师徒', description: '通天教主座下' },
    { id: 'e17', source: 'lingbao', target: 'guiling', relationship: '师徒', description: '通天教主座下' },
    { id: 'e18', source: 'lingbao', target: 'yunxiao', relationship: '师徒', description: '通天教主座下' },
    { id: 'e71', source: 'lingbao', target: 'bixiao', relationship: '师徒', description: '通天教主座下' },
    { id: 'e72', source: 'lingbao', target: 'qiongxiao', relationship: '师徒', description: '通天教主座下' },
    { id: 'e73', source: 'lingbao', target: 'zhaogongming', relationship: '师徒', description: '通天教主座下' },
    { id: 'e74', source: 'lingbao', target: 'shiji', relationship: '师徒', description: '通天教主座下' },
    { id: 'e96', source: 'yuanshi', target: 'shenggongbao', relationship: '师徒', description: '申公豹原为阐教弟子' },
    { id: 'e97', source: 'shenggongbao', target: 'sect_jiejiao', relationship: '从属', description: '申公豹叛投截教' },
    { id: 'e75', source: 'jinling', target: 'wenyao', relationship: '师徒', description: '金灵圣母收闻仲为徒' },

    // ============ 截教同门关系 ============
    { id: 'e19', source: 'duobao', target: 'wudang', relationship: '同门', description: '截教四大弟子', bidirectional: true },
    { id: 'e20', source: 'duobao', target: 'jinling', relationship: '同门', description: '截教四大弟子', bidirectional: true },
    { id: 'e21', source: 'duobao', target: 'guiling', relationship: '同门', description: '截教四大弟子', bidirectional: true },
    { id: 'e76', source: 'yunxiao', target: 'bixiao', relationship: '兄弟', description: '三霄姐妹', bidirectional: true },
    { id: 'e77', source: 'yunxiao', target: 'qiongxiao', relationship: '兄弟', description: '三霄姐妹', bidirectional: true },
    { id: 'e78', source: 'bixiao', target: 'qiongxiao', relationship: '兄弟', description: '三霄姐妹', bidirectional: true },
    { id: 'e79', source: 'zhaogongming', target: 'yunxiao', relationship: '兄弟', description: '赵公明与三霄', bidirectional: true },

    // ============ 西方教/佛门关系 ============
    { id: 'e22', source: 'jieyin', target: 'zhunti', relationship: '兄弟', description: '西方教两位教主', bidirectional: true },
    { id: 'e23', source: 'duobao', target: 'rulai', relationship: '化身', description: '多宝道人入西方教化为如来' },
    { id: 'e24', source: 'rulai', target: 'guanyin', relationship: '师徒', description: '如来座下' },
    { id: 'e25', source: 'rulai', target: 'wenshu', relationship: '从属', description: '佛门菩萨' },
    { id: 'e26', source: 'rulai', target: 'puxian', relationship: '从属', description: '佛门菩萨' },
    { id: 'e27', source: 'zhunti', target: 'sunwukong', relationship: '师徒', description: '菩提祖师传授孙悟空本领' },
    { id: 'e80', source: 'cihang', target: 'guanyin', relationship: '化身', description: '慈航道人入佛门为观音菩萨' },
    { id: 'e81', source: 'wenshuguangfa', target: 'wenshu', relationship: '化身', description: '文殊广法天尊入佛门为文殊菩萨' },
    { id: 'e82', source: 'puxianzhenren', target: 'puxian', relationship: '化身', description: '普贤真人入佛门为普贤菩萨' },
    { id: 'e83', source: 'weihu', target: 'sect_fomen', relationship: '从属', description: '韦护入佛门为韦陀护法' },

    // ============ 天庭关系 ============
    { id: 'e28', source: 'yudi', target: 'wangmu', relationship: '夫妻', description: '天庭帝后', bidirectional: true },
    { id: 'e29', source: 'yudi', target: 'lijing', relationship: '从属', description: '天庭将领' },
    { id: 'e30', source: 'yudi', target: 'taibai', relationship: '从属', description: '天庭使者' },
    { id: 'e31', source: 'yudi', target: 'yangjian', relationship: '从属', description: '玉帝外甥' },
    { id: 'e32', source: 'lijing', target: 'nezha', relationship: '从属', description: '父子关系' },
    { id: 'e84', source: 'lijing', target: 'jinzha', relationship: '从属', description: '父子关系' },
    { id: 'e85', source: 'lijing', target: 'muzha', relationship: '从属', description: '父子关系' },
    { id: 'e86', source: 'yudi', target: 'juling', relationship: '从属', description: '天庭先锋' },
    { id: 'e87', source: 'yudi', target: 'sitianjun', relationship: '从属', description: '天庭护法' },
    { id: 'e88', source: 'yudi', target: 'erlangshenjun', relationship: '从属', description: '天庭星宿' },
    { id: 'e89', source: 'wangmu', target: 'change', relationship: '从属', description: '月宫仙子' },
    { id: 'e98', source: 'change', target: 'wugang', relationship: '同门', description: '月宫同住', bidirectional: true },

    // ============ 西游取经团队 ============
    { id: 'e33', source: 'guanyin', target: 'tangseng', relationship: '师徒', description: '观音点化唐僧取经' },
    { id: 'e34', source: 'tangseng', target: 'sunwukong', relationship: '师徒', description: '唐僧收孙悟空为徒' },
    { id: 'e35', source: 'tangseng', target: 'zhubajie', relationship: '师徒', description: '唐僧收猪八戒为徒' },
    { id: 'e36', source: 'tangseng', target: 'shawujing', relationship: '师徒', description: '唐僧收沙悟净为徒' },
    { id: 'e37', source: 'tangseng', target: 'bailongma', relationship: '主仆', description: '白龙马驮唐僧' },
    { id: 'e38', source: 'sunwukong', target: 'zhubajie', relationship: '同门', description: '取经师兄弟', bidirectional: true },
    { id: 'e39', source: 'sunwukong', target: 'shawujing', relationship: '同门', description: '取经师兄弟', bidirectional: true },
    { id: 'e40', source: 'zhubajie', target: 'shawujing', relationship: '同门', description: '取经师兄弟', bidirectional: true },
    { id: 'e90', source: 'guanyin', target: 'muzha', relationship: '从属', description: '惠岸行者随侍观音' },

    // ============ 阐截敌对关系 ============
    { id: 'e41', source: 'yuanshi', target: 'lingbao', relationship: '敌对', description: '封神大战对立' },
    { id: 'e42', source: 'guangchengzi', target: 'yunxiao', relationship: '敌对', description: '封神大战交战' },
    { id: 'e91', source: 'nezha', target: 'shiji', relationship: '敌对', description: '哪吒杀石矶弟子' },
    { id: 'e92', source: 'yangjian', target: 'wenyao', relationship: '敌对', description: '封神大战交战' },

    // ============ 门派从属关系 ============
    { id: 'e43', source: 'yuanshi', target: 'sect_chanjiao', relationship: '从属', description: '阐教教主' },
    { id: 'e44', source: 'lingbao', target: 'sect_jiejiao', relationship: '从属', description: '截教教主' },
    { id: 'e45', source: 'taishang', target: 'sect_renjiao', relationship: '从属', description: '人教教主' },
    { id: 'e46', source: 'jieyin', target: 'sect_xifangjiao', relationship: '从属', description: '西方教教主' },
    { id: 'e47', source: 'zhunti', target: 'sect_xifangjiao', relationship: '从属', description: '西方教二教主' },
    { id: 'e48', source: 'yudi', target: 'sect_tianting', relationship: '从属', description: '天庭之主' },
    { id: 'e49', source: 'rulai', target: 'sect_fomen', relationship: '从属', description: '佛门之主' },

    // ============ 孙悟空与天庭的敌对 ============
    { id: 'e50', source: 'sunwukong', target: 'yudi', relationship: '敌对', description: '大闹天宫' },
    { id: 'e51', source: 'sunwukong', target: 'lijing', relationship: '敌对', description: '大闹天宫交战' },
    { id: 'e52', source: 'sunwukong', target: 'nezha', relationship: '敌对', description: '大闹天宫交战' },
    { id: 'e53', source: 'sunwukong', target: 'yangjian', relationship: '敌对', description: '大闹天宫交战' },
    { id: 'e93', source: 'sunwukong', target: 'juling', relationship: '敌对', description: '大闹天宫交战' },

    // ============ 如来镇压孙悟空 ============
    { id: 'e54', source: 'rulai', target: 'sunwukong', relationship: '从属', description: '如来镇压并收服孙悟空' },
  ],

  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-12-22',
    sources: ['《封神演义》', '《西游记》', '《道藏》', '民间传说'],
  },
};
