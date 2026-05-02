# LaTeX Markup

Синтаксис LaTeX для создания научных статей, технической документации, презентаций и документов с профессиональной типографикой.

---

## Структура документа

| Команда | Описание | Пример |
|---------|----------|--------|
| `\documentclass{класс}` | Тип документа | `\documentclass{article}` |
| `\usepackage{пакет}` | Подключение пакета | `\usepackage[utf8]{inputenc}` |
| `\begin{document}` | Начало документа | — |
| `\end{document}` | Конец документа | — |
| `\title{текст}` | Заголовок | `\title{Мой отчёт}` |
| `\author{текст}` | Автор | `\author{Иван Петров}` |
| `\date{текст}` | Дата | `\date{\today}` |
| `\maketitle` | Вывод титула | — |

**Классы документов:**
- `article` — статьи, короткие документы
- `report` — отчёты с главами
- `book` — книги
- `beamer` — презентации
- `letter` — письма

## Секции и заголовки

| Команда | Уровень | Нумерация |
|---------|---------|-----------|
| `\part{текст}` | 0 | Да |
| `\chapter{текст}` | 1 | Да (book/report) |
| `\section{текст}` | 2 | Да |
| `\subsection{текст}` | 3 | Да |
| `\subsubsection{текст}` | 4 | Да |
| `\paragraph{текст}` | 5 | Нет |
| `\subparagraph{текст}` | 6 | Нет |

**Без нумерации:** добавить `*` — `\section*{Введение}`

## Форматирование текста

| Команда | Результат |
|---------|-----------|
| `\textbf{текст}` | **жирный** |
| `\textit{текст}` | *курсив* |
| `\underline{текст}` | подчёркнутый |
| `\emph{текст}` | выделение (курсив в обычном, прямой в курсиве) |
| `\texttt{текст}` | `моноширинный` |
| `\textsc{текст}` | КАПИТЕЛЬ |
| `\textsf{текст}` | sans-serif |
| `\textsl{текст}` | наклонный |

**Размеры шрифта (от меньшего к большему):**

```latex
\tiny \scriptsize \footnotesize \small \normalsize
\large \Large \LARGE \huge \Huge
```

## Списки

**Маркированный список:**
```latex
\begin{itemize}
    \item Первый пункт
    \item Второй пункт
    \item Третий пункт
\end{itemize}
```

**Нумерованный список:**
```latex
\begin{enumerate}
    \item Первый пункт
    \item Второй пункт
    \item Третий пункт
\end{enumerate}
```

**Список определений:**
```latex
\begin{description}
    \item[Термин 1] Определение первого термина
    \item[Термин 2] Определение второго термина
\end{description}
```

## Математика

**Режимы:**

| Режим | Синтаксис | Описание |
|-------|-----------|----------|
| Inline | `$формула$` или `\(формула\)` | В строке текста |
| Display | `$$формула$$` или `\[формула\]` | Отдельная строка |
| Numbered | `\begin{equation}...\end{equation}` | С номером |

**Основные символы:**

| Категория | Синтаксис | Результат |
|-----------|-----------|-----------|
| Дробь | `\frac{a}{b}` | a/b |
| Верхний индекс | `x^{2}` | x^2 |
| Нижний индекс | `x_{i}` | x_i |
| Корень | `\sqrt{x}`, `\sqrt[n]{x}` | корень |
| Сумма | `\sum_{i=1}^{n}` | сумма |
| Интеграл | `\int_{a}^{b}` | интеграл |
| Произведение | `\prod_{i=1}^{n}` | произведение |
| Предел | `\lim_{x \to \infty}` | предел |

**Греческие буквы:**
```latex
\alpha \beta \gamma \delta \epsilon \theta \lambda \mu
\pi \sigma \phi \omega
\Gamma \Delta \Theta \Lambda \Pi \Sigma \Phi \Omega
```

**Операторы и отношения:**
```latex
\times \div \pm \mp \cdot \leq \geq \neq \approx
\equiv \subset \supset \in \notin \cup \cap
```

**Матрицы:**
```latex
\begin{pmatrix}
    a & b \\
    c & d
\end{pmatrix}
```

Типы скобок: `pmatrix` (круглые), `bmatrix` (квадратные), `vmatrix` (вертикальные), `Bmatrix` (фигурные)

## Таблицы

```latex
\begin{table}[htbp]
    \centering
    \begin{tabular}{|l|c|r|}
        \hline
        Левый & Центр & Правый \\
        \hline
        A & B & C \\
        D & E & F \\
        \hline
    \end{tabular}
    \caption{Заголовок таблицы}
    \label{tab:example}
\end{table}
```

