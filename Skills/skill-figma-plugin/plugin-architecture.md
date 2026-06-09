# Архитектура Figma-плагинов

## Назначение

Описание архитектуры плагинов Figma: модель исполнения (sandbox + iframe), типы плагинов, Quick Start примеры, коммуникация между потоками, типичные антипаттерны.

## Модель исполнения

Figma-плагин состоит из двух изолированных потоков:

**Main thread (sandbox):**
- Исполняет `code.ts` / `code.js`
- Имеет доступ к Figma Plugin API (`figma.*`)
- Может читать и изменять документ (ноды, стили, переменные)
- **Ограничения:** нет доступа к browser APIs — fetch, XMLHttpRequest, DOM, setTimeout, setInterval недоступны напрямую
- Sandbox — минимальная JS-среда, спроектированная для безопасности

**UI thread (iframe):**
- Исполняет `ui.html` (HTML + CSS + JS)
- Полная браузерная среда — доступны fetch, DOM, React, Vue, любые npm-пакеты
- **Ограничение:** нет доступа к Figma API
- Открывается через `figma.showUI(__html__)`

**Коммуникация:**
- Main -> UI: `figma.ui.postMessage(data)`
- UI -> Main: `parent.postMessage({ pluginMessage: data }, '*')`
- Данные сериализуются (только JSON-совместимые значения)

## Типы плагинов по editorType

| editorType | Среда | Примечание |
|-----------|-------|-----------|
| `figma` | Figma Design | Основной тип — работа с дизайн-файлами |
| `figjam` | FigJam | Для FigJam — sticky notes, connectors, shapes with text |
| `dev` | Dev Mode | Инструменты для разработчиков в Dev Mode |
| `slides` | Figma Slides | Для презентаций (добавлен январь 2026) |
| `buzz` | Figma Buzz | Для Buzz (добавлен январь 2026) |

> **Scope скилла:** покрыты `figma` и `figjam`. Типы `dev`, `slides`, `buzz` существуют, но их специфика не описана в данном скилле.

**Ограничение:** нельзя одновременно указать `dev` и `figjam` в `editorType`.

## Quick Start: минимальный плагин без UI

```typescript
// code.ts — main thread, доступ к Figma API

// Получить текущую selection
const selection = figma.currentPage.selection;

if (selection.length === 0) {
  figma.notify('Please select something');
  figma.closePlugin();
}

// Обработать selection
for (const node of selection) {
  if ('fills' in node) {
    node.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
  }
}

figma.notify(`Updated ${selection.length} items`);
figma.closePlugin();
```

## Quick Start: плагин с UI

**Main thread:**

```typescript
// code.ts
figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'create-rectangle') {
    const rect = figma.createRectangle();
    rect.resize(msg.width, msg.height);
    rect.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 1 } }];
    figma.currentPage.appendChild(rect);
    figma.viewport.scrollAndZoomIntoView([rect]);
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
```

**UI thread:**

```html
<!-- ui.html -->
<div id="app">
  <label>Width: <input id="width" type="number" value="100"></label>
  <label>Height: <input id="height" type="number" value="100"></label>
  <button id="create">Create Rectangle</button>
  <button id="cancel">Cancel</button>
</div>

<script>
  document.getElementById('create').onclick = () => {
    parent.postMessage({
      pluginMessage: {
        type: 'create-rectangle',
        width: Number(document.getElementById('width').value),
        height: Number(document.getElementById('height').value),
      }
    }, '*');
  };

  document.getElementById('cancel').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
  };
</script>
```

## Коммуникация: типизированные сообщения

Рекомендуемый паттерн — discriminated unions для типобезопасной коммуникации:

```typescript
// shared-types.ts
type PluginMessage =
  | { type: 'create-shape'; shape: 'rectangle' | 'ellipse'; size: number }
  | { type: 'update-selection'; color: RGB }
  | { type: 'cancel' };

type UIMessage =
  | { type: 'selection-changed'; count: number; types: string[] }
  | { type: 'error'; message: string };
```

**Main thread:**

