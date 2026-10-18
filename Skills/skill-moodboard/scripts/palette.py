#!/usr/bin/env python3
"""Доминирующие цвета картинки (для референсов, где нет CSS: фото, Dribbble, скриншоты пользователя).

Условие применимости: установлен Pillow (python3 -c "import PIL" без ошибки).

  python3 palette.py refs/03-shot.png --colors 6
Выход: JSON-список {hex, share_%} — помечать в мудборде как «определено по изображению, приблизительно».
Доли площади описывают фон и поверхности, а не акцент: акцент ищется среди насыщенных цветов с малой долей.
"""
import argparse, json
from PIL import Image

def palette(path, n):
    im = Image.open(path).convert("RGB")
    im.thumbnail((400, 400))
    q = im.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[: n * 3]
    total = im.width * im.height
    res = []
    for count, idx in sorted(q.getcolors(), reverse=True):
        r, g, b = pal[idx * 3: idx * 3 + 3]
        res.append({"hex": f"#{r:02X}{g:02X}{b:02X}", "share_%": round(count / total * 100, 1)})
    return res

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("image"); ap.add_argument("--colors", type=int, default=6)
    a = ap.parse_args()
    print(json.dumps(palette(a.image, a.colors), ensure_ascii=False))
