// 朝代工具函数

// 导入背景图片资源
import xiaImage from '../../../assets/images/dynasties/xia.svg';
import shangImage from '../../../assets/images/dynasties/shang.svg';
import westernZhouImage from '../../../assets/images/dynasties/western-zhou.svg';
import easternZhouImage from '../../../assets/images/dynasties/eastern-zhou.svg';
import qinImage from '../../../assets/images/dynasties/qin.svg';
import westernHanImage from '../../../assets/images/dynasties/western-han.svg';
import xinImage from '../../../assets/images/dynasties/xin.svg';
import easternHanImage from '../../../assets/images/dynasties/eastern-han.svg';
import threeKingdomsImage from '../../../assets/images/dynasties/three-kingdoms.svg';
import weiImage from '../../../assets/images/dynasties/wei.svg';
import shuImage from '../../../assets/images/dynasties/shu.svg';
import wuImage from '../../../assets/images/dynasties/wu.svg';
import westernJinImage from '../../../assets/images/dynasties/western-jin.svg';
import easternJinImage from '../../../assets/images/dynasties/eastern-jin.svg';
import northernSouthernImage from '../../../assets/images/dynasties/northern-southern.svg';
import liuSongImage from '../../../assets/images/dynasties/liu-song.svg';
import southernQiImage from '../../../assets/images/dynasties/southern-qi.svg';
import liangImage from '../../../assets/images/dynasties/liang.svg';
import chenImage from '../../../assets/images/dynasties/chen.svg';
import suiImage from '../../../assets/images/dynasties/sui.svg';
import tangImage from '../../../assets/images/dynasties/tang.svg';
import fiveDynastiesImage from '../../../assets/images/dynasties/five-dynasties.svg';
import laterLiangImage from '../../../assets/images/dynasties/later-liang.svg';
import laterTangImage from '../../../assets/images/dynasties/later-tang.svg';
import laterJinImage from '../../../assets/images/dynasties/later-jin.svg';
import laterHanImage from '../../../assets/images/dynasties/later-han.svg';
import laterZhouImage from '../../../assets/images/dynasties/later-zhou.svg';
import northernSongImage from '../../../assets/images/dynasties/northern-song.svg';
import southernSongImage from '../../../assets/images/dynasties/southern-song.svg';
import yuanImage from '../../../assets/images/dynasties/yuan.svg';
import mingImage from '../../../assets/images/dynasties/ming.svg';
import qingImage from '../../../assets/images/dynasties/qing.svg';

export interface Dynasty {
  name: string;
  nameEn: string;
  startYear: number;
  endYear: number;
  color: string;
  backgroundImage: string;
  isMultiPeriod?: boolean;
  subPeriods?: Dynasty[];
  description?: string;
}

