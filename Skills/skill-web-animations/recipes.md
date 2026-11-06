# Рецепты анимаций

## Назначение

Каталог готовых реализаций частых случаев: процедура начинает с рецепта и адаптирует его, а не собирает с нуля.

Кривые — токены `--ease-out`, `--ease-in-out` и `--ease-drawer` из раздела «Кривая» [motion-values.md](motion-values.md).

Селекторы `[data-starting-style]`, `[data-ending-style]`, `[data-instant]` и переменную `--transform-origin` в рецептах поповера, подсказки и модалки выставляет Base UI. ЕСЛИ в проекте нет Base UI → вход задаётся через `@starting-style`, выход — собственным атрибутом состояния, `transform-origin` — по стороне триггера.

---

## Нажатие кнопки

Любой нажимаемый элемент. Мгновенное подтверждение, что интерфейс услышал пользователя.

```css
.button {
  transition: transform 160ms var(--ease-out);
}

.button:active {
  transform: scale(0.97);
}
```

`scale()` масштабирует и детей — подпись и иконки едут вместе, поэтому нажатие читается как физическое.

По спецификации `:active` действует, пока палец касается экрана, поэтому ограничивать его медиазапросом не нужно. В Safari на iOS страница без обработчиков касаний `:active` не получает (ошибка WebKit 138816): отклик на нажатие проверяется на iPhone. Любой `:hover` ограничивается медиазапросом отдельно.

Расхождение с первоисточником: у Эмиля — «No hover gating needed here: `:active` is a real press on touch.» (skills/animate/RECIPES.md); по WebKit, https://bugs.webkit.org/show_bug.cgi?id=138816 — в Safari на iOS поведение `:active` при касании зависит от наличия обработчиков касаний.

---

## Выпадающий список, поповер, меню, select

Масштабируется из своего триггера, а не из воздуха.

```css
.popover {
  transform-origin: var(--transform-origin); /* Base UI supplies this */
  transition:
    opacity 200ms var(--ease-out),
    transform 200ms var(--ease-out);
}

.popover[data-starting-style],
.popover[data-ending-style] {
  opacity: 0;
  transform: scale(0.95);
}
```

Весь смысл — в `transform-origin`: панель должна выглядеть так, будто вышла из того, на что нажали.

---

## Подсказка

Та же форма, что у поповера, быстрее, плюс деталь, которую большинство реализаций упускает.

```css
.tooltip {
  transform-origin: var(--transform-origin);
  transition:
    transform 125ms var(--ease-out),
    opacity 125ms var(--ease-out);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* Once one tooltip is open, neighbours open instantly */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

Начальная задержка защищает от случайного открытия. После первой подсказки соседние открываются без задержки и без анимации — вся панель инструментов ощущается быстрее.

---

## Модалка

Единственный поповер, который остаётся по центру.

```css
.modal {
  transform-origin: center; /* exempt — not anchored to a trigger */
  transition:
    opacity 250ms var(--ease-out),
    transform 250ms var(--ease-out);
}

.modal[data-starting-style],
.modal[data-ending-style] {
  opacity: 0;
  transform: scale(0.96);
}

.backdrop {
  transition: opacity 250ms var(--ease-out);
}
```

Прозрачность подложки анимируется вместе с модалкой, чтобы они читались как одна поверхность.

---

## Шторка

```css
.drawer {
  transform: translateY(0);
  transition: transform 500ms var(--ease-drawer);
}

.drawer[data-closed] {
  transform: translateY(100%);
}
```

Так Vaul прячет шторку перед анимацией входа. Если добавить перетаскивание, это уже задача жеста — рецепт «Смахивание» ниже.

---

## Тост

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 400ms ease,
    transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

- `ease`, а не `ease-out`, и немного медленнее типичного интерфейса: Sonner читается изящным отчасти потому, что его движение подобрано под характер компонента, а не под общий бюджет интерфейса.
- ЕСЛИ `@starting-style` недоступен → запасной путь через флаг монтирования:

```jsx
useEffect(() => { setMounted(true); }, []);
// <div data-mounted={mounted}>
```

Когда тосты складываются в стопку и список перестраивается, изменение прозрачности должно работать против изменения высоты. Формулы для этой пары нет — значения двигают, пока не станет правильно, и проверяют снова на следующий день.

---

## Аккордеон

```css
.content {
  overflow: hidden;
  transition:
    height 200ms var(--ease-out),
    opacity 200ms var(--ease-out);
}
```

Длительность короткая: это одна из немногих анимаций, которая платит раскладкой на каждом кадре, поэтому долгая длительность и дорогая, и вязкая. Анимировать к `auto` можно через `interpolate-size: allow-keywords`, но только в Chrome 129+; в Firefox и Safari нет (данные совместимости MDN на 2026-11-06). Поэтому высоту измеряют в JS или берут у headless-примитива.

Расхождение с первоисточником: у Эмиля — «Measure the content height in JS (or use a headless primitive that supplies it) rather than animating to `auto`.» (skills/animate/RECIPES.md); по MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size — анимация к `auto` возможна через `interpolate-size: allow-keywords` в Chrome 129+.

---

## Вход группы со стаггером

Для списка или сетки, которые пользователь видит изредка, — не для списка, мимо которого он прокручивает весь день.

```css
.item {
  opacity: 0;
  transform: translateY(8px);
  animation: fadeIn 300ms var(--ease-out) forwards;
}

