# Требования и подключение

Кому доступно, чем авторизоваться, в каких браузерах работает, как включается в Claude Code и как устроено соединение. Диагностика обрыва — в [troubleshooting.md](troubleshooting.md).

---

## Кому доступно

- **Тарифы.** Pro, Max, Team, Enterprise. Формулировка повторяется во всех трёх статьях справки: «Claude in Chrome is available for all paid plans». **Бесплатного доступа нет.**
- **Статус.** «It's generally available in Claude Cowork and Claude Code, and in beta in the Chrome browser» — в связке с Claude Code это общедоступный релиз (GA с Claude Code 2.1.198), сама боковая панель Chrome — бета.
- **Модели.** «Claude in Chrome is available on all public models» — ограничений по модели нет.

**Где не работает вовсе**

| Ограничение | Формулировка источника |
|---|---|
| Сторонние провайдеры | «Chrome integration is not available through third-party providers like Amazon Bedrock, Google Cloud's Agent Platform, or Microsoft Foundry». Тем, кто ходит в Claude только через них, нужен отдельный аккаунт claude.ai |
| HIPAA | «Claude in Chrome isn't available to organizations covered by HIPAA» |
| Режим нулевого хранения данных (ZDR) | Не поддерживается |
| WSL | «Chrome integration isn't supported in Windows Subsystem for Linux (WSL)» |
| Мобильные устройства | Не поддерживаются |

Отдельного географического ограничения именно для Claude in Chrome в официальных источниках нет — продукт наследует общую географию доступности Claude.ai.

## Авторизация

Для Claude Code обязателен вход через `/login`. При авторизации по **API-ключу или долгоживущему токену** из `claude setup-token` интеграция принудительно выключается: расширение не умеет аутентифицироваться такими учётными данными. До версии Claude Code 2.1.216 такие сессии могли включить интеграцию, но каждая попытка соединения падала с ошибкой 403.

## Браузеры — источники расходятся

| Источник | Формулировка |
|---|---|
| Справка Anthropic | «Claude in Chrome is not supported on other Chromium-based web browsers or mobile devices» |
| Анонс от 12 августа 2026 | «Claude in Chrome doesn't run on other Chromium browsers or on mobile yet» |
| Дока Claude Code | «Chrome integration works with Google Chrome and Microsoft Edge. Claude Code also detects the extension and sets up the connection in other Chromium-based browsers, including Brave, Arc, Vivaldi, and Opera» |

Расхождение объясняется разными поверхностями продукта. **Итог:** боковая панель — только Chrome; связка «Claude Code ↔ расширение» документирована для Chrome и Edge, а Brave, Arc, Vivaldi и Opera поддерживаются стороной Claude Code, но справкой Anthropic не заявлены. Дока Claude Code перечисляет для них конкретные пути к файлу конфигурации хоста — см. ниже.

## Установка расширения

1. Открыть окно Google Chrome.
2. Найти Claude in Chrome в Chrome Web Store.
3. Нажать «Add to Chrome».
4. Войти под учётными данными Claude.
5. Закрепить расширение: иконка пазла → канцелярская кнопка возле «Claude».
6. Выдать необходимые разрешения (разбор слоёв — в [permissions.md](permissions.md)).

Идентификатор расширения: `fcoeoabgfenejglbffodgkkbkcdhcgfn`. Он пригодится при диагностике — по нему находятся каталог расширения на диске и запись в манифесте хоста.

**Связка с Claude Desktop** (Chat, Cowork): инициалы в левом нижнем углу → «Settings» → «Connectors» → Claude in Chrome → «Configure» → включить тумблер. Важная деталь: коннектор попадает в выпадающий список «Connectors» в чатах, **но выключен по умолчанию и включается вручную для каждой беседы**.

## Включение в Claude Code

**Предварительные требования**

- Google Chrome, Microsoft Edge или другой браузер на Chromium.
- Расширение Claude in Chrome **версии 1.0.36 или выше**.
- Установленный Claude Code.
- Прямой тарифный план Anthropic: Pro, Max, Team или Enterprise.
- Вход через `/login`.

**Запуск**

```bash
claude --chrome
```

Флагов ровно два: `--chrome` («Enable Claude in Chrome integration») и `--no-chrome` («Disable Claude in Chrome integration»). При первом запуске с флагом Claude Code показывает одноразовое окно, объясняющее интеграцию и работу разрешений по сайтам.

**Постоянное включение:** `/chrome` → «Enabled by default». Дока предупреждает: «Enabling Chrome by default in the CLI increases context usage since browser tools are always loaded». Постоянное включение стоит контекста; при его дефиците лучше вернуться к разовому `--chrome`.

**Команда `/chrome`** — центр управления: статус соединения, разрешения, переподключение расширения, выбор браузера. Интеграция считается рабочей, когда панель показывает «Status: Enabled» и «Extension: Installed». Выбор браузера («Select browser…») требует Claude Code 2.1.154 или новее; выбор запоминается даже при подключении другого браузера.

**Установка по запросу.** Если Claude нужен браузер, а расширение не обнаружено, Claude Code показывает окно «Claude wants to use your browser» — не чаще одного раза за сессию. Три варианта: «Install extension» (открывает страницу установки и ведёт мастера настройки прямо в текущей сессии), «Not now», «Don't ask again». Если организация заблокировала MCP-сервер `claude-in-chrome` через управляемую настройку `deniedMcpServers`, окно не показывается вовсе.

**VS Code.** Флаг не нужен — браузер доступен, как только установлено расширение Chrome. Вызов через `@browser` в поле ввода: `@browser go to localhost:3000 and check the console for errors`. Через меню вложений можно выбрать конкретные браузерные инструменты.

