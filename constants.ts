
import { Card, Suit, CardColor, CardRank, SupportedLanguage } from './types';

// Helper to create a card
const createCard = (suit: Suit, name: string, val: number, color: CardColor, rank: CardRank, desc: string, id: string): Card => ({
  id, suit, name, value: val, color, rank, description: desc
});

// Card IDs for Logic
export const ID_WAN_WAN = 'c_11';
export const ID_QIAN_WAN = 'c_10';
export const ID_BAI_WAN = 'c_9';
export const ID_90_WAN = 'c_8';
export const ID_20_WAN = 'c_1';

export const ID_9_GUAN = 's_9';
export const ID_8_GUAN = 's_8';
export const ID_6_GUAN = 's_6';
export const ID_5_GUAN = 's_5';
export const ID_1_GUAN = 's_1';

export const ID_9_SUO = 'k_9';
export const ID_1_SUO = 'k_1';

export const ID_KONG_WEN = 't_11';
export const ID_BAN_WEN = 't_10'; // Zhi Hua
export const ID_1_WEN = 't_9'; // Reversed Value logic: One Wen is High (Value 9)
export const ID_9_WEN = 't_1'; // Reversed Value logic: Nine Wen is Low (Value 1)

export const RED_CARDS = new Set([ID_WAN_WAN, ID_QIAN_WAN, ID_BAI_WAN, ID_9_GUAN, ID_8_GUAN, ID_9_SUO, 'k_8', ID_KONG_WEN, ID_BAN_WEN]);
export const GREEN_CARDS = new Set([ID_20_WAN, ID_1_GUAN, ID_1_SUO, ID_9_WEN]);

export const MA_DIAO_TUTOR_PROMPT = `
你现在是“马吊大师”，一位精通中国古代纸牌游戏“马吊”的智者。
你的目标是用中文教会用户“三防”策略和出牌规则。

**策略：闲家三防 (Three Preventions)**
1. **防庄家 (Prevent the Banker):** 如果庄家出牌可能赢墩，你必须尽全力捉打（Capture）。
2. **防百老 (Prevent the Millionaire):** 持有“百万”的玩家很危险。阻止他赢两墩（正本）。
3. **防色样 (Prevent Patterns):** 如果某人已经打出了3张同色样牌（如3张极/趣），绝不能让他赢第4张！

**出牌规则 (Leading Rules):**
1. **尊张限制:** 在同门的“肩”张出现之前，不要轻易首发“尊”（红）牌。
2. **青张保护:** 如果你持有同门的“极”（绿/趣），不要过早打完手中的青牌（黑）。
3. **十字门限制:** 除非你是“百老”（持有百万），否则避免首发十字门（钱/十）。
4. **两门原则:** 尽量只打你最强的两门花色。不要随意开第三门。
5. **千万禁手:** 永远不要首发“千万”。

请用简洁、古风的中文解释这些规则。警告用户，违反这些规则可能导致“包赔”（Penalty），即一人承担所有输分！
`;

