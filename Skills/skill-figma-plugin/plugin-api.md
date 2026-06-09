# Figma Plugin API Reference

## Назначение

Полный справочник Figma Plugin API: глобальные объекты, типы нод, свойства (mixins), Paint types, эффекты, Auto Layout, стили, переменные (Variables), события, экспорт.

## Глобальный объект figma

Главная точка входа, доступна в main thread.

```typescript
// Документ
figma.root                    // DocumentNode
figma.currentPage             // PageNode
figma.currentPage.selection   // readonly SceneNode[]

// Создание нод
figma.createRectangle()
figma.createEllipse()
figma.createPolygon()
figma.createStar()
figma.createLine()
figma.createFrame()
figma.createComponent()
figma.createComponentSet()
figma.createText()
figma.createBooleanOperation()
figma.createVector()
figma.createSlice()
figma.createConnector()        // FigJam
figma.createSticky()           // FigJam
figma.createShapeWithText()    // FigJam

// UI
figma.showUI(__html__, options?)
figma.ui.postMessage(message)
figma.ui.onmessage = (msg) => {}
figma.ui.resize(width, height)
figma.ui.close()
figma.closePlugin(message?)

// Viewport
figma.viewport.center          // Vector
figma.viewport.zoom            // number
figma.viewport.scrollAndZoomIntoView(nodes)

// Стили
figma.getLocalPaintStyles()
figma.getLocalTextStyles()
figma.getLocalEffectStyles()
figma.getLocalGridStyles()
figma.createPaintStyle()
figma.createTextStyle()
figma.createEffectStyle()
figma.createGridStyle()

// Поиск
figma.getNodeById(id)
figma.getStyleById(id)
figma.currentPage.findAll(callback?)
figma.currentPage.findOne(callback)
figma.currentPage.findChildren(callback?)
figma.currentPage.findAllWithCriteria({ types: [...] })

// События
figma.on('selectionchange', callback)
figma.on('currentpagechange', callback)
figma.on('close', callback)
figma.on('run', callback)
figma.on('drop', callback)
figma.once(event, callback)
figma.off(event, callback)

// Уведомления
figma.notify(message, options?)

// Хранилище
figma.clientStorage.getAsync(key)
figma.clientStorage.setAsync(key, value)
figma.clientStorage.deleteAsync(key)
figma.clientStorage.keysAsync()

// Шрифты
figma.loadFontAsync(fontName)
figma.listAvailableFontsAsync()

// Изображения
figma.createImage(data)        // Uint8Array
figma.getImageByHash(hash)

// Переменные (Design Tokens)
figma.variables.getLocalVariables()
figma.variables.getLocalVariableCollections()
figma.variables.createVariable(name, collectionId, type)
figma.variables.createVariableCollection(name)

// Параметризованные плагины
figma.parameters.on('input', callback)

// Payments
figma.payments.getPluginPaymentTokenAsync()
figma.payments.initiateCheckoutAsync(options)
```

---

## Типы нод

### Обзор

| Категория | Типы |
|----------|------|
| **Контейнеры** | PageNode, FrameNode, GroupNode, SectionNode |
| **Фигуры** | RectangleNode, EllipseNode, PolygonNode, StarNode, LineNode, VectorNode |
| **Текст** | TextNode |
| **Компоненты** | ComponentNode, ComponentSetNode, InstanceNode |
| **Медиа** | ImageNode (через fills) |
| **Специальные** | BooleanOperationNode, SliceNode, ConnectorNode |

### Структура документа

```typescript
// DocumentNode (figma.root)
interface DocumentNode {
  readonly type: 'DOCUMENT';
  readonly children: readonly PageNode[];
  name: string;
}

// PageNode
interface PageNode {
  readonly type: 'PAGE';
  readonly children: readonly SceneNode[];
  name: string;
  selection: readonly SceneNode[];
  selectedTextRange: { node: TextNode; start: number; end: number } | null;
  backgrounds: readonly Paint[];
  guides: readonly Guide[];

  // Методы поиска
  findAll(callback?: (node: SceneNode) => boolean): SceneNode[];
  findOne(callback: (node: SceneNode) => boolean): SceneNode | null;
  findChildren(callback?: (node: SceneNode) => boolean): SceneNode[];
  findAllWithCriteria(criteria: { types: NodeType[] }): SceneNode[];
}
```

