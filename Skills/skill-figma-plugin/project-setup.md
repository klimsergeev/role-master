# Настройка проекта Figma-плагина

## Назначение

Конфигурация, сборка, тестирование и публикация Figma-плагинов: manifest.json, TypeScript, бандлеры (esbuild, Vite, Webpack), development workflow, тестирование и publishing.

## Структура проекта

### Минимальная

```
my-plugin/
├── manifest.json      # Конфигурация плагина
├── code.ts            # Main thread код
├── ui.html            # UI (опционально)
└── package.json       # Зависимости
```

### Рекомендуемая

```
my-plugin/
├── manifest.json
├── package.json
├── tsconfig.json
├── esbuild.config.js
│
├── src/
│   ├── code.ts         # Main entry point
│   ├── ui.tsx          # UI entry point (React)
│   ├── types.ts        # Shared types (сообщения)
│   │
│   ├── features/       # Feature modules
│   │   ├── rename.ts
│   │   └── export.ts
│   │
│   └── utils/          # Утилиты
│       ├── colors.ts
│       └── traversal.ts
│
├── ui/
│   ├── components/     # UI-компоненты
│   ├── hooks/          # React hooks
│   └── styles/         # CSS
│
└── dist/               # Build output
    ├── code.js
    └── ui.html
```

---

## manifest.json

### Минимальный

```json
{
  "name": "My Plugin",
  "id": "1234567890",
  "api": "1.0.0",
  "main": "code.js",
  "editorType": ["figma"],
  "documentAccess": "dynamic-page"
}
```

### С UI

```json
{
  "name": "My Plugin",
  "id": "1234567890",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "editorType": ["figma"],
  "documentAccess": "dynamic-page"
}
```

### Полный пример

```json
{
  "name": "My Plugin",
  "id": "1234567890123456789",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "editorType": ["figma", "figjam"],
  "documentAccess": "dynamic-page",

  "capabilities": [],
  "enableProposedApi": false,

  "menu": [
    {
      "name": "Run Plugin",
      "command": "run"
    },
    { "separator": true },
    {
      "name": "Settings",
      "command": "settings"
    },
    {
      "name": "Utilities",
      "menu": [
        { "name": "Rename Layers", "command": "rename" },
        { "name": "Cleanup", "command": "cleanup" }
      ]
    }
  ],

  "relaunchButtons": [
    {
      "command": "refresh",
      "name": "Refresh",
      "multipleSelection": true
    }
  ],

  "parameters": [
    {
      "name": "text",
      "key": "text",
      "description": "Text to insert",
      "allowFreeform": true
    }
  ],

  "parameterOnly": false,

  "networkAccess": {
    "allowedDomains": ["api.example.com"],
    "reasoning": "Fetch data from our API"
  },

  "codegenLanguages": [
    {
      "label": "React",
      "value": "react"
    }
  ]
}
```

### Справочник полей manifest.json

| Поле | Обязательно | Описание |
|------|-----------|----------|
| `name` | Да | Название плагина |
| `id` | Да | Уникальный ID (присваивается Figma при создании) |
| `api` | Да | Версия API (`"1.0.0"`) |
| `main` | Да | Путь к файлу main thread кода |
| `ui` | Нет | Путь к HTML-файлу UI |
| `editorType` | Нет | `["figma"]`, `["figjam"]`, `["dev"]`, `["slides"]`, `["buzz"]`, или комбинации |
| `documentAccess` | Да (для новых) | `"dynamic-page"` — обязательно для новых плагинов |
| `menu` | Нет | Пользовательское меню с командами |
| `relaunchButtons` | Нет | Кнопки, которые сохраняются на нодах |
| `parameters` | Нет | Параметры для quick action |
| `networkAccess` | Нет | Обязательно для сетевых запросов — указать разрешённые домены |

### Значения editorType

| Значение | Среда | Примечание |
|---------|-------|-----------|
| `figma` | Figma Design | Основной тип |
| `figjam` | FigJam | Для FigJam-файлов |
| `dev` | Dev Mode | Для режима разработчика |
| `slides` | Figma Slides | Для презентаций (январь 2026) |
| `buzz` | Figma Buzz | Для Buzz (январь 2026) |

**Ограничение:** `dev` и `figjam` нельзя указать одновременно.

### documentAccess: dynamic-page

Поле `"documentAccess": "dynamic-page"` обязательно для всех новых плагинов. Без него Figma загружает все страницы документа при запуске плагина (показывая "Loading n pages for plugin..."), что замедляет работу. С полем — загружается только текущая страница.

**Важно:** при `dynamic-page` нужно использовать async-методы API. Deprecated синхронные методы недоступны.

### Обработка команд меню

