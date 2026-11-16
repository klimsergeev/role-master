# Python API Blender

## Назначение

Справочник Python API Blender (`bpy`) по типовым задачам — сцена, объекты и меши, материалы, свет, камера, модификаторы, рендер, экспорт — с ограничениями операторов `bpy.ops`, версиями Blender и ломающими изменениями 5.0–5.3. Сигнатуры — по API Blender 5.3, срез 2026-11-16.

## Версии Blender

| Линия | Статус на 2026-11-16 | Последняя точечная версия | Поддержка до |
|---|---|---|---|
| 5.4 | альфа | — | — |
| 5.3 | текущий выпуск (вышел 2026-11-10) | 5.3.0 | выхода следующей версии |
| 5.2 LTS | долгосрочная поддержка (с 2026-07-14) | 5.2.4 | июль 2028 |
| 4.5 LTS | долгосрочная поддержка (с 2025-07-15) | 4.5.16 | июль 2027 |
| 4.2 LTS | поддержка закончилась | 4.2.23 | июль 2026 |

- Каждый выпуск поддерживается до следующего, примерно четыре месяца; раз в год выходит LTS с поддержкой два года. Дальше по плану: 5.4 — май 2027, 6.0 — март 2028.
- Файлы, сохранённые в 5.0 и новее, открываются только в 4.5 и новее.
- Python: 3.11 с Blender 4.1, 3.13 с Blender 5.1; версия Python в 4.2–5.0 не установлена.

## Общие правила

- Новые блоки данных создаются и удаляются только методами коллекций `bpy.data`: `bpy.data.meshes.new(name="MyMesh")`, `bpy.data.meshes.remove(mesh)`. Вызов класса (`bpy.types.Mesh()`) даёт `TypeError`.
- Контекст только для чтения: `bpy.context.active_object = obj` — ошибка; `bpy.context.view_layer.objects.active = obj` — работает.
- После изменения значений зависимые данные (например `matrix_world`) не пересчитаны, пока не вызван `bpy.context.view_layer.update()`.
- Прямой доступ к данным (`bpy.data`, свойства объектов) предпочтительнее операторов `bpy.ops`: операторы зависят от контекста — раздел «Ограничения операторов `bpy.ops`».
- Потоки Python приводят к трудно диагностируемым падениям Blender: интеграция Python не потокобезопасна.

## Чтение сцены

| Что | API |
|---|---|
| Все объекты сцены | `scene.objects` |
| Корневая коллекция | `scene.collection` |
| Активная камера, мир | `scene.camera`, `scene.world` |
| Кадры | `scene.frame_start`, `scene.frame_end`, `scene.frame_current`; переход — `scene.frame_set(frame, *, subframe=0.0)` |
| Все блоки данных файла | `bpy.data.objects`, `.meshes`, `.materials`, `.lights`, `.cameras` и другие; с 5.2 — итератор `bpy.data.all_ids` (порядок с 5.3 — деталь реализации, на него не опираться) |
| Объект | `obj.type`, `obj.data`, `obj.location`, `obj.rotation_euler`, `obj.scale`, `obj.matrix_world`, `obj.dimensions`, `obj.parent`, `obj.modifiers`, `obj.material_slots`, `obj.users_collection` |
| Видимость и выделение | `obj.hide_render`, `obj.hide_viewport`, `obj.visible_get(*, view_layer=None, viewport=None)`, `obj.select_get(*, view_layer=None)`, `obj.select_set(state, *, view_layer=None)` |
| Геометрия меша | `mesh.vertices`, `mesh.edges`, `mesh.polygons`, `mesh.loops`, `mesh.attributes`, `mesh.uv_layers`, `mesh.materials` |
| Геометрия с модификаторами | `depsgraph = context.evaluated_depsgraph_get()`; `obj.to_mesh(*, preserve_all_data_layers=False, depsgraph=None)` — временный меш, освобождается `obj.to_mesh_clear()` |

## Объекты и меши