### Frame и Group

```typescript
interface FrameNode {
  readonly type: 'FRAME';

  // Дочерние элементы
  readonly children: readonly SceneNode[];
  appendChild(child: SceneNode): void;
  insertChild(index: number, child: SceneNode): void;

  // Позиция и размер
  x: number;
  y: number;
  width: number;
  height: number;
  resize(width: number, height: number): void;
  resizeWithoutConstraints(width: number, height: number): void;

  // Auto Layout
  layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode: 'FIXED' | 'AUTO';
  counterAxisSizingMode: 'FIXED' | 'AUTO';
  primaryAxisAlignItems: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  itemSpacing: number;

  // Внешний вид
  fills: readonly Paint[];
  strokes: readonly Paint[];
  strokeWeight: number;
  cornerRadius: number;
  opacity: number;
  effects: readonly Effect[];

  // Constraints
  constraints: Constraints;

  // Clipping
  clipsContent: boolean;
}

interface GroupNode {
  readonly type: 'GROUP';
  readonly children: readonly SceneNode[];
  // Группы НЕ имеют fills/strokes напрямую
  // Только transform
}
```

### Фигуры

```typescript
interface RectangleNode {
  readonly type: 'RECTANGLE';
  x: number;
  y: number;
  width: number;
  height: number;

  // Скругление углов
  cornerRadius: number;
  topLeftRadius: number;
  topRightRadius: number;
  bottomLeftRadius: number;
  bottomRightRadius: number;

  // Внешний вид
  fills: readonly Paint[];
  strokes: readonly Paint[];
  strokeWeight: number;
  strokeAlign: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  opacity: number;
  effects: readonly Effect[];
}

interface EllipseNode {
  readonly type: 'ELLIPSE';
  x: number;
  y: number;
  width: number;
  height: number;
  arcData: ArcData;
  fills: readonly Paint[];
  strokes: readonly Paint[];
}

interface PolygonNode {
  readonly type: 'POLYGON';
  pointCount: number;  // Количество сторон
  // + те же свойства внешнего вида
}

interface StarNode {
  readonly type: 'STAR';
  pointCount: number;
  innerRadius: number;  // 0-1, соотношение внутреннего и внешнего радиуса
  // + те же свойства внешнего вида
}

interface LineNode {
  readonly type: 'LINE';
  x: number;
  y: number;
  width: number;  // Длина линии
  rotation: number;
  strokes: readonly Paint[];
  strokeWeight: number;
  strokeCap: 'NONE' | 'ROUND' | 'SQUARE' | 'ARROW_LINES' | 'ARROW_EQUILATERAL';
}

interface VectorNode {
  readonly type: 'VECTOR';
  vectorNetwork: VectorNetwork;
  vectorPaths: VectorPaths;
  // Для сложных путей
}
```

### Текст

```typescript
interface TextNode {
  readonly type: 'TEXT';

  // Контент — ОБЯЗАТЕЛЬНО загрузить шрифт перед записью
  characters: string;

  // Шрифт
  fontName: FontName | typeof figma.mixed;
  fontSize: number | typeof figma.mixed;
  fontWeight: number | typeof figma.mixed;

  // Выравнивание
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
  textAutoResize: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE';

  // Стилизация
  textCase: TextCase | typeof figma.mixed;
  textDecoration: TextDecoration | typeof figma.mixed;
  letterSpacing: LetterSpacing | typeof figma.mixed;
  lineHeight: LineHeight | typeof figma.mixed;
  paragraphIndent: number;
  paragraphSpacing: number;

  // Range-методы (для mixed styles)
  getRangeFontName(start: number, end: number): FontName | typeof figma.mixed;
  setRangeFontName(start: number, end: number, value: FontName): void;
  getRangeFontSize(start: number, end: number): number | typeof figma.mixed;
  setRangeFontSize(start: number, end: number, value: number): void;
  getRangeFills(start: number, end: number): Paint[] | typeof figma.mixed;
  setRangeFills(start: number, end: number, value: Paint[]): void;

  // Гиперссылки
  getRangeHyperlink(start: number, end: number): HyperlinkTarget | null;
  setRangeHyperlink(start: number, end: number, value: HyperlinkTarget | null): void;
}

interface FontName {
  family: string;
  style: string;  // 'Regular', 'Bold', 'Italic', и т.д.
}

// Загрузка шрифта перед использованием
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
```

