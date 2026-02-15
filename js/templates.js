// 12ヶ月分のテンプレート定義
const MONTH_TEMPLATES = {
    1: {
        name: '新年会',
        theme: '新年',
        colors: {
            primary: '#DC143C',
            secondary: '#FFD700',
            background: '#FFF8DC'
        },
        decorations: ['🎍', '🎌', '🌅', '🎊'],
        defaultEventName: '新年お楽しみ会',
        commentTemplates: [
            '新しい年を皆様と笑顔で迎えることができました。',
            '今年も元気に楽しく過ごしましょう!',
            '令和{year}年も、笑顔あふれる一年になりますように。',
            '新年を祝い、皆で楽しいひと時を過ごしました。'
        ]
    },
    2: {
        name: '節分',
        theme: '節分',
        colors: {
            primary: '#4169E1',
            secondary: '#FFD700',
            background: '#F0F8FF'
        },
        decorations: ['👹', '🫘', '🎭', '🌸'],
        defaultEventName: '節分豆まき大会',
        commentTemplates: [
            '鬼は外!福は内!元気な掛け声が響きました。',
            '今年も無病息災を願い、豆まきを楽しみました。',
            '鬼退治で盛り上がり、福を呼び込みました。',
            '皆様の健康と幸せを願って、楽しく豆まきをしました。'
        ]
    },
    3: {
        name: 'ひな祭り',
        theme: 'ひな祭り',
        colors: {
            primary: '#FF69B4',
            secondary: '#FFB6C1',
            background: '#FFF0F5'
        },
        decorations: ['🎎', '🌸', '🍡', '🎀'],
        defaultEventName: 'ひな祭りお祝い会',
        commentTemplates: [
            '春の訪れを感じながら、ひな祭りを祝いました。',
            '皆様と一緒に、華やかなひな祭りを楽しみました。',
            '桃の節句、笑顔いっぱいのお祝いとなりました。',
            '春の訪れと共に、楽しいひと時を過ごしました。'
        ]
    },
    4: {
        name: 'お花見',
        theme: 'お花見',
        colors: {
            primary: '#FFB7C5',
            secondary: '#FFC0CB',
            background: '#FFF5EE'
        },
        decorations: ['🌸', '🌺', '🦋', '🍱'],
        defaultEventName: 'お花見会',
        commentTemplates: [
            '満開の桜の下、楽しいお花見となりました。',
            '春の陽気の中、美しい桜を楽しみました。',
            '桜を愛でながら、和やかなひと時を過ごしました。',
            'きれいな桜に囲まれ、笑顔あふれる一日でした。'
        ]
    },
    5: {
        name: '端午の節句',
        theme: '端午の節句',
        colors: {
            primary: '#228B22',
            secondary: '#4169E1',
            background: '#F0FFF0'
        },
        decorations: ['🎏', '⚔️', '🌿', '🍵'],
        defaultEventName: '端午の節句お祝い会',
        commentTemplates: [
            '鯉のぼりのように元気に、楽しい会となりました。',
            '皆様の健康を願い、端午の節句を祝いました。',
            '初夏の爽やかな季節を、楽しく過ごしました。',
            '元気いっぱい、鯉のぼりとともにお祝いしました。'
        ]
    },
    6: {
        name: '紫陽花鑑賞',
        theme: '紫陽花',
        colors: {
            primary: '#9370DB',
            secondary: '#87CEEB',
            background: '#F0F8FF'
        },
        decorations: ['💜', '☔', '🐌', '💧'],
        defaultEventName: '紫陽花鑑賞会',
        commentTemplates: [
            '美しい紫陽花を眺めながら、梅雨の季節を楽しみました。',
            '色とりどりの紫陽花に囲まれ、癒しの時間となりました。',
            '雨の季節も、紫陽花と共に笑顔で過ごしました。',
            '梅雨の風物詩、紫陽花を愛でる素敵な会となりました。'
        ]
    },
    7: {
        name: '七夕',
        theme: '七夕',
        colors: {
            primary: '#4169E1',
            secondary: '#FFD700',
            background: '#F0F8FF'
        },
        decorations: ['🎋', '⭐', '🌌', '💫'],
        defaultEventName: '七夕まつり',
        commentTemplates: [
            '願いを込めた短冊を飾り、楽しい七夕となりました。',
            '星に願いを届け、笑顔あふれる会となりました。',
            '皆様の願いが叶いますように、七夕を祝いました。',
            '短冊に想いを込めて、素敵な七夕を過ごしました。'
        ]
    },
    8: {
        name: '夏祭り',
        theme: '夏祭り',
        colors: {
            primary: '#DC143C',
            secondary: '#FFD700',
            background: '#FFFACD'
        },
        decorations: ['🎆', '🏮', '🍉', '🎐'],
        defaultEventName: '夏祭り',
        commentTemplates: [
            '夏の風物詩、楽しい夏祭りとなりました。',
            '提灯の灯りの下、盛大な夏祭りを楽しみました。',
            '暑い夏も、皆で楽しく盛り上がりました。',
            '夏の思い出に残る、素敵なお祭りとなりました。'
        ]
    },
    9: {
        name: '敬老の日',
        theme: '敬老の日',
        colors: {
            primary: '#FF8C00',
            secondary: '#FFD700',
            background: '#FFF8DC'
        },
        decorations: ['💐', '🎁', '💝', '🌻'],
        defaultEventName: '敬老の日お祝い会',
        commentTemplates: [
            '日頃の感謝を込めて、楽しい会となりました。',
            'いつまでもお元気で、笑顔でいてくださいね。',
            '皆様への感謝の気持ちを込めて、お祝いしました。',
            '敬老の日、心温まる素敵な一日となりました。'
        ]
    },
    10: {
        name: '運動会',
        theme: '運動会',
        colors: {
            primary: '#DC143C',
            secondary: '#4169E1',
            background: '#FFF8DC'
        },
        decorations: ['🏃', '🎯', '🏅', '🎊'],
        defaultEventName: '秋の大運動会',
        commentTemplates: [
            '秋晴れの下、元気いっぱい運動会を楽しみました。',
            '皆で体を動かし、笑顔あふれる運動会となりました。',
            '紅葉の季節、楽しい運動会で盛り上がりました。',
            '元気に競技を楽しみ、素敵な思い出ができました。'
        ]
    },
    11: {
        name: '紅葉狩り',
        theme: '紅葉',
        colors: {
            primary: '#FF6347',
            secondary: '#FFD700',
            background: '#FFF8DC'
        },
        decorations: ['🍁', '🍂', '🌰', '🦌'],
        defaultEventName: '紅葉鑑賞会',
        commentTemplates: [
            '美しい紅葉を眺めながら、秋を満喫しました。',
            '色づいた木々に囲まれ、素敵な秋の一日となりました。',
            '紅葉の美しさに心癒される、楽しい会となりました。',
            '秋の風物詩、紅葉狩りを楽しみました。'
        ]
    },
    12: {
        name: 'クリスマス',
        theme: 'クリスマス',
        colors: {
            primary: '#DC143C',
            secondary: '#228B22',
            background: '#FFF8DC'
        },
        decorations: ['🎄', '🎅', '⛄', '🎁'],
        defaultEventName: 'クリスマス会',
        commentTemplates: [
            'メリークリスマス!楽しいクリスマス会となりました。',
            'サンタさんも来て、笑顔いっぱいの会となりました。',
            '心温まるクリスマスを、皆で楽しみました。',
            '今年最後の大イベント、素敵なクリスマスとなりました。'
        ]
    }
};

// テンプレート取得関数
function getTemplate(month) {
    return MONTH_TEMPLATES[month] || null;
}

// 現在の年を取得
function getCurrentYear() {
    return new Date().getFullYear();
}
