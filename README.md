# STOP! 特殊詐欺 — ワンページ啓発サイト

軽量な静的ワンページサイトです。ポスター・待ち受け画像・ゲーム紹介などの啓発コンテンツをブラウザのみで配布することを目的としています。

## 構成（重要ファイル）
- `index.html` — ページの骨格。アクセシビリティ属性（`aria-*`）や `data-animate` が付与されています。
- `main.js` — すべてのクライアントサイドロジック。ティッカー・トピック表示、ポスター/待ち受けのデータ配列、ナビ、アニメーション、スクロールスパイを実装しています。
- `styles.css` — 全体スタイル。
- `assets/` — 画像・PDF 等の静的資産。ファイル名は `main.js` の参照と整合させる必要があります。

## ビルド・確認フロー
- このプロジェクトにビルドステップはありません。ファイルを編集してブラウザで確認します。
- ローカルで簡易 HTTP サーバを起動して確認することを推奨します（PowerShell の例）:

```powershell
npx http-server . -p 8080
# またはエディタの Live Server を利用
start msedge http://localhost:8080/
```

一部の機能（`navigator.clipboard` 等）はファイル:// では制限されるため、必ず HTTP 経由で動作確認してください。

## どこを編集するか（よくある変更）
- 表示文言 / 注意喚起の更新: `main.js` の先頭配列を編集します（`tickerMessages`, `topics`）。
- ポスターの追加: `main.js` の `posters` 配列にオブジェクトを追加し、対応する画像と PDF を `assets/` に置きます。例:

```js
{
  title: "その電話、なりすましかも",
  image: "assets/poster-03.jpg",
  alt: "…",
  download: "assets/poster-03-a3.pdf",
  size: "A4 300dpi",
  tip: "公共施設向け"
}
```

- 待ち受けの追加: `wallpapers` 配列に `preview` と `downloads`（`jpg`/`webp`）を設定して、`assets/` に画像を追加します。

## 実装上の注意（このリポジトリ特有）
- アニメーションと自動ローテーションは `prefers-reduced-motion` を尊重します。ユーザー設定を壊さないように注意してください（`reduceMotionQuery` を参照）。
- 表示切り替えやスクロールスパイは `IntersectionObserver` を利用しています。ユニットテストや DOM モックが必要な場合はこの点を考慮してください。
- 共有機能は `navigator.clipboard` を用いており、HTTPS またはローカルサーバ上でのみ動作します。

## 資産（assets/）取り扱いルール
- ファイル名は小文字・ハイフン区切りで統一してください（例: `poster-03.jpg`, `poster-03-a3.pdf`）。
- 画像には `loading="lazy"` を維持し、差し替え時は `width`/`height` 属性の整合性を確認してください。
- 既存の古いファイルは `assets/archived/` に退避する運用を推奨します（既にこのリポジトリでは採用済み）。

## テスト観点（手動）
- ティッカーが自動で切り替わるか（`tickerMessages` が 2 件以上である場合）。
- ポスターのスライダー・サムネイル操作、PDF ダウンロードの挙動。
- 待ち受けダウンロード（JPG/WebP）が期待どおりに動作するか。

## コミット・運用ノート
- 変更を加えたら簡単にブラウザで確認してからコミットしてください。
- 推奨コミット例: `chore: update poster assets and main.js references`

## 拡張提案（任意）
- `main.js` を小さな ES モジュールに分割して、`data/` 配列（コンテンツ）と UI ロジックを分離すると保守性が向上します。
- GitHub Pages や簡単な CI（`htmlproofer` 相当の静的チェック）を導入して、リンク切れや画像の欠落を自動検出するのも有用です。

---
ご要望があれば、この README を英語版に翻訳したり、CI プレビュー手順を追加したりします。
