/**
 * 清朝统治者Mock数据
 * Qing Dynasty Ruler Mock Data
 * 
 * 包含从努尔哈赤到溥仪的完整数据
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import type { QingRuler } from './types';

/**
 * 清朝统治者Mock数据
 */
export const qingRulerMockData: QingRuler[] = [
  {
    id: 'nurhaci',
    name: '努尔哈赤',
    templeName: '太祖',
    eraName: '天命',
    reignStart: 1616,
    reignEnd: 1626,
    policies: [
      {
        name: '八旗制度',
        year: 1615,
        description: '创建八旗制度，将满族社会组织军事化',
        impact: '奠定了清朝军事和社会组织的基础'
      },
      {
        name: '创制满文',
        year: 1599,
        description: '命额尔德尼、噶盖创制满文',
        impact: '为满族文化发展奠定基础'
      }
    ],
    majorEvents: [
      {
        name: '建立后金',
        year: 1616,
        role: '建立者',
        description: '在赫图阿拉称汗，建立后金政权'
      },
      {
        name: '萨尔浒之战',
        year: 1619,
        role: '统帅',
        description: '大败明军，奠定后金崛起基础'
      },
      {
        name: '宁远之战',
        year: 1626,
        role: '统帅',
        description: '攻打宁远城失败，被袁崇焕击退'
      }
    ],
    contribution: '统一女真各部，建立后金政权，创建八旗制度，为清朝入主中原奠定基础',
    responsibility: '对明朝发动战争，造成辽东地区大量人口伤亡',
    evaluations: [
      {
        source: '《清史稿》',
        content: '太祖承天广运圣德神功肇纪立极仁孝睿武端毅钦安弘文定业高皇帝，姓爱新觉罗氏，讳努尔哈赤。',
        author: '赵尔巽'
      }
    ],
    biography: '清太祖努尔哈赤，清朝奠基者，统一女真各部，建立后金政权，创建八旗制度。',
    sources: ['《清史稿》', '《满洲实录》']
  },
  {
    id: 'huangtaiji',
    name: '皇太极',
    templeName: '太宗',
    eraName: '崇德',
    reignStart: 1626,
    reignEnd: 1643,
    policies: [
      {
        name: '改国号为清',
        year: 1636,
        description: '将后金改为大清，称皇帝',
        impact: '标志着清朝正式建立'
      },
      {
        name: '完善八旗制度',
        year: 1635,
        description: '增设蒙古八旗和汉军八旗',
        impact: '扩大了清朝的军事力量和统治基础'
      },
      {
        name: '招降明将',
        description: '大力招降明朝将领，如洪承畴等',
        impact: '削弱明朝军事力量，增强清朝实力'
      }
    ],
    majorEvents: [
      {
        name: '松锦大战',
        year: 1642,
        role: '决策者',
        description: '大败明军，俘获洪承畴'
      },
      {
        name: '征服朝鲜',
        year: 1636,
        role: '统帅',
        description: '迫使朝鲜称臣'
      }
    ],
    contribution: '改国号为清，完善政治制度，为入关统一中国做好准备',
    responsibility: '继续对明朝发动战争，造成大量人员伤亡',
    evaluations: [
      {
        source: '《清史稿》',
        content: '太宗允文允武，内修政事，外勤讨伐，用兵如神，所向无敌。',
        author: '赵尔巽'
      }
    ],
    biography: '清太宗皇太极，努尔哈赤第八子，改国号为清，为清朝入关奠定基础。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'shunzhi',
    name: '福临',
    templeName: '世祖',
    eraName: '顺治',
    reignStart: 1643,
    reignEnd: 1661,
    policies: [
      {
        name: '入关定鼎',
        year: 1644,
        description: '在多尔衮辅佐下入关，定都北京',
        impact: '清朝正式成为全国性政权'
      },
      {
        name: '剃发易服',
        year: 1645,
        description: '强制推行剃发易服政策',
        impact: '引发强烈反抗，造成大量伤亡'
      },
      {
        name: '招抚政策',
        description: '对投降的明朝官员予以重用',
        impact: '加速了清朝对全国的统一'
      }
    ],
    majorEvents: [
      {
        name: '入关',
        year: 1644,
        role: '皇帝',
        description: '清军入关，定都北京'
      },
      {
        name: '扬州十日',
        year: 1645,
        role: '在位皇帝',
        description: '清军屠杀扬州城'
      }
    ],
    contribution: '完成入关，统一中国大部分地区',
    responsibility: '剃发易服政策引发民族矛盾，扬州十日等屠杀事件',
    evaluations: [
      {
        source: '《清史稿》',
        content: '世祖冲龄践阼，摄政睿亲王多尔衮定鼎燕京，抚绑中外。',
        author: '赵尔巽'
      }
    ],
    biography: '清世祖福临，年号顺治，清朝入关后第一位皇帝，在位期间完成统一中国大业。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'kangxi',
    name: '玄烨',
    templeName: '圣祖',
    eraName: '康熙',
    reignStart: 1661,
    reignEnd: 1722,
    policies: [
      {
        name: '平定三藩',
        year: 1681,
        description: '平定吴三桂等三藩之乱',
        impact: '巩固了清朝的统一'
      },
      {
        name: '收复台湾',
        year: 1683,
        description: '派施琅收复台湾',
        impact: '完成全国统一'
      },
      {
        name: '永不加赋',
        year: 1712,
        description: '宣布以康熙五十年人丁数为准，永不加赋',
        impact: '减轻农民负担，促进人口增长'
      },
      {
        name: '编纂典籍',
        description: '编纂《康熙字典》《古今图书集成》等',
        impact: '保存和传承中华文化'
      }
    ],
    majorEvents: [
      {
        name: '三藩之乱',
        year: 1673,
        role: '决策者',
        description: '平定吴三桂、尚可喜、耿精忠叛乱'
      },
      {
        name: '雅克萨之战',
        year: 1685,
        role: '决策者',
        description: '击退沙俄入侵，签订《尼布楚条约》'
      },
      {
        name: '三征噶尔丹',
        year: 1690,
        role: '亲征统帅',
        description: '三次亲征准噶尔部噶尔丹'
      }
    ],
    contribution: '平定三藩、收复台湾、抵御沙俄、平定准噶尔，开创康乾盛世',
    responsibility: '文字狱开始兴起，闭关锁国政策延续',
    evaluations: [
      {
        source: '《清史稿》',
        content: '圣祖仁孝性成，智勇天锡。早承大业，勤政爱民。经文纬武，寰宇一统。',
        author: '赵尔巽'
      }
    ],
    biography: '清圣祖玄烨，年号康熙，在位61年，是中国历史上在位时间最长的皇帝，开创康乾盛世。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'yongzheng',
    name: '胤禛',
    templeName: '世宗',
    eraName: '雍正',
    reignStart: 1722,
    reignEnd: 1735,
    policies: [
      {
        name: '摊丁入亩',
        year: 1723,
        description: '将丁银摊入田赋征收',
        impact: '简化税制，减轻无地农民负担'
      },
      {
        name: '设立军机处',
        year: 1729,
        description: '设立军机处，加强皇权',
        impact: '标志着君主专制达到顶峰'
      },
      {
        name: '改土归流',
        description: '在西南地区推行改土归流政策',
        impact: '加强了对西南地区的控制'
      },
      {
        name: '整顿吏治',
        description: '严厉打击贪腐，推行养廉银制度',
        impact: '改善了官场风气'
      }
    ],
    majorEvents: [
      {
        name: '九子夺嫡',
        year: 1722,
        role: '胜出者',
        description: '在激烈的皇位争夺中胜出'
      },
      {
        name: '年羹尧案',
        year: 1726,
        role: '决策者',
        description: '处死功臣年羹尧'
      }
    ],
    contribution: '整顿吏治，改革税制，充实国库，为乾隆盛世奠定基础',
    responsibility: '大兴文字狱，加强思想控制',
    evaluations: [
      {
        source: '《清史稿》',
        content: '世宗宪皇帝，圣祖第四子也。康熙三十七年封贝勒，四十八年晋封雍亲王。',
        author: '赵尔巽'
      }
    ],
    biography: '清世宗胤禛，年号雍正，以勤政著称，在位13年，承上启下，为乾隆盛世奠定基础。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'qianlong',
    name: '弘历',
    templeName: '高宗',
    eraName: '乾隆',
    reignStart: 1735,
    reignEnd: 1796,
    policies: [
      {
        name: '十全武功',
        description: '平定准噶尔、大小金川等十次重大军事行动',
        impact: '开疆拓土，清朝疆域达到最大'
      },
      {
        name: '编纂《四库全书》',
        year: 1773,
        description: '组织编纂《四库全书》',
        impact: '保存大量古籍，但也借机销毁禁书'
      },
      {
        name: '六下江南',
        description: '六次南巡江南',
        impact: '了解民情，但也造成巨大开支'
      }
    ],
    majorEvents: [
      {
        name: '平定准噶尔',
        year: 1757,
        role: '决策者',
        description: '彻底平定准噶尔部'
      },
      {
        name: '平定大小金川',
        year: 1776,
        role: '决策者',
        description: '平定四川大小金川土司叛乱'
      },
      {
        name: '马戛尔尼使团',
        year: 1793,
        role: '接见者',
        description: '接见英国使团，拒绝通商要求'
      }
    ],
    contribution: '康乾盛世达到顶峰，疆域最大，文化繁荣',
    responsibility: '大兴文字狱，闭关锁国，晚年宠信和珅导致贪腐盛行',
    evaluations: [
      {
        source: '《清史稿》',
        content: '高宗运际郅隆，励精图治，开疆拓宇，四征不庭，揆文奋武，于斯为盛。',
        author: '赵尔巽'
      }
    ],
    biography: '清高宗弘历，年号乾隆，在位60年，是中国历史上实际执政时间最长的皇帝。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'jiaqing',
    name: '颙琰',
    templeName: '仁宗',
    eraName: '嘉庆',
    reignStart: 1796,
    reignEnd: 1820,
    policies: [
      {
        name: '诛杀和珅',
        year: 1799,
        description: '乾隆帝驾崩后立即诛杀和珅',
        impact: '抄没和珅家产，充实国库'
      },
      {
        name: '镇压白莲教',
        description: '镇压白莲教起义',
        impact: '耗费大量军费，国力衰退'
      }
    ],
    majorEvents: [
      {
        name: '白莲教起义',
        year: 1796,
        role: '镇压者',
        description: '历时九年镇压白莲教起义'
      },
      {
        name: '天理教攻入紫禁城',
        year: 1813,
        role: '在位皇帝',
        description: '天理教徒攻入紫禁城'
      }
    ],
    contribution: '诛杀和珅，整顿吏治',
    responsibility: '未能扭转清朝衰落趋势，闭关锁国政策延续',
    evaluations: [
      {
        source: '《清史稿》',
        content: '仁宗初逢训政，恭谨无违。迨躬亲大政，惩贪黜佞，以为守成令主。',
        author: '赵尔巽'
      }
    ],
    biography: '清仁宗颙琰，年号嘉庆，在位期间清朝由盛转衰。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'daoguang',
    name: '旻宁',
    templeName: '宣宗',
    eraName: '道光',
    reignStart: 1820,
    reignEnd: 1850,
    policies: [
      {
        name: '禁烟运动',
        year: 1839,
        description: '任命林则徐禁烟',
        impact: '引发鸦片战争'
      },
      {
        name: '节俭治国',
        description: '提倡节俭，减少宫廷开支',
        impact: '效果有限，未能改变国势'
      }
    ],
    majorEvents: [
      {
        name: '鸦片战争',
        year: 1840,
        role: '在位皇帝',
        description: '中国近代史开端，签订《南京条约》'
      },
      {
        name: '虎门销烟',
        year: 1839,
        role: '决策者',
        description: '支持林则徐虎门销烟'
      }
    ],
    contribution: '支持禁烟运动',
    responsibility: '鸦片战争失败，签订不平等条约，中国开始沦为半殖民地半封建社会',
    evaluations: [
      {
        source: '《清史稿》',
        content: '宣宗恭俭之德，宽仁之量，守成之令辟也。',
        author: '赵尔巽'
      }
    ],
    biography: '清宣宗旻宁，年号道光，在位期间发生鸦片战争，中国开始沦为半殖民地半封建社会。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'xianfeng',
    name: '奕詝',
    templeName: '文宗',
    eraName: '咸丰',
    reignStart: 1850,
    reignEnd: 1861,
    policies: [
      {
        name: '镇压太平天国',
        description: '组织镇压太平天国运动',
        impact: '战争持续多年，国力大损'
      }
    ],
    majorEvents: [
      {
        name: '太平天国运动',
        year: 1851,
        role: '在位皇帝',
        description: '太平天国起义爆发'
      },
      {
        name: '第二次鸦片战争',
        year: 1856,
        role: '在位皇帝',
        description: '英法联军入侵，火烧圆明园'
      },
      {
        name: '逃往热河',
        year: 1860,
        role: '逃亡者',
        description: '英法联军攻入北京，咸丰帝逃往热河'
      }
    ],
    contribution: '任用曾国藩等汉族官员镇压太平天国',
    responsibility: '第二次鸦片战争失败，圆明园被焚毁，签订更多不平等条约',
    evaluations: [
      {
        source: '《清史稿》',
        content: '文宗遭阳九之运，躬明夷之会。外患内讧，相逼而来。',
        author: '赵尔巽'
      }
    ],
    biography: '清文宗奕詝，年号咸丰，在位期间内忧外患，太平天国运动和第二次鸦片战争相继爆发。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'tongzhi',
    name: '载淳',
    templeName: '穆宗',
    eraName: '同治',
    reignStart: 1861,
    reignEnd: 1875,
    policies: [
      {
        name: '同治中兴',
        description: '在慈禧太后和恭亲王主导下推行洋务运动',
        impact: '一定程度上增强了国力'
      },
      {
        name: '洋务运动',
        description: '创办近代军事工业和民用工业',
        impact: '开启中国近代化进程'
      }
    ],
    majorEvents: [
      {
        name: '辛酉政变',
        year: 1861,
        role: '幼帝',
        description: '慈禧太后发动政变，开始垂帘听政'
      },
      {
        name: '平定太平天国',
        year: 1864,
        role: '在位皇帝',
        description: '曾国藩攻克天京，太平天国灭亡'
      }
    ],
    contribution: '在位期间实现"同治中兴"',
    responsibility: '实际权力掌握在慈禧太后手中，个人作为有限',
    evaluations: [
      {
        source: '《清史稿》',
        content: '穆宗冲龄即位，母后垂帘。国运中兴，十年之间，盗贼划平，中外乂安。',
        author: '赵尔巽'
      }
    ],
    biography: '清穆宗载淳，年号同治，六岁即位，实际权力由慈禧太后掌握。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'guangxu',
    name: '载湉',
    templeName: '德宗',
    eraName: '光绪',
    reignStart: 1875,
    reignEnd: 1908,
    policies: [
      {
        name: '戊戌变法',
        year: 1898,
        description: '支持康有为、梁启超等人推行变法',
        impact: '变法失败，光绪帝被囚禁'
      },
      {
        name: '废除科举',
        year: 1905,
        description: '废除延续千年的科举制度',
        impact: '推动教育近代化'
      }
    ],
    majorEvents: [
      {
        name: '甲午战争',
        year: 1894,
        role: '在位皇帝',
        description: '中日甲午战争失败，签订《马关条约》'
      },
      {
        name: '戊戌变法',
        year: 1898,
        role: '支持者',
        description: '支持变法，变法失败后被囚禁'
      },
      {
        name: '八国联军侵华',
        year: 1900,
        role: '在位皇帝',
        description: '八国联军攻入北京，签订《辛丑条约》'
      }
    ],
    contribution: '支持戊戌变法，试图改革图强',
    responsibility: '一生受制于慈禧太后，无力挽救清朝',
    evaluations: [
      {
        source: '《清史稿》',
        content: '德宗亲政之时，春秋方富，抱大有为之志，欲张挞伐，以湔国耻。',
        author: '赵尔巽'
      }
    ],
    biography: '清德宗载湉，年号光绪，一生受制于慈禧太后，是中国近代史上悲剧性的皇帝。',
    sources: ['《清史稿》', '《清实录》']
  },
  {
    id: 'puyi',
    name: '溥仪',
    templeName: '（无庙号）',
    eraName: '宣统',
    reignStart: 1908,
    reignEnd: 1912,
    policies: [],
    majorEvents: [
      {
        name: '辛亥革命',
        year: 1911,
        role: '在位皇帝',
        description: '辛亥革命爆发，清朝统治动摇'
      },
      {
        name: '清帝退位',
        year: 1912,
        role: '退位者',
        description: '颁布退位诏书，清朝灭亡'
      },
      {
        name: '伪满洲国',
        year: 1932,
        role: '傀儡皇帝',
        description: '在日本扶持下成为伪满洲国皇帝'
      }
    ],
    contribution: '和平退位，避免更大流血冲突',
    responsibility: '后成为伪满洲国傀儡皇帝，充当日本侵略中国的工具',
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
 * 获取所有清朝统治者数据
 */
export async function getQingRulers(): Promise<{ data: QingRuler[] }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: qingRulerMockData };
}

/**
 * 根据ID获取清朝统治者
 */
export async function getQingRulerById(id: string): Promise<{ data: QingRuler | null }> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const ruler = qingRulerMockData.find(r => r.id === id) || null;
  return { data: ruler };
}
