# STOP! 特殊詐欺 - ワンページ啓発サイト

高松地方検察庁の特殊詐欺防止啓発コンテンツを掲載する静的ワンページサイトです。ポスター、待ち受け画像、漫画、ゲーム導線をブラウザだけで配布できる構成にしています。

## 構成

- `index.html` - ページの骨格、本文、外部リンク、固定表示の日付
- `main.js` - ティッカー、トピック表示、ポスター/待ち受けデータ、ナビ、アニメーション
- `styles.css` - 全体スタイル
- `assets/` - 公開で使用する画像、PDF、GIF
- `scripts/check-site.mjs` - 公開前の構造・資産チェック
- `scripts/check-links.mjs` - 外部リンクとローカル配布ファイルの確認

## ローカル確認

このプロジェクトにビルドステップはありません。ローカルHTTPサーバで表示確認します。

```powershell
python -m http.server 8080
```

ブラウザで次を開きます。

```text
http://localhost:8080/
```

`navigator.clipboard` など一部機能は `file://` では制限されるため、HTTP経由で確認してください。

## 公開前チェック

差し替え前に次を実行します。

```powershell
node scripts/check-site.mjs
node scripts/check-links.mjs
```

`check-site` は次を確認します。

- 必須ファイルの存在
- `=<head>` のような明らかなHTML破損
- `index.html` / `main.js` から参照される `assets/` ファイルの存在
- 0バイトファイルの混入
- `main.js` の構文
- 未使用のアクティブ資産

`check-links` は次を確認します。

- SOS47、体験ゲーム、ミニゲームなどの外部リンク
- ポスターPDF、待ち受けJPG/WebP、QR画像などのローカル配布ファイル

## GitHub Actions

`.github/workflows/check-site.yml` により、`main` へのpush時とPull Request時に次が自動実行されます。

```powershell
node scripts/check-site.mjs
node scripts/check-links.mjs
```

手元でチェックを忘れても、GitHub上で最低限の破損を検出できます。

## 公開差し替え前の確認手順

1. `node scripts/check-site.mjs` を実行する
2. `node scripts/check-links.mjs` を実行する
3. `python -m http.server 8080` でローカル表示を確認する
4. PC幅とスマホ幅で表示崩れがないか見る
5. ポスター切替、PDFダウンロード、待ち受けダウンロード、ゲームリンクを確認する
6. 問題がなければcommitして `main` にpushする
7. GitHub Actionsの結果を確認する

## よくある変更

表示文言や注意喚起の更新:

- `index.html` の本文を編集
- `main.js` 先頭の `tickerMessages` / `topics` を編集

ポスターの追加:

- 画像とPDFを `assets/` に追加
- `main.js` の `posters` 配列に追加

```js
{
  title: "その電話、なりすましかも",
  image: "assets/poster-03.jpg",
  alt: "ポスターの説明",
  download: "assets/poster-03-a3.pdf",
  size: "A4 300dpi",
  tip: "公共施設向け"
}
```

待ち受けの追加:

- JPG/WebPを `assets/` に追加
- `main.js` の `wallpapers` 配列に `preview` と `downloads` を追加

## 資産管理ルール

- 公開ページで使う画像・PDFだけを `assets/` 直下に置く
- 不要な0バイトファイルは残さない
- ファイル名は小文字・ハイフン区切りを基本にする
- 参照を変更したら `node scripts/check-site.mjs` を実行する

## 手動テスト観点

- ティッカーが表示される
- モバイルメニューが開閉する
- ポスターの前後ボタンとサムネイルが動く
- PDFダウンロード先が正しい
- 待ち受けJPG/WebPのリンクが正しい
- 体験ゲーム、ミニゲーム、SOS47への外部リンクが開く
- PC幅とスマホ幅で横スクロールが出ない