// Generating the Ma Diao Deck (40 Cards) based on the PDF table
export const generateDeck = (): Card[] => {
  const deck: Card[] = [];

  // 1. CASH SUIT (十) - 11 Cards
  deck.push(createCard(Suit.CASH, '萬萬', 11, CardColor.RED, CardRank.ZUN, '宋江', ID_WAN_WAN)); 
  deck.push(createCard(Suit.CASH, '千萬', 10, CardColor.RED, CardRank.JIAN, '武松', ID_QIAN_WAN));
  deck.push(createCard(Suit.CASH, '百萬', 9, CardColor.RED, CardRank.BAI, '阮小五', ID_BAI_WAN));
  deck.push(createCard(Suit.CASH, '九十', 8, CardColor.BLACK, CardRank.QING, '阮小七', ID_90_WAN)); 
  deck.push(createCard(Suit.CASH, '八十', 7, CardColor.BLACK, CardRank.QING, '朱仝', 'c_7'));
  deck.push(createCard(Suit.CASH, '七十', 6, CardColor.BLACK, CardRank.QING, '孫立', 'c_6'));
  deck.push(createCard(Suit.CASH, '六十', 5, CardColor.BLACK, CardRank.QING, '呼延灼', 'c_5'));
  deck.push(createCard(Suit.CASH, '五十', 4, CardColor.BLACK, CardRank.QING, '魯智深', 'c_4'));
  deck.push(createCard(Suit.CASH, '四十', 3, CardColor.BLACK, CardRank.QING, '李逵', 'c_3'));
  deck.push(createCard(Suit.CASH, '三十', 2, CardColor.BLACK, CardRank.QING, '楊志', 'c_2'));
  deck.push(createCard(Suit.CASH, '二十', 1, CardColor.GREEN, CardRank.JI, '扈三娘', ID_20_WAN));

  // 2. STRINGS SUIT (貫) - 9 Cards
  deck.push(createCard(Suit.STRINGS, '九貫', 9, CardColor.RED, CardRank.ZUN, '雷橫', ID_9_GUAN));
  deck.push(createCard(Suit.STRINGS, '八貫', 8, CardColor.RED, CardRank.JIAN, '索超', ID_8_GUAN));
  deck.push(createCard(Suit.STRINGS, '七貫', 7, CardColor.BLACK, CardRank.QING, '秦明', 's_7'));
  deck.push(createCard(Suit.STRINGS, '六貫', 6, CardColor.BLACK, CardRank.QING, '史進', ID_6_GUAN));
  deck.push(createCard(Suit.STRINGS, '五貫', 5, CardColor.BLACK, CardRank.QING, '李俊', ID_5_GUAN));
  deck.push(createCard(Suit.STRINGS, '四貫', 4, CardColor.BLACK, CardRank.QING, '柴進', 's_4'));
  deck.push(createCard(Suit.STRINGS, '三貫', 3, CardColor.BLACK, CardRank.QING, '關勝', 's_3'));
  deck.push(createCard(Suit.STRINGS, '二貫', 2, CardColor.BLACK, CardRank.QING, '花榮', 's_2'));
  deck.push(createCard(Suit.STRINGS, '一貫', 1, CardColor.GREEN, CardRank.JI, '燕青', ID_1_GUAN));

  // 3. COINS SUIT (索) - 9 Cards
  deck.push(createCard(Suit.COINS, '九索', 9, CardColor.RED, CardRank.ZUN, '九條', ID_9_SUO));
  deck.push(createCard(Suit.COINS, '八索', 8, CardColor.RED, CardRank.JIAN, '八條', 'k_8'));
  deck.push(createCard(Suit.COINS, '七索', 7, CardColor.BLACK, CardRank.QING, '七條', 'k_7'));
  deck.push(createCard(Suit.COINS, '六索', 6, CardColor.BLACK, CardRank.QING, '六條', 'k_6'));
  deck.push(createCard(Suit.COINS, '五索', 5, CardColor.BLACK, CardRank.QING, '五條', 'k_5'));
  deck.push(createCard(Suit.COINS, '四索', 4, CardColor.BLACK, CardRank.QING, '四條', 'k_4'));
  deck.push(createCard(Suit.COINS, '三索', 3, CardColor.BLACK, CardRank.QING, '三條', 'k_3'));
  deck.push(createCard(Suit.COINS, '二索', 2, CardColor.BLACK, CardRank.QING, '二條', 'k_2'));
  deck.push(createCard(Suit.COINS, '一索', 1, CardColor.GREEN, CardRank.JI, '麼雞', ID_1_SUO));

  // 4. TEXTS SUIT (文) - 11 Cards (Reversed Order)
  // Red: Kong Wen (Zun) - 11
  deck.push(createCard(Suit.TEXTS, '空文', 11, CardColor.RED, CardRank.ZUN, '王英', ID_KONG_WEN));
  // Red: Ban Wen (Jian) - 10
  deck.push(createCard(Suit.TEXTS, '半文', 10, CardColor.RED, CardRank.JIAN, '花束', ID_BAN_WEN));
  // Black: 1 Wen (High) to 8 Wen (Low)
  deck.push(createCard(Suit.TEXTS, '一文', 9, CardColor.BLACK, CardRank.QING, '一筒', ID_1_WEN));
  deck.push(createCard(Suit.TEXTS, '二文', 8, CardColor.BLACK, CardRank.QING, '二筒', 't_8'));
  deck.push(createCard(Suit.TEXTS, '三文', 7, CardColor.BLACK, CardRank.QING, '三筒', 't_7'));
  deck.push(createCard(Suit.TEXTS, '四文', 6, CardColor.BLACK, CardRank.QING, '四筒', 't_6'));
  deck.push(createCard(Suit.TEXTS, '五文', 5, CardColor.BLACK, CardRank.QING, '五筒', 't_5'));
  deck.push(createCard(Suit.TEXTS, '六文', 4, CardColor.BLACK, CardRank.QING, '六筒', 't_4'));
  deck.push(createCard(Suit.TEXTS, '七文', 3, CardColor.BLACK, CardRank.QING, '七筒', 't_3'));
  deck.push(createCard(Suit.TEXTS, '八文', 2, CardColor.BLACK, CardRank.QING, '八筒', 't_2'));
  // Green: 9 Wen (Low) - 1 (Ji)
  deck.push(createCard(Suit.TEXTS, '九文', 1, CardColor.GREEN, CardRank.JI, '九筒', ID_9_WEN));

  return deck;
};

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    title: 'MA DIAO MASTER',
    subtitle: 'ANCIENT CHINESE BRIDGE',
    enterGame: 'ENTER GAME',
    roundStart: 'Hand Start',
    trick: 'Trick',
    yourTurn: 'Your Turn',
    thinking: 'Thinking...',
    winsTrick: 'takes the trick',
    player: 'Player',
    visibleCards: 'Table Cards',
    diaoPoints: 'Diao (Penalty)',
    kaiZhuPoints: 'Open Pot',
    qiaoMenPoints: 'Knock',
    seYangPoints: 'Melds/Patterns',
    kaiChongPoints: 'Breakout',
    score: 'Score',
    nextRound: 'Next Deal',
    patterns: 'Melds:',
    confirm: 'CONFIRM',
    
    // Play Button Contexts (Bridge Style)
    act_play: 'Play Card',
    ctx_lead: 'Lead',
    ctx_catch: 'Capture',
    ctx_melt: 'Discard', // "Slough" is also used, but Discard is clearer for UI

    act_deal: 'Lead',
    act_catch: 'Take',
    act_melt: 'Disc',
    dir_north: 'North',
    dir_south: 'South',
    dir_east: 'East',
    dir_west: 'West',
    
    // Patterns
    pat_clouds: 'Azure Clouds (Ping Bu Qing Yun)',
    pat_huang_hui_tu: 'Imperial Gathering',
    pat_qian_jun_zhu: 'Iron Pillar',
    pat_hua_du_dou: 'Flower Bodice',
    pat_hua_bi_jian: 'Flower Shoulder',
    pat_qiao_si_shang: 'Smart Four Rewards',
    pat_qiao_si_jian: 'Smart Four Shoulders',
    pat_tian_di_fen: 'Heaven & Earth',
    pat_jian_tian_di: 'Shoulder Heaven & Earth',
    pat_xiao_tian_di: 'Lesser Heaven & Earth',
    pat_bai_duan_jian: 'Million Short Shoulder',
    pat_bai_chang_jian: 'Million Long Shoulder',
    pat_ji_duan_jian: 'Extreme Short Shoulder',
    pat_ji_chang_jian: 'Extreme Long Shoulder',
    pat_bai_ji_si_shang: 'Million Extreme Rewards',
    pat_bai_ji_si_jian: 'Million Extreme Shoulders',
    pat_bai_shang_si_ji: 'Million Reward Extremes',
    pat_bai_jian_si_ji: 'Million Shoulder Extremes',
    pat_jie_jie_gao: 'Rising Step by Step',
    pat_duan_jian: 'Short Shoulder',
    pat_dui_jian: 'Pair Shoulder',
    pat_chang_jian: 'Long Shoulder',
    pat_shang_ji_yu: 'Reward Carp Back',
    pat_jian_ji_yu: 'Shoulder Carp Back',
    pat_bai_ji_yu: 'Million Carp Back',
    pat_six_table: 'Six Trick Diao',
    pat_seven_table: 'Seven Trick Diao',
    pat_eight_table: 'Eight Trick Diao',
    pat_nei_sheng: 'Inner Saint Outer King',
    pat_tian_ran_qu: 'Natural Charm',
    pat_empress: 'Empress Ascension',
    pat_dragon_leap: 'Dragon Leap',
    pat_buddha_pearl: 'Buddha Pearl',
    pat_flower_goddess: 'Flower Goddess',
    pat_butterfly: 'Twin Butterflies',
    pat_three_stack: 'Triple Stack',
    pat_wind_flag: 'Wind Flag',
    pat_mirror_person: 'Mirror Image',
    pat_beauty_med: 'Beauty Meditating',
    pat_borrow_flower: 'Borrow Flower',
    pat_couple_reunion: 'Reunion',
    pat_fairy_son: 'Fairy Gift',
    pat_fo_chi_jiao: 'Barefoot Buddha',

    aiDisabled: 'AI Tutor disabled (No API Key).',
    masterTitle: 'Tutor',
    masterName: 'Ma Diao Master',
    meditating: 'Thinking...',
    chatPlaceholder: 'Ask a rule...',
    chatPlaceholderDisabled: 'AI Disabled',
    soundOn: 'Sound On',
    soundOff: 'Mute',
    diff_easy: 'Novice',
    diff_medium: 'Standard',
    diff_hard: 'Expert',
    quitGame: 'Quit',
    quitConfirm: 'Quit current game? Progress will be lost.',
    cancel: 'Cancel',
    oneClickPlay: '1-Click',
    
    // Risk Alert Switch
    riskAlertOn: 'Hints: ON',
    riskAlertOff: 'Hints: OFF',
    
    // Strategy Warnings
    risk_safe: 'Safe Play',
    risk_warning: 'Strategy Warning',
    risk_penalty: 'GRAND PENALTY',
    risk_confirm_penalty: 'Accept Penalty & Play',
    risk_confirm_warning: 'Ignore Warning',
    risk_cancel: 'Reconsider',

    warn_title: 'Strategy Alert',
    warn_cash_lead: 'Only the "Millionaire" (Bai Lao) should lead Cash. Leading this risks a Penalty.',
    warn_zun_early: 'Leading a "Reward" (Zun) before the "Shoulder" appears is dangerous.',
    warn_qing_exhaust: 'Do not exhaust your Black (Qing) cards while holding the Extreme (Ji).',
    warn_qian_wan: 'Leading "Qian Wan" is a forbidden move.',
    warn_continue: 'Proceed anyway?',

    // Kai Chong
    phase_kai_chong: 'Breakout Phase',
    flip_card: 'Draw',
    kc_match_success: 'Matched!',
    kc_match_fail: 'No Match',
    kc_turn_pass: 'Pass',
    kc_skip_ineligible: 'Skip (Ineligible)',
    kc_single: 'Single',
    kc_dan_chong: 'Single Match (1pt)',
    kc_brother: 'Brother',
    kc_double: 'Twin',
    kc_triple: 'Triplet',
    kc_seq: 'Sequential',
    kc_gap: 'Gap',

    // Tabs
    tab_summary: 'Summary',
    tab_kai_zhu: 'Pot / Knock',
    tab_se_yang: 'Melds',
    tab_kai_chong: 'Breakout',
    tab_kc_se_yang: 'BO Melds',

    // Kai Chong Se Yang
    pat_kc_shi_hong: 'Ten Red Gathering',
    pat_kc_man_tang_hong: 'Full House Red',
    pat_kc_10_zui: 'Drunken Beauty (10)',
    pat_kc_9_zui: 'Drunken Beauty (9)',
    pat_kc_8_zui: 'Drunken Beauty (8)',
    pat_kc_ju_qing: 'All Same Clan',
    pat_kc_shi_tong: 'Ten of a Kind',
    pat_kc_jiu_tong: 'Nine of a Kind',
    pat_kc_qian_shi_quan: 'Full Cash/Texts',
    pat_kc_guan_suo_quan: 'Full Strings/Coins',
    pat_kc_tai_ji: 'Tai Chi (7+1)',
    pat_kc_yuan_yang: 'Mandarin Duck 7',
    pat_kc_lian_huan: 'Chain 7',
    pat_kc_one_shot_7: 'One Shot 7',
    pat_kc_one_shot_6: 'One Shot 6',
    pat_kc_yin_hua: 'Stamp',
    pat_kc_jin_jue: 'Gold Dig',
    pat_kc_yin_jue: 'Silver Dig',
    pat_kc_shuang_jue: 'Double Dig',
    pat_kc_duo_jin: 'Trophy Snatch',
  },
  zh_CN: {
    title: '馬吊大師',
    subtitle: '古风纸牌游戏',
    enterGame: '开始游戏',
    roundStart: '回合开始',
    trick: '第几墩',
    yourTurn: '轮到你了',
    thinking: '思考中...',
    winsTrick: '赢得此墩',
    player: '玩家',
    visibleCards: '得桌',
    diaoPoints: '吊数',
    kaiZhuPoints: '开注',
    qiaoMenPoints: '敲门',
    seYangPoints: '色样',
    kaiChongPoints: '开冲',
    score: '得分',
    nextRound: '下一局',
    patterns: '牌型:',
    confirm: '确认',
    
    act_play: '出牌',
    ctx_lead: '发牌',
    ctx_catch: '捉牌',
    ctx_melt: '灭牌',

    act_deal: '发',
    act_catch: '捉',
    act_melt: '灭',
    dir_north: '北',
    dir_south: '南',
    dir_east: '东',
    dir_west: '西',
    pat_clouds: '平步青云',
    pat_huang_hui_tu: '皇会图',
    pat_qian_jun_zhu: '千均柱',
    pat_hua_du_dou: '花肚兜',
    pat_hua_bi_jian: '花比肩',
    pat_qiao_si_shang: '巧四赏',
    pat_qiao_si_jian: '巧四肩',
    pat_tian_di_fen: '天地分',
    pat_jian_tian_di: '肩天地分',
    pat_xiao_tian_di: '小天地分',
    pat_bai_duan_jian: '百短肩',
    pat_bai_chang_jian: '百长肩',
    pat_ji_duan_jian: '极短肩',
    pat_ji_chang_jian: '极长肩',
    pat_bai_ji_si_shang: '百极四赏',
    pat_bai_ji_si_jian: '百极四肩',
    pat_bai_shang_si_ji: '百赏四极',
    pat_bai_jian_si_ji: '百肩四极',
    pat_jie_jie_gao: '节节高',
    pat_duan_jian: '短肩',
    pat_dui_jian: '对肩',
    pat_chang_jian: '长肩',
    pat_shang_ji_yu: '赏鲫鱼背',
    pat_jian_ji_yu: '肩鲫鱼背',
    pat_bai_ji_yu: '百鲫鱼背',
    pat_six_table: '六桌吊',
    pat_seven_table: '七桌吊',
    pat_eight_table: '八桌吊',
    pat_nei_sheng: '内圣外王',
    pat_tian_ran_qu: '天然趣',
    pat_empress: '女帝登基',
    pat_dragon_leap: '龙门跃',
    pat_buddha_pearl: '佛顶珠',
    pat_flower_goddess: '散花天女',
    pat_butterfly: '蝶双飞',
    pat_three_stack: '三叠趣',
    pat_wind_flag: '顺风旗',
    pat_mirror_person: '镜中人',
    pat_beauty_med: '美女参禅',
    pat_borrow_flower: '借花献佛',
    pat_couple_reunion: '夫妻团圆',
    pat_fairy_son: '天仙送子',
    pat_fo_chi_jiao: '佛赤脚',
    aiDisabled: 'AI导师已禁用 (未配置API Key)',
    masterTitle: '导师',
    masterName: '马吊大师',
    meditating: '冥想中...',
    chatPlaceholder: '询问规则...',
    chatPlaceholderDisabled: 'AI已禁用',
    soundOn: '开启声音',
    soundOff: '静音',
    diff_easy: '简单',
    diff_medium: '中等',
    diff_hard: '困难',
    quitGame: '退出游戏',
    quitConfirm: '确定要退出吗？当前进度将丢失。',
    cancel: '取消',
    oneClickPlay: '单击出牌',
    
    riskAlertOn: '提示: 开',
    riskAlertOff: '提示: 关',
    risk_safe: '安全',
    risk_warning: '战术警示',
    risk_penalty: '严重违例 (包赔)',
    risk_confirm_penalty: '坚持出牌 (承担包赔)',
    risk_confirm_warning: '忽略警告',
    risk_cancel: '重新考虑',
    
    warn_title: '战术警示',
    warn_cash_lead: '非“百老”之家不应首发十字门（十、钱）。此举可能导致“包赔”。',
    warn_zun_early: '同门“肩”张未现身前，首发“赏”（尊）张风险极大。',
    warn_qing_exhaust: '持有“极”（趣）张时，切勿将同门青张发完。',
    warn_qian_wan: '首发“千万”属于禁手。',
    warn_continue: '坚持出牌（可能导致包赔）？',

    phase_kai_chong: '开冲阶段',
    flip_card: '翻底牌',
    kc_match_success: '开冲成功!',
    kc_match_fail: '无匹配',
    kc_turn_pass: '过',
    kc_skip_ineligible: '跳过 (无红/趣)',
    kc_single: '单冲',
    kc_dan_chong: '单冲 (1分)',
    kc_brother: '兄弟冲',
    kc_double: '双胞胎冲',
    kc_triple: '三胞胎冲',
    kc_seq: '顺领冲',
    kc_gap: '间领冲',

    tab_summary: '结算',
    tab_kai_zhu: '开注 / 敲门',
    tab_se_yang: '色样',
    tab_kai_chong: '开冲明细',
    tab_kc_se_yang: '冲成色样',

    // Kai Chong Se Yang
    pat_kc_shi_hong: '十红聚会',
    pat_kc_man_tang_hong: '满堂红',
    pat_kc_10_zui: '十红醉楊妃',
    pat_kc_9_zui: '九红醉楊妃',
    pat_kc_8_zui: '八红醉楊妃',
    pat_kc_ju_qing: '具庆堂',
    pat_kc_shi_tong: '十同',
    pat_kc_jiu_tong: '九同',
    pat_kc_qian_shi_quan: '钱十全门',
    pat_kc_guan_suo_quan: '贯索全门',
    pat_kc_tai_ji: '太极图',
    pat_kc_yuan_yang: '鸳鸯七同',
    pat_kc_lian_huan: '连环七同',
    pat_kc_one_shot_7: '一冲七',
    pat_kc_one_shot_6: '一冲六',
    pat_kc_yin_hua: '印花',
    pat_kc_jin_jue: '金掘藏',
    pat_kc_yin_jue: '银掘藏',
    pat_kc_shuang_jue: '双掘藏',
    pat_kc_duo_jin: '夺锦标',
  },
  zh_TW: {
    title: '馬吊大師',
    subtitle: '古風紙牌遊戲',
    enterGame: '進入遊戲',
    roundStart: '回合開始',
    trick: '第幾墩',
    yourTurn: '輪到你了',
    thinking: '思考中...',
    winsTrick: '贏得此墩',
    player: '玩家',
    visibleCards: '得桌',
    diaoPoints: '吊數',
    kaiZhuPoints: '開註',
    qiaoMenPoints: '敲門',
    seYangPoints: '色樣',
    kaiChongPoints: '開衝',
    score: '得分',
    nextRound: '下一局',
    patterns: '牌型:',
    confirm: '確認',
    
    act_play: '出牌',
    ctx_lead: '發牌',
    ctx_catch: '捉牌',
    ctx_melt: '滅牌',

    act_deal: '發',
    act_catch: '捉',
    act_melt: '滅',
    dir_north: '北',
    dir_south: '南',
    dir_east: '東',
    dir_west: '西',
    pat_clouds: '平步青雲',
    pat_huang_hui_tu: '皇會圖',
    pat_qian_jun_zhu: '千均柱',
    pat_hua_du_dou: '花肚兜',
    pat_hua_bi_jian: '花比肩',
    pat_qiao_si_shang: '巧四賞',
    pat_qiao_si_jian: '巧四肩',
    pat_tian_di_fen: '天地分',
    pat_jian_tian_di: '肩天地分',
    pat_xiao_tian_di: '小天地分',
    pat_bai_duan_jian: '百短肩',
    pat_bai_chang_jian: '百長肩',
    pat_ji_duan_jian: '極短肩',
    pat_ji_chang_jian: '極長肩',
    pat_bai_ji_si_shang: '百極四賞',
    pat_bai_ji_si_jian: '百極四肩',
    pat_bai_shang_si_ji: '百賞四極',
    pat_bai_jian_si_ji: '百肩四極',
    pat_jie_jie_gao: '節節高',
    pat_duan_jian: '短肩',
    pat_dui_jian: '對肩',
    pat_chang_jian: '長肩',
    pat_shang_ji_yu: '賞鯽魚背',
    pat_jian_ji_yu: '肩鯽魚背',
    pat_bai_ji_yu: '百鯽魚背',
    pat_six_table: '六桌吊',
    pat_seven_table: '七桌吊',
    pat_eight_table: '八桌吊',
    pat_nei_sheng: '內聖外王',
    pat_tian_ran_qu: '天然趣',
    pat_empress: '女帝登基',
    pat_dragon_leap: '龍門躍',
    pat_buddha_pearl: '佛頂珠',
    pat_flower_goddess: '散花天女',
    pat_butterfly: '蝶雙飛',
    pat_three_stack: '三疊趣',
    pat_wind_flag: '順風旗',
    pat_mirror_person: '鏡中人',
    pat_beauty_med: '美女參禪',
    pat_borrow_flower: '借花獻佛',
    pat_couple_reunion: '夫妻團圓',
    pat_fairy_son: '天仙送子',
    pat_fo_chi_jiao: '佛赤腳',
    aiDisabled: 'AI導師已禁用 (未配置API Key)',
    masterTitle: '導師',
    masterName: '馬吊大師',
    meditating: '冥想中...',
    chatPlaceholder: '詢問規則...',
    chatPlaceholderDisabled: 'AI已禁用',
    soundOn: '開啟聲音',
    soundOff: '靜音',
    diff_easy: '簡單',
    diff_medium: '中等',
    diff_hard: '困難',
    quitGame: '退出遊戲',
    quitConfirm: '確定要退出嗎？當前進度將丟失。',
    cancel: '取消',
    oneClickPlay: '單擊出牌',

    riskAlertOn: '提示: 開',
    riskAlertOff: '提示: 關',
    risk_safe: '安全',
    risk_warning: '戰術警示',
    risk_penalty: '嚴重違例 (包賠)',
    risk_confirm_penalty: '堅持出牌 (承擔包賠)',
    risk_confirm_warning: '忽略警告',
    risk_cancel: '重新考慮',

    warn_title: '戰術警示',
    warn_cash_lead: '非“百老”之家不應首發十字門（十、錢）。此舉可能導致“包賠”。',
    warn_zun_early: '同門“肩”張未現身前，首發“賞”（尊）張風險極大。',
    warn_qing_exhaust: '持有“極”（趣）張時，切勿將同門青張發完。',
    warn_qian_wan: '首發“千萬”屬於禁手。',
    warn_continue: '堅持出牌（可能導致包賠）？',

    phase_kai_chong: '開衝階段',
    flip_card: '翻底牌',
    kc_match_success: '開衝成功!',
    kc_match_fail: '無匹配',
    kc_turn_pass: '過',
    kc_skip_ineligible: '跳過 (無紅/趣)',
    kc_single: '單衝',
    kc_dan_chong: '單衝 (1分)',
    kc_brother: '兄弟衝',
    kc_double: '雙胞胎衝',
    kc_triple: '三胞胎衝',
    kc_seq: '順領衝',
    kc_gap: '間領衝',

    tab_summary: '結算',
    tab_kai_zhu: '開註 / 敲門',
    tab_se_yang: '色樣',
    tab_kai_chong: '開衝明細',
    tab_kc_se_yang: '衝成色樣',

    // Kai Chong Se Yang
    pat_kc_shi_hong: '十紅聚會',
    pat_kc_man_tang_hong: '滿堂紅',
    pat_kc_10_zui: '十紅醉楊妃',
    pat_kc_9_zui: '九紅醉楊妃',
    pat_kc_8_zui: '八紅醉楊妃',
    pat_kc_ju_qing: '具慶堂',
    pat_kc_shi_tong: '十同',
    pat_kc_jiu_tong: '九同',
    pat_kc_qian_shi_quan: '錢十全門',
    pat_kc_guan_suo_quan: '貫索全門',
    pat_kc_tai_ji: '太極圖',
    pat_kc_yuan_yang: '鴛鴦七同',
    pat_kc_lian_huan: '連環七同',
    pat_kc_one_shot_7: '一衝七',
    pat_kc_one_shot_6: '一衝六',
    pat_kc_yin_hua: '印花',
    pat_kc_jin_jue: '金掘藏',
    pat_kc_yin_jue: '銀掘藏',
    pat_kc_shuang_jue: '雙掘藏',
    pat_kc_duo_jin: '奪錦標',
  },
  ja: {
    title: '馬吊マスター',
    subtitle: '古代中国のカードゲーム',
    enterGame: 'ゲーム開始',
    roundStart: '配牌完了',
    trick: 'トリック',
    yourTurn: 'あなたの番',
    thinking: '思考中...',
    winsTrick: 'が獲得',
    player: 'プレイヤー',
    visibleCards: '獲得札',
    diaoPoints: '吊数',
    kaiZhuPoints: '開注',
    qiaoMenPoints: '敲門',
    seYangPoints: '役 (Se Yang)',
    kaiChongPoints: '開衝 (ボーナス)',
    score: 'スコア',
    nextRound: '次の局へ',
    patterns: '成立役:',
    confirm: '確認',
    
    // Play Button Contexts (Mahjong/Card Game Style)
    act_play: '打牌',
    ctx_lead: '先発 (Lead)',
    ctx_catch: '奪取 (Take)',
    ctx_melt: '捨牌 (Discard)',

    act_deal: '出',
    act_catch: '奪',
    act_melt: '捨',
    dir_north: '北家',
    dir_south: '南家',
    dir_east: '東家',
    dir_west: '西家',

    pat_clouds: '平步青雲',
    pat_huang_hui_tu: '皇会図',
    pat_qian_jun_zhu: '千均柱',
    pat_nei_sheng: '内聖外王',
    pat_tian_ran_qu: '天然趣',
    pat_empress: '女帝登基',
    pat_dragon_leap: '龍門躍',
    pat_buddha_pearl: '佛頂珠',
    pat_flower_goddess: '散花天女',
    pat_butterfly: '蝶雙飛',
    pat_three_stack: '三疊趣',
    pat_wind_flag: '順風旗',
    pat_mirror_person: '鏡中人',
    pat_beauty_med: '美女參禪',
    pat_borrow_flower: '借花献佛',
    pat_couple_reunion: '夫妻團圓',
    pat_fairy_son: '天仙送子',
    pat_fo_chi_jiao: '佛赤脚 (仏の裸足)',
    aiDisabled: 'AI無効',
    masterTitle: '先生',
    masterName: '馬吊大師',
    meditating: '瞑想中...',
    chatPlaceholder: 'ルールを聞く...',
    chatPlaceholderDisabled: 'AI無効',
    soundOn: '音オン',
    soundOff: '音オフ',
    diff_easy: '初級',
    diff_medium: '中級',
    diff_hard: '上級',
    quitGame: '終了',
    quitConfirm: '終了しますか？進行状況は失われます。',
    cancel: 'キャンセル',
    oneClickPlay: '1クリック',

    riskAlertOn: 'ヒント: オン',
    riskAlertOff: 'ヒント: オフ',
    risk_safe: '安全',
    risk_warning: '戦略警告',
    risk_penalty: '責任払い (パオ)',
    risk_confirm_penalty: '続行 (責任払い)',
    risk_confirm_warning: '警告を無視',
    risk_cancel: '再考する',

    warn_title: '戦略警告',
    warn_cash_lead: '「百老」でない場合、十字門（十、金）を先発してはいけません。責任払いのリスクがあります。',
    warn_zun_early: '同スートの「肩」が出る前に「賞」（尊）を出すのは危険です。',
    warn_qing_exhaust: '「極」（趣）を持っている場合、同スートの青牌を使い切ってはいけません。',
    warn_qian_wan: '「千万」を先発するのは禁止手（チョンボ）です。',
    warn_continue: '続けますか（責任払いの可能性あり）？',

    phase_kai_chong: '開衝フェーズ',
    flip_card: 'めくる',
    kc_match_success: 'マッチ!',
    kc_match_fail: 'マッチなし',
    kc_turn_pass: 'パス',
    kc_skip_ineligible: 'スキップ',
    kc_single: '単衝',
    kc_dan_chong: '単衝 (1点)',
    kc_brother: '兄弟衝',
    kc_double: '双子衝',
    kc_triple: '三つ子衝',
    kc_seq: '順領衝',
    kc_gap: '間領衝',

    tab_summary: '集計',
    tab_kai_zhu: '開注 / 敲門',
    tab_se_yang: '役種',
    tab_kai_chong: '開衝',
    tab_kc_se_yang: '衝成役',

    pat_kc_shi_hong: '十紅聚会',
    pat_kc_man_tang_hong: '滿堂紅',
    pat_kc_10_zui: '十紅醉楊妃',
    pat_kc_9_zui: '九紅醉楊妃',
    pat_kc_8_zui: '八紅醉楊妃',
    pat_kc_ju_qing: '具慶堂',
    pat_kc_shi_tong: '十同',
    pat_kc_jiu_tong: '九同',
    pat_kc_qian_shi_quan: '錢十全門',
    pat_kc_guan_suo_quan: '貫索全門',
    pat_kc_tai_ji: '太極圖',
    pat_kc_yuan_yang: '鴛鴦七同',
    pat_kc_lian_huan: '連環七同',
    pat_kc_one_shot_7: '一衝七',
    pat_kc_one_shot_6: '一衝六',
    pat_kc_yin_hua: '印花',
    pat_kc_jin_jue: '金掘藏',
    pat_kc_yin_jue: '銀掘藏',
    pat_kc_shuang_jue: '雙掘藏',
    pat_kc_duo_jin: '奪錦標',
  },
  ko: {
    title: '마조 마스터',
    subtitle: '고대 중국 카드 게임',
    enterGame: '게임 시작',
    roundStart: '판 시작',
    trick: '트릭',
    yourTurn: '내 차례',
    thinking: '생각 중...',
    winsTrick: '획득',
    player: '플레이어',
    visibleCards: '획득한 패',
    diaoPoints: '조',
    kaiZhuPoints: '개주',
    qiaoMenPoints: '고문',
    seYangPoints: '색양 (족보)',
    kaiChongPoints: '개충',
    score: '점수',
    nextRound: '다음 판',
    patterns: '족보:',
    confirm: '확인',
    
    // Play Button Contexts (Hwatu/Go-Stop Style)
    act_play: '내기',
    ctx_lead: '선 (Lead)',
    ctx_catch: '먹기 (Capture)',
    ctx_melt: '버림 (Discard)',

    act_deal: '선',
    act_catch: '먹',
    act_melt: '버',
    dir_north: '북',
    dir_south: '남',
    dir_east: '동',
    dir_west: '서',
    pat_clouds: '평보청운',
    pat_huang_hui_tu: '황회도',
    pat_qian_jun_zhu: '천균주',
    pat_hua_du_dou: '화두두',
    pat_hua_bi_jian: '화비견',
    pat_qiao_si_shang: '교사상',
    pat_qiao_si_jian: '교사견',
    pat_tian_di_fen: '천지분',
    pat_jian_tian_di: '견천지분',
    pat_xiao_tian_di: '소천지분',
    pat_bai_duan_jian: '백단견',
    pat_bai_chang_jian: '백장견',
    pat_ji_duan_jian: '극단견',
    pat_ji_chang_jian: '극장견',
    pat_bai_ji_si_shang: '백극사상',
    pat_bai_ji_si_jian: '백극사견',
    pat_bai_shang_si_ji: '백상사극',
    pat_bai_jian_si_ji: '백견사극',
    pat_jie_jie_gao: '절절고',
    pat_duan_jian: '단견',
    pat_dui_jian: '대견',
    pat_chang_jian: '장견',
    pat_shang_ji_yu: '상즉어배',
    pat_jian_ji_yu: '견즉어배',
    pat_bai_ji_yu: '백즉어배',
    pat_six_table: '육탁조',
    pat_seven_table: '칠탁조',
    pat_eight_table: '팔탁조',
    pat_nei_sheng: '내성외왕',
    pat_tian_ran_qu: '천연취',
    pat_empress: '여제등극',
    pat_dragon_leap: '용문약',
    pat_buddha_pearl: '불정주',
    pat_flower_goddess: '산화천녀',
    pat_butterfly: '접쌍비',
    pat_three_stack: '삼첩취',
    pat_wind_flag: '순풍기',
    pat_mirror_person: '경중인',
    pat_beauty_med: '미녀참선',
    pat_borrow_flower: '차화헌불',
    pat_couple_reunion: '부처단원',
    pat_fairy_son: '천선송자',
    pat_fo_chi_jiao: '불적각 (부처의 맨발)',
    aiDisabled: 'AI 비활성화됨',
    masterTitle: '스승',
    masterName: '마조 대사',
    meditating: '명상 중...',
    chatPlaceholder: '규칙 물어보기...',
    chatPlaceholderDisabled: 'AI 꺼짐',
    soundOn: '소리 켜기',
    soundOff: '소리 끄기',
    diff_easy: '하수',
    diff_medium: '중수',
    diff_hard: '고수',
    quitGame: '게임 종료',
    quitConfirm: '정말 종료하시겠습니까? 진행 상황이 손실됩니다.',
    cancel: '취소',
    oneClickPlay: '원클릭',

    riskAlertOn: '알림: 켜짐',
    riskAlertOff: '알림: 꺼짐',
    risk_safe: '안전',
    risk_warning: '전술 경고',
    risk_penalty: '독박 (벌칙)',
    risk_confirm_penalty: '독박 감수하고 진행',
    risk_confirm_warning: '경고 무시',
    risk_cancel: '다시 생각하기',

    warn_title: '전술 경고',
    warn_cash_lead: '백만(Bai Wan)을 가진 "백로"가 아니라면 십(Cash) 무늬를 먼저 내지 마십시오. 독박 위험이 있습니다.',
    warn_zun_early: '같은 무늬의 "견(Shoulder)" 카드가 나오기 전에 "상(Reward/Zun)" 카드를 먼저 내는 것은 위험합니다.',
    warn_qing_exhaust: '"극(Extreme/Ji)" 카드를 가지고 있다면, 같은 무늬의 청(Black) 카드를 다 써버리지 마십시오.',
    warn_qian_wan: '"천만(Qian Wan)"을 먼저 내는 것은 금지된 수입니다.',
    warn_continue: '계속하시겠습니까 (독박 가능성 있음)?',

    phase_kai_chong: '개충 단계',
    flip_card: '뒤집기',
    kc_match_success: '매치 성공!',
    kc_match_fail: '매치 없음',
    kc_turn_pass: '패스',
    kc_skip_ineligible: '건너뜀',
    kc_single: '단충',
    kc_dan_chong: '단충 (1점)',
    kc_brother: '형제충',
    kc_double: '쌍포태충',
    kc_triple: '삼포태충',
    kc_seq: '순령충',
    kc_gap: '간령충',

    tab_summary: '요약',
    tab_kai_zhu: '개주 / 고문',
    tab_se_yang: '색양',
    tab_kai_chong: '개충',
    tab_kc_se_yang: '개충 색양',

    pat_kc_shi_hong: '십홍집합',
    pat_kc_man_tang_hong: '만당홍',
    pat_kc_10_zui: '십홍취양비',
    pat_kc_9_zui: '구홍취양비',
    pat_kc_8_zui: '팔홍취양비',
    pat_kc_ju_qing: '구경당',
    pat_kc_shi_tong: '십동',
    pat_kc_jiu_tong: '구동',
    pat_kc_qian_shi_quan: '전십전문',
    pat_kc_guan_suo_quan: '관색전문',
    pat_kc_tai_ji: '태극도',
    pat_kc_yuan_yang: '원앙칠동',
    pat_kc_lian_huan: '연환칠동',
    pat_kc_one_shot_7: '일충칠',
    pat_kc_one_shot_6: '일충육',
    pat_kc_yin_hua: '인화',
    pat_kc_jin_jue: '금굴장',
    pat_kc_yin_jue: '은굴장',
    pat_kc_shuang_jue: '쌍굴장',
    pat_kc_duo_jin: '탈금표',
  }
};
