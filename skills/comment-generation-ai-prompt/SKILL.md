---
name: comment-generation-ai-prompt
description: AI-powered comment generation specialist for photo newsletters. Covers prompt engineering for warm, natural Japanese text, event-specific vocabulary, elderly-friendly tone, and character limits. Use when generating automated captions, descriptions, or commentary for photo collections in care facilities.
version: 1.0.0
tags: ai, prompt-engineering, comment-generation, natural-language, elderly-friendly, japanese, newsletter
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
user-invocable: false
---

# Comment Generation AI Prompt Expert

## When to Use

このスキルは以下の状況で使用してください：

- **写真から自動的にコメント**を生成したい
- **高齢者向けの温かい文章**を作りたい
- **月別イベント**（七夕・運動会など）に合わせた語彙を使いたい
- **施設名・利用者名**を自然に組み込みたい
- **文字数制限**（100文字以内など）を守りたい
- **季節感・イベント感**のある自然な文章を生成したい
- **職員の負担を最小化**したい

## Core Concepts & Rules

### 🎯 コメント生成の基本原則

#### 1. 温かく、親しみやすいトーン

```
❌ 避けるべき表現:
- 冷たい・事務的な文章
- 難しい漢字・専門用語
- 否定的な表現

✅ 推奨する表現:
- 温かく、優しい語調
- 平易な日本語
- ポジティブな表現
- 「〜ですね」「〜でした」などの柔らかい語尾
```

#### 2. イベント・季節に合わせた語彙

```javascript
const EVENT_VOCABULARY = {
  1: { // 新年会
    keywords: ['新年', '初春', 'お正月', '新しい年', '笑顔'],
    greetings: ['明けましておめでとうございます', '今年もよろしくお願いします'],
    activities: ['お屠蘇', '書き初め', 'かるた遊び']
  },
  7: { // 七夕
    keywords: ['七夕', '天の川', '願い事', '短冊', '笹飾り'],
    greetings: ['七夕の季節がやってきました', '星に願いを'],
    activities: ['短冊に願い事', '笹に飾り付け', '七夕飾り作り']
  },
  8: { // 夏祭り
    keywords: ['夏祭り', '盆踊り', '夏の思い出', '花火', '浴衣'],
    greetings: ['夏本番ですね', '暑い夏を楽しく'],
    activities: ['盆踊り', '縁日遊び', '金魚すくい', 'かき氷']
  }
  // ... 他の月
};
```

#### 3. 文字数制限の考慮

```
短文（50文字以内）:
「七夕の笹飾りを作りました。みなさんの願い事が叶いますように。」

中文（100文字以内）:
「7月7日、七夕の会を開きました。短冊に願い事を書いて、
笹に飾り付け。色とりどりの飾りが揺れて、とてもきれいでしたね。」

長文（150文字以内）:
「今年も七夕の季節がやってきました。みなさんで短冊に願い事を書いて、
笹に飾り付けをしました。「健康で過ごせますように」「家族が幸せで
ありますように」など、温かい願いがたくさん。色とりどりの飾りが
風に揺れて、とてもきれいでしたね。」
```

### 📝 プロンプトテンプレート

#### 基本テンプレート

```
あなたは高齢者施設の職員です。
施設で行われた{イベント名}の写真に添えるコメントを作成してください。

【条件】
- 温かく、親しみやすい語調で書く
- {文字数}文字以内
- 高齢者が読みやすいよう、難しい漢字は避ける
- 季節感・イベント感を出す
- ポジティブな表現を使う

【イベント情報】
- イベント名: {イベント名}
- 開催日: {日付}
- 参加者: {施設名}のみなさん
- 活動内容: {活動リスト}

【出力形式】
コメント文のみを出力してください。挨拶文や前置きは不要です。
```

#### イベント別テンプレート（7月: 七夕）

```
あなたは高齢者施設「{施設名}」の職員です。
七夕の会で撮影した写真に添えるコメントを作成してください。

【条件】
- 温かく、親しみやすい語調で書く
- 100文字以内
- 高齢者が読みやすいよう、難しい漢字は避ける
- 七夕らしい語彙を使う（短冊、笹、願い事、天の川など）
- 「〜ですね」「〜でした」などの柔らかい語尾を使う

【活動内容】
- 短冊に願い事を書く
- 笹に飾り付けをする
- 七夕飾りを作る

【参考表現】
- 「七夕の季節がやってきました」
- 「みなさんの願い事が叶いますように」
- 「色とりどりの飾りがきれいでしたね」

【出力】
コメント文のみを出力してください。
```

