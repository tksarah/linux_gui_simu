# Linux GUI Simulator

Linux GUI の基本操作とシェル操作をブラウザ上で練習するための Vite + React アプリです。

## 開発

必要環境:

- Node.js 22 以上
- npm

セットアップ:

```bash
npm install
```

開発サーバー起動:

```bash
npm run dev
```

本番ビルド:

```bash
npm run build
```

ローカルで本番ビルドを確認:

```bash
npm run preview
```

## GitHub Pages 公開

このリポジトリは project Pages 前提で設定しています。公開 URL は次の想定です。

- https://tksarah.github.io/linux_gui_simu/

Vite の `base` は `/linux_gui_simu/` に設定済みです。そのため、GitHub 上のリポジトリ名を変更する場合は [vite.config.ts](vite.config.ts) の `base` も合わせて修正してください。

### 初回設定

1. GitHub のリポジトリ設定を開く
2. Pages を開く
3. Build and deployment の Source で GitHub Actions を選ぶ
4. `main` ブランチへ push する

workflow は [.github/workflows/deploy.yml](.github/workflows/deploy.yml) にあります。`main` への push または手動実行で `dist` を GitHub Pages にデプロイします。

### 公開確認

1. Actions タブで `Deploy to GitHub Pages` が成功していることを確認する
2. https://tksarah.github.io/linux_gui_simu/ を開く
3. 課題一覧が表示されることを確認する
4. 最低限、課題を 1 つ選んでログイン画面まで遷移できることを確認する

## 補足

- このアプリはブラウザ内の状態だけで動作し、サーバー API には依存しません
- React Router は使っていないため、Pages 向けの SPA fallback 設定は不要です