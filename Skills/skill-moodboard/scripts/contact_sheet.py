#!/usr/bin/env python3
"""Контактный лист для отбора кандидатов мудборда: миниатюры по 24 на лист с крупными номерами.

Условие применимости: установлен Pillow (python3 -c "import PIL" без ошибки).

  python3 contact_sheet.py <рабочая папка>

Читает все файлы из <рабочая папка>/img (имя файла = номер кандидата, например 01, 02),
кладёт листы sheet1.jpg, sheet2.jpg, ... в <рабочая папка>. Миниатюры 300×300 в 6 колонок,
на каждой — красная плашка с именем файла. Файл, который не открылся как картинка, пропускается.
Листы просматриваются через Read.
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
d = sys.argv[1]; files = sorted(os.listdir(os.path.join(d, 'img')))
try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 22)
except Exception: font = ImageFont.load_default()
TW, TH, C, per = 300, 300, 6, 24
for s in range(0, len(files), per):
    chunk = files[s:s + per]; rows = (len(chunk) + C - 1) // C
    sheet = Image.new('RGB', (C * TW, rows * TH), 'white'); dr = ImageDraw.Draw(sheet)
    for i, f in enumerate(chunk):
        try:
            im = Image.open(os.path.join(d, 'img', f)).convert('RGB'); im.thumbnail((TW - 10, TH - 10))
        except Exception: continue
        x = (i % C) * TW + 5; y = (i // C) * TH + 5; sheet.paste(im, (x, y))
        dr.rectangle([x, y, x + 48, y + 28], fill='red'); dr.text((x + 4, y + 2), f, fill='white', font=font)
    sheet.save(os.path.join(d, f'sheet{s // per + 1}.jpg'), quality=80)
