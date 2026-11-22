export type CommunityLanguage = "fa" | "ps" | "en";

const en = {
  eyebrow: "YOUR DISH. YOUR VOICE. OUR TABLE.",
  title: "Rayhana Table",
  intro:
    "There is room for you here. Bring your favorite food and point of view to the table: choose a favorite dish for a gathering, take away a practical kitchen tip, and tell us what you think about the next idea. Four small steps, at your own pace and in your own way; a different opinion is just as welcome.",
  coverNote: "No account, purchase or photo needed.",
  join: "Take my place & save progress",
  browse: "Explore the four steps",
  close: "Close for now",
  products: "Back to products",
  back: "Back",
  story: "Read the Rayhana story",
  resume: "Continue my steps",
  privacyTitle: "Your choices, your privacy",
  privacy:
    "When you finish all four steps, your answer choices are stored in Rayhana’s database without your name, email, location or IP address. We use them to guide future work; they are not published. Optional written memories and suggestions stay only in this browser and are never submitted.",
  expiry:
    "Your in-progress answers and optional notes stay in this browser. Progress expires after 30 days. You can delete this local data here. Submitted answers are not linked to contact details, so an individual response cannot be identified and removed later.",
  preview:
    "You can explore without joining. Nothing is submitted to Rayhana until you complete all four steps.",
  steps: [
    "Your favourite dish",
    "A useful kitchen habit",
    "Your next shared meal",
    "Your honest view",
  ],
  stepPreview: "Four small ways to make this table yours",
  stepPoints: "Each saved step earns {points} points once.",
  stepLabel: "Step",
  completed: "Saved",
  progress: "Your progress",
  points: "points",
  noBadge: "There is room for you here",
  badges: [
    "Table guest",
    "Informed companion",
    "Table companion",
    "Rayhana companion",
  ],
  journeyTitle: "Your companion journey",
  badgeCurrent: "Current · earned",
  badgeEarned: "Earned",
  badgeUpcoming: "Still to come",
  nextStep: "Next: {step} · {points} points",
  journeyComplete:
    "All four steps saved. You are welcome to revisit your choices.",
  badgeNote:
    "Each step earns 25 points once, up to 100. Editing answers adds no points. Badges have no financial value or purchase benefit. Buying, Amazon reviews and social sharing are never rewarded.",
  memoryTitle: "Which dish brings people together for you?",
  memoryBody:
    "A weekend qabili, a family supper or something friends cook together. Which food feels like your gathering? Your choice is included in your anonymous response when you finish; an optional written memory stays private in this browser. Skipping earns the same points.",
  memorySavedTitle: "A little taste of your table",
  memorySavedFood:
    "Your choice is saved here for your progress and will be included anonymously when you finish: {food}.",
  memorySavedNeutral:
    "You chose to keep your food memory private. Your place here is just as welcome.",
  memoryOptions: {
    qabili: "Qabili palaw",
    rice: "Another pilaf",
    other: "Another food",
    skip: "I prefer to skip",
  },
  memoryText: "A private memory (optional · stays in this browser)",
  localHint:
    "Up to 200 characters. Please leave out names, addresses and sensitive family details. This text stays only in this browser and is not included in the anonymous response.",
  skip: "Skip this step · 25 points",
  optinSkip: "Join & skip this step · 25 points",
  save: "Save & continue",
  optinSave: "Join & save this choice",
  safetyTitle: "A small habit. A safer kitchen.",
  safetyBody:
    "Handles can get hot. Use Rayhana silicone grips or heat-resistant gloves. Never heat the pot empty. Follow the product guide and do not use damaged heat protection.",
  safetyGuideTitle: "A little care for the next shared meal",
  safetyGuideBody:
    "Handles can get hot. Use Rayhana silicone grips or heat-resistant gloves. Never heat the pot empty. Care for the coating with wood or silicone utensils and low-to-medium heat. Let the pot cool completely before washing and follow its care guide.",
  safetyQuestion: "If your heat glove is damaged, what do you do?",
  safetyOptions: {
    intact: "Choose an intact, suitable heat glove",
    damaged: "Use the damaged glove anyway",
  },
  incorrect:
    "A damaged protector may not protect your hand adequately. Choose the intact, suitable glove and try again. No penalty, and no extra points for retrying.",
  recipeTitle: "Which dish would you choose for a gathering?",
  recipeBody:
    "Pick qabili, another rice dish or your own idea for a shared meal. Your selected option is included in the anonymous response when you finish. Any written suggestion is optional and stays only in this browser.",
  recipeOptions: {
    qabili: "Qabili palaw",
    rice: "Another rice dish",
    suggestion: "My suggestion",
  },
  suggestionText: "My private suggestion (optional · stays in this browser)",
  conceptTitle: "An idea for moving from pot to table",
  conceptLabel: "CONCEPT ONLY · NOT FOR SALE",
  conceptBody:
    "We are considering pot grips and a trivet with an Afghan carpet-inspired pattern, for the moments between cooking and setting the table. This is an idea, not an available product or a preorder. Prototypes need heat, slip and safety testing before any production decision.",
  voteQuestion: "Does this idea interest you?",
  voteOptions: {
    yes: "I’m interested",
    no: "Not interested",
    unsure: "Not sure yet",
  },
  patternQuestion: "A pattern preference (optional)",
  patternOptions: { simple: "Simple", carpet: "Carpet-inspired" },
  clearPattern: "No pattern preference",
  conceptNote:
    "Positive, negative and unsure responses each earn 25 points. Your response is not an order or a promise of availability.",
  finish: "Save my response",
  thanksTitle: "Your voice has a place at Rayhana Table.",
  thanksPersonalTitle: "{food}, your voice, your place at Rayhana Table.",
  companionRecognition:
    "A recognised Rayhana companion · a symbolic badge, not a registered membership.",
  thanks:
    "Your four answer choices have been saved anonymously in Rayhana’s database to help guide future work. They are not linked to your name, email, location or IP address. Thank you for making this conversation your own, whether your answer was yes, no or not yet. Your optional private text stays in this browser.",
  delete: "Delete my progress & private text",
  deleteTitle: "Delete your Rayhana Table progress?",
  deleteBody:
    "This deletes your in-progress answers and private notes from this browser. Completed survey answers are stored anonymously and cannot be matched back to you or deleted individually.",
  confirmDelete: "Yes, delete my progress",
  cancel: "Keep my progress",
  loading: "Saving…",
  restoring: "Restoring your saved progress…",
  deleting: "Deleting your progress…",
  saved: "Your choice is saved.",
  joined: "You’ve joined. Your progress stays in this browser; completed answer choices are submitted anonymously.",
  deleted: "Your in-progress answers and private notes have been deleted from this browser.",
  deletedLocalWarning:
    "Progress was removed, but this browser could not confirm removal of its saved data. You can clear this site’s browser storage in your browser settings.",
  offline: "You appear to be offline. Your inputs are still here.",
  network: "The campaign service is unavailable. Your inputs are still here.",
  server: "The campaign service is unavailable. Your inputs are still here.",
  storage:
    "Progress could not be saved in this browser. Your inputs are still here; check browser storage settings.",
  invalid:
    "Your saved progress is unavailable or has expired. The old browser token was cleared. Choose Join to start again; we will not do this automatically.",
  missingStorage:
    "Browser storage is unavailable. You can still take part in this tab, but your progress and private notes may not survive a reload. Keep this tab open to manage or delete your progress.",
  retry: "Try again",
  choose: "Choose an answer first.",
  expiredOn: "Saved here until",
  unsaved: "Not saved yet",
  max: "Maximum 100 points",
};

