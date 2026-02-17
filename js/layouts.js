// レイアウトテンプレート定義

const LAYOUT_TEMPLATES = {
    'grid-5x4': {
        name: '標準グリッド (5×4)',
        photoSlots: 20,
        generator: 'generateGrid5x4Layout'
    },
    'magazine-2col': {
        name: '2段新聞スタイル',
        photoSlots: 12,
        generator: 'generateMagazine2ColLayout'
    },
    'magazine-3col': {
        name: '3段新聞スタイル (泉平風)',
        photoSlots: 15,
        generator: 'generateMagazine3ColLayout'
    },
    'feature-spotlight': {
        name: 'ヒーロー写真スタイル',
        photoSlots: 13,
        generator: 'generateFeatureSpotlightLayout'
    },
    'mixed-sections': {
        name: '混合セクション',
        photoSlots: 18,
        generator: 'generateMixedSectionsLayout'
    }
};

// ====================================
// ヘルパー関数
// ====================================

/**
 * 動的フォントサイズ調整（A4見切れ防止）
 * @param {number} estimatedHeight - 推定コンテンツ高さ（mm）
 * @param {number} maxHeight - 最大高さ（デフォルト: 277mm = 297mm - 20mm padding）
 * @returns {Object} 調整後のサイズ設定
 */
function calculateDynamicSizing(estimatedHeight, maxHeight = 277) {
    const scale = Math.min(1, maxHeight / estimatedHeight);

    return {
        headerFontSize: Math.max(18, 26 * scale), // 26pt → 最小18pt
        sectionHeaderFont: Math.max(10, 12 * scale), // 12pt → 最小10pt
        commentFont: Math.max(9, 11 * scale), // 11pt → 最小9pt
        photoGap: Math.max(1.5, 2 * scale), // 2mm → 最小1.5mm
        sectionGap: Math.max(2, 3 * scale), // 3mm → 最小2mm
        scale: scale
    };
}

/**
 * ヘッダー部分を生成
 */
function generateHeader(title, date, template) {
    let dateStr = '';
    if (date) {
        const d = new Date(date);
        dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }

    // カスタムフォントサイズがあれば使用
    const titleFontSize = window._customFontSizes?.titleFontSize || 26;

    return `
        <div style="
            text-align: center;
            margin-bottom: 5mm;
            padding: 6mm;
            background: linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%);
            color: white;
            border-radius: 8px;
            flex-shrink: 0;
        ">
            <h1 data-editable="title" spellcheck="false" style="
                font-size: ${titleFontSize}pt;
                margin: 0 0 3mm 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                outline: none;
            ">${template.decorations[0]} ${title} ${template.decorations[0]}</h1>
            ${dateStr ? `<p style="font-size: 14pt; margin: 0;">${dateStr}</p>` : ''}
        </div>
    `;
}

/**
 * フッター装飾を生成
 */
function generateFooter(template) {
    return `
        <div style="
            text-align: center;
            font-size: 28pt;
            margin-top: auto;
            padding-top: 3mm;
            flex-shrink: 0;
        ">
            ${template.decorations.join(' ')}
        </div>
    `;
}

/**
 * コメントセクションを生成
 */
function generateCommentSection(comment, template, fontSize = null) {
    if (!comment) return '';
    // カスタムフォントサイズがあれば使用
    fontSize = fontSize || window._customFontSizes?.commentFontSize || 11;

    return `
        <div data-role="comment-section" style="
            padding: 5mm;
            background: white;
            border: 2px solid ${template.colors.secondary};
            border-radius: 8px;
            font-size: ${fontSize}pt;
            line-height: 1.6;
            white-space: pre-wrap;
            flex-shrink: 0;
            overflow: hidden;
            max-height: 45mm;
        ">
            ${comment}
        </div>
    `;
}

/**
 * 写真グリッドを生成
 */