### Компоненты

```typescript
interface ComponentNode {
  readonly type: 'COMPONENT';

  // Все свойства FrameNode, плюс:
  readonly key: string;  // Уникальный идентификатор
  description: string;
  documentationLinks: readonly DocumentationLink[];

  // Создание инстанса
  createInstance(): InstanceNode;
}

interface ComponentSetNode {
  readonly type: 'COMPONENT_SET';
  readonly children: readonly ComponentNode[];  // Варианты
}

interface InstanceNode {
  readonly type: 'INSTANCE';

  // Ссылка на главный компонент
  readonly mainComponent: ComponentNode | null;

  // Overrides
  overrides: readonly Override[];

  // Замена компонента
  swapComponent(newComponent: ComponentNode): void;

  // Отсоединение от компонента
  detachInstance(): FrameNode;

  // Сброс overrides
  resetOverrides(): void;
}
```

---

## Paint Types

```typescript
type Paint = SolidPaint | GradientPaint | ImagePaint | VideoPaint;

interface SolidPaint {
  type: 'SOLID';
  color: RGB;
  opacity?: number;  // 0-1
  visible?: boolean;
  blendMode?: BlendMode;
}

interface GradientPaint {
  type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND';
  gradientStops: readonly ColorStop[];
  gradientTransform: Transform;
  opacity?: number;
  visible?: boolean;
}

interface ColorStop {
  position: number;  // 0-1
  color: RGBA;
}

interface ImagePaint {
  type: 'IMAGE';
  imageHash: string | null;
  scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE';
  imageTransform?: Transform;
  scalingFactor?: number;
  rotation?: number;
  filters?: ImageFilters;
  opacity?: number;
  visible?: boolean;
}

// Создание image paint
const imageData: Uint8Array = /* загрузить bytes изображения */;
const image = figma.createImage(imageData);
node.fills = [{
  type: 'IMAGE',
  imageHash: image.hash,
  scaleMode: 'FILL',
}];
```

---

## Effects

```typescript
type Effect = DropShadowEffect | InnerShadowEffect | BlurEffect | BackgroundBlurEffect;

interface DropShadowEffect {
  type: 'DROP_SHADOW';
  color: RGBA;
  offset: Vector;
  radius: number;
  spread?: number;
  visible: boolean;
  blendMode: BlendMode;
  showShadowBehindNode?: boolean;
}

interface InnerShadowEffect {
  type: 'INNER_SHADOW';
  color: RGBA;
  offset: Vector;
  radius: number;
  spread?: number;
  visible: boolean;
  blendMode: BlendMode;
}

interface BlurEffect {
  type: 'LAYER_BLUR';
  radius: number;
  visible: boolean;
}

interface BackgroundBlurEffect {
  type: 'BACKGROUND_BLUR';
  radius: number;
  visible: boolean;
}

// Пример
node.effects = [
  {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.25 },
    offset: { x: 0, y: 4 },
    radius: 8,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  }
];
```

---

## Auto Layout

