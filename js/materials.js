// フリー素材 自動挿入機能
// CSSパターン・絵文字・SVGを使った装飾素材ライブラリ

// ====================================
// 月別 素材定義
// ====================================

const MONTH_MATERIALS = {
    1: {
        backgroundPattern: 'diagonal-lines',
        patternColors: ['#DC143C', '#FFD700'],
        cornerEmojis: ['🎍', '🎌', '🎊', '🌅'],
        sidebarEmojis: ['🎍', '🌅', '🎊', '🎌', '✨'],
        borderStyle: 'double',
        borderColor: '#DC143C',
        accentLabel: '謹賀新年'
    },
    2: {
        backgroundPattern: 'dots',
        patternColors: ['#4169E1', '#FFD700'],
        cornerEmojis: ['👹', '🫘', '🎭', '🌸'],
        sidebarEmojis: ['👹', '🫘', '🫘', '🎭', '💥'],
        borderStyle: 'dashed',
        borderColor: '#4169E1',
        accentLabel: '鬼は外！'
    },
    3: {
        backgroundPattern: 'sakura-dots',
        patternColors: ['#FF69B4', '#FFB6C1'],
        cornerEmojis: ['🎎', '🌸', '🍡', '🎀'],
        sidebarEmojis: ['🌸', '🎎', '🌸', '🍡', '🌸'],
        borderStyle: 'solid',
        borderColor: '#FF69B4',
        accentLabel: '桃の節句'
    },
    4: {
        backgroundPattern: 'petal-scatter',
        patternColors: ['#FFB7C5', '#FFC0CB'],
        cornerEmojis: ['🌸', '🦋', '🌸', '🌺'],
        sidebarEmojis: ['🌸', '🦋', '🌸', '🌺', '🌸'],
        borderStyle: 'solid',
        borderColor: '#FFB7C5',
        accentLabel: '花見日和'
    },
    5: {
        backgroundPattern: 'diagonal-lines',
        patternColors: ['#228B22', '#4169E1'],
        cornerEmojis: ['🎏', '⚔️', '🌿', '🍵'],
        sidebarEmojis: ['🎏', '🌿', '🎏', '⚔️', '🍵'],
        borderStyle: 'solid',
        borderColor: '#228B22',
        accentLabel: '端午の節句'
    },
    6: {
        backgroundPattern: 'rain-drops',
        patternColors: ['#9370DB', '#87CEEB'],
        cornerEmojis: ['💜', '☔', '🐌', '💧'],
        sidebarEmojis: ['💜', '💧', '🐌', '☔', '💧'],
        borderStyle: 'solid',
        borderColor: '#9370DB',
        accentLabel: '雨の季節'
    },
    7: {
        backgroundPattern: 'stars',
        patternColors: ['#4169E1', '#FFD700'],
        cornerEmojis: ['🎋', '⭐', '🌌', '💫'],
        sidebarEmojis: ['⭐', '🎋', '💫', '⭐', '🌌'],
        borderStyle: 'solid',
        borderColor: '#4169E1',
        accentLabel: '七夕まつり'
    },
    8: {
        backgroundPattern: 'zigzag',
        patternColors: ['#DC143C', '#FFD700'],
        cornerEmojis: ['🎆', '🏮', '🍉', '🎐'],
        sidebarEmojis: ['🏮', '🎆', '🍉', '🎐', '✨'],
        borderStyle: 'double',
        borderColor: '#DC143C',
        accentLabel: '夏祭り'
    },
    9: {
        backgroundPattern: 'dots',
        patternColors: ['#FF8C00', '#FFD700'],
        cornerEmojis: ['💐', '🎁', '💝', '🌻'],
        sidebarEmojis: ['💐', '🌻', '💝', '🎁', '💐'],
        borderStyle: 'solid',
        borderColor: '#FF8C00',
        accentLabel: '感謝を込めて'
    },
    10: {
        backgroundPattern: 'diagonal-lines',
        patternColors: ['#DC143C', '#4169E1'],
        cornerEmojis: ['🏃', '🎯', '🏅', '🎊'],
        sidebarEmojis: ['🏅', '🎯', '🏃', '🎊', '🏅'],
        borderStyle: 'dashed',
        borderColor: '#DC143C',
        accentLabel: '頑張れ！'
    },
    11: {
        backgroundPattern: 'leaf-scatter',
        patternColors: ['#FF6347', '#FFD700'],
        cornerEmojis: ['🍁', '🍂', '🌰', '🦌'],
        sidebarEmojis: ['🍁', '🍂', '🍁', '🌰', '🍂'],
        borderStyle: 'solid',
        borderColor: '#FF6347',
        accentLabel: '秋の深まり'
    },
    12: {
        backgroundPattern: 'snowflakes',
        patternColors: ['#DC143C', '#228B22'],
        cornerEmojis: ['🎄', '🎅', '⛄', '🎁'],
        sidebarEmojis: ['🎄', '⭐', '🎁', '⛄', '🎅'],
        borderStyle: 'double',
        borderColor: '#DC143C',
        accentLabel: 'Merry Xmas!'
    }
};