type Copy = {
  [K in keyof typeof en]: K extends "steps" | "badges"
    ? string[]
    : K extends "memoryOptions"
      ? Record<"qabili" | "rice" | "other" | "skip", string>
      : K extends "safetyOptions"
        ? Record<"intact" | "damaged", string>
        : K extends "recipeOptions"
          ? Record<"qabili" | "rice" | "suggestion", string>
          : K extends "voteOptions"
            ? Record<"yes" | "no" | "unsure", string>
            : K extends "patternOptions"
              ? Record<"simple" | "carpet", string>
              : string;
};

const fa: Copy = {
  eyebrow: "غذای شما، صدای شما، دسترخوان ما",
  title: "دسترخوان ریحانه",
  intro:
    "اینجا برای شما هم جا هست. غذای دلخواه و نظر خودتان را به دسترخوان بیاورید: برای یک دورهمی، غذای محبوبتان را انتخاب کنید، نکته‌ای کاربردی برای آشپزخانه با خود ببرید و دربارهٔ ایدهٔ بعدی بگویید چه فکر می‌کنید. چهار قدم کوچک، با وقت و سلیقهٔ خودتان؛ نظر متفاوت هم به همان اندازه عزیز است.",
  coverNote: "بدون نیاز به حساب کاربری، خرید یا عکس.",
  join: "سهم می‌گیرم و پیشرفتم را ذخیره می‌کنم",
  browse: "دیدن چهار قدم",
  close: "فعلاً می‌بندم",
  products: "برگشت به محصولات",
  back: "بازگشت",
  story: "خواندن داستان ریحانه",
  resume: "ادامهٔ قدم‌های من",
  privacyTitle: "انتخاب شما، حریم خصوصی شما",
  privacy:
    "پس از تکمیل هر چهار قدم، انتخاب‌های شما در پایگاه دادهٔ ریحانه بدون نام، ایمیل، موقعیت مکانی یا نشانی IP ذخیره می‌شوند تا در کارهای آینده راهنما باشند؛ این پاسخ‌ها منتشر نمی‌شوند. خاطره‌ها و پیشنهادهای نوشتاری اختیاری فقط در همین مرورگر می‌مانند و فرستاده نمی‌شوند.",
  expiry:
    "پاسخ‌های ناتمام و یادداشت‌های اختیاری شما در همین مرورگر می‌مانند. پیشرفت پس از ۳۰ روز منقضی می‌شود و می‌توانید داده‌های محلی را از همین‌جا حذف کنید. پاسخ‌های ثبت‌شده به اطلاعات تماس پیوند ندارند؛ بنابراین نمی‌توان یک پاسخ مشخص را پیدا و بعداً حذف کرد.",
  preview:
    "بدون سهم‌گرفتن هم می‌توانید قدم‌ها را ببینید. تا زمانی که هر چهار قدم را تکمیل نکنید، پاسخی به ریحانه فرستاده نمی‌شود.",
  steps: ["غذای دلخواه شما", "یک عادت مصون", "وعدهٔ مشترک بعدی", "نظر خودتان"],
  stepPreview: "چهار قدم کوچک، با سلیقه و صدای خودتان",
  stepPoints: "هر قدم ذخیره‌شده، فقط یک‌بار {points} امتیاز دارد.",
  stepLabel: "قدم",
  completed: "ذخیره شد",
  progress: "پیشرفت شما",
  points: "امتیاز",
  noBadge: "اینجا برای شما هم جا هست",
  badges: [
    "مهمان دسترخوان",
    "همراه آگاه",
    "هم‌دسترخوان",
    "همراه دسترخوان ریحانه",
  ],
  journeyTitle: "قدم‌به‌قدم تا همراهی دسترخوان",
  badgeCurrent: "نشان فعلی · به دست آمده",
  badgeEarned: "به دست آمده",
  badgeUpcoming: "پیش رو",
  nextStep: "قدم بعدی: {step} · {points} امتیاز",
  journeyComplete:
    "هر چهار قدم ذخیره شدند؛ هر وقت خواستید، انتخاب‌هایتان را دوباره ببینید.",
  badgeNote:
    "هر قدم فقط یک‌بار ۲۵ امتیاز دارد؛ سقف ۱۰۰ امتیاز است. تغییر پاسخ، امتیاز تازه ندارد. نشان‌ها ارزش مالی یا امتیاز خرید ندارند. خرید، نظر آمازون و نشر در شبکه‌های اجتماعی هیچ امتیازی ندارند.",
  memoryTitle: "کدام غذا شما را دور هم جمع می‌کند؟",
  memoryBody:
    "قابلیِ آخر هفته، شام خانوادگی یا غذایی که با دوستان می‌پزید؛ کدام غذا رنگ دورهمی شما را دارد؟ انتخاب شما پس از تکمیل قدم‌ها به‌گونهٔ ناشناس ثبت می‌شود؛ خاطرهٔ نوشتاری اختیاری فقط در همین مرورگر می‌ماند. گذشتن از این قدم هم همان امتیاز را دارد.",
  memorySavedTitle: "رنگی از دسترخوان شما",
  memorySavedFood:
    "انتخاب شما برای پیشرفت در همین مرورگر ذخیره شد و پس از تکمیل، ناشناس ثبت می‌شود: {food}.",
  memorySavedNeutral:
    "ترجیح دادید خاطرهٔ غذا را برای خود نگه دارید؛ جای شما در این دسترخوان به همان اندازه گرم است.",
  memoryOptions: {
    qabili: "قابلی",
    rice: "پلوی دیگری",
    other: "غذای دیگر",
    skip: "ترجیح می‌دهم ننویسم",
  },
  memoryText: "خاطرهٔ خصوصی من (اختیاری؛ در همین مرورگر می‌ماند)",
  localHint:
    "حداکثر ۲۰۰ نویسه. لطفاً نام، نشانی و اطلاعات حساس خانواده را ننویسید. این متن فقط در همین مرورگر می‌ماند و در پاسخ ناشناس ثبت نمی‌شود.",
  skip: "از این قدم می‌گذرم · ۲۵ امتیاز",
  optinSkip: "مشارکت و گذشتن از این قدم · ۲۵ امتیاز",
  save: "ذخیره و ادامه",
  optinSave: "مشارکت و ذخیرهٔ این انتخاب",
  safetyTitle: "یک عادت کوچک؛ آشپزخانهٔ مصون‌تر",
  safetyBody:
    "دسته‌ها ممکن است داغ شوند؛ از دستگیرهٔ سیلیکونی ریحانه یا دستکش مناسب حرارت استفاده کنید. دیگ را خالی حرارت ندهید. راهنمای محصول را رعایت کنید و به محافظ آسیب‌دیده تکیه نکنید.",
  safetyGuideTitle: "کمی مراقبت، برای دورهمی بعدی",
  safetyGuideBody:
    "دسته‌ها ممکن است داغ شوند؛ از دستگیرهٔ سیلیکونی ریحانه یا دستکش مناسب حرارت استفاده کنید. دیگ را خالی حرارت ندهید. برای مراقبت از پوشش دیگ، ابزار چوبی یا سیلیکونی و حرارت کم تا متوسط را انتخاب کنید. پیش از شست‌وشو بگذارید دیگ کاملاً سرد شود و راهنمای مراقبت را رعایت کنید.",
  safetyQuestion: "اگر دستکش حرارتی آسیب دیده باشد، چه می‌کنید؟",
  safetyOptions: {
    intact: "دستکش سالم و مناسب حرارت می‌گیرم",
    damaged: "همان دستکش آسیب‌دیده را به کار می‌برم",
  },
  incorrect:
    "محافظ آسیب‌دیده ممکن است به اندازهٔ کافی از دست محافظت نکند. دستکش سالم و مناسب را انتخاب کنید و دوباره کوشش کنید؛ نه جریمه دارد، نه امتیاز اضافی.",
  recipeTitle: "برای یک دورهمی کدام غذا را انتخاب می‌کنید؟",
  recipeBody:
    "قابلی، غذای برنجی دیگر یا ایدهٔ خودتان برای یک وعدهٔ مشترک را انتخاب کنید. انتخاب شما پس از تکمیل به‌گونهٔ ناشناس ثبت می‌شود؛ پیشنهاد نوشتاری اختیاری فقط در همین مرورگر می‌ماند.",
  recipeOptions: {
    qabili: "قابلی",
    rice: "یک غذای برنجی دیگر",
    suggestion: "پیشنهاد من",
  },
  suggestionText: "پیشنهاد خصوصی من (اختیاری؛ در همین مرورگر می‌ماند)",
  conceptTitle: "یک ایده برای برداشتن و گذاشتن دیگ",
  conceptLabel: "فقط یک ایده؛ برای فروش نیست",
  conceptBody:
    "دستگیره و زیر‌دیگی با نقش الهام‌گرفته از قالین افغانی را بررسی می‌کنیم؛ برای فاصلهٔ میان پختن غذا و چیدن دسترخوان. این فقط ایده است، نه محصول موجود یا پیش‌سفارش. پیش از تصمیم تولید، نمونه‌ها به آزمون حرارت، لغزش و ایمنی نیاز دارند.",
  voteQuestion: "این ایده برایتان جالب است؟",
  voteOptions: {
    yes: "علاقه دارم",
    no: "علاقه ندارم",
    unsure: "هنوز نمی‌دانم",
  },
  patternQuestion: "انتخاب نقش (اختیاری)",
  patternOptions: { simple: "ساده", carpet: "الهام‌گرفته از قالین" },
  clearPattern: "ترجیحی برای نقش ندارم",
  conceptNote:
    "پاسخ مثبت، منفی و نامطمئن، هرکدام ۲۵ امتیاز دارند. پاسخ شما سفارش یا وعدهٔ عرضه نیست.",
  finish: "ذخیرهٔ نظرم",
  thanksTitle: "صدای شما در دسترخوان ریحانه جا دارد.",
  thanksPersonalTitle: "{food}، صدای شما و جای شما در دسترخوان ریحانه.",
  companionRecognition:
    "همراه شناخته‌شدهٔ دسترخوان ریحانه؛ نشانی نمادین، نه عضویت رسمی.",
  thanks:
    "چهار پاسخ شما به‌گونهٔ ناشناس در پایگاه دادهٔ ریحانه ثبت شدند تا در کارهای آینده راهنما باشند؛ این پاسخ‌ها به نام، ایمیل، موقعیت مکانی یا IP پیوند ندارند. سپاس که با سلیقه و صدای خودتان سهم گرفتید. نوشتهٔ خصوصی اختیاری شما فقط در همین مرورگر می‌ماند.",
  delete: "حذف پیشرفت و نوشته‌های خصوصی من",
  deleteTitle: "پیشرفت شما در دسترخوان ریحانه حذف شود؟",
  deleteBody:
    "پاسخ‌های ناتمام و یادداشت‌های خصوصی از همین مرورگر حذف می‌شوند. پاسخ‌های ثبت‌شده به اطلاعات تماس پیوند ندارند؛ بنابراین نمی‌توان یک پاسخ مشخص را پیدا و جداگانه حذف کرد.",
  confirmDelete: "بله، پیشرفت من حذف شود",
  cancel: "پیشرفتم بماند",
  loading: "در حال ذخیره…",
  restoring: "در حال بازیابی پیشرفت ذخیره‌شده…",
  deleting: "در حال حذف پیشرفت…",
  saved: "انتخاب شما ذخیره شد.",
  joined: "سهم‌گرفتن شما آغاز شد؛ پیشرفت در همین مرورگر می‌ماند و انتخاب‌های تکمیل‌شده ناشناس ثبت می‌شوند.",
  deleted: "پاسخ‌های ناتمام و یادداشت‌های خصوصی از همین مرورگر حذف شدند.",
  deletedLocalWarning:
    "پیشرفت حذف شد، اما مرورگر نتوانست حذف همهٔ داده‌های ذخیره‌شده را تأیید کند. می‌توانید داده‌های این سایت را از تنظیمات مرورگر پاک کنید.",
  offline: "به نظر می‌رسد به اینترنت وصل نیستید. ورودی‌های شما هنوز اینجا هستند.",
  network: "سرویس کمپاین در دسترس نیست. ورودی‌های شما هنوز اینجا هستند.",
  server: "سرویس کمپاین در دسترس نیست. ورودی‌های شما هنوز اینجا هستند.",
  storage:
    "پیشرفت در این مرورگر ذخیره نشد. ورودی‌های شما هنوز اینجا هستند؛ تنظیمات ذخیره‌سازی مرورگر را بررسی کنید.",
  invalid:
    "پیشرفت ذخیره‌شده در دسترس نیست یا منقضی شده است. نشانهٔ قبلی مرورگر پاک شد. برای شروع دوباره، خودتان سهم‌گرفتن را انتخاب کنید؛ خودکار آغاز نمی‌کنیم.",
  missingStorage:
    "ذخیره‌سازی مرورگر در دسترس نیست. در همین زبانه می‌توانید سهم بگیرید، اما پیشرفت و یادداشت‌ها شاید پس از بارگذاری دوباره نمانند. برای مدیریت یا حذف پیشرفت، این زبانه را باز نگه دارید.",
  retry: "کوشش دوباره",
  choose: "نخست یک پاسخ را انتخاب کنید.",
  expiredOn: "ذخیره‌شده تا",
  unsaved: "هنوز ذخیره نشده",
  max: "حداکثر ۱۰۰ امتیاز",
};

