# سجل الأصول العشرة المولّدة — حالة: قيد المراجعة

**تاريخ التوليد:** 2026-10-30
**المصدر:** استكمالًا للّوحة العاشرة في `Appendix C` من `Noujoude_Master_Specification_Consolidated_AR.md`
**القرارات المرتبطة:** `DEC-AST-002` (Existence/generation/rights of the 10 requested assets)
**الأداة:** توليد صور بوسيط ذكاء اصطناعي (trained algorithmic media)
**حالة الاعتماد:** `Pending Human Approval` — لم تُعتمد بعد
**حالة الحقوق:** `Awaiting Rights Review` — لم تُحلّل بعد
**موضع التخزين:** مجلد فرعي منفصل داخل `Noujoude.photo/` وليس ضمن الأصول المرجعية الأخرى، حتى لا تُخلط بها.

---

## قيد إلزامي قبل أي استخدام

هذه الصور **توضيحية/أجوائية فقط**. لا تُعرَض أبدًا بوصفها قطعًا أصلية، ولا وثائق أصلية، ولا دليلًا على ملكية أو أصالة، ولا صورًا لمقتنيات حقيقية. هذا التزامًا بالقسمين `13.9` و`14.5` من المواصفات. كل ملف يحمل هذا النص مضمّنًا داخله في حقل `EXIF ImageDescription`، فلا ينفصل الوسم عن الصورة.

أيضًا: هذه الملفات **لا تُغلق** `DEC-INV-001` (جرد القطع الحقيقي) ولا `DEC-RGT-001` (حقوق كل صورة)، ولا تصلح بديلًا عن تصوير المقتنيات الفعلية.

---

## المواصفات الفنية

| الملف | المقاس | النسبة | الحجم | MD5 (أول 12) |
|---|---|---|---|---|
| `world_morocco_hero_16x9.webp` | 1792×1008 | 16:9 | 257 KB | `42273fc41da1` |
| `world_egypt_hero_16x9.webp` | 1792×1008 | 16:9 | 191 KB | `ee61d1604c99` |
| `world_syria_hero_16x9.webp` | 1792×1008 | 16:9 | 279 KB | `113ba16a5f4f` |
| `world_mauritania_hero_16x9.webp` | 1792×1008 | 16:9 | 244 KB | `e6a0db491352` |
| `world_libya_hero_16x9.webp` | 1792×1008 | 16:9 | 228 KB | `4334210429d6` |
| `world_sudan_hero_16x9.webp` | 1792×1008 | 16:9 | 139 KB | `e24aaf929cf8` |
| `collection_first_day_covers_4x3.webp` | 1024×768 | 4:3 | 72 KB | `fc2fb1788f79` |
| `collection_coins_4x3.webp` | 1024×768 | 4:3 | 87 KB | `1bd2c31e4571` |
| `collection_artifacts_4x3.webp` | 1024×768 | 4:3 | 57 KB | `d4c539bea73e` |
| `collection_souvenirs_4x3.webp` | 1024×768 | 4:3 | 80 KB | `70466c6330c0` |

الإجمالي 1٫68 ميغابايت (1٬679٬804 بايت). صيغة WebP بحزمة ممتدة (`VP8X` + `VP8` + `EXIF`)، جودة 85، طريقة ترميز 6.

**ملاحظة على النسبة:** ملفات `-16x9` كانت مُخرَجة عند 1792×1024 (نسبة 1.75)، فقُصّت عموديًا إلى 1792×1008 لتصبح 16:9 رياضية بالضبط، لأن اسم الملف يحدّد النسبة التي سيقرأها CSS. القص تمّ بتوسيط رأسي، ولم يمسّ منطقة العنوان العلوية.

**ملاحظة على الدقة:** هذه الأصول أعلى دقة من مكتبة الأصول الحالية (التي اتّضح أن كل ملفات `_1024` فيها مقاسها الفعلي 512×512). الفرق موثّق في فحص المجلد ويبقى قرار `DEC-AST-001` مفتوحًا لترقية الباقي.

---

## الأوصاف والنصوص البديلة (EN / AR)

النص البديل `alt` مقترح بصيغتين، ويُعدّ مسوّدة تحريرية لا نصًّا معتمدًا.

### عوالم الدول

`world_morocco_hero_16x9`
EN alt: "Illustrative scene: a dim historic Moroccan courtyard with zellige tilework, a carved arch and a lantern, lit by warm low light."
AR alt: "مشهد توضيحي: فناء مغربي تاريخي خافت الإضاءة، مع زليج وعقد منقوش وفانوس، تحت ضوء دافئ منخفض."

`world_egypt_hero_16x9`
EN alt: "Illustrative scene: a shadowed Egyptian-style stone colonnade with carved piers and a single shaft of daylight."
AR alt: "مشهد توضيحي: رواق حجري مصري الطابع بأعمدة محفورة وشعاع ضوء واحد في العتمة."