## Code Patterns / Examples

### Pattern 1: 月別コメントジェネレーター

```javascript
/**
 * 月別イベントのコメントテンプレート
 */
class CommentGenerator {
  constructor() {
    this.templates = {
      1: {
        event: '新年会',
        keywords: ['新年', '初春', 'お正月', '笑顔', '新しい年'],
        activities: ['お屠蘇で乾杯', '書き初め', 'かるた遊び'],
        openings: [
          '明けましておめでとうございます。',
          '新しい年が始まりました。',
          '今年も元気にスタートです。'
        ],
        closings: [
          '今年もよろしくお願いします。',
          '笑顔いっぱいの一年になりますように。',
          '健康で楽しい一年をお過ごしください。'
        ]
      },
      7: {
        event: '七夕',
        keywords: ['七夕', '天の川', '願い事', '短冊', '笹飾り'],
        activities: ['短冊に願い事', '笹に飾り付け', '七夕飾り作り'],
        openings: [
          '七夕の季節がやってきました。',
          '7月7日、七夕の会を開きました。',
          '今年も七夕飾りを作りました。'
        ],
        closings: [
          'みなさんの願い事が叶いますように。',
          '色とりどりの飾りがきれいでしたね。',
          '楽しい七夕になりました。'
        ]
      },
      8: {
        event: '夏祭り',
        keywords: ['夏祭り', '盆踊り', '夏の思い出', '浴衣', '縁日'],
        activities: ['盆踊り', '縁日遊び', 'かき氷', '金魚すくい'],
        openings: [
          '夏本番、夏祭りを開催しました。',
          '待ちに待った夏祭りです。',
          '今年も盛大に夏祭りを楽しみました。'
        ],
        closings: [
          '夏の楽しい思い出ができましたね。',
          '笑顔いっぱいの夏祭りでした。',
          '来年も元気に楽しみましょう。'
        ]
      }
      // ... 他の月も同様
    };
  }

  /**
   * コメントを生成
   */
  generate(month, options = {}) {
    const template = this.templates[month];

    if (!template) {
      return this._generateGeneric(options);
    }

    const {
      facilityName = '',
      date = '',
      maxLength = 100
    } = options;

    // ランダムに選択
    const opening = this._randomPick(template.openings);
    const activity = this._randomPick(template.activities);
    const closing = this._randomPick(template.closings);

    // コメント構築
    let comment = `${opening}`;

    if (activity) {
      comment += `みなさんで${activity}を楽しみました。`;
    }

    comment += closing;

    // 文字数制限
    if (comment.length > maxLength) {
      comment = this._truncate(comment, maxLength);
    }

    return comment;
  }

  /**
   * AI プロンプトを生成
   */
  generatePrompt(month, options = {}) {
    const template = this.templates[month];

    if (!template) {
      return null;
    }

    const {
      facilityName = '当施設',
      date = '',
      photoCount = 0,
      maxLength = 100
    } = options;

    const prompt = `
あなたは高齢者施設「${facilityName}」の職員です。
${template.event}で撮影した${photoCount}枚の写真に添えるコメントを作成してください。

【条件】
- 温かく、親しみやすい語調で書く
- ${maxLength}文字以内
- 高齢者が読みやすいよう、難しい漢字は避ける
- ${template.event}らしい語彙を使う（${template.keywords.join('、')}など）
- 「〜ですね」「〜でした」などの柔らかい語尾を使う
- ポジティブな表現を使う

【開催情報】
- イベント名: ${template.event}
${date ? `- 開催日: ${date}` : ''}
- 参加者: ${facilityName}のみなさん

【活動内容】
${template.activities.map(a => `- ${a}`).join('\n')}

【参考表現（開始）】
${template.openings.map(o => `- ${o}`).join('\n')}

【参考表現（終了）】
${template.closings.map(c => `- ${c}`).join('\n')}

