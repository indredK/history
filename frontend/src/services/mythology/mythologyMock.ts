/**
 * 神话 Mock 数据
 * Mythology Mock Data
 * 
 * Requirements: 1.4
 * 包含6个经典中国神话故事
 */

import type { Mythology } from './types';

export const mockMythologies: Mythology[] = [
  {
    id: '1',
    title: '后羿射日',
    englishTitle: 'Hou Yi Shoots the Suns',
    category: '英雄神话',
    description: '远古时期，天上有十个太阳同时出现，大地被烤焦，河流干涸，民不聊生。英雄后羿挺身而出，登上昆仑山顶，运足神力，拉开神弓，一气射下九个太阳，只留一个太阳照耀大地，拯救了苍生万物。',
    characters: ['后羿', '羲和', '帝俊', '嫦娥'],
    source: '《山海经》《淮南子》'
  },
  {
    id: '2',
    title: '女娲补天',
    englishTitle: 'Nüwa Mends the Sky',
    category: '创世神话',
    description: '上古时代，水神共工与火神祝融大战，共工战败后怒触不周山，天柱折断，天塌地陷，洪水泛滥。女娲不忍人类受难，于是炼五色石补天，斩神龟之足撑四极，杀黑龙以济冀州，积芦灰以止淫水，终于平息灾难，拯救人类。',
    characters: ['女娲', '共工', '祝融'],
    source: '《淮南子》《列子》'
  },
  {
    id: '3',
    title: '精卫填海',
    englishTitle: 'Jingwei Fills the Sea',
    category: '自然神话',
    description: '炎帝的小女儿女娃，在东海游玩时不幸溺水身亡。她的灵魂化作一只名叫精卫的小鸟，常衔西山的木石，投入东海，誓要将大海填平。精卫日复一日，年复一年，从不停歇，象征着坚韧不拔、矢志不渝的精神。',
    characters: ['精卫', '炎帝', '女娃'],
    source: '《山海经·北山经》'
  },
  {
    id: '4',
    title: '夸父追日',
    englishTitle: 'Kuafu Chases the Sun',
    category: '自然神话',
    description: '巨人夸父立志追赶太阳，他跨过千山万水，越跑越快，离太阳越来越近。途中他喝干了黄河、渭水，仍然口渴难耐，便向北去喝大泽之水。可惜还未到达，便渴死在途中。他的手杖化作桃林，为后人遮阴解渴，象征着人类征服自然的雄心壮志。',
    characters: ['夸父'],
    source: '《山海经·海外北经》《列子·汤问》'
  },
  {
    id: '5',
    title: '嫦娥奔月',
    englishTitle: "Chang'e Flies to the Moon",
    category: '爱情神话',
    description: '后羿射日后，西王母赐予他一颗不死仙丹。后羿舍不得离开妻子嫦娥，便将仙丹交给嫦娥保管。不料此事被恶徒蓬蒙得知，趁后羿外出时逼迫嫦娥交出仙丹。嫦娥情急之下吞下仙丹，身体飘离地面，飞向月宫。从此嫦娥独居广寒宫，与玉兔为伴，后羿只能在月下遥望思念。',
    characters: ['嫦娥', '后羿', '蓬蒙', '西王母', '玉兔'],
    source: '《淮南子》《搜神记》'
  },
  {
    id: '6',
    title: '大禹治水',
    englishTitle: 'Yu the Great Controls the Flood',
    category: '英雄神话',
    description: '上古时期，洪水泛滥，百姓流离失所。大禹受命治水，他吸取父亲鲧堵塞治水失败的教训，采用疏导的方法。大禹三过家门而不入，历经十三年艰辛，终于疏通九州河道，将洪水引入大海，使天下太平。大禹因治水有功，被推举为部落联盟首领，后建立夏朝。',
    characters: ['大禹', '鲧', '舜'],
    source: '《尚书》《史记·夏本纪》'
  }
];