// 精确的中国历史朝代数据
export const DYNASTIES: Dynasty[] = [
  {
    name: '夏朝',
    nameEn: 'Xia Dynasty',
    startYear: -2070,
    endYear: -1600,
    color: '#8B4513',
    backgroundImage: xiaImage,
    description: '中国史书记载的第一个世袭制朝代'
  },
  {
    name: '商朝',
    nameEn: 'Shang Dynasty',
    startYear: -1600,
    endYear: -1046,
    color: '#A0522D',
    backgroundImage: shangImage,
    description: '中国历史上第二个朝代，也是中国第一个有直接文字记载的朝代'
  },
  {
    name: '西周',
    nameEn: 'Western Zhou',
    startYear: -1046,
    endYear: -771,
    color: '#CD853F',
    backgroundImage: westernZhouImage,
    description: '周武王灭商后建立，定都镐京'
  },
  {
    name: '东周',
    nameEn: 'Eastern Zhou',
    startYear: -770,
    endYear: -256,
    color: '#DEB887',
    backgroundImage: easternZhouImage,
    description: '周平王东迁洛邑，分为春秋和战国两个时期'
  },
  {
    name: '秦朝',
    nameEn: 'Qin Dynasty',
    startYear: -221,
    endYear: -206,
    color: '#2F4F4F',
    backgroundImage: qinImage,
    description: '中国历史上第一个大一统王朝，建立了中央集权制度'
  },
  {
    name: '西汉',
    nameEn: 'Western Han',
    startYear: -202,
    endYear: 8,
    color: '#8B4513',
    backgroundImage: westernHanImage,
    description: '刘邦建立的汉朝，定都长安'
  },
  {
    name: '新朝',
    nameEn: 'Xin Dynasty',
    startYear: 9,
    endYear: 23,
    color: '#696969',
    backgroundImage: xinImage,
    description: '王莽篡汉建立的短命王朝'
  },
  {
    name: '东汉',
    nameEn: 'Eastern Han',
    startYear: 25,
    endYear: 220,
    color: '#A0522D',
    backgroundImage: easternHanImage,
    description: '刘秀建立的汉朝，定都洛阳'
  },
  {
    name: '三国',
    nameEn: 'Three Kingdoms',
    startYear: 220,
    endYear: 280,
    color: '#DAA520',
    backgroundImage: threeKingdomsImage,
    isMultiPeriod: true,
    description: '魏、蜀、吴三国鼎立时期',
    subPeriods: [
      { name: '魏', nameEn: 'Cao Wei', startYear: 220, endYear: 265, color: '#B8860B', backgroundImage: weiImage, description: '曹丕建立的政权，定都洛阳' },
      { name: '蜀', nameEn: 'Shu Han', startYear: 221, endYear: 263, color: '#DAA520', backgroundImage: shuImage, description: '刘备建立的政权，定都成都' },
      { name: '吴', nameEn: 'Eastern Wu', startYear: 229, endYear: 280, color: '#FFD700', backgroundImage: wuImage, description: '孙权建立的政权，定都建业' }
    ]
  },
  {
    name: '西晋',
    nameEn: 'Western Jin',
    startYear: 265,
    endYear: 316,
    color: '#F4A460',
    backgroundImage: westernJinImage,
    description: '司马炎建立的晋朝，定都洛阳'
  },
  {
    name: '东晋',
    nameEn: 'Eastern Jin',
    startYear: 317,
    endYear: 420,
    color: '#DEB887',
    backgroundImage: easternJinImage,
    description: '司马睿南迁建立的晋朝，定都建康'
  },
  {
    name: '南北朝',
    nameEn: 'Northern and Southern Dynasties',
    startYear: 420,
    endYear: 589,
    color: '#D2B48C',
    backgroundImage: northernSouthernImage,
    isMultiPeriod: true,
    description: '中国南北分裂时期，南方和北方各有多个朝代更迭',
    subPeriods: [
      { name: '宋', nameEn: 'Liu Song', startYear: 420, endYear: 479, color: '#CD853F', backgroundImage: liuSongImage, description: '刘裕建立的南朝政权' },
      { name: '齐', nameEn: 'Southern Qi', startYear: 479, endYear: 502, color: '#A0522D', backgroundImage: southernQiImage, description: '萧道成建立的南朝政权' },
      { name: '梁', nameEn: 'Liang Dynasty', startYear: 502, endYear: 557, color: '#8B4513', backgroundImage: liangImage, description: '萧衍建立的南朝政权' },
      { name: '陈', nameEn: 'Chen Dynasty', startYear: 557, endYear: 589, color: '#654321', backgroundImage: chenImage, description: '陈霸先建立的南朝政权' }
    ]
  },
  {
    name: '隋朝',
    nameEn: 'Sui Dynasty',
    startYear: 581,
    endYear: 618,
    color: '#BC8F8F',
    backgroundImage: suiImage,
    description: '杨坚建立的朝代，重新统一中国'
  },
  {
    name: '唐朝',
    nameEn: 'Tang Dynasty',
    startYear: 618,
    endYear: 907,
    color: '#DC143C',
    backgroundImage: tangImage,
    description: '李渊建立的盛世王朝，定都长安'
  },
  {
    name: '五代十国',
    nameEn: 'Five Dynasties and Ten Kingdoms',
    startYear: 907,
    endYear: 960,
    color: '#B22222',
    backgroundImage: fiveDynastiesImage,
    isMultiPeriod: true,
    description: '唐朝灭亡后的分裂时期，中原先后有五个朝代，南方有十个割据政权',
    subPeriods: [
      { name: '后梁', nameEn: 'Later Liang', startYear: 907, endYear: 923, color: '#A0522D', backgroundImage: laterLiangImage, description: '朱温建立的政权' },
      { name: '后唐', nameEn: 'Later Tang', startYear: 923, endYear: 937, color: '#8B4513', backgroundImage: laterTangImage, description: '李存勖建立的政权' },
      { name: '后晋', nameEn: 'Later Jin', startYear: 936, endYear: 947, color: '#D2691E', backgroundImage: laterJinImage, description: '石敬瑭建立的政权' },
      { name: '后汉', nameEn: 'Later Han', startYear: 947, endYear: 951, color: '#CD853F', backgroundImage: laterHanImage, description: '刘知远建立的政权' },
      { name: '后周', nameEn: 'Later Zhou', startYear: 951, endYear: 960, color: '#DEB887', backgroundImage: laterZhouImage, description: '郭威建立的政权' }
    ]
  },
  {
    name: '北宋',
    nameEn: 'Northern Song',
    startYear: 960,
    endYear: 1127,
    color: '#4169E1',
    backgroundImage: northernSongImage,
    description: '赵匡胤建立的朝代，定都开封'
  },
  {
    name: '南宋',
    nameEn: 'Southern Song',
    startYear: 1127,
    endYear: 1279,
    color: '#6495ED',
    backgroundImage: southernSongImage,
    description: '赵构南迁建立的宋朝，定都临安'
  },
  {
    name: '元朝',
    nameEn: 'Yuan Dynasty',
    startYear: 1271,
    endYear: 1368,
    color: '#8B008B',
    backgroundImage: yuanImage,
    description: '蒙古人建立的朝代，忽必烈定国号为元'
  },
  {
    name: '明朝',
    nameEn: 'Ming Dynasty',
    startYear: 1368,
    endYear: 1644,
    color: '#FF6347',
    backgroundImage: mingImage,
    description: '朱元璋建立的朝代，定都南京（后迁都北京）'
  },
  {
    name: '清朝',
    nameEn: 'Qing Dynasty',
    startYear: 1644,
    endYear: 1912,
    color: '#2F4F4F',
    backgroundImage: qingImage,
    description: '满族人建立的最后一个封建王朝'
  }
];