【出力】
コメント文のみを出力してください。挨拶文や前置きは不要です。
    `.trim();

    return prompt;
  }

  /**
   * 汎用コメント生成
   */
  _generateGeneric(options = {}) {
    const { event = 'イベント', maxLength = 100 } = options;

    const comment = `${event}を開催しました。みなさんで楽しい時間を過ごしました。笑顔いっぱいの一日でしたね。`;

    return this._truncate(comment, maxLength);
  }

  /**
   * ランダムに選択
   */
  _randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 文字数制限でトリミング
   */
  _truncate(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }

    // 句点で区切って短くする
    const sentences = text.split('。');
    let result = '';

    for (let sentence of sentences) {
      if ((result + sentence + '。').length <= maxLength) {
        result += sentence + '。';
      } else {
        break;
      }
    }

    return result || text.substring(0, maxLength - 3) + '...';
  }
}

// 使用例
const generator = new CommentGenerator();

// 7月（七夕）のコメント生成
const comment = generator.generate(7, {
  facilityName: '泉平ホーム',
  date: '7月7日',
  maxLength: 100
});

console.log(comment);
// 「七夕の季節がやってきました。みなさんで短冊に願い事を楽しみました。
//  みなさんの願い事が叶いますように。」

// AI用のプロンプト生成
const prompt = generator.generatePrompt(7, {
  facilityName: '泉平ホーム',
  date: '7月7日',
  photoCount: 15,
  maxLength: 100
});

console.log(prompt);
```

### Pattern 2: OpenAI API を使った動的生成

```javascript
/**
 * OpenAI API を使ったコメント生成
 */
class AICommentGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    this.generator = new CommentGenerator(); // 基本ジェネレーター
  }

  /**
   * AIでコメントを生成
   */
  async generate(month, options = {}) {
    const prompt = this.generator.generatePrompt(month, options);

    if (!prompt) {
      // プロンプトが生成できない場合は基本生成
      return this.generator.generate(month, options);
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'あなたは高齢者施設の優しい職員です。温かく親しみやすい文章を書くことが得意です。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });

      const data = await response.json();
      const comment = data.choices[0].message.content.trim();

      // 文字数制限
      const maxLength = options.maxLength || 100;
      if (comment.length > maxLength) {
        return this.generator._truncate(comment, maxLength);
      }

      return comment;
    } catch (error) {
      console.error('AI生成エラー:', error);

      // エラー時はフォールバック
      return this.generator.generate(month, options);
    }
  }

  /**
   * 複数パターン生成
   */
  async generateMultiple(month, options = {}, count = 3) {
    const promises = [];

    for (let i = 0; i < count; i++) {
      promises.push(this.generate(month, options));
    }

    return await Promise.all(promises);
  }
}

// 使用例
const aiGenerator = new AICommentGenerator('YOUR_API_KEY');

// コメント生成
const comment = await aiGenerator.generate(7, {
  facilityName: '泉平ホーム',
  date: '7月7日',
  photoCount: 15,
  maxLength: 100
});

console.log(comment);

// 複数候補を生成
const candidates = await aiGenerator.generateMultiple(7, {
  facilityName: '泉平ホーム',
  date: '7月7日',
  maxLength: 100
}, 3);

candidates.forEach((c, i) => {
  console.log(`候補${i + 1}: ${c}`);
});
```

### Pattern 3: ローカル AI を使った生成（Electron + Ollama）

```javascript
/**
 * Ollama（ローカルLLM）を使ったオフライン生成
 */
class LocalAICommentGenerator {
  constructor() {
    this.baseURL = 'http://localhost:11434/api/generate';
    this.model = 'gemma:2b'; // 軽量モデル
    this.generator = new CommentGenerator();
  }

  /**
   * ローカルAIでコメント生成
   */
  async generate(month, options = {}) {
    const prompt = this.generator.generatePrompt(month, options);

    if (!prompt) {
      return this.generator.generate(month, options);
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        })
      });

      const data = await response.json();
      const comment = data.response.trim();

      // 文字数制限
      const maxLength = options.maxLength || 100;
      return this.generator._truncate(comment, maxLength);
    } catch (error) {
      console.error('ローカルAI生成エラー:', error);

      // エラー時はフォールバック
      return this.generator.generate(month, options);
    }
  }
}

// 使用例（Electronアプリ内）
const localGenerator = new LocalAICommentGenerator();

const comment = await localGenerator.generate(7, {
  facilityName: '泉平ホーム',
  date: '7月7日',
  maxLength: 100
});
```

### Pattern 4: テンプレートベースの簡易生成

