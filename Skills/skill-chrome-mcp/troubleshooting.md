# Диагностика: видимые ошибки и симптомы

Здесь класс «есть видимая ошибка или отчётливый симптом». Если внешнего признака поломки нет, а результат неверен, — вам в [silent-failures.md](silent-failures.md).

---

## Словарь дословных текстов ошибок

Тексты приведены дословно: по ним ситуация опознаётся по первым словам, без гадания.

### От браузерных инструментов (наблюдение)

| Текст | Что означает | Что делать |
|---|---|---|
| `Couldn't determine which page this action targets. Re-read tabs_context_mcp and try again.` | Идентификатор вкладки недействителен | Вызвать `tabs_context_mcp` заново и взять актуальный `tabId` |
| `Can't interact with browser-internal or unparseable URLs. Navigate to a web page first.` | Переход на служебный адрес или `about:blank` | Перейти на обычный адрес. Отказ происходит до перехода, состояние вкладки не потеряно |
| `Failed to read page: The extensions gallery cannot be scripted.` | Чтение страницы магазина расширений | Обходного пути нет, см. ниже |
| `Error capturing screenshot: The extensions gallery cannot be scripted.` | Снимок страницы магазина расширений | То же |
| `"cmd+=" was not pressed: page zoom keyboard shortcuts are not supported. To magnify part of the page for closer inspection, use the zoom action with a region instead.` | Попытка масштабировать страницу сочетанием клавиш | Использовать действие `zoom` с областью |
| `Failed to resize window: Dimensions exceed 8K resolution limit. Maximum dimensions are 7680x4320` | Запрошенный размер больше предела; проверка по каждой стороне отдельно | Уменьшить сторону, превысившую предел |
| `Failed to resize window: Invalid value for bounds. Bounds must be at least 50% within visible screen space.` | Окно ушло бы с экрана | Уменьшить размер или подвинуть окно |
| `Failed to resize window: Both width and height parameters are required` | Передан ноль: он трактуется как отсутствующий параметр | Передать положительные числа |
| `Failed to resize window: Width and height must be positive numbers` | Переданы отрицательные значения | То же |
| `Cannot upload "…": total upload size would exceed 10 MB. file_upload sends file contents over the browser bridge in a single message; …` | Превышен предел загрузки | Файл поменьше либо несколько вызовов подряд, если страница принимает файлы по одному |
| `Cannot upload "…": only files this session is allowed to read can be uploaded. Ask the user to share the file with this session, or to add its folder with /add-dir.` | Файла нет или сессии не разрешено его читать | Проверить путь; попросить пользователя выполнить `/add-dir` |
| `The requested screenshot is no longer available (it may have expired, or was not taken in this session). Take a new screenshot with the computer tool and retry the upload with its new ID.` | Идентификатор снимка протух | Сделать снимок заново непосредственно перед загрузкой |
| `The query "…" does not match any elements in the accessibility tree.` + краткое описание того, что на странице есть | У `find` нет совпадений. Это **ошибка**, а не пустой список: внутри `browser_batch` она рвёт пакет | Свериться со снимком: элемент может лежать в теневом дереве или чужом кадре |
| `actions[N] (имя) failed: … (K completed, M remaining)` | Ошибка внутри пакета; нумерация с нуля | Пакет остановился на действии N. Повторять надо только оставшиеся M действий |

### От связки Claude Code с расширением

| Сообщение | Причина | Лечение |
|---|---|---|
| «Browser extension is not connected» | Хост native messaging не достучался до расширения | Перезапустить Chrome и Claude Code, затем `/chrome` для переподключения |
| Расширение показано как «Not detected» в `/chrome` | Расширение не установлено или выключено | Установить или включить в `chrome://extensions` |
| «No tab available» | Действие выполнено до готовности вкладки | Создать новую вкладку и повторить |
| «Receiving end does not exist» | Служебный процесс расширения уснул | `/chrome` → «Reconnect extension» |

**Полный текст ошибки о неподключённом расширении** — эталонный образец симптома. Он сам перечисляет четыре возможные причины и даёт адрес для обращения:

> Browser extension is not connected. Please ensure the Claude browser extension is installed and running (https://claude.ai/chrome), and that you are logged into claude.ai with the same account as Claude Code. If this is your first time connecting to Chrome, you may need to restart Chrome for the installation to take effect. If you continue to experience issues, please report a bug: https://github.com/anthropics/claude-code/issues/new?labels=bug,claude-in-chrome

### Ложный симптом — это не ошибка

```
No tab group exists for this session. Use `createIfEmpty: true` to create one.
```

Связь есть, всё в порядке — просто группы вкладок ещё нет. Спутать это состояние с обрывом связи легко, а лечение противоположное: здесь **чинить нечего**, надо просто передать `createIfEmpty: true`.

---

## Порядок восстановления связи

1. Проверить, что расширение установлено и включено в `chrome://extensions`.
2. Проверить версию Claude Code: `claude --version`.
3. Убедиться, что Chrome запущен.
4. `/chrome` → «Reconnect extension».
5. Не помогло — перезапустить и Claude Code, и Chrome.
6. Проверить наличие файла конфигурации хоста по путям из [setup.md](setup.md).

---

## Служебный процесс расширения засыпает

Дока Claude Code: «The Chrome extension's service worker can go idle during extended sessions, which breaks the connection. If browser tools stop working after a period of inactivity, run `/chrome` and select "Reconnect extension".»

Числа из документации Chrome — процесс завершается, когда выполняется одно из условий:

- «After 30 seconds of inactivity. Receiving an event or calling an extension API resets this timer.»
- «When a single request, such as an event or API call, takes longer than 5 minutes to process.»
- «When a fetch() response takes more than 30 seconds to arrive.»

**Почему это касается именно связки с Claude Code.** Соединение native messaging удерживает служебный процесс живым: «Connecting to a native messaging host using `chrome.runtime.connectNative()` will keep a service worker alive. If the host process crashes or is shut down, the port is closed and the service worker will terminate after timers complete.» То есть пока связь с Claude Code жива, расширение не засыпает; связь рвётся при перезапуске Claude Code, смене сборки или сбое — и тогда процесс уходит в сон, а восстанавливать надо вручную через `/chrome` → «Reconnect extension».

---

## Модальные диалоги: полная остановка без ошибки

Самая частая причина того, что «инструменты молчат». Ограничение упоминают все три слоя официальных источников.

**Встроенное руководство:** «IMPORTANT: Do not trigger JavaScript alerts, confirms, prompts, or browser modal dialogs through your actions. These browser dialogs block all further browser events and will prevent the extension from receiving any subsequent commands.»

**Дока Claude Code:** «Check if a modal dialog (alert, confirm, prompt) is blocking the page. JavaScript dialogs block browser events and prevent Claude from receiving commands. Dismiss the dialog manually, then tell Claude to continue.»

**Почему так.** Стандарт HTML предписывает для `alert()`, `confirm()` и `prompt()` операцию «pause», а её определение объясняет остальное: «While a user agent has a paused task, the corresponding event loop must not run further tasks, and any script in the currently running task must block». Скрипты расширения живут в изолированном окружении, но **в том же цикле событий того же процесса отрисовки**, что и страница. Пока задача на паузе, останавливается всё: таймеры и промисы скриптов расширения, доставка сообщений, наблюдатели за DOM, попытки внедрить скрипт. Служебный процесс и сам браузер при этом живы и продолжают слать команды — но выполнить их некому. Отсюда симптом: инструменты «молчат», ошибки нет, браузер выглядит рабочим.

**Снять диалог агенту нечем.** Отладочный протокол Chrome умеет закрывать такие окна (`Page.handleJavaScriptDialog`), и домен `Page` расширению доступен — но инструмента, выставляющего эту возможность наружу, среди 22 нет. `javascript_tool` исполняется **внутри** остановленной страницы и потому бесполезен ровно тогда, когда нужен. Официальный совет «пусть пользователь закроет вручную» — не лень авторов, а следствие отсутствия инструмента.

**Что делать**

1. Не кликать по кнопкам и ссылкам, способным вызвать диалог, — типичный пример: кнопки «Delete» с подтверждением.
2. Если взаимодействие неизбежно — **предупредить пользователя заранее**, что сессия может прерваться.
3. Перед началом работы проверить и снять уже открытые диалоги через `javascript_tool`.
4. Если диалог всё же появился и связь потеряна — сообщить пользователю, что закрыть его надо руками в браузере.

**Родственные блокираторы, работающие так же**

- **Нативное окно выбора файла.** Открывается кликом по полю файла или кнопке загрузки. Единственный путь — `file_upload` с идентификатором элемента, см. [tools-act.md](tools-act.md).
- **`window.print()` и `beforeunload`** — те же модальные окна уровня браузера. Про `beforeunload` полезно знать: диалог показывается только после жеста пользователя на странице. Пока агент лишь читал страницу, он не появится; после первого клика навигация или закрытие вкладки могут на нём встать.
- **Запрос базовой авторизации HTTP (401).** Штатный путь расширений требует разрешений `webRequest` и `webRequestAuthProvider`; у Claude in Chrome их нет — окно ввода логина и пароля остаётся на пользователе.
- **Запросы разрешений браузера** (геолокация, камера, микрофон, уведомления). Управление ими живёт в домене `Browser` отладочного протокола, а этого домена в списке доступных расширению нет. Расширение такие запросы ни выдать, ни сбросить не может — нужен человек.
- **Собственные окна Chrome** — печать, сохранение файла, подтверждение выхода. Рисуются процессом браузера, вне процесса отрисовки страницы; ни скрипты, ни ввод через отладочный протокол до них не дотягиваются.

---

## Панель разработчика и полоса-предупреждение

Оба следствия разрешения `debugger`, на котором держится вся автоматизация.

**Открытая панель разработчика отбирает соединение.** Документация `chrome.debugger` описывает событие `onDetach`: «Fired when browser terminates debugging session for the tab. This happens when either the tab is being closed or Chrome DevTools is being invoked for the attached tab.» То есть если пользователь откроет DevTools на **той вкладке, где работает Claude**, соединение расширения с этой вкладкой разорвётся. Разработчик, привыкший держать панель открытой, получит необъяснимый отказ ровно на одной вкладке.

**Один отладчик на вкладку.** В документации этого нет, но в исходниках обработчика зафиксирован текст ошибки: `"Another debugger is already attached to the * with id: *."`. Claude in Chrome и любое другое расширение-автоматизатор не смогут работать с одной вкладкой одновременно.

**Полоса-предупреждение.** Пользователь видит строку:

> **‘Claude’ started debugging this browser**  [ Cancel ]  ✕

Имя в кавычках берётся из поля `name` манифеста, а там просто `Claude`, не «Claude in Chrome». Свойства полосы:

- **Кнопка «Cancel» отцепляет отладчик, то есть обрывает работу Claude.** Крестик справа просто убирает полосу, не трогая соединение. Пользователь, закрывающий «мешающую полоску» не тем элементом, обрывает работу и не понимает почему.
- Полоса **мигает, а не висит постоянно** (наблюдение): расширение присоединяет отладчик на время операции и отцепляет в простое, а полоса живёт ровно столько, сколько держится присоединение. Снимок, сделанный через несколько секунд после последнего вызова, полосы не содержит; снимок во время работающего вызова — содержит.
- Полоса глобальная: пока присоединение держится, показывается во всех вкладках всех окон, и переход на другую страницу её не убирает.
- Не показывается двум категориям: расширениям, установленным корпоративной политикой, и при запуске браузера со специальным отладочным флагом.

**Вторая визуальная метка — рамка агента.** По периметру области просмотра рисуется оранжево-персиковая рамка: признак того, что страницей управляет агент. Её рисует отдельный скрипт расширения, объявленный для всех адресов. В документации Anthropic про эту метку не сказано, а пользователю она видна всё время работы.

---

## Страницы, где инструменты отказывают в принципе

Ограничения платформы Chrome, а не продукта. Шаблоны совпадения допускают только схемы `http`, `https` и `file`.

| Что | Результат | Текст ошибки |
|---|---|---|
| Служебные схемы: `chrome://`, `chrome-untrusted://`, `devtools://`, `view-source:`, `edge://`, прочие `about:*` | Недоступно | «Cannot access contents of the page. Extension manifest must request permission to access the respective host.» |
| `chrome://` | Недоступно | «Cannot access a chrome:// URL» |
| Chrome Web Store — оба домена | Недоступно | «The extensions gallery cannot be scripted.» |
| Страница другого расширения | Недоступно | «Cannot access a chrome-extension:// URL of different extension» |
| Новая вкладка | Недоступно | «The New Tab Page cannot be scripted.» |
| Хост, запрещённый корпоративной политикой | Недоступно, проверяется **раньше** прочих правил | — |

**Магазин расширений закрыт полностью** (наблюдение): переход проходит и `navigate` возвращает обычный ответ, но и чтение, и снимок отказаны. Обходного пути к содержимому нет вовсе, а вкладка, оставшаяся на его адресе, для агента полностью слепа. Практическая мелочь: свериться с карточкой расширения в магазине (версия, дата обновления) браузерными инструментами нельзя — нужен обычный сетевой запрос вне браузера.

**Локальные файлы.** Доступ к `file://` включается отдельным ручным переключателем в `chrome://extensions`, даже при объявленном разрешении.

Отладчик добавляет свои запреты поверх этого: страницы служебного интерфейса браузера, страницы-заглушки при ошибках сети и предупреждениях о сертификате, встроенный просмотрщик PDF, вкладки чужого профиля. Командные флаги, которые исторически снимали часть запретов (`--extensions-on-chrome-urls`, `--disable-extensions-except`), убраны из фирменных сборок Chrome начиная с версии 139 — обходных путей на пользовательской машине не осталось.

---

## Обрыв канала связи при слишком большом сообщении

Канал native messaging имеет предел **1 МиБ на сообщение в направлении «Claude Code → расширение»** (в обратную сторону — 64 МиБ). При превышении сообщение **не обрезается и не отбрасывается по отдельности — канал закрывается целиком** с ошибкой ввода-вывода.

Практический смысл: превышение выглядит для пользователя не как «ответ пришёл неполным», а как внезапный обрыв связи с расширением — ровно тот симптом, что описан выше текстом «Browser extension is not connected». Узкое горлышко приходится на команды и загружаемые файлы, а не на результаты чтения страницы.

---

## Специфика Windows

- **Конфликт именованных каналов (EADDRINUSE):** другой процесс занял тот же именованный канал. Перезапустить Claude Code, закрыть другие сессии Claude Code, использующие Chrome.
- **Сбой хоста native messaging при старте:** переустановить Claude Code, чтобы пересоздать конфигурацию хоста.
- **Страницы настройки не открываются:** обновить Claude Code; до версии 2.1.211 вкладка с приглашением подключить расширение могла не открыться.

---

## Типовые сбои из статьи справки

- **Claude не видит страницу:** обновить страницу и проверить, что расширение включено; проверить, выдано ли разрешение на текущий сайт; учесть, что страницам с большим объёмом JavaScript нужно время на загрузку.
- **Действия работают неправильно:** обновить Chrome; отключить другие расширения, которые могут мешать взаимодействию со страницей; обновить страницу и начать заново.
- **Расширение не устанавливается или не пускает:** проверить активную платную подписку; на Team и Enterprise — уточнить у администратора, включено ли расширение; очистить кэш и куки для claude.ai; выйти и войти заново.
- **Проблемы производительности:** закрыть лишние вкладки; разбить сложную задачу на шаги.
- **Расширение не соединяется с Claude Desktop или Claude Code:** перезапустить или обновить расширение; если тумблер Claude in Chrome неактивен в настройках коннекторов приложения — перезапустить или обновить Claude Desktop; для Claude Code — перезапустить или обновить Claude Code.