.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
.item:nth-child(4) { animation-delay: 150ms; }

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Стаггер декоративен — он никогда не блокирует взаимодействие, пока играет.

---

## Удержание для подтверждения

Для разрушительных действий, где обычный клик слишком легко сделать случайно.

```css
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms var(--ease-out); /* release: snappy */
}

.button:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;             /* press: slow and deliberate */
}

.button:active {
  transform: scale(0.97);
}
```

`linear` здесь верен: заливка — индикатор прогресса, а прогресс не должен ускоряться и замедляться.

---

## Индикатор вкладок с переходом цвета

Отдельные переходы цвета по списку вкладок никогда не попадают точно. Вместо них — обрезка.

Список вкладок дублируется. Копия оформляется как активное состояние — другой фон, другой цвет текста. Копия обрезается так, чтобы был виден только активный таб, и обрезка анимируется при смене:

```css
.tabs-active-copy {
  clip-path: inset(0 60% 0 20%); /* driven by the active tab's position */
  transition: clip-path 250ms var(--ease-in-out);
}
```

Текст и фон меняются вместе и синхронно, потому что это один элемент, который открывается, а не два интерполируемых цвета.

---

## Раскрытие при скролле

Только для маркетинговых страниц. Не для функционального интерфейса, который пользователь посещает каждый день.

```css
.reveal {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 600ms var(--ease-in-out);
}

.reveal[data-visible] {
  clip-path: inset(0 0 0 0);
}
```

Запуск — через `IntersectionObserver` или `useInView` из Motion с `{ once: true, margin: "-100px" }`. Срабатывает один раз: повторная анимация при каждом проходе мимо — интерфейс, который борется со своим читателем. Так же раскрываются картинки: старт `clip-path: inset(0 0 100% 0)` (скрыто снизу), цель `inset(0 0 0 0)` при входе в видимую область.

---

## Смахивание

Рецепт жеста. Пружины, а не длительности, потому что пользователь может развернуть движение на середине.

```js
// Dismiss on a flick, not just on distance
const timeTaken = Date.now() - dragStartTime.current;
const velocity = Math.abs(swipeAmount) / timeTaken;

if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

```js
// Set transform on the dragged element directly.
// Driving it through a CSS variable on the parent recalcs styles for every child.
element.style.transform = `translateY(${distance}px)`;
```

Четыре детали, которые отделяют хорошее перетаскивание от плохого:

- **Захват указателя** с начала перетаскивания, чтобы оно продолжалось, когда указатель выходит за границы элемента.
- **Защита от мультитача** — `if (isDragging) return` на новые точки касания, иначе смена пальца посреди перетаскивания заставляет элемент прыгнуть.
- **Демпфирование за границами** — за естественным краем элемент сдвигается тем меньше, чем дальше его тянут. Реальные вещи замедляются, прежде чем остановиться.
- **Трение, а не стена** — перетягивание разрешено с растущим сопротивлением, а не запрещено.

Перетаскивание завершается пружиной, чтобы прерванный жест сохранил скорость:

```js
{ type: "spring", mass: 1, stiffness: 100, damping: 16 }
```

Скорость отпускания передаётся в опции `velocity` в пикселях в секунду; пружина на `duration` + `bounce` скорость отбрасывает. Значение расчётное: коэффициент демпфирования ζ = damping / (2 · √(stiffness · mass)) = 16 / (2 · √100) = 0.8.

Расхождение с первоисточником: у Эмиля — «Settle with a spring so an interrupted drag keeps its velocity» (skills/animate/RECIPES.md) с пружиной `{ type: "spring", duration: 0.5, bounce: 0.2 }`; по документации Motion, https://motion.dev/docs/react-transitions — пружина на `duration` + `bounce` скорость не учитывает, скорость переносит только физическая пружина.

Передача скорости и проекция точки остановки — в [gestures-and-springs.md](gestures-and-springs.md).

---

## Маскировка кроссфейда, который не встаёт

ЕСЛИ во время перехода видно наложение двух состояний и никакая настройка кривой или длительности не помогает → размыть шов:

```css
.content {
  transition:
    filter 200ms ease,
    opacity 200ms ease;
}

