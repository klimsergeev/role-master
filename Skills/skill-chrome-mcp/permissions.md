# Разрешения: четыре слоя, организация, плановый режим

В источниках четыре разных слоя разрешений перемешаны, и путать их нельзя. Практическое следствие путаницы: **доступ к сайту нельзя выдать из командной строки**, и агент, который этого не понимает, будет бесконечно предлагать пользователю не то действие.

---

## Оговорка о применимости наблюдений

**Все живые наблюдения этого скилла сделаны на профиле, где расширению выданы полные разрешения на хосты:** `explicit_host: ["<all_urls>"]`, `withholding_permissions: false` — то есть режим «спрашивать по сайтам» на уровне Chrome выключен.

На профиле с ограниченными разрешениями и в организации Team или Enterprise поведение приглашений по сайтам и категорий блокировки **может отличаться — это не проверено**. Оговорка сквозная: она относится ко всему, что в скилле сказано про доступ к сайтам и блокировки, а не к одному наблюдению.

---

## Слой 1 — разрешения расширения в Chrome

Выдаются один раз при установке. Полный список — в манифесте установленной версии; статья справки от него отстаёт (в манифесте 1.0.85 есть `activeTab` и `identity`, которых в статье нет, и нет `system.display`, которое в статье есть). Для работы агента важно одно разрешение из пятнадцати.

**`debugger`** — «This is what allows Claude to actually control your browser – clicking buttons, typing text, and taking screenshots». Именно оно, а не `scripting`, даёт возможность кликать и печатать: расширение работает через отладочный протокол Chrome. Отсюда растут два практических следствия, разобранные в [troubleshooting.md](troubleshooting.md): полоса-предупреждение в браузере и разрыв соединения при открытии панели разработчика на рабочей вкладке.

---

## Слой 2 — режим работы

Выбирается выпадающим списком в поле ввода боковой панели или в Claude Desktop.

| Режим | Поведение |
|---|---|
| **Manually approve** (раньше «Ask before acting») | «Claude pauses and asks for approval before each action. You review each request and choose Allow or Deny» |
| **Automatically approve** | «Claude keeps working and reviews each action for safety, automatically blocking anything it determines to be unsafe and pausing to ask you when needed» |
| **Skip all approvals** (раньше «Act without asking») | «Claude doesn't pause to ask and nothing checks its actions automatically» |

**По умолчанию в боковой панели Cowork — автоматическое подтверждение.** Смена режима запоминается для будущих сессий.

Что легко упустить:

- В **классической** боковой панели ручной режим означает утверждение **плана** целиком: план перечисляет сайты и подход, Claude не выходит за его рамки без нового запроса. В боковой панели **Cowork** плана нет — Claude может задать пару уточняющих вопросов и дальше спрашивает разрешение перед каждым действием, предлагая «Allow all for this website», «Allow this time only» или «Deny».
- Автоматический режим дороже по лимиту: «Because Claude does this extra checking for you, auto mode consumes more of your usage limit than the other modes».
- Автоматический режим самовосстанавливается на ручной: «If Claude keeps running into blocks, it switches back to asking for your permission for each step».
- Anthropic сама рекомендует не полагаться на него в делах с последствиями: «For work with real consequences—money, messages sent as you, important files—stay close and review what Claude does or consider switching back to "Manually approve"».

---

## Слой 3 — доступ к сайтам

На части сайтов Claude требует подтверждения каждого действия. При переходе появляется приглашение «New permissions required» — в боковой панели, в Cowork или в Claude Code. Диалог подтверждения в CLI начинается словами «Claude in Chrome wants to».

| Вариант ответа | Что даёт |
|---|---|
| «Allow this action» | Одно действие, дальше спросит снова. Самый безопасный вариант |
| «Always allow actions on this site» | Постоянный доступ. Предупреждение доки: «Claude may take unintended actions across the website when granted this permission» |
| «Decline» | Действие не выполняется |