- Меш: `bpy.data.meshes.new(name)`; геометрия из списков — `mesh.from_pydata(vertices, edges, faces, shade_flat=True)`; затем `mesh.update(*, calc_edges=False, calc_edges_loose=False)` и при сомнении `mesh.validate(*, verbose=False, clean_customdata=True)`. Ещё: `mesh.transform(matrix, *, shape_keys=False)`, `mesh.clear_geometry()`, `mesh.shade_smooth()`.
- Объект: `bpy.data.objects.new(name, object_data)`; в сцену — `collection.objects.link(obj)` (например `scene.collection.objects.link(obj)`), из коллекции — `collection.objects.unlink(obj)`.
- Удаление: `bpy.data.objects.remove(object, *, do_unlink=True, do_id_user=True, do_ui_user=True)`; так же `meshes.remove`, `lights.remove`, `cameras.remove`, `materials.remove`.
- `bmesh`: `bmesh.new(*, use_operators=True)`, `bmesh.from_edit_mesh(mesh)`, `bmesh.update_edit_mesh(mesh, *, loop_triangles=True, destructive=True)`. Для граней по одной и правки геометрии удобнее BMesh; полигоны `Mesh` эффективнее, но жёстче.
- В режиме редактирования `obj.data` не синхронизирован с edit-mesh, пока не выйти из режима или не вызвать `BMesh.to_mesh()`.

## Материалы

- `bpy.data.materials.new(name)`; назначение — `obj.active_material = mat` или `obj.data.materials.append(mat)`.
- С 5.0 дерево узлов создаётся сразу при `materials.new()`; `material.node_tree` — только чтение; Principled BSDF — тип `ShaderNodeBsdfPrincipled`.
- `material.use_nodes` устарел с 5.0 (всегда `True`, установка ни на что не влияет, удаление — в 6.0); так же `world.use_nodes`.
- Цвет в рендере задаёт вход Base Color узла `ShaderNodeBsdfPrincipled` в `material.node_tree.nodes`. Какие узлы `materials.new()` создаёт в дереве в 5.3, не установлено: узел ищется по `bl_idname`, а при его отсутствии состав дерева проверяется `[n.bl_idname for n in mat.node_tree.nodes]`.
- Свойства материала вне узлов — вид в 3D-виде в режиме Solid, на рендер они не влияют: `diffuse_color` (по умолчанию `(0.8, 0.8, 0.8, 1.0)`), `metallic`, `roughness` (по умолчанию 0.4); `blend_method` устарел в пользу `surface_render_method`.

## Свет и камера

- Свет: `bpy.data.lights.new(name, type)`, `type` — `POINT`, `SUN`, `SPOT`, `AREA`; затем объект через `bpy.data.objects.new(name, light)`.
- Камера: `bpy.data.cameras.new(name)`, объект через `bpy.data.objects.new`; камера рендера — `scene.camera = cam_obj`.

## Модификаторы

- `obj.modifiers.new(name, type)`, `obj.modifiers.remove(modifier)`; типы — например `ARRAY`, `BOOLEAN`, `NODES`, `SUBSURF`.
- Решатель булевых операций `"FAST"` с 5.0 называется `"FLOAT"`.
- Входы модификатора Geometry Nodes с 5.2: `modifier.properties.inputs.<identifier>.value = 5.0`; атрибут — `.type = "ATTRIBUTE"` и `.attribute_name`. Прежняя запись `modifier["identifier"] = 5.0` не работает.
- Применение — оператор `bpy.ops.object.modifier_apply(*, modifier='', report=False, merge_customdata=True, single_user=False, all_keyframes=False, use_selected_objects=False)`, с ограничениями операторов. Результат без применения — через `evaluated_depsgraph_get()` и `to_mesh()`.

## Рендер

- `bpy.ops.render.render(*, animation=False, write_still=False, use_viewport=False, use_sequencer_scene=False, layer='', scene='', frame_start=0, frame_end=0)`: кадр с записью файла — `write_still=True`; анимация — `animation=True`; `frame_start` и `frame_end` (с 5.0) — только для анимации, по умолчанию из сцены.
- Настройки — `scene.render`: `engine` (по умолчанию `'BLENDER_EEVEE'`), `filepath` (по умолчанию `"//"`; символы `#` задают место и разрядность номера кадра), `resolution_x` (по умолчанию 1920), `resolution_percentage`, `image_settings`.
- Формат файла: с 5.0 в `image_settings` сначала задаётся `media_type`, затем `file_format`. По справке API 5.2 `media_type` — `'IMAGE'` (по умолчанию), `'MULTI_LAYER_IMAGE'` или `'VIDEO'`; `file_format` по умолчанию `'PNG'`. Для Blender 5.3 значения не установлены; допустимые значения в запущенном Blender даёт `[i.identifier for i in scene.render.image_settings.bl_rna.properties['media_type'].enum_items]`.
- Кадр перед рендером — `scene.frame_set(frame)`, чтобы обновились данные анимации.

