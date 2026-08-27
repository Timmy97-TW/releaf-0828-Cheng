# ReLeaf · 給鄭梅君老師的進度回報

單一 self-contained 頁面，為 2026-08-28 與台大生化科技系鄭梅君老師的第二次見面而作。
上次拜訪是 2026-03-27。

## 這頁在講什麼

- 3/27 老師提的六件事，現在各自走到哪裡（含三件我們沒做到的）
- Agar 八個實驗組的鹽逆境與熱逆境數據
- 土耕 7 盤 28 盆，以及逆境施加時機的錯誤
- 重新設計的水耕盤，以及要留給老師的兩套 setup
- 九個問題
- 4 月到 8 月的照片

## 檔案

```
index.html                    整頁，中文預設，右上角切 EN
assets/css/tokens.css         色票與字級，與團隊其他頁面共用
assets/css/page.css           版面骨架
assets/css/update.css         這一類進度回報頁專用，末段是本頁新增的
assets/js/update.js           語言切換、目錄、燈箱。無相依套件
assets/img/fig-*.svg          三張圖，由 tools/figures.py 產生
assets/img/*.jpg / *.webp     每張照片兩個格式，頁面用 <picture> 挑
assets/fonts/inter-latin.woff2  子集化過的 Inter，80 KB
assets/fonts/inter-variable.ttf 完整版原始檔，只用來重新子集化，頁面不載入
tools/figures.py              圖的產生器。數字改這裡，重跑就好
tools/import-photo.sh         把原始照片轉成網頁用的尺寸
tools/build-webp.sh           每張 jpg 旁邊產生一份 webp
tools/build-font.sh           重新子集化字體
```

## 效能

首屏 731 KB（HTML+CSS+JS 167、字體 79、五張照片加 logo 485）。
其餘 1.47 MB 是捲到才抓的照片，整頁全部捲完 2.18 MB。

做過的事：
- 字體子集化到 Latin 再轉 WOFF2，856 KB → 80 KB，可變字重 100–900 保留
- 每張照片縮到實際顯示寬度的兩倍（相簿格是 270 px 顯示，原本塞 1400 px）
- 全部轉 WebP，用 `<picture>` 留 JPEG 後備
- 每個 `<img>` 都有 width/height，捲動時不會跳版
- 第一屏以外 lazy load，hero 和字體 preload

改過照片或加了新字之後：

```
./tools/build-webp.sh
./tools/build-font.sh
```

## 重畫圖

```
python3 tools/figures.py
```

數字寫在 `figures.py` 的 `F1` / `F2` / `F3` 三個區塊，各自標了來源檔案。

## 本機預覽

```
python3 -m http.server 8811
```

## 寄出前

- [ ] 開場照片裡拿盤子的是誰，確認後改 caption
- [ ] 明天實際要帶哪兩套水耕盤，填進 6.4
- [ ] 去的學生與指導老師人數，填進第 7 節
- [ ] 決定要不要拿掉 `<meta name="robots" content="noindex">`
- [ ] 拿掉頁首那條黃色草稿橫幅（`<p class="draft">`）