```typescript
// code.ts
figma.on('run', ({ command }) => {
  switch (command) {
    case 'run':
      figma.showUI(__html__);
      break;
    case 'settings':
      figma.showUI(__html__, { width: 300, height: 200 });
      break;
    case 'rename':
      renameSelectedNodes();
      break;
    default:
      figma.showUI(__html__);
  }
});
```

---

## TypeScript

### Установка типов

```bash
npm install --save-dev @figma/plugin-typings typescript
```

### tsconfig.json для main thread

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "typeRoots": [
      "./node_modules/@types",
      "./node_modules/@figma"
    ]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

> **Важно:** `typeRoots` должен включать `./node_modules/@figma` — типы плагина расположены не в стандартном `@types`, а в `@figma`. Без этой настройки TypeScript не найдёт глобальные типы `figma`, `SceneNode`, и т.д.

### tsconfig.ui.json для UI с DOM

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx"
  },
  "include": ["src/ui.tsx", "ui/**/*"]
}
```

---

## Бандлеры

### esbuild (рекомендуется)

```javascript
// esbuild.config.js
const esbuild = require('esbuild');
const fs = require('fs');

// Сборка main thread
esbuild.buildSync({
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  target: 'es2020',
  format: 'iife',
});

// Сборка UI
esbuild.buildSync({
  entryPoints: ['src/ui.tsx'],
  bundle: true,
  outfile: 'dist/ui.js',
  target: 'es2020',
  format: 'iife',
  loader: {
    '.tsx': 'tsx',
    '.css': 'css',
  },
});

// Инлайн JS в HTML (Figma требует один HTML-файл)
const uiJs = fs.readFileSync('dist/ui.js', 'utf8');
const uiHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    ${fs.readFileSync('ui/styles/main.css', 'utf8')}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>${uiJs}</script>
</body>
</html>
`;
fs.writeFileSync('dist/ui.html', uiHtml);
```

### package.json scripts

```json
{
  "scripts": {
    "build": "node esbuild.config.js",
    "watch": "node esbuild.config.js --watch",
    "dev": "npm run watch",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/**/*.ts"
  },
  "devDependencies": {
    "@figma/plugin-typings": "^1.0.0",
    "esbuild": "^0.19.0",
    "typescript": "^5.0.0"
  }
}
```

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        ui: resolve(__dirname, 'src/ui.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
});
```

### Webpack

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const path = require('path');

module.exports = [
  // Main thread
  {
    entry: './src/code.ts',
    output: {
      filename: 'code.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
  },
  // UI
  {
    entry: './src/ui.tsx',
    output: {
      filename: 'ui.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/ui.html',
        filename: 'ui.html',
        inject: 'body',
      }),
      new HtmlInlineScriptPlugin(),
    ],
  },
];
```

---

## Альтернатива: create-figma-plugin

