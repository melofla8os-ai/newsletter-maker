// 文章自動生成モジュール

class CommentGenerator {
    constructor() {
        this.currentTemplate = null;
    }

    // テンプレートを設定
    setTemplate(month) {
        this.currentTemplate = getTemplate(month);
    }

    // ランダムにコメントを生成
    generateComment(eventName, eventDate) {
        if (!this.currentTemplate) {
            return 'テンプレートが選択されていません。';
        }

        // テンプレートからランダムに選択
        const templates = this.currentTemplate.commentTemplates;
        const randomIndex = Math.floor(Math.random() * templates.length);
        let comment = templates[randomIndex];

        // プレースホルダーを置換
        const year = getCurrentYear();
        comment = comment.replace('{year}', year);

        // イベント名と日付を組み合わせ
        let fullComment = '';

        if (eventDate) {
            const date = new Date(eventDate);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            fullComment += `${month}月${day}日、`;
        }

        if (eventName) {
            fullComment += `「${eventName}」を開催しました。\n\n`;
        }

        fullComment += comment;

        // デコレーションを追加
        const decoration = this.getRandomDecoration();
        fullComment = `${decoration} ${fullComment} ${decoration}`;

        return fullComment;
    }

    // ランダムなデコレーションを取得
    getRandomDecoration() {
        if (!this.currentTemplate) return '';
        const decorations = this.currentTemplate.decorations;
        const randomIndex = Math.floor(Math.random() * decorations.length);
        return decorations[randomIndex];
    }

    // 複数のコメントパターンを生成
    generateMultipleComments(eventName, eventDate, count = 3) {
        const comments = [];
        for (let i = 0; i < count; i++) {
            comments.push(this.generateComment(eventName, eventDate));
        }
        return comments;
    }

    // カスタムコメント生成(基本テンプレート + カスタム要素)
    generateCustomComment(eventName, eventDate, customText) {
        let comment = this.generateComment(eventName, eventDate);

        if (customText) {
            comment += `\n\n${customText}`;
        }

        return comment;
    }
}

// グローバルインスタンス
const commentGenerator = new CommentGenerator();
