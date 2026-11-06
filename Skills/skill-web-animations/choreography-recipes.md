# Рецепты хореографии

## Назначение

Готовые шаблоны для отношений из [choreography.md](choreography.md); значения — отправные точки, которые настраиваются по записи.

## Overlap: CSS-стаггер через индексную переменную

Для одноразовых входов (герой, вступление личного сайта). Задержка считается для каждого элемента из пользовательского свойства, поэтому не нужен класс на каждый элемент.

```tsx
<div className="stagger">
  <h1 style={{ "--i": 0 }}>Title</h1>
  <p style={{ "--i": 0 }}>First paragraph, same beat as the title</p>
  <p style={{ "--i": 1 }}>Supporting paragraph</p>
  <div style={{ "--i": 2 }}>CTAs</div>
</div>
```

```css
.stagger > * {
  --step: 120ms;
  animation: enter 0.6s ease both;
  animation-delay: calc(var(--step) * var(--i));
}

@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stagger > * {
    animation-name: fade;
    animation-delay: 0ms;
  }
  @keyframes fade {
    from { opacity: 0; }
  }
}
```

- `both` обязателен. `backwards` применяет первый ключевой кадр на время задержки, поэтому поздние элементы не показывают конечное состояние до своей анимации. `forwards` удерживает конечное состояние.
- Без `to` анимация идёт к собственным стилям элемента.
- Смена пользовательского свойства на родителе пересчитывает стили всех потомков, которые его наследуют. Для одноразового входа это нормально, но покадровые значения (перетаскивание) не гоняются через наследуемую переменную на большом дереве.

## Overlap: варианты Motion с неравномерным стаггером

```tsx
import { motion, stagger } from "motion/react";

const list = {
  hidden: {},
  show: {
    transition: {
      // Delays shrink as the group goes on, so it reads as a wave, not a metronome
      delayChildren: stagger(0.06, { ease: "easeOut" }),
    },
  },
};

const lead = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

const support = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
};

const decoration = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

<motion.section variants={list} initial="hidden" animate="show">
  <motion.span variants={decoration}>New</motion.span>
  <motion.h1 variants={lead}>Title</motion.h1>
  <motion.p variants={support}>Subtitle</motion.p>
  <motion.div variants={support}>CTAs</motion.div>
</motion.section>
```

- У каждой роли свой вариант (дистанция, длительность). Стаггер задаёт только *когда* каждый стартует.
- `stagger(0.05, { from: "center" })` расходится от середины. Число-индекс — чтобы расходиться от элемента, с которым взаимодействовал пользователь.
- Старые версии Motion используют `staggerChildren: 0.06` вместо `delayChildren: stagger(...)`.
- В длинных списках элементы после ~6-го получают ту же задержку, что 6-й, чтобы группа никогда не шла дольше ~300ms.

## Together: уходящий элемент — из потока

Соседи закрывают зазор *пока* удалённый элемент гаснет, а не после.

```tsx
<ul>
  <AnimatePresence mode="popLayout" initial={false}>
    {chips.map((chip) => (
      <motion.li
        key={chip.id}
        layout
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      >
        {chip.label}
      </motion.li>
    ))}
  </AnimatePresence>
</ul>
```

Без библиотеки: перед выходом прочитать смещение элемента, поставить ему `position: absolute` с этими `top`/`left` (у родителя нужен `position: relative`), затем анимировать уход. Соседи анимируются через FLIP или просто перестраиваются.

## Together: кроссфейд видов в контейнере меняющейся высоты

Высота контейнера и смена содержимого — один объект: одна длительность, одно семейство кривых.

```tsx
import useMeasure from "react-use-measure";

const [ref, bounds] = useMeasure();
const prevHeight = useRef<number>();

// The fade duration scales with how far the container moves
const fadeDuration = useMemo(() => {
  const MIN = 0.15;
  const MAX = 0.27;
  if (!prevHeight.current) {
    prevHeight.current = bounds.height;
    return MIN;
  }
  const delta = Math.abs(bounds.height - prevHeight.current);
  prevHeight.current = bounds.height;
  return Math.min(Math.max(delta / 500, MIN), MAX);
}, [bounds.height]);

<motion.div
  animate={{ height: bounds.height }}
  transition={{ duration: 0.27, ease: [0.25, 1, 0.5, 1] }}
  style={{ overflow: "hidden" }}
>
  <div ref={ref}>
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        key={view}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: fadeDuration, ease: [0.26, 0.08, 0.25, 1] }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  </div>
</motion.div>
```

- Высота идёт на сильном `ease-out`, содержимое — на более лёгкой кривой того же семейства, поэтому смена видна и не выпадает из синхронизации.
- `key` на ребёнке сообщает `AnimatePresence`, что вид ушёл. Отсутствующий ключ — первое, что проверяется, когда выход не играет.
- ЕСЛИ контейнер — часть большего компонента (шторки) → собственная длительность открытия этого компонента приводится к этой же, чтобы всё ощущалось одним целым.

## Шаги с учётом направления

```tsx
const [[step, direction], setStep] = useState([0, 0]);
const go = (d: 1 | -1) => setStep(([s]) => [s + d, d]);

const variants = {
  initial: (d: number) => ({ x: `${110 * d}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit: (d: number) => ({ x: `${-110 * d}%`, opacity: 0 }),
};