## Экспорт и импорт

| Формат | Оператор экспорта | Отбор и ключевые параметры |
|---|---|---|
| OBJ | `bpy.ops.wm.obj_export` | `export_selected_objects=False`, `apply_modifiers=True`, `export_materials=True`, `forward_axis='NEGATIVE_Z'`, `up_axis='Y'`, `global_scale=1.0`, `export_animation=False` |
| STL | `bpy.ops.wm.stl_export` | `ascii_format=False`, `export_selected_objects=False`, `apply_modifiers=True`, `forward_axis='Y'`, `up_axis='Z'` |
| PLY | `bpy.ops.wm.ply_export` | `export_selected_objects=False`, `apply_modifiers=True`, `ascii_format=False` |
| USD | `bpy.ops.wm.usd_export` | `selected_objects_only=False`, `export_animation=False`, `export_materials=True` |
| Alembic | `bpy.ops.wm.alembic_export` | `selected=False`, `start`, `end`, `global_scale=1.0` |
| FBX | `bpy.ops.export_scene.fbx` | `use_selection=False`, `use_visible=False`, `use_active_collection=False`; встроенный аддон |
| glTF 2.0 | `bpy.ops.export_scene.gltf` | встроенный аддон, включён по умолчанию |
| OpenTimelineIO | `bpy.ops.wm.otio_export` | — |
| `.blend` | `bpy.ops.wm.save_as_mainfile(...)`, `bpy.ops.wm.save_mainfile(...)`; открыть — `bpy.ops.wm.open_mainfile(...)` | — |

- Импорт есть для OBJ, STL, PLY, USD, Alembic, FBX (`bpy.ops.wm.fbx_import`), SPZ, OTIO.
- Collada удалена в 5.0.
- Включён ли по умолчанию аддон-экспортёр FBX в 5.3, не установлено: перед экспортом проверить `bpy.ops.export_scene.fbx.poll()` или включить аддон.

## Ограничения операторов `bpy.ops`

- Операторам нельзя передать объект, меш или материал: они работают с контекстом. Аргументы — только именованные свойства оператора.
- Возвращают множество из `{'RUNNING_MODAL', 'CANCELLED', 'FINISHED', 'PASS_THROUGH'}`, а не результат. Отмена без отчётов об ошибке — просто `{'CANCELLED'}`; отчёт об ошибке — `RuntimeError` после завершения, даже при `{'FINISHED'}`.
- Неверный контекст — `RuntimeError` вида `Operator bpy.ops.action.clean.poll() failed, context is incorrect`. Проверка заранее — `bpy.ops.<модуль>.<оператор>.poll()`; причину отказа poll обычно не называет.
- Часть операторов работает только из своего места интерфейса: например `bpy.ops.texture.slot_move()`, `bpy.ops.constraint.limitdistance_reset()`, `bpy.ops.object.modifier_copy()`, `bpy.ops.buttons.file_browse()`; `bpy.ops.view3d.render_border()` требует 3D-вид с активной камерой.
- Подмена контекста: `with bpy.context.temp_override(**overrides): ...` — например `selected_objects`, для операторов интерфейса — `window` и `area`. С 5.0 `override.logging_set(True)` журналирует обращения к контексту.
- По умолчанию вызов идёт в режиме `EXEC_DEFAULT` (только `execute()`); `INVOKE_DEFAULT` вызывает `invoke()` для взаимодействия с пользователем. Вызовы из скрипта не попадают в историю отмены (второй позиционный аргумент `undo` по умолчанию `False`).
- С 5.0 операторы добавления стрипов VSE по умолчанию модальные.
- `sys.exit()` закрывает Blender немедленно — в том числе `argparse` при неверных аргументах.

## Без интерфейса (`--background`)

- `context.space_data` может быть `None`; `context.window`, `area`, `region`, `screen` типизированы как допускающие `None`. Операторы, которым нужно место интерфейса, в фоне падают на `poll()`.
- GPU в фоне — с 5.2 `gpu.init()`; при неудаче — `SystemError`.
- С флагом `--disable-depsgraph-on-file-load` граф зависимостей при загрузке не строится: скрипт сам вызывает `context.evaluated_depsgraph_get()`.
- Полного перечня операторов, не работающих в фоне, нет: проверка — `poll()` и данные вместо операторов.
- Снимки экрана в фоне недоступны.

