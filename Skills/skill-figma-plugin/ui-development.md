# UI-разработка для Figma-плагинов

## Назначение

Создание пользовательских интерфейсов для Figma-плагинов: показ UI, коммуникация с main thread, plain HTML/CSS/JS, React, Figma Theme Colors, типичные UI-компоненты, файловый экспорт.

## Архитектура UI

```
+---------------------------------------------------------+
|                 MAIN THREAD (code.ts)                    |
|                                                          |
|   figma.showUI(__html__)                                 |
|         |                                                |
|         v                                                |
|   +--------------------------------------------------+  |
|   |              UI IFRAME (ui.html)                  |  |
|   |                                                   |  |
|   |   - Полная браузерная среда                       |  |
|   |   - HTML, CSS, JavaScript                         |  |
|   |   - React, Vue, Svelte и т.д.                     |  |
|   |   - НЕТ доступа к Figma API                      |  |
|   |   - Коммуникация через postMessage                |  |
|   |                                                   |  |
|   +--------------------------------------------------+  |
|                                                          |
+---------------------------------------------------------+
```

## Показ UI

### Базовый

```typescript
// code.ts
figma.showUI(__html__);  // __html__ заменяется содержимым ui.html при сборке

// С опциями
figma.showUI(__html__, {
  width: 400,
  height: 300,
  title: 'My Plugin',
  visible: true,
  position: { x: 100, y: 100 },
  themeColors: true,  // Инжектирует CSS-переменные Figma (см. секцию Theme Colors)
});
```

### Опции showUI

| Опция | Тип | По умолчанию | Описание |
|-------|-----|-------------|----------|
| `width` | number | 300 | Ширина окна |
| `height` | number | 200 | Высота окна |
| `visible` | boolean | true | Видимость окна |
| `position` | `{ x, y }` | — | Позиция окна |
| `title` | string | — | Заголовок окна |
| `themeColors` | boolean | false | Инжектировать CSS-переменные Figma |

### Изменение размера

```typescript
// Из main thread
figma.ui.resize(500, 400);

// Из UI — запросить resize через сообщение
parent.postMessage({
  pluginMessage: { type: 'resize', width: 500, height: 400 }
}, '*');

// code.ts — обработать
figma.ui.onmessage = (msg) => {
  if (msg.type === 'resize') {
    figma.ui.resize(msg.width, msg.height);
  }
};
```

---

## Коммуникация с main thread

### UI -> Main

```html
<!-- ui.html -->
<script>
// Отправить сообщение в main thread
function sendMessage(type, data) {
  parent.postMessage({ pluginMessage: { type, ...data } }, '*');
}

// Примеры
sendMessage('create-shape', { shape: 'rectangle', width: 100, height: 50 });
sendMessage('update-color', { color: '#FF5733' });
sendMessage('close');
</script>
```

### Main -> UI

```typescript
// code.ts
figma.ui.postMessage({
  type: 'selection-data',
  nodes: figma.currentPage.selection.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type,
  })),
});

// Отправлять при изменении selection
figma.on('selectionchange', () => {
  figma.ui.postMessage({
    type: 'selection-changed',
    count: figma.currentPage.selection.length,
  });
});
```

### Получение сообщений в UI

```html
<script>
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  switch (msg.type) {
    case 'selection-data':
      renderNodes(msg.nodes);
      break;
    case 'selection-changed':
      updateCount(msg.count);
      break;
    case 'error':
      showError(msg.message);
      break;
  }
};
</script>
```

### Типизированные сообщения

```typescript
// shared/types.ts
export type MainToUI =
  | { type: 'selection-changed'; count: number }
  | { type: 'node-data'; node: SerializedNode }
  | { type: 'error'; message: string }
  | { type: 'styles-loaded'; styles: StyleData[] };

export type UIToMain =
  | { type: 'create-shape'; shape: 'rectangle' | 'ellipse'; size: number }
  | { type: 'apply-style'; styleId: string }
  | { type: 'close' };

// code.ts
figma.ui.onmessage = (msg: UIToMain) => {
  switch (msg.type) {
    case 'create-shape':
      // TypeScript знает, что есть shape и size
      break;
  }
};

// ui.ts
declare function postMessage(msg: UIToMain): void;
```

---

## Plain HTML/CSS/JS

### Базовая структура

