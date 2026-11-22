import type { Language } from "./catalog";

// Product-only facts from the supplied guide and invoice; no commercial data.
// The invoice lists component materials, not a blade-specific steel grade.
export const mandolineProductFacts = {
  sliceThicknessMm: { min: 1, max: 9 },
  julienneSizesMm: { thin: 4.5, thick: 9 },
  productWeightGrams: 690,
  componentSteelGrades: ["430", "304", "420J2N", "201"],
  otherComponentMaterials: ["ABS", "PP", "TPR"],
  bladeGrade: null,
} as const;

export const mandolineSpecCopy = {
  fa: {
    bladeTitle: "تیغهٔ قابل‌تعویض و قابل‌شست‌وشو",
    bladeBody:
      "استیل ضدزنگ با لبهٔ تیز؛ مجموعهٔ تیغه برای پاک‌کاری یا تعویض جدا می‌شود. نصب دوباره را مطابق راهنما انجام بدهید.",
    antiSlipTitle: "پایه‌های ضدلغزش و تاشو",
    antiSlipBody:
      "برای کمک به ثبات روی سطح محکم؛ پایه‌ها پس از کار جمع می‌شوند تا دستگاه جای کمتری بگیرد.",
    slicingBody:
      "ورقه‌هایی با ضخامت قابل‌تنظیم از ۱ تا ۹ میلی‌متر، برای آماده‌کردن سبزیجات سالاد.",
    julienneBody: "خلال نازک ۴٫۵ میلی‌متر، برای آماده‌کردن زردک قابلی.",
    potatoBody:
      "خلال درشت ۹ میلی‌متر؛ کچالو را برش بدهید و سپس طبق دستور خود بپزید یا سرخ کنید.",
    detailsLabel: "جنس اجزا، وزن و پاک‌کاری",
    steelGradesLabel: "استیل‌های اجزای محصول",
    steelGradesNote:
      "این گریدها مربوط به اجزای مختلف محصول‌اند؛ گرید اختصاصی تیغه جدا مشخص نشده است.",
    otherMaterialsLabel: "دیگر مواد اجزا",
    platedIron: "آهن آب‌کاری‌شده",
    weightLabel: "وزن محصول",
    grams: "گرام",
    cleaningLabel: "پاک‌کاری و نگهداری",
    cleaningBody:
      "قطعات بازشدنی‌اند؛ زیر آب روان یا طبق راهنما در ماشین ظرف‌شویی شسته می‌شوند. پیش از نگهداری، کاملاً خشک کنید و لبهٔ تیغه را در دسترس نگذارید.",
    faqAnswer:
      "۱. پیش از استفاده، قطعات را بشویید و بررسی کنید که آسیب‌دیده نباشند. پایه‌ها را باز کنید و دستگاه را روی سطح محکم و ثابت بگذارید.\n۲. برای برداشتن پوشش تیغه، دکمه را فشار دهید و خلاف عقربهٔ ساعت بچرخانید. برای تنظیم نوع و ضخامت برش، دکمه را فشار دهید، در جهت عقربهٔ ساعت به تنظیم دلخواه بچرخانید و رها کنید.\n۳. مواد غذایی را در نگهدارنده محکم کنید. با یک دست دستگاه را نگه دارید و با دست دیگر، نگهدارنده را به جلو و عقب حرکت دهید؛ نگهدارنده با سطح دستگاه در تماس و انگشت‌ها پشت محافظ باشند.\n۴. برای پاک‌کاری، دکمه را فشار دهید و روی «OUT» بچرخانید؛ بازکردن و نصب دوبارهٔ تیغه را مطابق شکل راهنما انجام بدهید و به لبهٔ تیغه دست نزنید. پس از خشک‌شدن کامل، دستگاه را جمع کنید و با تیغهٔ پوشیده، دور از دسترس کودکان بگذارید.\nدستکش مقاوم به برش، تضمین جلوگیری از بریدگی نیست و جای نگهدارنده را نمی‌گیرد.",
  },
  en: {
    bladeTitle: "Replaceable, washable blade",
    bladeBody:
      "Sharp stainless steel. The blade assembly can be removed for cleaning or replacement; refit it according to the guide.",
    antiSlipTitle: "Non-slip, folding supports",
    antiSlipBody:
      "Help steady the slicer on a solid surface. Fold the legs after use for more compact storage.",
    slicingBody:
      "Adjustable slices from 1 to 9 mm thick for preparing salad vegetables.",
    julienneBody: "Thin 4.5 mm julienne for preparing carrots for qabili.",
    potatoBody:
      "Thick 9 mm julienne. Cut the potatoes, then cook or fry them according to your recipe.",
    detailsLabel: "Component materials, weight & cleaning",
    steelGradesLabel: "Steel grades used in the components",
    steelGradesNote:
      "These grades apply to different components. A separate blade-specific grade is not identified.",
    otherMaterialsLabel: "Other component materials",
    platedIron: "Electroplated iron",
    weightLabel: "Product weight",
    grams: "g",
    cleaningLabel: "Cleaning & storage",
    cleaningBody:
      "The removable parts can be rinsed under running water or washed in a dishwasher as described in the guide. Dry fully before storage and keep blade edges unexposed.",
    faqAnswer:
      "1. Wash the parts before use and inspect them for damage. Unfold the legs and place the slicer on a solid, stable surface.\n2. Press and turn the knob counterclockwise to remove the blade cover. To choose the cut type and thickness, press the knob, turn clockwise to the desired setting, then release.\n3. Secure the food in the holder. Hold the slicer with one hand and move the holder back and forth with the other; keep the holder against the base and your fingers behind the guard.\n4. To clean, press and turn the knob to OUT. Follow the guide’s illustrations to remove and refit the blade assembly without touching its edge. Dry fully, fold for storage and keep the covered blade out of children’s reach.\nCut-resistant gloves do not guarantee protection from cuts and do not replace the food holder.",
  },
  ps: {
    bladeTitle: "د بدلولو او مینځلو وړ تیغه",
    bladeBody:
      "د زنګ نه وهونکي استیل تېره څنډه؛ د تیغې مجموعه د پاکولو یا بدلولو لپاره جلا کېږي. بېرته یې د لارښود مطابق نصب کړئ.",
    antiSlipTitle: "نه‌ښویېدونکې او راټولېدونکې پښې",
    antiSlipBody:
      "پر کلک سطح د دستگاه له ثبات سره مرسته کوي؛ له کار وروسته پښې راټولېږي او د ساتلو لپاره لږ ځای نیسي.",
    slicingBody:
      "د سلاد سبزیجاتو لپاره د ۱ تر ۹ ملي‌متره پورې د تنظیم وړ نرۍ ټوټې.",
    julienneBody: "د قابلي لپاره د ګازرو نري ۴٫۵ ملي‌متره خلال.",
    potatoBody:
      "غټ ۹ ملي‌متره خلال؛ کچالو پرې کړئ او بیا یې د خپلې طریقې له مخې پاخه یا سره کړئ.",
    detailsLabel: "د برخو مواد، وزن او پاکول",
    steelGradesLabel: "د محصول په برخو کې کارول شوي استیلونه",
    steelGradesNote:
      "دا درجې د محصول بېلابېلو برخو ته مربوطې دي؛ د تیغې ځانګړې درجه جلا نه ده ښودل شوې.",
    otherMaterialsLabel: "د نورو برخو مواد",
    platedIron: "آبکاري شوې اوسپنه",
    weightLabel: "د محصول وزن",
    grams: "ګرامه",
    cleaningLabel: "پاکول او ساتنه",
    cleaningBody:
      "برخې جلا کېدای شي؛ تر روانو اوبو لاندې یا د لارښود مطابق په لوښي‌مینځونکي ماشین کې مینځل کېږي. له ساتلو مخکې یې بشپړ وچې کړئ او د تیغې څنډې پټې وساتئ.",
    faqAnswer:
      "۱. له کارولو مخکې برخې ومینځئ او وګورئ چې زیانمنې نه وي. پښې خلاصې کړئ او دستگاه پر کلک او ثابت سطح کېږدئ.\n۲. د تیغې د پوښ لرې کولو لپاره تڼۍ ټینګه کړئ او د ساعت د ستنو خلاف یې وڅرخوئ. د پرې کولو د ډول او پنډوالي لپاره تڼۍ ټینګه کړئ، د ساعت د ستنو په لوري مطلوب تنظیم ته یې وڅرخوئ او خوشې یې کړئ.\n۳. خواړه په نیوونکي کې محکم کړئ. په یوه لاس دستگاه ونیسئ او په بل لاس نیوونکی مخکې او وروسته وخوځوئ؛ نیوونکی دې له سطح سره په تماس او ګوتې دې د محافظ شاته وي.\n۴. د پاکولو لپاره تڼۍ ټینګه کړئ او OUT ته یې وڅرخوئ. د تیغې د جلا کولو او بېرته نصبولو لپاره د لارښود انځورونه تعقیب کړئ او څنډې ته یې لاس مه وروړئ. له بشپړ وچېدو وروسته پښې راټولې کړئ او پوښلې تیغه د ماشومانو له لاسرسي لرې وساتئ.\nد پرې کېدو پر وړاندې مقاومې دستکشې د پرې کېدو مخنیوی نه تضمینوي او د خوړو نیوونکی نه بدلوي.",
  },
} satisfies Record<Language, Record<string, string>>;