```typescript
// Включить auto layout
frame.layoutMode = 'VERTICAL';  // или 'HORIZONTAL'

// Направление и выравнивание
frame.primaryAxisAlignItems = 'CENTER';     // Главная ось: MIN, CENTER, MAX, SPACE_BETWEEN
frame.counterAxisAlignItems = 'CENTER';     // Поперечная ось: MIN, CENTER, MAX, BASELINE

// Размеры
frame.primaryAxisSizingMode = 'AUTO';       // FIXED или AUTO (hug)
frame.counterAxisSizingMode = 'AUTO';       // FIXED или AUTO (hug)

// Padding
frame.paddingTop = 16;
frame.paddingBottom = 16;
frame.paddingLeft = 16;
frame.paddingRight = 16;

// Gap между элементами
frame.itemSpacing = 8;

// Wrap
frame.layoutWrap = 'WRAP';  // или 'NO_WRAP'

// Свойства дочерних элементов (когда родитель имеет auto layout)
child.layoutPositioning = 'AUTO';           // или 'ABSOLUTE'
child.layoutAlign = 'STRETCH';              // INHERIT, STRETCH, MIN, CENTER, MAX
child.layoutGrow = 1;                       // Flex grow

// Заполнение контейнера
child.layoutSizingHorizontal = 'FILL';      // FIXED, HUG, или FILL
child.layoutSizingVertical = 'HUG';
```

---

## Стили

```typescript
// Получить существующие стили
const paintStyles = figma.getLocalPaintStyles();
const textStyles = figma.getLocalTextStyles();
const effectStyles = figma.getLocalEffectStyles();

// Создать paint style
const style = figma.createPaintStyle();
style.name = 'Brand/Primary';
style.paints = [{ type: 'SOLID', color: { r: 0, g: 0.5, b: 1 } }];

// Применить стиль к ноде
node.fillStyleId = style.id;

// Создать text style
const textStyle = figma.createTextStyle();
textStyle.name = 'Heading/H1';
textStyle.fontName = { family: 'Inter', style: 'Bold' };
textStyle.fontSize = 32;
textStyle.lineHeight = { value: 40, unit: 'PIXELS' };

// Применить text style
textNode.textStyleId = textStyle.id;

// Создать effect style
const effectStyle = figma.createEffectStyle();
effectStyle.name = 'Shadow/Medium';
effectStyle.effects = [
  {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.15 },
    offset: { x: 0, y: 4 },
    radius: 12,
    visible: true,
    blendMode: 'NORMAL',
  }
];

// Применить effect style
node.effectStyleId = effectStyle.id;
```

---

## Переменные (Variables / Design Tokens)

```typescript
// Получить переменные
const variables = figma.variables.getLocalVariables();
const collections = figma.variables.getLocalVariableCollections();

// Создать коллекцию
const collection = figma.variables.createVariableCollection('Colors');

// Добавить mode (для тем)
const darkModeId = collection.addMode('Dark');
const lightModeId = collection.defaultModeId;  // Уже существует

// Создать переменную
const primaryColor = figma.variables.createVariable(
  'color/primary',
  collection.id,
  'COLOR'
);

// Установить значения по mode
primaryColor.setValueForMode(lightModeId, { r: 0, g: 0.5, b: 1 });
primaryColor.setValueForMode(darkModeId, { r: 0.3, g: 0.7, b: 1 });

// Привязать переменную к ноде
node.setBoundVariable('fills', primaryColor.id);

// Типы переменных
type VariableResolvedDataType =
  | 'BOOLEAN'
  | 'FLOAT'
  | 'STRING'
  | 'COLOR';
```

### Extended Variable Collections (ноябрь 2025)

Extended collections позволяют создавать темы на основе родительских коллекций. Extension наследует все modes и переменные из родительской коллекции, но позволяет переопределять значения для темы.

```typescript
// Расширить локальную коллекцию
const themeCollection = variableCollection.extend('Dark Theme');

// Расширить библиотечную коллекцию
const extended = await figma.variables.extendLibraryCollectionByKeyAsync(
  collectionKey,
  'Custom Theme'
);

// Получить ID корневой коллекции (январь 2026)
const rootId = extendedCollection.rootVariableCollectionId;
```

---

## События

