# Запуски утилит
## Marker (конвертация PDF / EPUB / MOBI в .md)
```bash
source venv/bin/activate
```
```bash
marker_single path/to/file.pdf --output_dir output/folder
```
## Pandoc (конвертация HTML в .md)
```bash
source venv/bin/activate
```
```bash
pandoc "file.html" -f html -t markdown -o file.md
```