// ====================================
// 背景パターン生成
// ====================================

function generateBackgroundPattern(month, template) {
    const mat = MONTH_MATERIALS[month];
    if (!mat) return `background-color: ${template.colors.background};`;

    const [c1, c2] = mat.patternColors;
    const alpha1 = '18'; // 透明度 (hex)
    const alpha2 = '10';

    switch (mat.backgroundPattern) {
        case 'diagonal-lines':
            return `
                background-color: ${template.colors.background};
                background-image: repeating-linear-gradient(
                    45deg,
                    ${c1}${alpha1} 0px,
                    ${c1}${alpha1} 2px,
                    transparent 2px,
                    transparent 18px
                );
            `;
        case 'dots':
            return `
                background-color: ${template.colors.background};
                background-image: radial-gradient(circle, ${c1}22 2px, transparent 2px);
                background-size: 20px 20px;
            `;
        case 'sakura-dots':
        case 'petal-scatter':
            return `
                background-color: ${template.colors.background};
                background-image:
                    radial-gradient(ellipse 6px 8px at 50% 50%, ${c1}20 60%, transparent 60%),
                    radial-gradient(ellipse 6px 8px at 50% 50%, ${c2}18 60%, transparent 60%);
                background-size: 30px 30px, 15px 15px;
                background-position: 0 0, 15px 15px;
            `;
        case 'stars':
            return `
                background-color: ${template.colors.background};
                background-image:
                    radial-gradient(circle, ${c2}30 1.5px, transparent 1.5px),
                    radial-gradient(circle, ${c1}20 1px, transparent 1px);
                background-size: 25px 25px, 12px 12px;
                background-position: 0 0, 6px 6px;
            `;
        case 'snowflakes':
            return `
                background-color: ${template.colors.background};
                background-image:
                    radial-gradient(circle, ${c2}25 2px, transparent 2px),
                    radial-gradient(circle, ${c1}15 1px, transparent 1px);
                background-size: 28px 28px, 14px 14px;
                background-position: 0 0, 7px 7px;
            `;
        case 'rain-drops':
            return `
                background-color: ${template.colors.background};
                background-image: repeating-linear-gradient(
                    100deg,
                    ${c1}12 0px,
                    ${c1}12 1px,
                    transparent 1px,
                    transparent 12px
                );
            `;
        case 'zigzag':
            return `
                background-color: ${template.colors.background};
                background-image:
                    linear-gradient(135deg, ${c1}15 25%, transparent 25%) -10px 0,
                    linear-gradient(225deg, ${c1}15 25%, transparent 25%) -10px 0,
                    linear-gradient(315deg, ${c1}15 25%, transparent 25%),
                    linear-gradient(45deg, ${c1}15 25%, transparent 25%);
                background-size: 20px 20px;
            `;
        case 'leaf-scatter':
            return `
                background-color: ${template.colors.background};
                background-image:
                    radial-gradient(ellipse 8px 5px at 30% 50%, ${c1}22 70%, transparent 70%),
                    radial-gradient(ellipse 6px 4px at 70% 50%, ${c2}18 70%, transparent 70%);
                background-size: 35px 25px, 25px 20px;
                background-position: 0 0, 12px 10px;
            `;
        default:
            return `background-color: ${template.colors.background};`;
    }
}