const ps: Copy = {
  eyebrow: "ستاسو خواړه، ستاسو غږ، زموږ دسترخوان",
  title: "د ریحانې دسترخوان",
  intro:
    "دلته ستاسو لپاره هم ځای شته. خپل د خوښې خواړه او نظر مو دسترخوان ته راوړئ: د یوې مېلمستیا لپاره خپل د خوښې خواړه وټاکئ، د پخلنځي یوه ګټوره لار درسره یوسئ او د بلې مفکورې په اړه خپل نظر راسره شریک کړئ. څلور واړه کوچني ګامونه، په خپل وخت او خوښه؛ بېل نظر هم همدومره د هرکلي وړ دی.",
  coverNote: "حساب، پېرود یا عکس ته اړتیا نشته.",
  join: "ګډون کوم او پرمختګ ساتم",
  browse: "څلور ګامونه وګورئ",
  close: "اوس یې بندوم",
  products: "محصولاتو ته ستنېدل",
  back: "بېرته",
  story: "د ریحانې کیسه ولولئ",
  resume: "زما ګامونو ته دوام",
  privacyTitle: "ستاسو انتخاب، ستاسو محرمیت",
  privacy:
    "کله چې څلور واړه ګامونه بشپړ کړئ، ستاسو انتخابونه د راتلونکو کارونو د لارښوونې لپاره د ریحانې په ډیټابېس کې، ستاسو له نوم، برېښنالیک، ځای یا IP پتې پرته، ساتل کېږي؛ ځوابونه نه خپرېږي. اختیاري لیکلې خاطرې او وړاندیزونه یوازې په همدې براوزر کې پاتې کېږي او نه لېږل کېږي.",
  expiry:
    "نا بشپړ ځوابونه او اختیاري یادښتونه په همدې براوزر کې پاتې کېږي. پرمختګ له ۳۰ ورځو وروسته پای ته رسېږي او دلته یې پاکولی شئ. سپارل شوي ځوابونه د اړیکو معلوماتو سره نه تړل کېږي؛ نو یو ځانګړی ځواب وروسته نه شي موندل کېدای او نه شي ړنګېدای.",
  preview:
    "له ګډون پرته هم ګامونه کتلی شئ. تر هغو ریحانې ته څه نه لېږل کېږي چې تاسو څلور واړه ګامونه بشپړ کړئ.",
  steps: [
    "ستاسو د خوښې خواړه",
    "یو خوندي عادت",
    "راتلونکې ګډه ډوډۍ",
    "ستاسو خپل نظر",
  ],
  stepPreview: "څلور کوچني ګامونه، ستاسو په خوښه او غږ",
  stepPoints: "هر ساتل شوی ګام یوازې یو ځل {points} نمرې لري.",
  stepLabel: "ګام",
  completed: "وساتل شو",
  progress: "ستاسو پرمختګ",
  points: "نمرې",
  noBadge: "دلته ستاسو لپاره هم ځای شته",
  badges: [
    "د دسترخوان مېلمه",
    "باخبره ملګری",
    "د دسترخوان ملګری",
    "د ریحانې ملګری",
  ],
  journeyTitle: "ګام په ګام د دسترخوان ملګرتیا",
  badgeCurrent: "اوسنۍ نښه · ترلاسه شوې",
  badgeEarned: "ترلاسه شوې",
  badgeUpcoming: "لا پاتې ده",
  nextStep: "راتلونکی ګام: {step} · {points} نمرې",
  journeyComplete:
    "ټول څلور ګامونه وساتل شول؛ خپل انتخابونه هر وخت بیا کتلی شئ.",
  badgeNote:
    "هر ګام یوازې یو ځل ۲۵ نمرې لري؛ تر ټولو ډېرې ۱۰۰ دي. د ځواب بدلول نوې نمرې نه زیاتوي. نښې مالي ارزښت یا د پېرود ګټه نه لري. پېرود، د امازون بیاکتنې او په ټولنیزو رسنیو کې شریکول نمرې نه لري.",
  memoryTitle: "کوم خواړه مو سره راټولوي؟",
  memoryBody:
    "د اونۍ د پای قابلي پلو، د کورنۍ ډوډۍ یا هغه خواړه چې له ملګرو سره یې پخوئ؛ کوم خواړه ستاسو د راټولېدو خوند لري؟ ستاسو انتخاب د ګامونو تر بشپړېدو وروسته بې‌نومه ساتل کېږي؛ لیکلې خاطره اختیاري ده او په همدې براوزر کې شخصي پاتې کېږي. له دې ګامه تېرېدل هم هماغه نمرې لري.",
  memorySavedTitle: "ستاسو د دسترخوان یو خوند",
  memorySavedFood:
    "ستاسو انتخاب د پرمختګ لپاره په همدې براوزر کې وساتل شو او د بشپړېدو پر مهال به بې‌نومه ثبت شي: {food}.",
  memorySavedNeutral:
    "غوښتل مو د خوړو خاطره له ځان سره وساتئ؛ په دې دسترخوان کې ستاسو ځای همدومره تود دی.",
  memoryOptions: {
    qabili: "قابلي پلو",
    rice: "بل ډول پلو",
    other: "نور خواړه",
    skip: "غواړم تېر شم",
  },
  memoryText: "زما شخصي خاطره (اختیاري؛ په همدې براوزر کې پاتې کېږي)",
  localHint:
    "تر ۲۰۰ تورو پورې. نومونه، پتې او د کورنۍ حساس معلومات مه لیکئ. دا متن یوازې په همدې براوزر کې پاتې کېږي او په بې‌نومه ځواب کې نه شاملېږي.",
  skip: "له دې ګامه تېرېږم · ۲۵ نمرې",
  optinSkip: "ګډون کوم او له دې ګامه تېرېږم · ۲۵ نمرې",
  save: "ساتل او دوام",
  optinSave: "ګډون کوم او دا انتخاب ساتم",
  safetyTitle: "یو کوچنی عادت؛ خوندي پخلنځی",
  safetyBody:
    "لاستي ګرمېدای شي؛ د ریحانې سیلیکوني لاستي ساتونکي یا د تودوخې مناسبې دستکشې وکاروئ. تش دیګ مه تودوئ. د محصول لارښود تعقیب کړئ او خراب محافظ مه کاروئ.",
  safetyGuideTitle: "لږه پاملرنه، د راتلونکې ګډې ډوډۍ لپاره",
  safetyGuideBody:
    "لاستي ګرمېدای شي؛ د ریحانې سیلیکوني لاستي ساتونکي یا د تودوخې مناسبې دستکشې وکاروئ. تش دیګ مه تودوئ. د پوښ د ساتنې لپاره لرګین یا سیلیکوني وسایل او ټیټه تر منځنۍ تودوخه وکاروئ. له مینځلو مخکې دیګ بشپړ یخ کړئ او د ساتنې لارښود تعقیب کړئ.",
  safetyQuestion: "که د تودوخې دستکش زیانمن شوی وي، څه کوئ؟",
  safetyOptions: {
    intact: "روغ او د تودوخې لپاره مناسب دستکش اخلم",
    damaged: "هماغه زیانمن دستکش کاروم",
  },
  incorrect:
    "زیانمن ساتونکی ښايي لاس په کافي اندازه خوندي نه کړي. روغ او مناسب دستکش وټاکئ او بیا هڅه وکړئ؛ نه جریمه شته او نه د بیا هڅې اضافي نمرې.",
  recipeTitle: "د ګډې ډوډۍ لپاره کوم خواړه غوره کوئ؟",
  recipeBody:
    "قابلي پلو، د وریجو بل خواړه یا د ګډې ډوډۍ لپاره خپله مفکوره وټاکئ. ستاسو ټاکل شوی انتخاب د ګامونو تر بشپړېدو وروسته بې‌نومه ساتل کېږي؛ لیکلی وړاندیز اختیاري دی او یوازې په همدې براوزر کې پاتې کېږي.",
  recipeOptions: {
    qabili: "قابلي پلو",
    rice: "د وریجو بل خواړه",
    suggestion: "زما وړاندیز",
  },
  suggestionText: "زما شخصي وړاندیز (اختیاري؛ په همدې براوزر کې پاتې کېږي)",
  conceptTitle: "د دیګ د پورته کولو او اېښودلو مفکوره",
  conceptLabel: "یوازې مفکوره؛ د پلور لپاره نه ده",
  conceptBody:
    "د دیګ د لاستي ساتونکي او د دیګ لاندې اېښودونکي مفکوره څېړو، چې نقش یې له افغان غالیو الهام اخلي؛ د پخلي او دسترخوان غوړولو ترمنځ شېبو لپاره. دا یوازې مفکوره ده، نه شته محصول او نه مخکېنی فرمایش. د تولید له پرېکړې مخکې نمونې د تودوخې، ښویېدو او خوندیتوب ازموینې غواړي.",
  voteQuestion: "دا مفکوره درته په زړه پورې ده؟",
  voteOptions: {
    yes: "لېوالتیا لرم",
    no: "لېوالتیا نه لرم",
    unsure: "لا نه پوهېږم",
  },
  patternQuestion: "د نقش خوښه (اختیاري)",
  patternOptions: { simple: "ساده", carpet: "له غالۍ الهام اخیستی" },
  clearPattern: "د نقش ځانګړې خوښه نه لرم",
  conceptNote:
    "مثبت، منفي او نامطمئن ځوابونه هر یو ۲۵ نمرې لري. ستاسو ځواب فرمایش یا د محصول د وړاندې کولو ژمنه نه ده.",
  finish: "زما نظر وساتئ",
  thanksTitle: "ستاسو غږ د ریحانې په دسترخوان کې ځای لري.",
  thanksPersonalTitle: "{food}، ستاسو غږ او د ریحانې په دسترخوان کې ستاسو ځای.",
  companionRecognition:
    "د ریحانې پېژندل شوی ملګری؛ یوه سمبولیکه نښه، نه رسمي غړیتوب.",
  thanks:
    "ستاسو څلور انتخابونه د راتلونکو کارونو د لارښوونې لپاره د ریحانې په ډیټابېس کې بې‌نومه وساتل شول؛ له نوم، برېښنالیک، ځای یا IP پتې سره نه دي تړل شوي. مننه چې په خپله خوښه او خپل غږ مو ونډه واخیسته. اختیاري شخصي لیکنه مو یوازې په همدې براوزر کې پاتې کېږي.",
  delete: "زما پرمختګ او شخصي لیکنې ړنګول",
  deleteTitle: "د ریحانې په دسترخوان کې مو پرمختګ ړنګ شي؟",
  deleteBody:
    "نا بشپړ ځوابونه او شخصي یادښتونه له همدې براوزر څخه ړنګېږي. سپارل شوي ځوابونه د اړیکو معلوماتو سره نه تړل کېږي؛ نو یو ځانګړی ځواب نه شي موندل کېدای او په جلا توګه نه شي ړنګېدای.",
  confirmDelete: "هو، زما پرمختګ ړنګ کړئ",
  cancel: "زما پرمختګ وساتئ",
  loading: "ساتل کېږي…",
  restoring: "ساتل شوی پرمختګ بېرته راوړل کېږي…",
  deleting: "پرمختګ ړنګېږي…",
  saved: "ستاسو انتخاب وساتل شو.",
  joined: "ستاسو ګډون پیل شو؛ پرمختګ په همدې براوزر کې پاتې کېږي او بشپړ شوي انتخابونه بې‌نومه لېږل کېږي.",
  deleted: "نا بشپړ ځوابونه او شخصي یادښتونه له همدې براوزر څخه ړنګ شول.",
  deletedLocalWarning:
    "پرمختګ لرې شو، خو براوزر د ټولو ساتل شویو معلوماتو ړنګېدل تایید نه کړل. د براوزر له تنظیماتو د دې وېبپاڼې معلومات پاکولی شئ.",
  offline: "ښايي له انټرنېټ سره نه یاست نښتي. ستاسو لیکنې لا دلته دي.",
  network: "د کمپاین خدمت د لاسرسي وړ نه دی. ستاسو لیکنې لا دلته دي.",
  server: "د کمپاین خدمت د لاسرسي وړ نه دی. ستاسو لیکنې لا دلته دي.",
  storage: "پرمختګ په دې براوزر کې ونه ساتل شو. ستاسو لیکنې لا دلته دي؛ د براوزر د ساتنې امستنې وګورئ.",
  invalid:
    "ساتل شوی پرمختګ نشته یا موده یې ختمه شوې. د براوزر پخوانۍ نښه پاکه شوه. د بیا پیل لپاره پخپله ګډون وټاکئ؛ موږ یې په خپله نه پیلوو.",
  missingStorage:
    "د براوزر ساتنځای نشته. په همدې ټب کې ګډون کولی شئ، خو پرمختګ او یادښتونه ښايي له بیا پرانیستلو وروسته پاتې نه شي. د پرمختګ د سمبالولو یا ړنګولو لپاره دا ټب پرانیستی وساتئ.",
  retry: "بیا هڅه",
  choose: "لومړی یو ځواب وټاکئ.",
  expiredOn: "تر دې نېټې ساتل کېږي",
  unsaved: "لا نه دی ساتل شوی",
  max: "تر ټولو ډېرې ۱۰۰ نمرې",
};

export const communityCopy: Record<CommunityLanguage, Copy> = { en, fa, ps };

/** Display tier for points saved in the visitor's browser. */
export function communityBadgeLevel(points: number): number {
  if (!Number.isFinite(points) || points < 25) return -1;
  return Math.min(3, Math.floor(points / 25) - 1);
}