```typescript
// code.ts
figma.ui.onmessage = (msg: PluginMessage) => {
  switch (msg.type) {
    case 'create-shape':
      // TypeScript знает, что msg имеет shape и size
      break;
    case 'update-selection':
      // TypeScript знает, что msg имеет color
      break;
  }
};
```

**UI thread:**

```typescript
// ui.ts
window.onmessage = (event) => {
  const msg = event.data.pluginMessage as UIMessage;
  if (msg.type === 'selection-changed') {
    document.getElementById('count').textContent = String(msg.count);
  }
};
```

## Коммуникация: направления

**Main -> UI:**

```typescript
// code.ts
figma.ui.postMessage({
  type: 'selection-changed',
  count: figma.currentPage.selection.length
});
```

**UI -> Main:**

```typescript
// ui.ts
parent.postMessage({
  pluginMessage: { type: 'do-something', data: 'value' }
}, '*');
```

```typescript
// code.ts
figma.ui.onmessage = (msg) => {
  if (msg.type === 'do-something') {
    console.log(msg.data);
  }
};
```

## Антипаттерны

### Забыть загрузить шрифт перед изменением текста

```typescript
// НЕПРАВИЛЬНО: упадёт с ошибкой
const text = figma.createText();
text.characters = 'Hello'; // Error: font not loaded

// ПРАВИЛЬНО: сначала загрузить шрифт
const text = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
text.characters = 'Hello';
```

### Модификация readonly массивов

```typescript
// НЕПРАВИЛЬНО: fills — readonly
node.fills.push(newFill); // Error

// ПРАВИЛЬНО: создать новый массив
node.fills = [...node.fills, newFill];
```

### Не обработать пустую selection

```typescript
// НЕПРАВИЛЬНО: упадёт если ничего не выделено
const node = figma.currentPage.selection[0];
node.name = 'Renamed'; // Error если selection пуста

// ПРАВИЛЬНО: проверить
const selection = figma.currentPage.selection;
if (selection.length === 0) {
  figma.notify('Please select something');
  return;
}
```

### Блокировка main thread длинным циклом

```typescript
// НЕПРАВИЛЬНО: заморозит Figma
for (let i = 0; i < 10000; i++) {
  figma.createRectangle();
}

// ПРАВИЛЬНО: batch с yield
async function createManyRectangles(count: number) {
  const batchSize = 100;
  for (let i = 0; i < count; i += batchSize) {
    for (let j = 0; j < Math.min(batchSize, count - i); j++) {
      figma.createRectangle();
    }
    // Отдать управление Figma
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

### Плагин без кнопки закрытия

```typescript
// НЕПРАВИЛЬНО: плагин зависает, пользователь не может закрыть
figma.showUI(__html__);

// ПРАВИЛЬНО: всегда предусмотреть выход
figma.showUI(__html__);
figma.ui.onmessage = (msg) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};
```

### Использование browser APIs в sandbox

```typescript
// НЕПРАВИЛЬНО: fetch недоступен в main thread
const response = await fetch('https://api.example.com/data'); // Error

// ПРАВИЛЬНО: делать fetch из UI, отправлять результат в main thread
// ui.ts
const response = await fetch('https://api.example.com/data');
const data = await response.json();
parent.postMessage({ pluginMessage: { type: 'data', data } }, '*');

// code.ts
figma.ui.onmessage = (msg) => {
  if (msg.type === 'data') {
    // Использовать data для работы с Figma API
  }
};
```

## Type Guards для работы с нодами

```typescript
// Проверка типа ноды перед доступом к свойствам
function isTextNode(node: SceneNode): node is TextNode {
  return node.type === 'TEXT';
}

function hasChildren(node: SceneNode): node is FrameNode | GroupNode {
  return 'children' in node;
}

function hasFills(node: SceneNode): node is GeometryMixin & SceneNode {
  return 'fills' in node;
}

// Использование
for (const node of figma.currentPage.selection) {
  if (isTextNode(node)) {
    node.characters = 'Updated text';
  }
  if (hasFills(node)) {
    node.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
  }
}
```