**`/mcp` — действие пользователя, не агента.** Актуальный состав инструментов смотрится так: `/mcp` → `claude-in-chrome` → «View tools». Дока описывает это как последовательность выборов в интерактивной панели («Run `/mcp`, select `claude-in-chrome`, then select **View tools**»), то есть шаг адресован человеку за клавиатурой: когда нужно свериться с составом инструментов, надо просить пользователя открыть панель, а не пытаться сделать это за него.

Агенту доступен более дешёвый и постоянно действующий путь: **схемы инструментов, приезжающие в момент их загрузки.** При расхождении справочника со схемой прав схема, и о расхождении стоит сказать пользователю: скилл собран из схем работающего сервера и стареет вместе с продуктом.

Самопроверка связи в начале сессии в скилле есть — шаг 2 рабочего процесса в [SKILL.md](SKILL.md). Она состоит только из вызовов, которые агент выполняет сам (`tabs_context_mcp`, `list_connected_browsers`); `/mcp` в неё не входит именно потому, что этот шаг агент выполнить не может.

## Как устроено соединение

Связь идёт **не по сети, а через механизм native messaging Chrome**. Chrome запускает бинарник Claude Code со скрытым флагом `--chrome-native-host` и общается с ним через стандартные потоки ввода-вывода.

Файл конфигурации хоста (macOS, Chrome):

```json
{
  "name": "com.anthropic.claude_code_browser_extension",
  "description": "Claude Code Browser Extension Native Host",
  "path": "<домашний каталог>/.claude/chrome/chrome-native-host",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://fcoeoabgfenejglbffodgkkbkcdhcgfn/"
  ]
}
```

Сам `chrome-native-host` — короткая оболочка на sh, запускающая `claude.exe --chrome-native-host`.

**Пути к файлу конфигурации**

| Браузер | Система | Путь |
|---|---|---|
| Chrome | macOS | `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Chrome | Linux | `~/.config/google-chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Chrome | Windows | Ключ реестра `HKCU\Software\Google\Chrome\NativeMessagingHosts\` |
| Edge | macOS | `~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Edge | Linux | `~/.config/microsoft-edge/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Edge | Windows | `HKCU\Software\Microsoft\Edge\NativeMessagingHosts\` |
| Brave | macOS | `~/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/` |
| Brave | Windows | `HKCU\Software\BraveSoftware\Brave-Browser\NativeMessagingHosts\` |

Прочие браузеры на Chromium читают тот же файл из своего каталога.

**Два предупреждения**

1. Файл создаётся при первом включении интеграции, а **Chrome читает его только при старте**. Если расширение не обнаружено с первой попытки — перезапустить Chrome.
2. Рядом лежит второй манифест, `com.anthropic.claude_browser_extension.json`, принадлежащий приложению **Claude Desktop**. Это разные хосты, и путать их конфигурации не нужно.

## Версионные пороги, влияющие на поведение

| Версия | Что изменилось |
|---|---|
| Расширение 1.0.36 | Минимальная версия для связки с Claude Code |
| Claude Code 2.1.154 | Выбор браузера через `/chrome` → «Select browser…» |
| Claude Code 2.1.172 | Браузерные инструменты грузятся одним пакетным вызовом вместо вызова на инструмент |
| Claude Code 2.1.198 | Claude in Chrome — общедоступный релиз |
| Claude Code 2.1.211 | Загрузка файлов из удалённых сессий и CLI; `save_to_disk` у снимка реально пишет файл; исправлено открытие страниц настройки в Windows |
| Claude Code 2.1.216 | Исправлен цикл ошибок 403 при переподключении, когда у токена нет нужного разрешения |
| Claude Code 2.1.221 | Расширение само закрывает открытые им вкладки, когда они больше не нужны |

**Пономерной истории изменений расширения не существует:** Anthropic её не публикует, карточка в магазине показывает «WHAT'S NEW» без номеров версий — искать такой журнал бессмысленно. Пономерный журнал есть только у стороны Claude Code: https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md — оттуда взяты все пороги таблицы выше, кроме первого: минимальную версию расширения 1.0.36 называет дока Claude Code.

## Сетевые адреса для строгих сред

Статья для администраторов называет адреса приблизительно: «claude.ai, api.anthropic.com, platform.claude.com … the same bridge endpoint Claude Desktop uses (wss://bridge.claudeusercontent.com) and … standard telemetry services».

Политика безопасности содержимого в манифесте расширения 1.0.85 раскрывает их полностью — это исчерпывающий перечень, потому что всё, чего в нём нет, браузер заблокирует:

```
connect-src 'self'
  https://api.anthropic.com  wss://api.anthropic.com
  https://claude.ai  https://platform.claude.com
  https://api.segment.io  https://*.segment.com
  https://*.ingest.us.sentry.io
  https://api.honeycomb.io
  https://browser-intake-us5-datadoghq.com
  wss://bridge.claudeusercontent.com  wss://bridge-staging.claudeusercontent.com
```

Два следствия. «Стандартная телеметрия» из статьи справки — это Segment, Sentry, Honeycomb и Datadog: в строгой сети их надо либо разрешить, либо сознательно принять, что часть функций расширения будет ругаться в журнал. И в списке есть предпродакшн-адрес того же моста, `wss://bridge-staging.claudeusercontent.com`: на поведение он не влияет, но в описи сетевых адресов для службы безопасности его надо называть, иначе опись неполна.

Ограничить расширение одной организацией можно политикой Chrome `forceLoginOrgUUID` — см. [permissions.md](permissions.md).