**Выравнивание столбцов:**
- `l` — по левому краю
- `c` — по центру
- `r` — по правому краю
- `|` — вертикальная линия
- `p{ширина}` — фиксированная ширина с переносом

## Рисунки

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.8\textwidth]{image.png}
    \caption{Подпись к рисунку}
    \label{fig:example}
\end{figure}
```

**Опции includegraphics:**
- `width=значение` — ширина
- `height=значение` — высота
- `scale=число` — масштаб
- `angle=градусы` — поворот

**Позиционирование [htbp]:**
- `h` — здесь (here)
- `t` — вверху страницы (top)
- `b` — внизу страницы (bottom)
- `p` — отдельная страница (page)
- `!` — игнорировать ограничения

## Ссылки и библиография

| Команда | Описание |
|---------|----------|
| `\label{метка}` | Установить метку |
| `\ref{метка}` | Ссылка на номер |
| `\pageref{метка}` | Ссылка на страницу |
| `\cite{ключ}` | Ссылка на источник |
| `\footnote{текст}` | Сноска |
| `\bibliography{файл}` | Файл библиографии |
| `\bibliographystyle{стиль}` | Стиль библиографии |

## Специальные элементы

**Буквальный текст:**
```latex
\begin{verbatim}
Текст выводится как есть,
    включая    пробелы.
\end{verbatim}
```

**Код с подсветкой (пакет listings):**
```latex
\begin{lstlisting}[language=Python]
def hello():
    print("Hello, World!")
\end{lstlisting}
```

**Комментарии:**
```latex
% Это комментарий — игнорируется при компиляции
```

**Специальные символы:**

| Символ | Код |
|--------|-----|
| % | `\%` |
| $ | `\$` |
| & | `\&` |
| # | `\#` |
| _ | `\_` |
| { } | `\{ \}` |
| ~ | `\textasciitilde` |
| ^ | `\textasciicircum` |
| \ | `\textbackslash` |

---

## Правила

- ЕСЛИ нужна русская типографика -> подключить `\usepackage[T2A]{fontenc}` и `\usepackage[utf8]{inputenc}`
- ЕСЛИ нужны математические символы -> подключить `\usepackage{amsmath}` и `\usepackage{amssymb}`
- ЕСЛИ нужны картинки -> подключить `\usepackage{graphicx}`
- ЕСЛИ нужен код с подсветкой -> подключить `\usepackage{listings}`
- ЕСЛИ нужны гиперссылки -> подключить `\usepackage{hyperref}`
- ВСЕГДА закрывать все `\begin{}` соответствующим `\end{}`
- ВСЕГДА экранировать специальные символы
- НИКОГДА не оставлять пустые строки внутри математических окружений

---

## Примеры

### Пример 1: Базовый документ

**Запрос:** Создать простой документ с заголовком и текстом

**Результат:**
```latex
\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T2A]{fontenc}
\usepackage[russian]{babel}

\title{Заголовок документа}
\author{Автор}
\date{\today}

\begin{document}

\maketitle

\section{Введение}

Это первый параграф документа. Он содержит текст с \textbf{жирным}
и \textit{курсивным} выделением.

\section{Основная часть}

Список ключевых пунктов:
\begin{itemize}
    \item Первый пункт
    \item Второй пункт
    \item Третий пункт
\end{itemize}

\end{document}
```

### Пример 2: Математическая формула

**Запрос:** Написать формулу квадратного уравнения с решением

**Результат:**
```latex
\documentclass{article}
\usepackage{amsmath}

\begin{document}

Квадратное уравнение: $ax^2 + bx + c = 0$

Решение:
\begin{equation}
    x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
\end{equation}

Дискриминант: $D = b^2 - 4ac$

\end{document}
```

### Пример 3: Таблица с данными

**Запрос:** Создать таблицу с тремя столбцами

**Результат:**
```latex
\begin{table}[htbp]
    \centering
    \begin{tabular}{|l|c|r|}
        \hline
        \textbf{Название} & \textbf{Количество} & \textbf{Цена} \\
        \hline
        Товар A & 10 & 100 \\
        Товар B & 25 & 250 \\
        Товар C & 5 & 500 \\
        \hline
        \textbf{Итого} & 40 & 850 \\
        \hline
    \end{tabular}
    \caption{Пример таблицы с данными}
    \label{tab:prices}
\end{table}
```