```typescript
// Изменение selection
figma.on('selectionchange', () => {
  console.log('Selection:', figma.currentPage.selection);
});

// Смена страницы
figma.on('currentpagechange', () => {
  console.log('Current page:', figma.currentPage.name);
});

// Изменение документа (отслеживание конкретных изменений)
figma.on('documentchange', (event) => {
  for (const change of event.documentChanges) {
    console.log(change.type, change.id);
  }
});

// Закрытие плагина
figma.on('close', () => {
  // Cleanup
});

// Drop event (drag & drop на canvas)
figma.on('drop', (event) => {
  const { items, dropMetadata } = event;
  // items: перетащенные файлы/данные
  // dropMetadata: информация о позиции
  return false;  // false — Figma обработает, true — отменить
});

// Удаление listener
const handler = () => {};
figma.on('selectionchange', handler);
figma.off('selectionchange', handler);

// Once — автоудаление после первого вызова
figma.once('selectionchange', () => {
  console.log('First selection change only');
});
```

---

## Экспорт

```typescript
interface ExportSettings {
  format: 'PNG' | 'JPG' | 'SVG' | 'PDF';
  suffix?: string;
  contentsOnly?: boolean;
  constraint?: {
    type: 'SCALE' | 'WIDTH' | 'HEIGHT';
    value: number;
  };
}

// Экспорт ноды
const bytes = await node.exportAsync({
  format: 'PNG',
  constraint: { type: 'SCALE', value: 2 },  // 2x
});

// Экспорт как SVG строка
const svgBytes = await node.exportAsync({ format: 'SVG' });
const svg = String.fromCharCode(...svgBytes);

// Отправить в UI для скачивания
figma.ui.postMessage({
  type: 'export',
  data: Array.from(bytes),
  filename: `${node.name}.png`,
});
```

---

## Вспомогательные API

### figma.mixed

```typescript
// Когда свойство имеет разные значения в выделении
if (textNode.fontSize === figma.mixed) {
  console.log('Mixed font sizes');
} else {
  console.log('Font size:', textNode.fontSize);
}
```

### Clone

```typescript
// Клонирование ноды
const clone = node.clone();

// Клон возвращает тот же тип
const rectClone = rectangleNode.clone();  // RectangleNode
```

### Поиск нод

```typescript
// Найти все текстовые ноды на странице
const textNodes = figma.currentPage.findAll(
  (node) => node.type === 'TEXT'
) as TextNode[];

// Найти первый frame с именем
const header = figma.currentPage.findOne(
  (node) => node.type === 'FRAME' && node.name === 'Header'
) as FrameNode | null;

// Поиск по типу (быстрее)
const allFrames = figma.currentPage.findAllWithCriteria({
  types: ['FRAME']
});

// Поиск среди прямых детей
const directTextChildren = parentFrame.findChildren(
  (node) => node.type === 'TEXT'
);
```

### Абсолютная позиция

```typescript
// Получить абсолютную позицию (относительно страницы)
const absoluteX = node.absoluteTransform[0][2];
const absoluteY = node.absoluteTransform[1][2];

// Или через absoluteBoundingBox
const bounds = node.absoluteBoundingBox;
if (bounds) {
  console.log(bounds.x, bounds.y, bounds.width, bounds.height);
}
```

---

## Цвета: RGB в Figma

**Важно:** Figma использует RGB в диапазоне 0-1, а не 0-255.

```typescript
const red: RGB = { r: 1, g: 0, b: 0 };
const blue: RGB = { r: 0, g: 0, b: 1 };

// С альфа-каналом
const semiTransparent: RGBA = { r: 1, g: 0, b: 0, a: 0.5 };

// Конвертация hex -> RGB
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  } : { r: 0, g: 0, b: 0 };
}

// Применить solid fill
node.fills = [{ type: 'SOLID', color: hexToRgb('#FF5733') }];
```

---

## Хранилище

```typescript
// Per-document storage (привязано к пользователю)
await figma.clientStorage.setAsync('key', { data: 'value' });
const data = await figma.clientStorage.getAsync('key');

// Per-node storage (переживает copy/paste)
node.setPluginData('key', JSON.stringify({ saved: true }));
const nodeData = JSON.parse(node.getPluginData('key') || '{}');

// Shared storage (доступно между плагинами, используй namespace)
node.setSharedPluginData('com.myplugin', 'key', 'value');
```