```html
<!-- ui.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Inter, system-ui, sans-serif;
      font-size: 11px;
      color: var(--figma-color-text);
      background: var(--figma-color-bg);
      padding: 12px;
    }

    .input-group {
      margin-bottom: 12px;
    }

    label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
    }

    input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--figma-color-border);
      border-radius: 4px;
      background: var(--figma-color-bg);
      color: var(--figma-color-text);
    }

    input:focus, select:focus {
      outline: none;
      border-color: var(--figma-color-border-brand);
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary {
      background: var(--figma-color-bg-brand);
      color: white;
    }

    .btn-secondary {
      background: var(--figma-color-bg-secondary);
      color: var(--figma-color-text);
    }

    .btn-row {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="input-group">
    <label for="name">Name</label>
    <input type="text" id="name" placeholder="Enter name">
  </div>

  <div class="input-group">
    <label for="size">Size</label>
    <input type="number" id="size" value="100" min="1">
  </div>

  <div class="btn-row">
    <button class="btn-secondary" id="cancel">Cancel</button>
    <button class="btn-primary" id="create">Create</button>
  </div>

  <script>
    const nameInput = document.getElementById('name');
    const sizeInput = document.getElementById('size');

    document.getElementById('create').onclick = () => {
      parent.postMessage({
        pluginMessage: {
          type: 'create',
          name: nameInput.value,
          size: parseInt(sizeInput.value, 10),
        }
      }, '*');
    };

    document.getElementById('cancel').onclick = () => {
      parent.postMessage({ pluginMessage: { type: 'close' } }, '*');
    };

    // Получение сообщений
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;
      if (msg?.type === 'update') {
        nameInput.value = msg.name || '';
      }
    };
  </script>
</body>
</html>
```

---

## React

### Настройка

```bash
# С toolkit create-figma-plugin (рекомендуется)
npx create-figma-plugin
# Выбрать шаблон с Preact UI

# Или ручная настройка React
npm install react react-dom
npm install --save-dev @types/react @types/react-dom
```

### Компонент приложения

```typescript
// ui.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import './ui.css';

type Message =
  | { type: 'selection-changed'; count: number }
  | { type: 'node-data'; node: { name: string; type: string } };

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [size, setSize] = useState(100);

  // Слушать сообщения из main thread
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data.pluginMessage as Message;
      if (!msg) return;

      if (msg.type === 'selection-changed') {
        setCount(msg.count);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Отправить сообщение в main thread
  const postMessage = useCallback((message: any) => {
    parent.postMessage({ pluginMessage: message }, '*');
  }, []);

  const handleCreate = () => {
    postMessage({ type: 'create', name, size });
  };

  const handleClose = () => {
    postMessage({ type: 'close' });
  };

  return (
    <div className="container">
      <p className="selection-info">
        {count} items selected
      </p>

      <div className="input-group">
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Size</label>
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="btn-row">
        <button className="btn-secondary" onClick={handleClose}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleCreate}>
          Create
        </button>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

### Custom Hook для Figma Messages

```typescript
// hooks/useFigmaMessage.ts
import { useEffect, useCallback } from 'react';

type MessageHandler<T> = (message: T) => void;

export function useFigmaMessage<T>(handler: MessageHandler<T>) {
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg) {
        handler(msg as T);
      }
    };

    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [handler]);
}

export function usePostMessage() {
  return useCallback((message: any) => {
    parent.postMessage({ pluginMessage: message }, '*');
  }, []);
}

// Использование
function App() {
  const [data, setData] = useState(null);
  const postMessage = usePostMessage();

  useFigmaMessage((msg) => {
    if (msg.type === 'data') {
      setData(msg.data);
    }
  });

  return (
    <button onClick={() => postMessage({ type: 'fetch-data' })}>
      Fetch Data
    </button>
  );
}
```

---

## Figma Theme Colors

Когда `themeColors: true` передано в `figma.showUI()`, Figma инжектирует CSS-переменные, которые автоматически адаптируются к light/dark теме.

### Доступные CSS-переменные

```css
:root {
  /* Текст */
  --figma-color-text:                    /* основной текст */;
  --figma-color-text-secondary:          /* вторичный текст */;
  --figma-color-text-tertiary:           /* третичный текст */;
  --figma-color-text-disabled:           /* неактивный текст */;
  --figma-color-text-onbrand:            /* текст на brand-цвете */;
  --figma-color-text-onbrand-secondary:  /* вторичный текст на brand */;
  --figma-color-text-danger:             /* ошибки */;
  --figma-color-text-warning:            /* предупреждения */;
  --figma-color-text-success:            /* успех */;

  /* Фоны */
  --figma-color-bg:                /* основной фон */;
  --figma-color-bg-secondary:      /* вторичный фон */;
  --figma-color-bg-tertiary:       /* третичный фон */;
  --figma-color-bg-brand:          /* brand фон */;
  --figma-color-bg-brand-hover:    /* brand hover */;
  --figma-color-bg-brand-pressed:  /* brand pressed */;
  --figma-color-bg-danger:         /* danger фон */;
  --figma-color-bg-warning:        /* warning фон */;
  --figma-color-bg-success:        /* success фон */;
  --figma-color-bg-hover:          /* hover state */;
  --figma-color-bg-pressed:        /* pressed state */;
  --figma-color-bg-selected:       /* selected state */;

  /* Границы */
  --figma-color-border:        /* основная граница */;
  --figma-color-border-strong:  /* усиленная граница */;
  --figma-color-border-brand:   /* brand граница */;
  --figma-color-border-danger:  /* danger граница */;

  /* Иконки */
  --figma-color-icon:           /* основная иконка */;
  --figma-color-icon-secondary: /* вторичная иконка */;
  --figma-color-icon-tertiary:  /* третичная иконка */;
  --figma-color-icon-brand:     /* brand иконка */;
  --figma-color-icon-danger:    /* danger иконка */;
}
```

### Использование Theme Colors

```css
/* Автоматическая адаптация к light/dark */
body {
  background: var(--figma-color-bg);
  color: var(--figma-color-text);
}

