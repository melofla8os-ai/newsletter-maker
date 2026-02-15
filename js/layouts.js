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
 * ヘッダー部分を生成
 */
function generateHeader(title, date, template) {
    let dateStr = '';
    if (date) {
        const d = new Date(date);
        dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }

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
            <h1 style="
                font-size: 26pt;
                margin: 0 0 3mm 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
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
function generateCommentSection(comment, template) {
    if (!comment) return '';

    return `
        <div style="
            padding: 5mm;
            background: white;
            border: 2px solid ${template.colors.secondary};
            border-radius: 8px;
            font-size: 11pt;
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
function generatePhotoGrid(photos, columns, template, gap = '2mm') {
    return `
        <div style="
            display: grid;
            grid-template-columns: repeat(${columns}, 1fr);
            gap: ${gap};
        ">
            ${photos.map(photo => `
                <div style="
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
                    ">
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * セクションヘッダーを生成
 */
function generateSectionHeader(title, template) {
    return `
        <div style="
            padding: 3mm;
            margin-bottom: 2mm;
            background: linear-gradient(90deg, ${template.colors.primary}, ${template.colors.secondary});
            color: white;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12pt;
            text-align: center;
        ">
            ${title}
        </div>
    `;
}

/**
 * 単一写真(大きめ)を生成
 */
function generateLargePhoto(photo, template, height = '100mm') {
    return `
        <div style="
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
            ">
        </div>
    `;
}

/**
 * ページラッパーを生成
 */
function generatePageWrapper(content, template) {
    return `
        <div class="preview-wrapper">
            <div style="
                width: 210mm;
                height: 297mm;
                margin: 0 auto;
                padding: 10mm;
                background: ${template.colors.background};
                border: 2px solid ${template.colors.primary};
                box-sizing: border-box;
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
            ${photos.map(photo => `
                <div style="
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
                    ">
                </div>
            `).join('')}
        </div>

        ${generateCommentSection(comment, template)}
        ${generateFooter(template)}
    `;

    return generatePageWrapper(content, template);
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
                ${generateLargePhoto(heroPhoto, template, '120mm')}
            </div>
            <div>
                ${generateSectionHeader('活動の様子', template)}
                ${generatePhotoGrid(gridPhotos, 3, template, '2mm')}
            </div>
        </div>

        ${generateCommentSection(comment, template)}
        ${generateFooter(template)}
    `;

    return generatePageWrapper(content, template);
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

    const generateColumn = (title, columnPhotos) => {
        if (columnPhotos.length === 0) return '';
        return `
            <div style="
                border: 2px solid ${template.colors.primary};
                border-radius: 6px;
                padding: 3mm;
                background: white;
            ">
                ${generateSectionHeader(title, template)}
                ${generatePhotoGrid(columnPhotos, 2, template, '2mm')}
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
            ${generateColumn('活動①', col1)}
            ${generateColumn('活動②', col2)}
            ${generateColumn('活動③', col3)}
        </div>

        ${generateCommentSection(comment, template)}
        ${generateFooter(template)}
    `;

    return generatePageWrapper(content, template);
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
            ${generateLargePhoto(heroPhoto, template, '90mm')}
        </div>

        ${generateSectionHeader('その他の様子', template)}
        <div style="margin-bottom: 4mm;">
            ${generatePhotoGrid(gridPhotos, 4, template, '2mm')}
        </div>

        ${generateCommentSection(comment, template)}
        ${generateFooter(template)}
    `;

    return generatePageWrapper(content, template);
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

    const content = `
        ${generateHeader(eventTitle, eventDate, template)}

        <div style="margin-bottom: 3mm;">
            ${generateSectionHeader('午前の部', template)}
            ${generatePhotoGrid(section1, 3, template, '2mm')}
        </div>

        <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3mm;
            margin-bottom: 3mm;
        ">
            <div>
                ${generateSectionHeader('午後の部', template)}
                ${generatePhotoGrid(section2, 2, template, '2mm')}
            </div>
            <div>
                ${generateSectionHeader('エンディング', template)}
                ${generatePhotoGrid(section3, 2, template, '2mm')}
            </div>
        </div>

        ${generateCommentSection(comment, template)}
        ${generateFooter(template)}
    `;

    return generatePageWrapper(content, template);
}