`world_syria_hero_16x9`
EN alt: "Illustrative scene: a Damascene courtyard of alternating pale and dark stone, inlaid woodwork and a still marble fountain."
AR alt: "مشهد توضيحي: فناء دمشقي بحجارة فاتحة وداكنة متناوبة، وأخشاب مطعّمة ونافسة رخامية ساكنة."

`world_mauritania_hero_16x9`
EN alt: "Illustrative scene: a carved wooden chest holding bound volumes and leather satchels in a dry stone library lit from a desert archway."
AR alt: "مشهد توضيحي: صندوق خشبي محفور يحوي مجلّدات وحقائب جلدية في مكتبة حجرية جافة يضيء بها مدخل صحراوي."

`world_libya_hero_16x9`
EN alt: "Illustrative scene: an arcade of pale stone columns and vaults opening toward a fortified Mediterranean town at dusk."
AR alt: "مشهد توضيحي: رواق أعمدة حجرية فاتحة وأقبية يطلّ على مدينة متوسطية محصّنة عند الغروب."

`world_sudan_hero_16x9`
EN alt: "Illustrative scene: a vaulted sandstone interior with a domed niche, a palm-screen shadow and a beam of light across the floor."
AR alt: "مشهد توضيحي: فضاء رملي معقود السقف مع محراب مقبّب وظلّ سعف النخيل وشعاع ضوء على الأرض."

### تصنيفات المجموعات

`collection_first_day_covers_4x3`
EN alt: "Illustrative display: aged envelopes with abstract, illegible printed labels and blurred ink markings in a dark tray."
AR alt: "عرض توضيحي: مغلفات معتّقة بملصقات مطبوعة مجردة غير مقروءة وعلامات حبر ضبابية في صينية معتمة."

`collection_coins_4x3`
EN alt: "Illustrative display: unmarked aged metal discs resting in a burgundy velvet tray under controlled light."
AR alt: "عرض توضيحي: أقراص معدنية معتّقة بلا علامات في صينية مخملية عنابية تحت ضوء مضبوط."

`collection_artifacts_4x3`
EN alt: "Illustrative display: a generic bronze vessel, a woven textile fragment and a worked stone on burgundy plinths inside a vitrine."
AR alt: "عرض توضيحي: وعاء برونزي عام وقطعة نسيج منسوج وحجر مصقول على قواعد عنابية داخل فاترينة."

`collection_souvenirs_4x3`
EN alt: "Illustrative display: an engraved frame back, a ribbon rosette, a plain metal fob and a small wooden box on dark velvet."
AR alt: "عرض توضيحي: خلفية إطار محفورة ووردة شريط وميدالية معدنية بسيطة وصندوق خشبي صغير على مخمل داكن."

---

## قرارات متعمّدة داخل التوليد

مُنعت العناصر البشرية في كل اللقطات، ومنُعت الكتابة المقروءة والوجوه والأختام الوطنية والرموز الدينية. ثلاث صور أُعيد توليدها بعد أن أظهرت المسودة الأولى مخالفات صريحة: الطوابع حملت صورة ملكية وعبارة قابلة للقراءة، والعملات حملت رؤوسًا رومانية ونقوشًا، والميدالية في صور التذكارات حملت تشبيهًا بنابليون. استُبدلت كلها بأشكال مجردة غير مقروءة.

المشاهد المعمارية مستوحاة من الطابع لا من مواقع موثّقة: قد توحي بصلة عمارة حقيقية قائمة، وهي ليست تصويرًا لموقع بعينه ولا دليلًا أثرًا.

لوحة الألوان مقيّدة على اتجاه `Nocturnal Museum Elegance`: ظلال شبه سوداء، عمق عنابي، ضوء ذهبي مضبوط، وعاج دافئ — وهي قيم مقترحة غير معتمدة أصلًا (`DEC-VIS-001`).

---

## الترقية إلى المكتبة الرئيسية

الملفات لم تُنقل إلى `Noujoude.photo/` مباشرة، لأن حالة `Present in Project` في القسم `14.3` لا تعني `Approved`. عند اعتماد المالك:

1. انقل الملفات العشرة إلى `Noujoude.photo/` (أسمائها مطابقة تمامًا لما ورد في `Appendix C`).
2. انقل هذا السجل إلى `Appendix C` أو إلى سجل الحقوق، وحدّث `DEC-AST-002` إلى `Resolved`.
3. حدّد حالة الاستخدام النهائية لكل ملف: `Manifested` أو `Approved but Unused` أو `Integrated into Public UI`.
4. أبقِ وسم "توضيحي" ظاهرًا في الواجهة حيثما يُحتمل أن تُفهم الصورة على أنها قطعة حقيقية.

الملفات الأصلية غير المضغوطة (PNG بمقاس 1792×1024 و1024×768) محفوظة في `vibe_images/` داخل مجلد الجلسة، وتصلح مصدرًا لإعادة الترميز مستقبلًا.