## Пример: сцена из данных без операторов

Шаблон собран из сигнатур выше и не использует операторов, зависящих от места интерфейса; координаты условные. При запуске без `.blend` скрипт работает поверх стартовой сцены: её объекты остаются, а совпадающие имена Blender дополняет суффиксом (`Camera.001`); состав стартовой сцены в скилле не установлен, поэтому для известной сцены скрипт запускают на своём `.blend`.

```python
import bpy

scene = bpy.context.scene

mesh = bpy.data.meshes.new("Plane")
mesh.from_pydata([(-1, -1, 0), (1, -1, 0), (1, 1, 0), (-1, 1, 0)], [], [(0, 1, 2, 3)])
mesh.update()
plane = bpy.data.objects.new("Plane", mesh)
scene.collection.objects.link(plane)

mat = bpy.data.materials.new("Red")
mat.diffuse_color = (0.8, 0.1, 0.1, 1.0)  # only the Solid viewport color
bsdf = next((n for n in mat.node_tree.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"), None)
if bsdf is not None:
    bsdf.inputs["Base Color"].default_value = (0.8, 0.1, 0.1, 1.0)  # render color
else:
    print("No Principled BSDF in the default tree:", [n.bl_idname for n in mat.node_tree.nodes])
plane.data.materials.append(mat)

light = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
light.location = (2, -2, 5)
scene.collection.objects.link(light)

cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
cam.location = (0, -6, 4)
cam.rotation_euler = (1.0, 0.0, 0.0)
scene.collection.objects.link(cam)
scene.camera = cam

scene.render.filepath = "//render_####"
bpy.ops.render.render(write_still=True)
```

## Ломающие изменения 5.0–5.3

Основной разрыв — 5.0. Скрипт, написанный под 4.x, проверяется по таблице.

