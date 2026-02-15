// メインアプリケーション

class NewsletterApp {
    constructor() {
        this.selectedMonth = null;
        this.photos = [];
        this.eventTitle = '';
        this.eventDate = '';
        this.comment = '';
        this.currentTemplate = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('Newsletter Maker initialized!');
    }

    setupEventListeners() {
        // 月選択
        const monthSelect = document.getElementById('monthSelect');
        monthSelect.addEventListener('change', (e) => this.onMonthChange(e));

        // ファイル選択
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => this.onFileSelect(e));

        // ドラッグ&ドロップ
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => this.onDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.onDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.onDrop(e));

        // コメント生成
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.addEventListener('click', () => this.generateComment());

        // プレビュー
        const previewBtn = document.getElementById('previewBtn');
        previewBtn.addEventListener('click', () => this.showPreview());

        // 印刷
        const printBtn = document.getElementById('printBtn');
        printBtn.addEventListener('click', () => this.print());

        // PDF保存
        const pdfBtn = document.getElementById('pdfBtn');
        pdfBtn.addEventListener('click', () => this.savePDF());

        // タイトル・日付入力
        const eventTitle = document.getElementById('eventTitle');
        eventTitle.addEventListener('input', (e) => {
            this.eventTitle = e.target.value;
        });

        const eventDate = document.getElementById('eventDate');
        eventDate.addEventListener('change', (e) => {
            this.eventDate = e.target.value;
        });

        // コメント編集
        const commentText = document.getElementById('commentText');
        commentText.addEventListener('input', (e) => {
            this.comment = e.target.value;
        });
    }

    // 月選択時
    onMonthChange(e) {
        this.selectedMonth = parseInt(e.target.value);
        if (!this.selectedMonth) return;

        this.currentTemplate = getTemplate(this.selectedMonth);
        commentGenerator.setTemplate(this.selectedMonth);

        // デフォルトイベント名を設定
        const eventTitleInput = document.getElementById('eventTitle');
        if (!eventTitleInput.value) {
            eventTitleInput.value = this.currentTemplate.defaultEventName;
            this.eventTitle = this.currentTemplate.defaultEventName;
        }

        console.log(`月選択: ${this.selectedMonth}月 - ${this.currentTemplate.name}`);
    }

    // ファイル選択時
    onFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addPhotos(files);
    }

    // ドラッグオーバー
    onDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    // ドラッグリーブ
    onDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    // ドロップ
    onDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        this.addPhotos(files);
    }

    // 写真追加
    addPhotos(files) {
        // 20枚制限
        const remainingSlots = 20 - this.photos.length;
        const filesToAdd = files.slice(0, remainingSlots);

        filesToAdd.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.photos.push({
                    file: file,
                    data: e.target.result,
                    name: file.name
                });
                this.renderPhotos();
            };
            reader.readAsDataURL(file);
        });

        if (files.length > remainingSlots) {
            alert(`最大20枚までです。${remainingSlots}枚のみ追加しました。`);
        }
    }

    // 写真削除
    removePhoto(index) {
        this.photos.splice(index, 1);
        this.renderPhotos();
    }

    // 写真表示
    renderPhotos() {
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.innerHTML = '';

        this.photos.forEach((photo, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';

            const img = document.createElement('img');
            img.src = photo.data;
            img.alt = photo.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'photo-remove';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => this.removePhoto(index);

            photoItem.appendChild(img);
            photoItem.appendChild(removeBtn);
            photoPreview.appendChild(photoItem);
        });

        console.log(`写真数: ${this.photos.length}`);
    }

    // コメント生成
    generateComment() {
        if (!this.selectedMonth) {
            alert('まず月を選択してください!');
            return;
        }

        const eventTitle = document.getElementById('eventTitle').value;
        const eventDate = document.getElementById('eventDate').value;

        this.comment = commentGenerator.generateComment(eventTitle, eventDate);

        // コメント表示
        const commentArea = document.getElementById('commentArea');
        const commentText = document.getElementById('commentText');

        commentArea.style.display = 'block';
        commentText.value = this.comment;

        console.log('コメント生成完了');
    }

    // プレビュー表示
    showPreview() {
        if (!this.selectedMonth) {
            alert('まず月を選択してください!');
            return;
        }

        if (this.photos.length === 0) {
            alert('写真を追加してください!');
            return;
        }

        const previewArea = document.getElementById('previewArea');
        previewArea.innerHTML = this.generatePreviewHTML();
        previewArea.classList.add('active');

        console.log('プレビュー表示');
    }

    // プレビューHTML生成
    generatePreviewHTML() {
        const template = this.currentTemplate;
        const eventTitle = document.getElementById('eventTitle').value || 'イベント';
        const eventDate = document.getElementById('eventDate').value;
        const comment = document.getElementById('commentText').value || '';

        // 日付フォーマット
        let dateStr = '';
        if (eventDate) {
            const date = new Date(eventDate);
            dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        }

        // 写真をグリッド表示(最大12枚をプレビュー)
        const displayPhotos = this.photos.slice(0, 12);

        let html = `
            <div style="
                width: 210mm;
                height: 297mm;
                margin: 0 auto;
                padding: 20mm;
                background: ${template.colors.background};
                border: 2px solid ${template.colors.primary};
                box-sizing: border-box;
                font-family: 'Yu Gothic', 'Meiryo', sans-serif;
            ">
                <!-- ヘッダー -->
                <div style="
                    text-align: center;
                    margin-bottom: 10mm;
                    padding: 10mm;
                    background: linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%);
                    color: white;
                    border-radius: 10px;
                ">
                    <h1 style="
                        font-size: 32pt;
                        margin: 0 0 5mm 0;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    ">${template.decorations[0]} ${eventTitle} ${template.decorations[0]}</h1>
                    ${dateStr ? `<p style="font-size: 18pt; margin: 0;">${dateStr}</p>` : ''}
                </div>

                <!-- 写真グリッド -->
                <div style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 5mm;
                    margin-bottom: 10mm;
                ">
                    ${displayPhotos.map(photo => `
                        <div style="
                            aspect-ratio: 1;
                            overflow: hidden;
                            border-radius: 8px;
                            border: 3px solid ${template.colors.primary};
                        ">
                            <img src="${photo.data}" style="
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            ">
                        </div>
                    `).join('')}
                </div>

                <!-- コメント -->
                ${comment ? `
                    <div style="
                        padding: 8mm;
                        background: white;
                        border: 3px solid ${template.colors.secondary};
                        border-radius: 10px;
                        font-size: 14pt;
                        line-height: 1.8;
                        white-space: pre-wrap;
                    ">
                        ${comment}
                    </div>
                ` : ''}

                <!-- デコレーション -->
                <div style="
                    text-align: center;
                    font-size: 40pt;
                    margin-top: 10mm;
                ">
                    ${template.decorations.join(' ')}
                </div>
            </div>
        `;

        return html;
    }

    // 印刷
    print() {
        if (!this.selectedMonth || this.photos.length === 0) {
            alert('プレビューを表示してから印刷してください!');
            return;
        }

        window.print();
    }

    // PDF保存
    async savePDF() {
        if (!this.selectedMonth || this.photos.length === 0) {
            alert('プレビューを表示してからPDF保存してください!');
            return;
        }

        const previewArea = document.getElementById('previewArea');
        if (!previewArea.innerHTML) {
            alert('プレビューを表示してからPDF保存してください!');
            return;
        }

        try {
            // html2canvasを使用してキャンバスに変換
            const canvas = await html2canvas(previewArea, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            // jsPDFでPDF生成
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

            // ファイル名生成
            const eventTitle = document.getElementById('eventTitle').value || 'newsletter';
            const date = new Date();
            const filename = `${eventTitle}_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}.pdf`;

            pdf.save(filename);

            console.log('PDF保存完了');
        } catch (error) {
            console.error('PDF生成エラー:', error);
            alert('PDF生成中にエラーが発生しました。');
        }
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NewsletterApp();
});