.card {
  background: var(--figma-color-bg-secondary);
  border: 1px solid var(--figma-color-border);
}

.btn-primary {
  background: var(--figma-color-bg-brand);
  color: var(--figma-color-text-onbrand);
}

.btn-primary:hover {
  background: var(--figma-color-bg-brand-hover);
}

.error {
  color: var(--figma-color-text-danger);
  background: var(--figma-color-bg-danger);
}
```

---

## Типичные UI-компоненты

### Loading State

```html
<div id="loading" class="loading">
  <div class="spinner"></div>
  <p>Loading...</p>
</div>

<div id="content" class="hidden">
  <!-- Основной контент -->
</div>

<style>
.hidden { display: none; }

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--figma-color-border);
  border-top-color: var(--figma-color-bg-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

<script>
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (msg?.type === 'ready') {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('content').classList.remove('hidden');
  }
};
</script>
```

### Tabs

```html
<div class="tabs">
  <button class="tab active" data-tab="settings">Settings</button>
  <button class="tab" data-tab="export">Export</button>
  <button class="tab" data-tab="about">About</button>
</div>

<div class="tab-content active" id="settings"><!-- ... --></div>
<div class="tab-content" id="export"><!-- ... --></div>
<div class="tab-content" id="about"><!-- ... --></div>

<style>
.tabs {
  display: flex;
  border-bottom: 1px solid var(--figma-color-border);
  margin-bottom: 12px;
}

.tab {
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--figma-color-text-secondary);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab.active {
  color: var(--figma-color-text);
  border-bottom-color: var(--figma-color-bg-brand);
}

.tab-content { display: none; }
.tab-content.active { display: block; }
</style>

<script>
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tab.dataset.tab).classList.add('active');
  };
});
</script>
```

### Color Picker

```html
<div class="color-picker">
  <input type="color" id="color" value="#0066FF">
  <input type="text" id="color-hex" value="#0066FF" maxlength="7">
</div>

<style>
.color-picker {
  display: flex;
  gap: 8px;
}

input[type="color"] {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--figma-color-border);
  border-radius: 4px;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
input[type="color"]::-webkit-color-swatch { border-radius: 2px; border: none; }
</style>

<script>
const colorInput = document.getElementById('color');
const hexInput = document.getElementById('color-hex');

colorInput.oninput = () => {
  hexInput.value = colorInput.value.toUpperCase();
};

hexInput.oninput = () => {
  if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
    colorInput.value = hexInput.value;
  }
};
</script>
```

### Node List

```html
<ul id="node-list" class="node-list"></ul>

<style>
.node-list {
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--figma-color-border);
  border-radius: 4px;
}

.node-item {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-bottom: 1px solid var(--figma-color-border);
}

.node-item:last-child { border-bottom: none; }
.node-item:hover { background: var(--figma-color-bg-hover); }
.node-item.selected { background: var(--figma-color-bg-selected); }

.node-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<script>
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (msg?.type === 'nodes') {
    renderNodes(msg.nodes);
  }
};

function renderNodes(nodes) {
  const list = document.getElementById('node-list');
  list.innerHTML = nodes.map(node => `
    <li class="node-item" data-id="${node.id}">
      <span class="node-icon">${getIcon(node.type)}</span>
      <span class="node-name">${node.name}</span>
    </li>
  `).join('');

  list.querySelectorAll('.node-item').forEach(item => {
    item.onclick = () => {
      parent.postMessage({
        pluginMessage: { type: 'select-node', id: item.dataset.id }
      }, '*');
    };
  });
}

function getIcon(type) {
  const icons = { FRAME: '#', TEXT: 'T', RECTANGLE: '[]', ELLIPSE: 'O', COMPONENT: '<>', INSTANCE: '{}' };
  return icons[type] || '-';
}
</script>
```

---

## Файловый экспорт (скачивание из UI)

```typescript
// code.ts — экспорт ноды и отправка в UI
const bytes = await node.exportAsync({ format: 'PNG' });
figma.ui.postMessage({
  type: 'download',
  bytes: Array.from(bytes),
  filename: `${node.name}.png`,
  mimeType: 'image/png',
});
```

```html
<!-- ui.html — скачивание файла -->
<script>
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (msg?.type === 'download') {
    downloadFile(msg.bytes, msg.filename, msg.mimeType);
  }
};

function downloadFile(bytes, filename, mimeType) {
  const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
</script>
```

---

## Внешние ресурсы

```html
<!-- Внешние шрифты -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<!-- Внешние скрипты (бандлинг предпочтителен) -->
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>

<!--
  Предупреждения:
  - Требуют интернет-соединение
  - Могут замедлить загрузку плагина
  - Бандлить по возможности для лучшего UX
-->
```