| Версия | Область | Что сломано | Чем заменить |
|---|---|---|---|
| 5.0 | Свойства `bpy.props` | доступ через синтаксис словаря больше не работает (`bpy.context.scene['cycles']`) | обычный доступ к свойству; старые данные — `obj.bl_system_properties_get()`; сброс — `obj.property_unset('cycles')` |
| 5.0 | Колбэки `get`/`set` в `bpy.props` | `set` без `get` — ошибка; хранение через IDProperty в `get`/`set` запрещено | `get_transform` и `set_transform`; только чтение — флаг `READ_ONLY` |
| 5.0 | Встроенные модули | стали приватными: `animsys_refactor`, `bl_console_utils`, `bl_i18n_utils`, `bl_previews_utils`, `bl_rna_utils`, `bl_text_utils`, `bl_ui_utils`, `bpy_restrict_state`, `console_python`, `console_shell`, `graphviz_export`, `keyingsets_utils`, `rna_info`, `rna_manual_reference`, `rna_xml` | — |
| 5.0 | GPU | удалены модуль BGL, `Image.bindcode`, создание шейдеров из исходников GLSL | `gpu.texture.from_image(image)`, `gpu.types.GPUTexture`; шейдеры — `gpu.shader.create_from_info()` |
| 5.0 | Рендер | `BLENDER_EEVEE_NEXT` → `BLENDER_EEVEE`; проходы переименованы (`'DiffCol'` → `'Diffuse Color'`, `'IndexMA'` → `'Material Index'`, `'Z'` → `'Depth'`); `scene.eevee.gtao_distance` → `view_layer.eevee.ambient_occlusion_distance`; удалены `gtao_quality`, `use_gtao` | новые имена |
| 5.0 | Изображения | в `ImageFormatSettings` сначала `media_type`, затем `file_format` | — |
| 5.0 | Композитинг | удалён `scene.node_tree`; `scene.use_nodes` устарел; у узла File Output удалены `file_slots`, `layer_slots`, `base_path`, добавлены `directory`, `file_name`, `file_output_items`; часть узлов композитора заменена шейдерными (`CompositorNodeGamma` → `ShaderNodeGamma`) | `scene.compositing_node_group` и `bpy.data.node_groups.new(..., "CompositorNodeTree")` |
| 5.0 | Материалы и мир | `use_nodes` устарел, дерево создаётся сразу | — |
| 5.0 | Анимация | удалены `action.fcurves`, `action.groups`, `action.id_root`; у `Bone` удалены `select`, `select_head`, `select_tail`; удалён `context.space_data.action` в Dope Sheet | `channelbag.fcurves` и `channelbag.groups` через `bpy_extras.anim_utils.action_get_channelbag_for_slot()` и `action_ensure_channelbag_for_slot()`; `action_slot.target_id_type`; `action_group` → `group_name`; `pose.bones[i].select`, `edit_bones[i].select`; `context.active_action` |
| 5.0 | UV | выделение UV общее для всех карт; удалены `MeshUVLoopLayer.vertex_selection`, `edge_selection`, `BMLoopUV.select`, `BMLoopUV.select_edge` | атрибуты `.uv_select_vert`, `.uv_select_edge`, `.uv_select_face`, методы `bmesh.types.*uv_select*` |
| 5.0 | Моделирование | решатель булевых операций `"FAST"` → `"FLOAT"` | — |
| 5.0 | Импорт и экспорт | удалён `Scene.alembic_export`; у `alembic_export` и `usd_export` удалена `visible_objects_only`; у `usd_import` `import_subdiv` → `import_subdivision`, `attr_import_mode` → `property_import_mode`; у `usd_export` удалена `export_textures` (есть `export_textures_mode`); Collada удалена | — |
| 5.0 | Grease Pencil и аннотации | `GPencilStroke` → `AnnotationStroke`, старый `GreasePencil` → `Annotation`, `Scene.grease_pencil` → `Scene.annotation`; `GreasePencilv3` → `GreasePencil`, `bpy.data.grease_pencils_v3` → `bpy.data.grease_pencils` | — |
| 5.0 | Кисти | `brush.sculpt_tool` → `brush.sculpt_brush_type` (суффикс `_tool` → `_brush_type`); `curve`/`curve_preset` → `curve_distance_falloff`/`curve_distance_falloff_preset` | — |
| 5.0 | Секвенсор | контекст VSE — `context.sequencer_scene`, может отличаться от `context.scene`; у новых стрипов `end_frame` → `length` | — |
| 5.0 | Интерфейс и ассеты | удалены `AssetHandle` (замена `AssetRepresentation`), `AssetCatalogPath`, `UILayout.template_asset_view()`; удалено `GRID` в `UIList.layout_type`; `RADIAL_MENU` → `PIE_MENU` | — |
| 5.0 | `mathutils` | элементы `Vector` и других типов — float32 вместо float64; буфер для numpy некомпактный | — |
| 5.0 | Журнал | формат вывода изменился, включая прогресс фонового рендера; парсеры вывода обновить | — |
| 5.1 | Python | обновлён до 3.13 | — |
| 5.1 | Кисти | удалён `sculpt.sample_color` (есть `paint.sample_color`); `use_airbrush`, `use_anchor`, `use_space`, `use_line`, `use_curve`, `use_restore_mesh` → перечисление `brush.stroke_method`; режимы `SMOOTH`, `ERASE`, `MASK` → свойство `brush_toggle` | — |
| 5.1 | Секвенсор | `frame_final_duration` → `duration`, `frame_final_start` → `left_handle`, `frame_start` → `content_start` и др.; старые имена работают до 6.0 | новые имена |
| 5.2 | Geometry Nodes | входы модификатора — RNA-свойства `modifier.properties.inputs.<identifier>.value`; пути вида `object.modifiers["geonode_mod"]["socket_1"]` не работают; изменены идентификаторы сокетов Compare и Random Value | новая запись |
| 5.2 | Скульпт | настройки automasking — в `mesh_automasking_settings` | — |
| 5.2 | Прочее | удалены `paint.eraser_brush`, `paint.eraser_brush_asset_reference`, аргумент `color` у `UILayout.template_palette`; вложенность IDProperties — не глубже 1024 | — |
| 5.3 | `PropertyGroup` | свойство `name` по умолчанию — только чтение; своё `name` в подклассе допустимо | — |
| 5.3 | `bpy.data.all_ids` | порядок — деталь реализации | не опираться на порядок |

Внутри 4.x: в 4.2 — статическая типизация IDProperties и упаковка аддонов манифестом (`blender_manifest.toml`) вместо `bl_info`; в 4.4 — подклассы типов Blender со своим `__init__`/`__new__` обязаны вызывать родительский конструктор, `bpy.types.Sequence` → `bpy.types.Strip`, слоты Action; в 4.5 — устаревания GPU, `seq1`/`seq2` → `input1`/`input2` в `strips.new_effect()`.