.content.transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

Без размытия глаз видит два разных объекта, которые меняются местами. Размытие сливает их в одно воспринимаемое превращение. Размытие меньше 20px; по наблюдению Эмиля Ковальски, тяжёлое размытие дорого, особенно в Safari.

---

## Программная анимация без библиотеки

Когда движению нужно управление из JS, но не зависимость:

```js
element.animate(
  [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
  { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }
);
```

WAAPI даёт управление из JavaScript без библиотеки и относится к самым производительным способам анимации в вебе. Вынос на компоновщик зависит от свойства и браузера: `clip-path` из примера — в Chromium да, в Firefox нет. Анимацию можно поставить на паузу, развернуть и отменить, но текущее значение при замене одной анимации другой она не подхватывает, как CSS-переход.

Расхождение с первоисточником: у Эмиля — «Hardware-accelerated, interruptible, and no library needed.» (skills/emil-design-eng/SKILL.md); по MDN, https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API — ускорение зависит от свойства и браузера, автоматического подхвата текущего значения у WAAPI нет.

---

## Устройство `clip-path: inset()`

`clip-path: inset(top right bottom left)` задаёт прямоугольную область обрезки: каждое значение «съедает» элемент со своей стороны.

```css
/* Fully hidden from right */
.hidden {
  clip-path: inset(0 100% 0 0);
}

/* Fully visible */
.visible {
  clip-path: inset(0 0 0 0);
}

/* Reveal from left to right */
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms ease-out;
}
.button:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;
}
```

---

## 3D-трансформации

Глубину `rotateX()` и `rotateY()` дают только вместе с перспективой (`perspective` или функция `perspective()`); `transform-style: preserve-3d` помещает потомков в общий 3D-контекст, сами элементы остаются плоскими; `opacity`, фильтры и обрезка на элементе с `preserve-3d` переводят его в `flat`. Орбиты, перевороты монеты и эффекты глубины возможны без JavaScript.

Расхождение с первоисточником: у Эмиля — «`rotateX()`, `rotateY()` with `transform-style: preserve-3d` create real 3D effects in CSS.» (skills/emil-design-eng/SKILL.md); по CSS Transforms Level 2, https://drafts.csswg.org/css-transforms-2/#3d-rendering-contexts — глубину даёт перспектива, `preserve-3d` объединяет потомков в один 3D-контекст.

```css
.wrapper {
  transform-style: preserve-3d;
}

@keyframes orbit {
  from {
    transform: translate(-50%, -50%) rotateY(0deg) translateZ(72px) rotateY(360deg);
  }
  to {
    transform: translate(-50%, -50%) rotateY(360deg) translateZ(72px) rotateY(0deg);
  }
}
```

---

## Слайдер сравнения

Две картинки накладываются друг на друга. Верхняя обрезается `clip-path: inset(0 50% 0 0)`, правый отступ меняется по положению перетаскивания. Лишних элементов DOM не нужно. Слайдер, который пишет `clip-path` из обработчика перетаскивания, обновляет стиль на главном потоке; анимация `clip-path` выносится на компоновщик в Chromium и не выносится в Firefox.

Расхождение с первоисточником: у Эмиля — «No extra DOM elements needed, fully hardware-accelerated.» (skills/emil-design-eng/SKILL.md); по исходному коду Chromium, https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/animation/compositor_animations.cc — на компоновщик анимация `clip-path` выносится в Chromium, в Firefox нет, а запись стиля из обработчика — работа главного потока.

---

## Пружинное следование за курсором

Прямая привязка визуального изменения к положению мыши выглядит искусственно: у неё нет движения. Пружина интерполирует изменение значения. Только для декоративного движения: на функциональном графике в банковском приложении лучше без анимации.

`useSpring` следует за значением, только если ему передан motion value; число берётся лишь как начальное.

```jsx
import { useMotionValue, useTransform, useSpring } from "motion/react";

const mouseX = useMotionValue(0);
const rotation = useTransform(mouseX, (x) => x * 0.1);
const springRotation = useSpring(rotation, { stiffness: 100, damping: 10 });
```

Расхождение с первоисточником: у Эмиля — «const springRotation = useSpring(mouseX * 0.1, {» (skills/emil-design-eng/SKILL.md); по документации Motion, https://motion.dev/docs/react-use-spring — за источником `useSpring` следует, только если это motion value; число задаёт лишь начальное значение.