// 按时间顺序排序的朝代数组（已排序）
export const SORTED_DYNASTIES = [...DYNASTIES].sort((a, b) => a.startYear - b.startYear);

// 根据年份获取对应的朝代
export function getDynastyByYear(year: number): Dynasty | null {
  for (const dynasty of SORTED_DYNASTIES) {
    if (year >= dynasty.startYear && year <= dynasty.endYear) {
      return dynasty;
    }
  }
  return null;
}

// 根据事件获取相关朝代
export function getDynastyByEvent(event: { startYear: number; endYear?: number; title?: string; description?: string }): Dynasty | null {
  const year = event.startYear;
  const dynasty = getDynastyByYear(year);
  
  if (!dynasty) return null;
  
  // 特殊处理：根据事件标题或描述判断具体子朝代
  if (dynasty.isMultiPeriod && dynasty.subPeriods) {
    const title = event.title || '';
    const description = event.description || '';
    const content = `${title} ${description}`.toLowerCase();
    
    for (const subPeriod of dynasty.subPeriods) {
      if (content.includes(subPeriod.name.toLowerCase()) || 
          content.includes(subPeriod.nameEn.toLowerCase())) {
        return {
          ...subPeriod,
          parentDynasty: dynasty.name
        } as any;
      }
    }
  }
  
  return dynasty;
}

// 获取当前年份范围内的所有朝代（按时间顺序）
export function getDynastiesInRange(startYear: number, endYear: number): Dynasty[] {
  const result: Dynasty[] = [];
  const added = new Set<string>();
  
  for (const dynasty of SORTED_DYNASTIES) {
    // 检查朝代是否与指定年份范围有重叠
    if (dynasty.startYear <= endYear && dynasty.endYear >= startYear) {
      if (!added.has(dynasty.name)) {
        result.push(dynasty);
        added.add(dynasty.name);
      }
    }
  }
  
  return result;
}

// 获取当前显示事件相关的朝代列表（按时间顺序）
export function getDynastiesFromEvents(events: any[]): Dynasty[] {
  const result: Dynasty[] = [];
  const added = new Set<string>();
  
  for (const event of events) {
    const dynasty = getDynastyByEvent(event);
    if (dynasty && !added.has(dynasty.name)) {
      result.push(dynasty);
      added.add(dynasty.name);
    }
  }
  
  // 确保按时间顺序排列
  return result.sort((a, b) => a.startYear - b.startYear);
}

// 计算朝代在时间轴中的相对位置（0-1）
export function getDynastyPosition(dynasty: Dynasty, totalStartYear: number, totalEndYear: number): number {
  const totalDuration = totalEndYear - totalStartYear;
  const dynastyStartOffset = dynasty.startYear - totalStartYear;
  return dynastyStartOffset / totalDuration;
}

// 计算朝代在时间轴中的相对宽度（0-1）
export function getDynastyWidth(dynasty: Dynasty, totalStartYear: number, totalEndYear: number): number {
  const totalDuration = totalEndYear - totalStartYear;
  const dynastyDuration = dynasty.endYear - dynasty.startYear;
  return dynastyDuration / totalDuration;
}