Toolkit [create-figma-plugin](https://yuanqing.github.io/create-figma-plugin/) (автор: yuanqing, npm: `create-figma-plugin`, текущая версия 4.x) — готовый набор инструментов для разработки плагинов и виджетов Figma:

- TypeScript + CSS Modules из коробки
- Preact-компоненты, стилизованные под Figma UI
- Утилиты для работы с Plugin API
- Собственная система сборки

```bash
# Установка
npx create-figma-plugin

# Пакеты в составе:
# @create-figma-plugin/ui       — Preact-компоненты для Figma UI
# @create-figma-plugin/utilities — утилиты для Plugin API
# @create-figma-plugin/build    — сборка
# @create-figma-plugin/tsconfig — базовый tsconfig
```

**Когда использовать:** если нужен быстрый старт с готовыми UI-компонентами и не хочется настраивать бандлер вручную.

**Когда не использовать:** если нужен полный контроль над стеком (свой фреймворк, свой бандлер) или проект уже имеет устоявшуюся конфигурацию.

---

## Development Workflow

### Предварительные требования

- **Figma Desktop app** — обязательна для разработки и тестирования плагинов (web-версия не подходит для локальной разработки)
- **Node.js + npm**
- Текстовый редактор (VS Code рекомендуется)

### Создание нового плагина

**Способ: через Figma Desktop:**
- Открыть Figma Desktop
- Plugins > Development > New plugin
- В модальном окне "Create a plugin" выбрать тип (Figma design, FigJam, и т.д.)
- Задать имя, сохранить папку на диск
- Figma сгенерирует `manifest.json` с присвоенным ID

**Способ: вручную:**
- Создать директорию проекта
- Создать `manifest.json` (ID будет присвоен при первой публикации)
- Импортировать в Figma: Plugins > Development > Import plugin from manifest
- Выбрать файл `manifest.json`

### Процесс разработки

- Запустить `npm run watch` в терминале для автоматической пересборки
- В Figma Desktop: Plugins > Development > [Имя плагина]
- После изменений: пересобрать + перезапустить плагин
- Быстрый перезапуск последнего плагина: Cmd/Ctrl + Alt + P
- Консоль: Plugins > Development > Show/Hide Console

### Console Logging

```typescript
// Main thread — появляется в Figma Console
console.log('Main thread log');

// UI thread — также появляется в Figma Console
// Открыть: Plugins > Development > Show/Hide Console
console.log('UI log');
```

---

## Тестирование

### Чеклист ручного тестирования

- [ ] Плагин загружается без ошибок
- [ ] UI отображается корректно
- [ ] Selection handling работает
- [ ] Пустая selection обработана
- [ ] Большая selection обработана (100+ нод)
- [ ] Ошибки обработаны (notify + closePlugin)
- [ ] Cancel/Close работает
- [ ] Undo работает после действий плагина
- [ ] Работает в light и dark теме
- [ ] Работает с `documentAccess: "dynamic-page"`

### Unit-тесты

```typescript
// __tests__/utils.test.ts
import { hexToRgb, rgbToHex } from '../src/utils/colors';

describe('hexToRgb', () => {
  test('converts hex to RGB', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 1, g: 0, b: 0 });
    expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 1, b: 0 });
    expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 1 });
  });
});
```

```json
{
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

### Mock Figma API

```typescript
// __mocks__/figma.ts
export const figma = {
  currentPage: {
    selection: [],
    findAll: jest.fn(() => []),
    findOne: jest.fn(() => null),
  },
  createRectangle: jest.fn(() => ({
    type: 'RECTANGLE',
    x: 0,
    y: 0,
    resize: jest.fn(),
  })),
  notify: jest.fn(),
  closePlugin: jest.fn(),
  ui: {
    postMessage: jest.fn(),
    onmessage: null,
  },
};

// jest.setup.ts
(global as any).figma = figma;
```

---

## Публикация

### Подготовка

- Создать cover image (1920 x 960 пикселей)
- Создать иконку (128 x 128 пикселей)
- Написать описание (поддерживается markdown)
- Протестировать по чеклисту выше
- Собрать production bundle (`npm run build`)

### Процесс публикации

- Открыть Figma > Plugins > Manage plugins
- Найти свой development-плагин
- Нажать "Publish"
- Заполнить:
  - Name (до 50 символов)
  - Tagline (до 100 символов)
  - Description (markdown)
  - Cover image
  - Categories и Tags
- Submit for review

### Требования Figma к review

Figma проверяет плагины по критериям:
- **Security** — нет вредоносного кода
- **Privacy** — прозрачная работа с данными
- **Quality** — работает как описано
- **Guidelines** — соответствие community guidelines

Частые причины отказа:
- Плагин падает или имеет критические баги
- Отсутствующее или вводящее в заблуждение описание
- Проблемы с privacy policy (если собираются данные)

### Обновление опубликованного плагина

- Обновить версию в коде (если отслеживается)
- Собрать production bundle
- Figma > Plugins > Manage plugins
- Нажать "Edit" на плагине
- Загрузить новые файлы
- Обновить описание при необходимости
- Submit update

---

## Типичные проблемы

### "Plugin timed out"

```typescript
// ПРОБЛЕМА: длинная операция блокирует main thread
for (let i = 0; i < 10000; i++) {
  figma.createRectangle();
}

// РЕШЕНИЕ: batch с yield
async function createMany(count: number) {
  for (let i = 0; i < count; i += 100) {
    for (let j = 0; j < Math.min(100, count - i); j++) {
      figma.createRectangle();
    }
    await new Promise(r => setTimeout(r, 0));
  }
}
```

### "Cannot read properties of null"

```typescript
// ПРОБЛЕМА: не проверяется null
const node = figma.currentPage.selection[0];
node.name = 'New name'; // Падает если ничего не выделено

// РЕШЕНИЕ: проверить
const selection = figma.currentPage.selection;
if (selection.length === 0) {
  figma.notify('Select something first');
  return;
}
const node = selection[0];
```

### "Font not loaded"

```typescript
// ПРОБЛЕМА: изменение текста без загрузки шрифта
const text = figma.createText();
text.characters = 'Hello'; // Error!

// РЕШЕНИЕ: загрузить шрифт
const text = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
text.characters = 'Hello';
```

### UI не показывается

```typescript
// ПРОБЛЕМА: передача строки вместо __html__
figma.showUI('<html>...</html>'); // Не сработает

// РЕШЕНИЕ: использовать __html__ (заменяется при сборке)
figma.showUI(__html__);

// Или для inline HTML (только для разработки)
figma.showUI(`<html><body>Hello</body></html>`, { width: 200, height: 100 });
```

### Сетевые запросы заблокированы

```json
// manifest.json — добавить networkAccess
{
  "networkAccess": {
    "allowedDomains": ["api.example.com"],
    "reasoning": "Fetch data from our API"
  }
}
```

> **Напоминание:** fetch доступен только в UI iframe, не в main thread sandbox. Сетевые запросы делаются из UI, результаты передаются в main thread через postMessage.