// ====================================
// コーナー装飾生成
// ====================================

function generateCornerDecorations(month) {
    const mat = MONTH_MATERIALS[month];
    if (!mat) return '';

    const [tl, tr, bl, br] = mat.cornerEmojis;
    const size = '22pt';
    const pos = '3mm';

    return `
        <div style="position: absolute; top: ${pos}; left: ${pos}; font-size: ${size}; line-height: 1; pointer-events: none;">${tl}</div>
        <div style="position: absolute; top: ${pos}; right: ${pos}; font-size: ${size}; line-height: 1; pointer-events: none;">${tr}</div>
        <div style="position: absolute; bottom: ${pos}; left: ${pos}; font-size: ${size}; line-height: 1; pointer-events: none;">${bl}</div>
        <div style="position: absolute; bottom: ${pos}; right: ${pos}; font-size: ${size}; line-height: 1; pointer-events: none;">${br}</div>
    `;
}

// ====================================
// サイドバー装飾生成（左右）
// ====================================

function generateSideDecorations(month) {
    const mat = MONTH_MATERIALS[month];
    if (!mat) return { left: '', right: '' };

    const emojis = mat.sidebarEmojis;
    const emojiHtml = emojis.map(e =>
        `<div style="font-size: 14pt; line-height: 1.8; text-align: center;">${e}</div>`
    ).join('');

    const sideStyle = `
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 8mm;
        flex-shrink: 0;
        opacity: 0.75;
        padding: 5mm 0;
    `;

    return {
        left: `<div style="${sideStyle}">${emojiHtml}</div>`,
        right: `<div style="${sideStyle}">${emojiHtml}</div>`
    };
}

// ====================================
// アクセントラベル（ヘッダー角）
// ====================================

function generateAccentLabel(month, template) {
    const mat = MONTH_MATERIALS[month];
    if (!mat || !mat.accentLabel) return '';

    return `
        <div style="
            display: inline-block;
            padding: 2mm 5mm;
            background: ${template.colors.secondary};
            color: #333;
            font-size: 9pt;
            font-weight: bold;
            border-radius: 20px;
            margin-top: 3mm;
            letter-spacing: 1px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${mat.accentLabel}</div>
    `;
}

// ====================================
// ボーダースタイル取得
// ====================================

function getMaterialBorderStyle(month) {
    const mat = MONTH_MATERIALS[month];
    if (!mat) return '2px solid #ccc';
    return `3px ${mat.borderStyle} ${mat.borderColor}`;
}

// ====================================
// 素材ありページラッパー生成
// ====================================

function generatePageWrapperWithMaterials(content, template, month) {
    const bgStyle = generateBackgroundPattern(month, template);
    const corners = generateCornerDecorations(month);
    const sides = generateSideDecorations(month);
    const border = getMaterialBorderStyle(month);

    return `
        <div class="preview-wrapper">
            <div style="
                max-width: 210mm;
                margin: 0 auto;
                padding: 5mm;
                ${bgStyle}
                font-family: 'Yu Gothic', 'Meiryo', sans-serif;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                position: relative;
                border: ${border};
                border-radius: 4px;
                overflow: hidden;
            ">
                ${corners}
                <div style="
                    display: flex;
                    flex-direction: row;
                    gap: 2mm;
                    flex: 1;
                    min-height: 0;
                ">
                    ${sides.left}
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 4mm; min-width: 0;">
                        ${content}
                    </div>
                    ${sides.right}
                </div>
            </div>
        </div>
    `;
}