function generatePhotoGrid(photos, columns, template, gap = '2mm', startIndex = 0) {
    return `
        <div style="
            display: grid;
            grid-template-columns: repeat(${columns}, 1fr);
            gap: ${gap};
        ">
            ${photos.map((photo, i) => `
                <div class="preview-photo" data-photo-index="${startIndex + i}" style="
                    aspect-ratio: 1;
                    overflow: hidden;
                    border-radius: 6px;
                    border: 2px solid ${template.colors.primary};
                    position: relative;
                ">
                    <img src="${photo.data}" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        object-position: center center;
                        pointer-events: none;
                    ">
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * セクションヘッダーを生成
 */
function generateSectionHeader(title, template, sectionKey = null) {
    const editableAttrs = sectionKey
        ? `data-editable="section" data-section-key="${sectionKey}" contenteditable="true" spellcheck="false"`
        : '';
    return `
        <div ${editableAttrs} style="
            padding: 3mm;
            margin-bottom: 2mm;
            background: linear-gradient(90deg, ${template.colors.primary}, ${template.colors.secondary});
            color: white;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12pt;
            text-align: center;
            outline: none;
        ">
            ${title}
        </div>
    `;
}

/**
 * 単一写真(大きめ)を生成
 */
function generateLargePhoto(photo, template, height = '100mm', photoIndex = 0) {
    return `
        <div class="preview-photo" data-photo-index="${photoIndex}" style="
            height: ${height};
            overflow: hidden;
            border-radius: 8px;
            border: 3px solid ${template.colors.primary};
            position: relative;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        ">
            <img src="${photo.data}" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center center;
                pointer-events: none;
            ">
        </div>
    `;
}

/**
 * ページラッパーを生成
 * month が渡された場合は素材ありバージョンを使用
 */
function generatePageWrapper(content, template, month = null) {
    if (month && typeof generatePageWrapperWithMaterials === 'function') {
        return generatePageWrapperWithMaterials(content, template, month);
    }
    return `
        <div class="preview-wrapper">
            <div style="
                max-width: 210mm;
                margin: 0 auto;
                padding: 5mm;
                background: ${template.colors.background};
                font-family: 'Yu Gothic', 'Meiryo', sans-serif;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
            ">
                ${content}
            </div>
        </div>
    `;
}

// ====================================
// レイアウトジェネレーター関数
// ====================================

/**
 * 1. 標準グリッド 5×4 (既存レイアウト)
 * 20枚の写真を均等配置
 */
function generateGrid5x4Layout(app) {
    const template = app.currentTemplate;
    const eventTitle = document.getElementById('eventTitle').value || 'イベント';
    const eventDate = document.getElementById('eventDate').value;
    const comment = document.getElementById('commentText').value || '';
    const photos = app.photos.slice(0, 20);

    const content = `
        ${generateHeader(eventTitle, eventDate, template)}

        <div style="
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 3mm;
            margin-bottom: 5mm;
            flex-shrink: 0;
        ">
            ${photos.map((photo, index) => `
                <div class="preview-photo" data-photo-index="${index}" style="
                    aspect-ratio: 1;
                    overflow: hidden;
                    border-radius: 6px;
                    border: 2px solid ${template.colors.primary};
                    position: relative;
                ">
                    <img src="${photo.data}" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        object-position: center center;
                        pointer-events: none;
                    ">
                </div>
            `).join('')}
        </div>

        ${generateCommentSection(comment, template)}
        ${generateFooter(template)}
    `;

    return generatePageWrapper(content, template, app.selectedMonth);
}

/**
 * 2. 2段新聞スタイル
 * 大写真1枚 + 小グリッド11枚 = 12枚
 */
function generateMagazine2ColLayout(app) {
    const template = app.currentTemplate;
    const eventTitle = document.getElementById('eventTitle').value || 'イベント';
    const eventDate = document.getElementById('eventDate').value;
    const comment = document.getElementById('commentText').value || '';
    const photos = app.photos.slice(0, 12);

    if (photos.length === 0) return generatePageWrapper('写真がありません', template);

    const heroPhoto = photos[0];
    const gridPhotos = photos.slice(1, 12);

    const content = `
        ${generateHeader(eventTitle, eventDate, template)}

        <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4mm;
            margin-bottom: 5mm;
        ">
            <div>
                ${generateSectionHeader('メイン写真', template)}
                ${generateLargePhoto(heroPhoto, template, '120mm', 0)}
            </div>
            <div>
                ${generateSectionHeader('活動の様子', template)}
                ${generatePhotoGrid(gridPhotos, 3, template, '2mm', 1)}
            </div>
        </div>

        ${generateCommentSection(comment, template)}
        ${generateFooter(template)}
    `;

    return generatePageWrapper(content, template, app.selectedMonth);
}

/**
 * 3. 3段新聞スタイル (泉平ファミリー新聞風) ⭐
 * 3つのセクションに分割、各5枚 = 15枚
 */
function generateMagazine3ColLayout(app) {
    const template = app.currentTemplate;
    const eventTitle = document.getElementById('eventTitle').value || 'イベント';
    const eventDate = document.getElementById('eventDate').value;
    const comment = document.getElementById('commentText').value || '';
    const photos = app.photos.slice(0, 15);

    if (photos.length === 0) return generatePageWrapper('写真がありません', template);

    // 写真を3グループに分割
    const col1 = photos.slice(0, 5);
    const col2 = photos.slice(5, 10);
    const col3 = photos.slice(10, 15);

    const generateColumn = (title, columnPhotos, startIndex = 0, sectionKey = null) => {
        if (columnPhotos.length === 0) return '';
        return `
            <div style="
                border: 2px solid ${template.colors.primary};
                border-radius: 6px;
                padding: 3mm;
                background: white;
            ">
                ${generateSectionHeader(title, template, sectionKey)}
                ${generatePhotoGrid(columnPhotos, 2, template, '2mm', startIndex)}
            </div>
        `;
    };

    const content = `
        ${generateHeader(eventTitle, eventDate, template)}

        <div style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4mm;
            margin-bottom: 5mm;
        ">
            ${generateColumn(app.sectionTitles['magazine-3col']?.section1 || '活動①', col1, 0, 'section1')}
            ${generateColumn(app.sectionTitles['magazine-3col']?.section2 || '活動②', col2, 5, 'section2')}
            ${generateColumn(app.sectionTitles['magazine-3col']?.section3 || '活動③', col3, 10, 'section3')}
        </div>

        ${generateCommentSection(comment, template)}
        ${generateFooter(template)}
    `;

    return generatePageWrapper(content, template, app.selectedMonth);
}

/**
 * 4. ヒーロー写真スタイル
 * 大きなヒーロー写真1枚 + グリッド12枚 = 13枚
 */
function generateFeatureSpotlightLayout(app) {
    const template = app.currentTemplate;
    const eventTitle = document.getElementById('eventTitle').value || 'イベント';
    const eventDate = document.getElementById('eventDate').value;
    const comment = document.getElementById('commentText').value || '';
    const photos = app.photos.slice(0, 13);

    if (photos.length === 0) return generatePageWrapper('写真がありません', template);

    const heroPhoto = photos[0];
    const gridPhotos = photos.slice(1, 13);

    const content = `
        ${generateHeader(eventTitle, eventDate, template)}

        <div style="margin-bottom: 4mm;">
            ${generateLargePhoto(heroPhoto, template, '90mm', 0)}
        </div>

        ${generateSectionHeader('その他の様子', template)}
        <div style="margin-bottom: 4mm;">
            ${generatePhotoGrid(gridPhotos, 4, template, '2mm', 1)}
        </div>

        ${generateCommentSection(comment, template)}
        ${generateFooter(template)}
    `;

    return generatePageWrapper(content, template, app.selectedMonth);
}

/**
 * 5. 混合セクション
 * 複数セクション混合 = 18枚
 */
function generateMixedSectionsLayout(app) {
    const template = app.currentTemplate;
    const eventTitle = document.getElementById('eventTitle').value || 'イベント';
    const eventDate = document.getElementById('eventDate').value;
    const comment = document.getElementById('commentText').value || '';
    const photos = app.photos.slice(0, 18);

    if (photos.length === 0) return generatePageWrapper('写真がありません', template);

    const section1 = photos.slice(0, 6);
    const section2 = photos.slice(6, 12);
    const section3 = photos.slice(12, 18);

    // デフォルトサイズを使用（レンダリング後にapp.jsで自動調整）
    // 18枚の写真を収めるため、余白を控えめに
    const sizing = {
        headerFontSize: 24, // 26 → 24pt（少し小さく）
        sectionHeaderFont: 11, // 12 → 11pt
        commentFont: 10, // 11 → 10pt
        photoGap: 1.5, // 2 → 1.5mm（写真間を詰める）
        sectionGap: 2, // 3 → 2mm（セクション間を詰める）
        scale: 1
    };

    const content = `
        ${generateHeader(eventTitle, eventDate, template)}

        <div style="margin-bottom: ${sizing.sectionGap}mm;">
            ${generateSectionHeader(app.sectionTitles['mixed-sections']?.section1 || '午前の部', template, 'section1')}
            ${generatePhotoGrid(section1, 3, template, `${sizing.photoGap}mm`, 0)}
        </div>

        <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: ${sizing.sectionGap}mm;
            margin-bottom: ${sizing.sectionGap}mm;
        ">
            <div>
                ${generateSectionHeader(app.sectionTitles['mixed-sections']?.section2 || '午後の部', template, 'section2')}
                ${generatePhotoGrid(section2, 2, template, `${sizing.photoGap}mm`, 6)}
            </div>
            <div>
                ${generateSectionHeader(app.sectionTitles['mixed-sections']?.section3 || 'エンディング', template, 'section3')}
                ${generatePhotoGrid(section3, 2, template, `${sizing.photoGap}mm`, 12)}
            </div>
        </div>

        ${generateCommentSection(comment, template, sizing.commentFont)}
        ${generateFooter(template)}
    `;

    return generatePageWrapper(content, template, app.selectedMonth);
}