<MotionConfig transition={{ type: "spring", duration: 0.5, bounce: 0 }}>
  <AnimatePresence mode="popLayout" initial={false} custom={direction}>
    <motion.div
      key={step}
      custom={direction}
      variants={variants}
      initial="initial"
      animate="active"
      exit="exit"
    >
      {content}
    </motion.div>
  </AnimatePresence>
  <motion.div layout>{/* Back / Continue follow the height change */}</motion.div>
</MotionConfig>
```

`custom` стоит **и** на `AnimatePresence`, и на ребёнке. Уходящий ребёнок читает последнее направление из `AnimatePresence`; без этого он использует направление, которое было при его монтировании.

Для небольших контейнеров или похожих видов сдвиг на 110% заменяется кроссфейдом со смещением 8px и лёгким размытием: глаза почти не двигаются, а смена читается.

## Sequence: одно рисование за другим

```css
.square {
  animation: draw 0.6s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
}

.checkmark {
  animation: draw 0.4s cubic-bezier(0.645, 0.045, 0.355, 1) forwards;
  animation-delay: 0.6s; /* = the square's duration */
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

С `pathLength="100"` на обоих путях `stroke-dasharray: 100; stroke-dashoffset: 100` прячет каждый круглыми числами. Чтобы передача читалась одним жестом, галочка стартует чуть раньше конца квадрата (например, на 0.5s).

## Sequence: морф двух насыщенных состояний с кроссфейдом

`mode="wait"` — безопасный выбор, когда контейнер между плотными видами меняет ширину *и* высоту. Чтобы всё же сохранить кроссфейд:

1. Активный вид рендерится дважды. Копия A анимирует только **вход**. Копия B стоит с `position: absolute`, на `opacity: 0` и становится видимой только при **выходе**: её выход — ключевые кадры, которые стартуют с `opacity: 1` и гаснут.
2. Уходящей копии задаётся своя трансформация в зависимости от того, куда идёт контейнер: увеличить, если следующее состояние больше, уменьшить, если меньше, со `scaleX`, который тянет её к центру, когда контейнер сужается, чтобы она не вылезала за края.
3. При небольшом числе состояний эти значения (и отскок пружины) задаются вручную для каждой пары состояний и передаются через `custom`. Меньшим состояниям — больше отскока.

## Carry: управление shared layout-анимацией через родителя

С Motion 12.40.0 путь layout-анимации, в том числе общего `layoutId`, задаётся через `transition={{ layout: { path: arc() } }}`. На версиях до 12.40.0 путь не настраивается — тогда двигают контейнер, в который элемент приземляется.

Расхождение с первоисточником: у Эмиля — «You can't customize the path a `layoutId` animation takes» (skills/choreograph/RECIPES.md); по документации Motion, https://motion.dev/docs/react-layout-animations — с версии 12.40.0 путь задаётся через `transition.layout.path` с `arc()`, в том числе для `layoutId`.

```tsx
<motion.div
  animate={{ y: 73 }}
  transition={{ delay: 0.13, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
>
  {selected.map((img) => (
    <motion.img key={img.id} layoutId={img.id} src={img.src} />
  ))}
</motion.div>
```

Картинки морфятся в корзину *и* падают вместе с ней. Передняя стенка корзины показывается с задержкой, рассчитанной на момент, когда картинки почти приземлились, чтобы они никогда заметно не проходили сквозь неё.

## Императивная оркестровка (`useAnimate`)

Только когда несколько элементов согласуются на нескольких событиях и нужно дожидаться завершения.

```tsx
const [scope, animate] = useAnimate();
const running = useRef<ReturnType<typeof animate>[]>([]);
const ready = useRef(false); // a flag that never renders, so no useState

function play(steps: ReturnType<typeof animate>[]) {
  running.current.forEach((a) => a.stop()); // never stack sequences
  running.current = steps;
  return Promise.all(steps);
}

const onEnter = async () => {
  ready.current = false;
  await play([
    animate("[data-animate='icon']", { y: -4 }, { duration: 0.3 }),
    ...[...scope.current.querySelectorAll("[data-animate='line']")].map((el, i) =>
      animate(
        el,
        { strokeDashoffset: [1.05, 0] },
        { duration: 0.5, times: [0.7, 0.9], delay: i === 1 ? 0 : 0.04 },
      ),
    ),
  ]);
  ready.current = true;
};

const onClick = () => {
  if (!ready.current) return;
  // A repeat action skips the buildup: the same proportions, earlier in the timeline
  play([animate("[data-animate='bg']", { scale: [1, 0.96, 1.02, 1] }, { duration: 0.4 })]);
};

const onLeave = async () => {
  await play([/* reset every element */]);
  startIdle(); // only once the reset has finished
};

function startIdle() {
  // Tracked in `running`, so the next onEnter stops the loop
  running.current = [
    animate("[data-animate='icon']", { y: [0, -3, 0] }, {
      delay: 2.5,
      repeat: Infinity,
      repeatDelay: 6,
    }),
  ];
}
```

- Элементы выбираются селекторами `data-animate` внутри `scope`, а не отдельным ref на каждый элемент.
- `Promise.all` ожидается, когда длительности разные. Ожидать одну анимацию безопасно, только если у всех одна длительность.