```javascript
/**
 * シンプルなテンプレート置換
 */
class SimpleCommentGenerator {
  constructor() {
    this.templates = {
      7: [
        '{date}、七夕の会を開きました。みなさんで短冊に願い事を書いて、笹に飾り付けをしました。色とりどりの飾りがきれいでしたね。',
        '七夕の季節がやってきました。{facility}のみなさんで七夕飾りを作りました。願い事が叶いますように。',
        '今年も七夕を楽しく過ごしました。短冊に書いた願い事、きっと届きますね。笑顔いっぱいの七夕でした。'
      ],
      8: [
        '夏本番、{facility}で夏祭りを開催しました。盆踊りや縁日遊びを楽しんで、笑顔いっぱいの一日でしたね。',
        '{date}、待ちに待った夏祭りです。みなさんで盆踊りを踊って、かき氷を食べて、夏の楽しい思い出ができました。',
        '今年も盛大に夏祭りを楽しみました。浴衣を着て、縁日遊びをして、夏らしい一日を過ごしましたね。'
      ]
      // ... 他の月
    };
  }

  generate(month, options = {}) {
    const {
      facility = '当施設',
      date = '',
      maxLength = 100
    } = options;

    const templateList = this.templates[month];

    if (!templateList) {
      return `楽しいイベントを開催しました。みなさんの笑顔がたくさん見られて嬉しかったです。`;
    }

    // ランダムに選択
    const template = templateList[Math.floor(Math.random() * templateList.length)];

    // プレースホルダーを置換
    let comment = template
      .replace('{facility}', facility)
      .replace('{date}', date);

    // 文字数制限
    if (comment.length > maxLength) {
      comment = comment.substring(0, maxLength - 3) + '...';
    }

    return comment;
  }
}

// 使用例
const simpleGen = new SimpleCommentGenerator();

const comment = simpleGen.generate(7, {
  facility: '泉平ホーム',
  date: '7月7日',
  maxLength: 100
});

console.log(comment);
```

## Anti-Patterns

### ❌ 避けるべき表現

#### 1. 冷たい・事務的な文章

```
❌ BAD:
「7月7日に七夕イベントを実施しました。参加者は20名でした。」

✅ GOOD:
「7月7日、七夕の会を開きました。みなさんで短冊に願い事を書いて、
笹に飾り付けをしました。色とりどりの飾りがきれいでしたね。」
```

#### 2. 難しい漢字・専門用語

```
❌ BAD:
「七夕の伝統行事を実施し、参加者の皆様に短冊を配布致しました。」

✅ GOOD:
「七夕の会を開きました。みなさんに短冊をお渡しして、
願い事を書いていただきました。」
```

#### 3. 否定的な表現

```
❌ BAD:
「天気が悪くて外に出られませんでしたが、室内で七夕飾りを作りました。」

✅ GOOD:
「室内で七夕飾りを作りました。みなさんの笑顔がたくさん見られて
嬉しかったです。」
```

## Integration with Other Skills

### 🎨 senior-friendly-ui-expert との連携

```javascript
// 生成したコメントを高齢者向けUIで表示
const comment = generator.generate(7, {
  facilityName: '泉平ホーム',
  maxLength: 100
});

// 大きめのフォントで表示
document.getElementById('comment').style.fontSize = '18px';
document.getElementById('comment').style.lineHeight = '2.0';
document.getElementById('comment').textContent = comment;
```

## Quick Reference

### 📝 月別イベント一覧

| 月 | イベント | キーワード |
|----|---------|-----------|
| 1月 | 新年会 | 新年、初春、お正月、笑顔 |
| 2月 | 節分 | 鬼、福、豆まき、恵方巻 |
| 3月 | ひな祭り | ひな人形、桃の節句、春 |
| 7月 | 七夕 | 短冊、笹、願い事、天の川 |
| 8月 | 夏祭り | 盆踊り、浴衣、縁日、夏 |
| 12月 | クリスマス | サンタ、ツリー、プレゼント |

## Resources

- **プロンプトエンジニアリング**: https://platform.openai.com/docs/guides/prompt-engineering
- **高齢者向け文章作成**: https://www.mhlw.go.jp/（厚生労働省）

---

**Version**: 1.0.0
**Last Updated**: 2026-02-16
**Designed for**: Newsletter Maker Project (AI-Powered Comment Generation)
