
import { SupportedLanguage, AILearningState } from '../types';

export type ChatContext = 
    | 'GAME_START' 
    | 'TRICK_WIN' 
    | 'TRICK_WIN_BIG'
    | 'TRICK_LOSS' 
    | 'PENALTY' 
    | 'ROUND_WIN' 
    | 'ROUND_LOSS' 
    | 'KAI_CHONG_SUCCESS'
    | 'KAI_CHONG_FAIL'
    | 'PLAY_HIGH_CARD'
    | 'WAITING'
    | 'TEACH_VIOLATION'; // New context for scolding the player

const MESSAGES: Record<SupportedLanguage, Record<ChatContext, string[]>> = {
    zh_CN: {
        GAME_START: [
            "夫马吊者，兵法也。四十张牌，变化无穷，诸君慎之。",
            "冯梦龙先生有云：‘知己知彼，百战不殆’。今日且看谁是英雄。",
            "明季士大夫皆好此道，吾辈今日重聚，定要以此会友。",
            "这四十张纸牌，暗合梁山一百单八将之数，各位切莫轻视。",
            "局以变生，制由机发。请诸位落座，共演此纵横之术。"
        ],
        TRICK_WIN: [
            "此乃顺手牵羊之计。",
            "笑纳了。正所谓：取之有道。",
            "这一墩，恰如探囊取物。",
            "兵贵神速，此牌出得正是时候。",
            "吾观此局，运势在我也。"
        ],
        TRICK_WIN_BIG: [
            "一夫当关，万夫莫开！",
            "百万军中取上将首级，如探囊取物！",
            "至尊在此，谁敢造次？",
            "此乃定海神针，这分吾拿定了。",
            "痛快！此局气势如虹，势不可挡！"
        ],
        TRICK_LOSS: [
            "大意了，竟被汝钻了空子。",
            "此乃诱敌深入之计，汝莫要高兴太早。",
            "好一招借刀杀人，佩服。",
            "胜败兵家常事，暂且让你一回。",
            "这牌路诡谲，颇有古风，吾竟未看破。"
        ],
        PENALTY: [
            "哎呀！老夫竟犯了如此低级之错，愧对先贤！",
            "这...这是‘包赔’？吾一世英名，毁于一旦！",
            "一时眼花，误打误撞，罪过罪过。",
            "此乃天亡我也，非战之罪。",
            "惨矣！触犯天条，自食苦果。"
        ],
        ROUND_WIN: [
            "运筹帷幄之中，决胜千里之外。",
            "今日手气，颇有当年冯梦龙之风。",
            "承让承让。此局赢得惊险，全赖各位成全。",
            "牌风顺遂，如鱼得水。再来一局？",
            "吾之牌技，虽不及古人，亦足以在此桌称雄矣。"
        ],
        ROUND_LOSS: [
            "时运不济，命途多舛...",
            "卷土重来未可知，下局定要翻盘。",
            "汝等牌技精进神速，老夫佩服。",
            "这一局输得蹊跷，待老夫复盘一番。",
            "胜负乃浮云，唯博弈之乐长存。"
        ],
        KAI_CHONG_SUCCESS: [
            "天作之合！此乃天意！",
            "踏破铁鞋无觅处，得来全不费工夫。",
            "妙哉！这底牌正如吾意。",
            "神来之笔，冲得漂亮！",
            "这便是缘分，挡都挡不住。"
        ],
        KAI_CHONG_FAIL: [
            "缘分未到，强求不得。",
            "镜中花，水中月，空欢喜一场。",
            "底牌无情，奈何奈何。",
            "时机未到，且看下回分解。",
            "罢了，得之我幸，失之我命。"
        ],
        PLAY_HIGH_CARD: [
            "泰山压顶！谁能挡我？",
            "此牌一出，乾坤定矣。",
            "重剑无锋，大巧不工。",
            "看这张‘尊’张，可有气势？"
        ],
        WAITING: [
            "思考良久，莫非在推演天机？",
            "兵贵神速，犹豫则败北。",
            "莫让光阴虚度，速速出牌。",
            "阁下可是在研读《马吊牌经》？快哉快哉。"
        ],
        TEACH_VIOLATION: [
            "孺子不可教也！《牌经》有云：首发千万乃是大忌！你怎敢造次？",
            "荒唐！非‘百老’而首发十字门，你这是自寻死路，还要连累旁人！",
            "若是当年在苏州茶馆，你这般打法，是要被赶下桌的！",
            "同门‘肩’未出，怎可妄动‘尊’张？新手切记：三防为上！",
            "你这打法，毫无章法！这就是‘包赔’的下场，好好记着！",
            "不懂规矩！趣张在手，岂可灭绝青牌？回去再读读规则吧！"
        ]
    },
    zh_TW: {
        GAME_START: [
            "夫馬吊者，兵法也。四十張牌，變化無窮，諸君慎之。",
            "馮夢龍先生有云：『知己知彼，百戰不殆』。今日且看誰是英雄。",
            "明季士大夫皆好此道，吾輩今日重聚，定要以此會友。",
            "這四十張紙牌，暗合梁山一百單八將之數，各位切莫輕視。",
            "局以變生，制由機發。請諸位落座，共演此縱橫之術。"
        ],
        TRICK_WIN: [
            "此乃順手牽羊之計。",
            "笑納了。正所謂：取之有道。",
            "這一墩，恰如探囊取物。",
            "兵貴神速，此牌出得正是時候。",
            "吾觀此局，運勢在我也。"
        ],
        TRICK_WIN_BIG: [
            "一夫當關，萬夫莫開！",
            "百萬軍中取上將首級，如探囊取物！",
            "至尊在此，誰敢造次？",
            "此乃定海神針，這分吾拿定了。",
            "痛快！此局氣勢如虹，勢不可擋！"
        ],
        TRICK_LOSS: [
            "大意了，竟被汝鑽了空子。",
            "此乃誘敵深入之計，汝莫要高興太早。",
            "好一招借刀殺人，佩服。",
            "勝敗兵家常事，暫且讓你一回。",
            "這牌路詭譎，頗有古風，吾竟未看破。"
        ],
        PENALTY: [
            "哎呀！老夫竟犯了如此低級之錯，愧對先賢！",
            "這...這是『包賠』？吾一世英名，毀於一旦！",
            "一時眼花，誤打誤撞，罪過罪過。",
            "此乃天亡我也，非戰之罪。",
            "慘矣！觸犯天條，自食苦果。"
        ],
        ROUND_WIN: [
            "運籌帷幄之中，決勝千里之外。",
            "今日手氣，頗有當年馮夢龍之風。",
            "承讓承讓。此局贏得驚險，全賴各位成全。",
            "牌風順遂，如魚得水。再來一局？",
            "吾之牌技，雖不及古人，亦足以在此桌稱雄矣。"
        ],
        ROUND_LOSS: [
            "時運不濟，命途多舛...",
            "捲土重來未可知，下局定要翻盤。",
            "汝等牌技精進神速，老夫佩服。",
            "這一局輸得蹊蹺，待老夫復盤一番。",
            "勝負乃浮雲，唯博弈之樂長存。"
        ],
        KAI_CHONG_SUCCESS: [
            "天作之合！此乃天意！",
            "踏破鐵鞋無覓處，得來全不費工夫。",
            "妙哉！這底牌正如吾意。",
            "神來之筆，衝得漂亮！",
            "這便是緣分，擋都擋不住。"
        ],
        KAI_CHONG_FAIL: [
            "緣分未到，強求不得。",
            "鏡中花，水中月，空歡喜一場。",
            "底牌無情，奈何奈何。",
            "時機未到，且看下回分解。",
            "罷了，得之我幸，失之我命。"
        ],
        PLAY_HIGH_CARD: [
            "泰山壓頂！誰能擋我？",
            "此牌一出，乾坤定矣。",
            "重劍無鋒，大巧不工。",
            "看這張『尊』張，可有氣勢？"
        ],
        WAITING: [
            "思考良久，莫非在推演天機？",
            "兵貴神速，猶豫則敗北。",
            "莫讓光陰虛度，速速出牌。",
            "閣下可是在研讀《馬吊牌經》？快哉快哉。"
        ],
        TEACH_VIOLATION: [
            "孺子不可教也！《牌經》有云：首發千萬乃是大忌！你怎敢造次？",
            "荒唐！非『百老』而首發十字門，你這是自尋死路，還要連累旁人！",
            "若是當年在蘇州茶館，你這般打法，是要被趕下桌的！",
            "同門『肩』未出，怎可妄動『尊』張？新手切記：三防為上！",
            "你這打法，毫無章法！這就是『包賠』的下場，好好記著！",
            "不懂規矩！趣張在手，豈可滅絕青牌？回去再讀讀規則吧！"
        ]
    },
    en: {
        GAME_START: ["Ma Diao is akin to military strategy. Forty cards, infinite changes. Proceed with caution.", "As the ancient masters said: Know yourself and your enemy. Let us duel.", "In the Ming Dynasty, scholars adored this game. Let us honor their tradition."],
        TRICK_WIN: ["A strategic acquisition.", "I accept this tribute gratefully.", "Just as the manuals predicted.", "Swift as the wind, I take this trick."],
        TRICK_WIN_BIG: ["One man guards the pass, ten thousand cannot break through!", "The Supreme Card is here!", "Who dares to challenge my authority?", "Absolute dominance!"],
        TRICK_LOSS: ["A momentary lapse in judgment...", "I let you have this one intentionally.", "A clever trap, I must admit.", "The ancients warned of such strategies."],
        PENALTY: ["Alas! I have brought shame upon my ancestors!", "A penalty? My reputation is ruined!", "I was momentarily blinded by greed.", "A painful lesson learned."],
        ROUND_WIN: ["Strategy woven within the tent determines victory a thousand miles away.", "My luck today rivals the masters of old.", "A narrow victory, thank you for the game.", "The flow of the cards was with me."],
        ROUND_LOSS: ["Fortune is fickle...", "I shall return stronger in the next hand.", "Your skills have improved, young one.", "I must meditate on this defeat."],
        KAI_CHONG_SUCCESS: ["A match made in heaven!", "It was destined to be.", "A stroke of genius!", "Fate is on my side."],
        KAI_CHONG_FAIL: ["Fate has not yet arrived.", "Like a flower in the mirror, an illusion.", "The pot is cruel today.", "Patience is a virtue."],
        PLAY_HIGH_CARD: ["Behold, the weight of Mount Tai!", "This card settles the universe.", "Power without flash.", "Can you withstand this?"],
        WAITING: ["Are you calculating the movements of the stars?", "Hesitation leads to defeat.", "Time flows like a river, please play.", "Studying the ancient texts, are we?"],
        TEACH_VIOLATION: [
            "Foolish apprentice! Leading 'Qian Wan' is strictly forbidden by the ancients!",
            "Absurd! Leading Cash without being a Millionaire? You court disaster!",
            "In the old tea houses of Suzhou, such play would get you expelled!",
            "Do not play the Reward (Zun) before the Shoulder appears! Remember the Three Preventions!",
            "Chaos! This is why the 'Grand Penalty' exists. Learn from this!",
            "You hold the Extreme (Ji) yet discard your Blacks? Amateur!"
        ]
    },
    ja: {
        GAME_START: ["馬吊は兵法の如し。四十枚の札、変化は無限なり。", "馮夢龍先生曰く『彼を知り己を知れば百戦殆うからず』。", "明代の文人たちも愛したこの遊戯、雅に参ろう。"],
        TRICK_WIN: ["頂いた。", "兵は神速を貴ぶ。", "計算通りだ。", "この一手が戦局を変える。"],
        TRICK_WIN_BIG: ["一夫当関、万夫莫開！", "至尊ここにあり！", "誰がこの勢いを止められようか？", "圧倒的ではないか！"],
        TRICK_LOSS: ["不覚...", "敵を欺くにはまず味方からか。", "見事な策だ。", "次はこうはいかんぞ。"],
        PENALTY: ["嗚呼！先人に顔向けできぬ...", "責任払いとは...一生の不覚！", "魔が差したとしか言いようがない。", "自業自得か..."],
        ROUND_WIN: ["帷幄の中で謀り、千里の外で勝つ。", "今日の運勢は古の達人の如し。", "良い勝負であった。", "流れは我にあり。"],
        ROUND_LOSS: ["運命とは非情なもの...", "次は必ず雪辱を果たす。", "若手にしてはやるな。", "この敗北を糧としよう。"],
        KAI_CHONG_SUCCESS: ["天の配剤なり！", "待っていたぞ。", "妙手！", "運命の巡り合わせだ。"],
        KAI_CHONG_FAIL: ["縁がなかったか。", "鏡花水月...", "無念。", "次機を待つのみ。"],
        PLAY_HIGH_CARD: ["泰山の重みを知れ！", "乾坤一擲！", "この札で決める。", "これぞ王者の風格。"],
        WAITING: ["天機を読んでいるのか？", "長考は敗北の元なり。", "時は金なり、早う。", "古文書でも読んでいるのか？"],
        TEACH_VIOLATION: [
            "愚か者め！『千万』の先発は古来よりの大禁忌ぞ！",
            "なんと！『百老』でもないのに十字門を出すとは、自滅する気か！",
            "昔の蘇州の茶館なら、叩き出されているところだぞ！",
            "同門の『肩』が出ぬうちに『尊』を出すなど、言語道断！",
            "無茶苦茶だ！それが『責任払い』の報いだ、よく覚えておけ！",
            "『極』を持っているのに青牌を捨てるとは...素人め！"
        ]
    },
    ko: {
        GAME_START: ["마조는 병법과 같다. 40장의 패, 변화무쌍하니 신중하라.", "풍몽룡 선생 왈: 지피지기면 백전불태라 했다.", "명나라 선비들이 즐기던 이 놀이, 풍류를 즐겨보자."],
        TRICK_WIN: ["감사히 받겠소.", "병법은 신속을 귀하게 여긴다.", "계산대로군.", "이 한 수가 판세를 뒤집으리라."],
        TRICK_WIN_BIG: ["일당백의 기세로다!", "지존이 여기 있다!", "누가 감히 막을쏘냐?", "압도적이군!"],
        TRICK_LOSS: ["방심했군...", "적을 속이려다 내가 당했소.", "훌륭한 계략이오.", "다음엔 어림없다."],
        PENALTY: ["오호 통재라! 선현들께 면목이 없구나...", "독박이라니... 일생일대의 실수로다!", "귀신에 홀렸나 보오.", "자업자득이로다."],
        ROUND_WIN: ["천리 밖의 승부를 앉아서 결정짓는군.", "오늘 운세가 옛 고수들과 같구려.", "좋은 승부였소.", "흐름이 나에게 왔소."],
        ROUND_LOSS: ["운명이 야속하군...", "다음 판엔 반드시 설욕하리라.", "젊은 친구가 제법이군.", "이 패배를 교훈 삼겠소."],
        KAI_CHONG_SUCCESS: ["하늘이 정해준 인연이로다!", "기다리고 있었소.", "묘수!", "운명의 장난이군."],
        KAI_CHONG_FAIL: ["인연이 아닌가 보오.", "신기루였군...", "아쉽구려.", "때를 기다려야지."],
        PLAY_HIGH_CARD: ["태산의 무게를 느껴보라!", "건곤일척의 승부수!", "이 패로 끝내겠소.", "왕의 품격이로다."],
        WAITING: ["천기를 읽고 계시오?", "망설임은 패배를 부를 뿐.", "시간이 금이오, 어서.", "고서라도 읽고 있는 게요?"],
        TEACH_VIOLATION: [
            "어리석은지고! '천만'을 먼저 내는 것은 옛부터 금기였거늘!",
            "당치 않소! '백로'도 아니면서 십자문을 내다니, 자멸할 셈이오?",
            "옛날 소주 찻집이었으면 쫓겨났을 플레이오!",
            "같은 무늬 '견'이 나오기도 전에 '존'을 내다니, 언어도단이오!",
            "무모하군! 그것이 바로 '독박'의 대가이니, 명심하시오!",
            "'극'을 쥐고도 청패를 버리다니... 하수나 하는 짓이오!"
        ]
    }
};

export const getAIChatMessage = (context: ChatContext, language: SupportedLanguage, personality?: AILearningState): string => {
    const langMessages = MESSAGES[language] || MESSAGES['en'];
    const options = langMessages[context] || [];
    
    if (options.length === 0) return "";

    // Simple random selection
    const index = Math.floor(Math.random() * options.length);
    return options[index];
};