**Где живут эти разрешения — и почему их нельзя выдать из CLI.** Это **собственный слой Anthropic внутри расширения**, а не механизм Chrome: на уровне браузера расширению уже выдан `<all_urls>`, и Chrome ни о чём не спрашивает. Со стороны Claude Code разрешения по сайтам **наследуются от расширения**: «Site-level permissions are inherited from the Chrome extension. Manage permissions in the Chrome extension settings». Отдельного механизма в CLI нет.

**Правильное действие агента, когда доступ к сайту не выдан:** попросить пользователя открыть настройки расширения (иконка расширения → три точки в правом верхнем углу боковой панели → «Extension settings» → страница «Permissions»). Там виден список сайтов со статусом «always allow» («Your approved sites»), там же разрешение отзывается и смотрится история. Предлагать выдать доступ через флаги, конфигурацию Claude Code или повторный вызов инструмента бессмысленно.

---

## Слой 4 — что требует подтверждения всегда

**Защищённые действия.** Даже при «Always allow actions on this site» Claude отдельно спрашивает перед тем, как:

- скачать файл;
- ввести потенциально чувствительную информацию на странице;
- выдать авторизацию.

**Действия, требующие явного разрешения независимо от режима:** изменение настроек разрешений, выдача авторизаций, ввод потенциально чувствительной информации на сайтах.

**Неснимаемые запреты продукта.** Не снимаются никаким режимом. Списки в двух статьях справки **не совпадают**, поэтому ниже — их объединение с указанием источника.

Из статьи о разрешениях:

- Making purchases or financial transactions
- Creating accounts
- Handling sensitive credit card or ID data
- Downloading files from untrusted sources
- Permanent deletions (emptying trash, deleting emails, files, or messages)
- Providing investment or financial advice
- Executing financial trades or investment transactions
- Modifying system files
- Completing instructions from emails or web content

Только в статье о безопасности:

- Bypassing captchas
- Gathering or scraping facial images

(Статья о безопасности повторяет своими словами и часть предыдущего списка: «Engaging in stock trading or investment transactions», «Inputting sensitive data».)

Поведенческое следствие, зафиксированное докой Claude Code: «When Claude encounters a login page or CAPTCHA, it pauses and asks you to handle it manually.»

---

## Категории заблокированных сайтов

Три официальные формулировки расходятся по полноте.

| Источник | Формулировка |
|---|---|
| Статья о безопасности | «Claude cannot access sensitive, high-risk sites such as: Adult content websites; Known pirated content sites». Отдельно: «Claude asks for permission before accessing financial sites» |
| Статья о диагностике | «The site may be in Claude's default blocked categories (financial services, banking, investment platforms, cryptocurrency exchanges, adult content, pirated content)» |
| Анонс пилота, август 2025 | «We've blocked Claude from using websites from certain high-risk categories such as financial services, adult content, and pirated content» |

**Расхождение разрешено в пользу статьи о безопасности** живой проверкой: главная страница криптобиржи открылась и прочиталась без заглушки и без запроса разрешения — `navigate` вернул обычный ответ, `get_page_text` отдал текст целиком. Никаких действий, кроме перехода и чтения, не выполнялось.

Действующая картина: **порнография и пиратские сайты — жёсткий блок с заглушкой; финансовые сервисы и криптобиржи в худшем случае требуют явного разрешения, а на профиле с уже выданным доступом проходят молча.** Формулировка статьи о диагностике описывает более раннее состояние политики.

Две оговорки к этому выводу. Первая — сквозная оговорка о профиле из начала файла: наблюдение сделано там, где выданы `<all_urls>`, сайт мог быть ранее внесён в «Your approved sites», а в организации Team или Enterprise поверх лежат свои списки. Вторая — от самой Anthropic: «It's unlikely that we've captured all sites in these categories, so please report any omissions».

**Что видит пользователь на заблокированном адресе** — страница-заглушка из дистрибутива расширения, её текст целиком:

> The content on this page isn't available when Claude is active for safety reasons.

Ни причины, ни имени правила, ни того, чьё это решение — политика администратора или встроенная категория, — страница не сообщает. **По самой фразе источник блокировки определить нельзя.**

---

## Слой организации — Team и Enterprise

Настройки: войти владельцем (Owner или Primary Owner) → Organization settings → Claude in Chrome.

- **Общий тумблер «Enable for your team»:** на тарифе Team расширение **включено по умолчанию**, на Enterprise — **выключено по умолчанию**.
- **Allowlist** — Claude ходит только на перечисленные сайты. Рекомендация Anthropic: «We recommend starting with a restrictive allowlist, especially during initial rollout».
- **Blocklist** — сайты, куда Claude не пойдёт никогда, независимо от прочих настроек.
- **Ролевая модель.** «Claude in Chrome has its own permission, separate from Claude Cowork. … Claude in Chrome doesn't inherit a user's Cowork access.» Пороли́ (per-role capability) применимы к организациям Enterprise с настраиваемыми ролями.
- **Отключение работы из Claude Desktop:** выключить расширение целиком либо отключить `isLocalDevMcpEnabled` в конфигурации Enterprise.

### Управляемые политики Chrome

Помимо настроек организации на стороне Anthropic, расширение принимает политики со стороны Chrome — через управляемое хранилище. Полей ровно два, и в статье справки описано только второе.

| Поле | Тип | Дословное описание из схемы политик |
|---|---|---|
| `blockedUrlPatterns` | массив строк | «URL patterns where Claude in Chrome is blocked. Each pattern is matched against the page's hostname and path (e.g. 'example.com/admin'). Use '*' as a wildcard to match any sequence of characters. Patterns are case-insensitive; a leading 'http://', 'https://', or 'www.' is ignored. A bare domain with no path is treated as '<domain>/*'. Example: 'github.com/myorg/*' blocks all pages under that path.» |
| `forceLoginOrgUUID` | строка | «Restricts which Anthropic organization(s) the extension can be used with. Accepts either a single UUID string or a JSON-encoded array of UUID strings. If the signed-in user's organization is not in this list, the extension shows a blocking page with a log out button.» |

Ценное сверх статьи справки: `blockedUrlPatterns` разворачивается **до пути**, а не только до домена (`github.com/myorg/*` закрывает раздел, оставляя остальной GitHub рабочим), задаётся администратором машины, а не владельцем аккаунта Anthropic, и имеет явные правила нормализации — регистр не важен, `http://`, `https://` и `www.` отбрасываются, голый домен равен `<домен>/*`. А `forceLoginOrgUUID` принимает и массив, закодированный строкой JSON, хотя статья справки говорит об организации в единственном числе.

**Политика `ExtensionSettings` перекрывает даже разрешение `debugger`.** Её поля `runtime_blocked_hosts` и `runtime_allowed_hosts` (не более 100 записей каждое, действуют на профиль, обновляются без перезапуска) блокируют для расширения внедрение скриптов, наблюдение за запросами, работу с куками и прочее. В обработчике отладчика Chromium стоит прямой комментарий: «Policy blocked hosts supersede the 'debugger' permission».

**Практический симптом, у которого нет внятного признака:** в организации с настроенной `ExtensionSettings` Claude может не работать на части сайтов **независимо** от списков разрешённых сайтов внутри самого продукта, и отказ будет выглядеть как необъяснимый. Со стороны Claude Code есть ещё один рычаг — блокировка MCP-сервера `claude-in-chrome` через управляемую настройку `deniedMcpServers`; при ней окно установки расширения не показывается вовсе.

---

## Плановый режим Claude Code

Дока Claude Code даёт готовое разделение.

**Проходят без запроса разрешения:** `read_page`, `get_page_text`, `find`, чтение сообщений консоли, чтение сетевых запросов, снимок экрана.

**Требуют подтверждения:** клики, ввод текста, навигация, управление вкладками и окнами, запись GIF.

**Тонкость:** «An otherwise read-only call also prompts for approval when it sets a state-changing input flag, such as `createIfEmpty` on `tabs_context_mcp`, `clear` on the console and network readers, or `save_to_disk` on a screenshot». Пакет `browser_batch` проходит без подтверждения только если каждое действие внутри читающее.
