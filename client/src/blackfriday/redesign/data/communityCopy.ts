export type CommunityLanguage = "fa" | "ps" | "en";

const en = {
  eyebrow: "YOUR DISH. YOUR VOICE. OUR TABLE.",
  title: "Rayhana Table",
  intro:
    "Choose a dish, learn a kitchen tip and share your view on a future idea. Four short steps—every opinion is welcome.",
  coverNote: "No account, purchase or personal details needed.",
  join: "Take my place at the table",
  browse: "Start the four steps",
  close: "Close",
  products: "Back to products",
  story: "Read the Rayhana story",
  privacyTitle: "Your choices, your privacy",
  privacy:
    "Your selected answers are sent anonymously to Rayhana’s server when you submit all four steps. We do not ask for or store your name, email, photo or other personal details. Answers are used to understand the community’s choices.",
  steps: ["Your favourite dish", "A safer kitchen habit", "Your next shared meal", "Your honest view"],
  stepPreview: "Four steps, your way",
  stepPoints: "Complete each step to earn {points} points.",
  stepLabel: "Step",
  completed: "Completed",
  progress: "Your progress",
  points: "points",
  noBadge: "There is room for you here",
  badges: ["Table guest", "Informed companion", "Table companion", "Rayhana companion"],
  journeyTitle: "Your journey",
  badgeCurrent: "Current",
  badgeEarned: "Earned",
  badgeUpcoming: "Still to come",
  nextStep: "Next: {step} · {points} points",
  journeyComplete: "All four steps complete. Thank you for taking part.",
  badgeNote:
    "Each step earns 25 points, up to 100. Badges have no financial value or purchase benefit. Purchases, reviews and social sharing are never rewarded.",
  memoryTitle: "Which dish brings you together?",
  memoryBody: "Choose the dish you most enjoy sharing with family and friends.",
  memoryOptions: {
    qabili: "Qabili palaw",
    rice: "Another pilaf",
    other: "Another food",
    skip: "I prefer to skip",
  },
  safetyTitle: "A safer kitchen habit",
  safetyBody:
    "Handles can get hot. Use Rayhana silicone grips or suitable heat-resistant gloves. Never heat a pot while empty, and do not rely on damaged heat protection.",
  safetyQuestion: "What would you do if a heat glove is damaged?",
  safetyOptions: {
    intact: "Choose an intact, suitable heat glove",
    damaged: "Use the damaged glove anyway",
  },
  incorrect:
    "A damaged glove may not protect your hand. Choose an intact, suitable glove and try again.",
  recipeTitle: "What would you serve at your next gathering?",
  recipeBody: "Pick a meal you would enjoy sharing at your next gathering.",
  recipeOptions: {
    qabili: "Qabili palaw",
    rice: "Another rice dish",
    suggestion: "Another meal",
  },
  conceptTitle: "From pot to table: an idea",
  conceptLabel: "CONCEPT ONLY · NOT FOR SALE",
  conceptBody:
    "We are considering pot grips and a trivet with an Afghan carpet-inspired pattern. This is an idea, not an available product or preorder. Any prototype would need heat, slip and safety testing before production is considered.",
  voteQuestion: "Does this idea interest you?",
  voteOptions: { yes: "I’m interested", no: "Not interested", unsure: "Not sure yet" },
  patternQuestion: "Which pattern do you prefer? (optional)",
  patternOptions: { simple: "Simple", carpet: "Carpet-inspired" },
  conceptNote:
    "Every response is welcome. Your answer is not an order or a promise that a product will be made.",
  finish: "Submit my answers",
  thanksTitle: "Your voice has a place at Rayhana Table.",
  companionRecognition:
    "A symbolic Rayhana Table badge—not a registered membership.",
  thanks:
    "Thank you for sharing your choices. Your anonymous answers have been added to the community results. Explore the Rayhana story or browse the kitchen collection.",
  submitted: "Your anonymous answers have been submitted.",
  modalIntro: "Your answers are only submitted after you finish all four steps.",
  back: "Back",
  skip: "Skip this step",
  save: "Continue",
  loading: "Submitting…",
  choose: "Choose an answer to continue.",
  offline: "You appear to be offline. Reconnect and try submitting again.",
  network: "We could not connect. Your answers remain in this open form; please try again.",
  server: "We could not submit your answers. Please try again.",
};

type CommunityCopy = {
  [K in keyof typeof en]: typeof en[K] extends string[]
    ? string[]
    : typeof en[K] extends Record<string, string>
      ? { [P in keyof typeof en[K]]: string }
      : string;
};

const fa: CommunityCopy = {
  eyebrow: "غذای شما، صدای شما، دسترخوان ما",
  title: "دسترخوان ریحانه",
  intro:
    "غذای دلخواه‌تان را انتخاب کنید، نکته‌ای برای آشپزخانه بیاموزید و دربارهٔ ایده‌ای تازه نظر بدهید. چهار قدم کوتاه؛ نظر همه ارزشمند است.",
  coverNote: "بدون نیاز به حساب کاربری، خرید یا اطلاعات شخصی.",
  join: "من هم سر این دسترخوان می‌آیم",
  browse: "آغاز چهار قدم",
  close: "بستن",
  products: "بازگشت به محصولات",
  story: "خواندن داستان ریحانه",
  privacyTitle: "انتخاب شما، حریم خصوصی شما",
  privacy:
    "پس از تکمیل هر چهار قدم، پاسخ‌های انتخابی شما به‌صورت ناشناس به سرور ریحانه فرستاده می‌شوند. نام، ایمیل، عکس یا اطلاعات شخصی دیگری نمی‌پرسیم یا ذخیره نمی‌کنیم. پاسخ‌ها برای شناخت انتخاب‌های جامعه استفاده می‌شوند.",
  steps: ["غذای دلخواه شما", "یک عادت ایمن", "وعدهٔ مشترک بعدی", "نظر خودتان"],
  stepPreview: "چهار قدم، به سلیقهٔ شما",
  stepPoints: "با تکمیل هر قدم، {points} امتیاز بگیرید.",
  stepLabel: "قدم",
  completed: "تکمیل شد",
  progress: "پیشرفت شما",
  points: "امتیاز",
  noBadge: "اینجا برای شما هم جا هست",
  badges: ["مهمان دسترخوان", "همراه آگاه", "هم‌دسترخوان", "همراه ریحانه"],
  journeyTitle: "مسیر شما",
  badgeCurrent: "نشان فعلی",
  badgeEarned: "به‌دست‌آمده",
  badgeUpcoming: "در ادامه",
  nextStep: "قدم بعدی: {step} · {points} امتیاز",
  journeyComplete: "هر چهار قدم تکمیل شد. از همراهی شما سپاسگزاریم.",
  badgeNote:
    "هر قدم ۲۵ امتیاز دارد و سقف امتیاز ۱۰۰ است. نشان‌ها ارزش مالی یا امتیاز خرید ندارند. خرید، نظرها و نشر در شبکه‌های اجتماعی پاداش ندارند.",
  memoryTitle: "کدام غذا شما را دور هم جمع می‌کند؟",
  memoryBody: "غذایی را انتخاب کنید که از خوردنش با خانواده و دوستان لذت می‌برید.",
  memoryOptions: {
    qabili: "قابلی",
    rice: "پلوی دیگری",
    other: "غذای دیگر",
    skip: "ترجیح می‌دهم بگذرم",
  },
  safetyTitle: "یک عادت برای آشپزی ایمن‌تر",
  safetyBody:
    "دسته‌ها ممکن است داغ شوند. از دستگیرهٔ سیلیکونی ریحانه یا دستکش مناسب حرارت استفاده کنید. دیگ را خالی حرارت ندهید و به محافظ آسیب‌دیده تکیه نکنید.",
  safetyQuestion: "اگر دستکش حرارتی آسیب دیده باشد، چه می‌کنید؟",
  safetyOptions: {
    intact: "دستکش سالم و مناسب حرارت انتخاب می‌کنم",
    damaged: "با همان دستکش آسیب‌دیده کار می‌کنم",
  },
  incorrect:
    "دستکش آسیب‌دیده ممکن است از دست شما محافظت نکند. دستکش سالم و مناسب را انتخاب کنید و دوباره کوشش کنید.",
  recipeTitle: "برای دورهمی بعدی چه غذایی می‌پزید؟",
  recipeBody: "غذایی را انتخاب کنید که دوست دارید در دورهمی بعدی با خانواده و دوستان میل کنید.",
  recipeOptions: {
    qabili: "قابلی",
    rice: "یک غذای برنجی دیگر",
    suggestion: "غذای دیگری",
  },
  conceptTitle: "از دیگ تا دسترخوان؛ یک ایده",
  conceptLabel: "فقط ایده است · برای فروش نیست",
  conceptBody:
    "ساخت دستگیرهٔ دیگ و زیر‌دیگی با نقش الهام‌گرفته از قالین افغانی را بررسی می‌کنیم. این فقط یک ایده است، نه محصول موجود یا پیش‌فروش. هر نمونه پیش از تصمیم تولید باید از نظر حرارت، لغزش و ایمنی آزمایش شود.",
  voteQuestion: "این ایده برایتان جالب است؟",
  voteOptions: { yes: "علاقه دارم", no: "علاقه ندارم", unsure: "هنوز مطمئن نیستم" },
  patternQuestion: "کدام نقش را ترجیح می‌دهید؟ (اختیاری)",
  patternOptions: { simple: "ساده", carpet: "الهام‌گرفته از قالین" },
  conceptNote:
    "هر پاسخی ارزشمند است. پاسخ شما سفارش یا وعدهٔ ساخت محصول نیست.",
  finish: "فرستادن پاسخ‌ها",
  thanksTitle: "صدای شما در دسترخوان ریحانه جا دارد.",
  companionRecognition: "نشان نمادین دسترخوان ریحانه؛ نه عضویت رسمی.",
  thanks:
    "از شریک‌کردن انتخاب‌هایتان سپاسگزاریم. پاسخ‌های ناشناس شما در آمار کلی مشارکت‌ها ثبت شد. داستان ریحانه را بخوانید یا محصولات آشپزخانه را ببینید.",
  submitted: "پاسخ‌های ناشناس شما فرستاده شد.",
  modalIntro: "پاسخ‌ها پس از تکمیل هر چهار قدم فرستاده می‌شوند.",
  back: "بازگشت",
  skip: "گذشتن از این قدم",
  save: "ادامه",
  loading: "در حال فرستادن…",
  choose: "برای ادامه یک پاسخ انتخاب کنید.",
  offline: "به نظر می‌رسد به اینترنت وصل نیستید. وصل شوید و دوباره بفرستید.",
  network: "ارتباط برقرار نشد. پاسخ‌ها در همین فرم باز باقی‌اند؛ لطفاً دوباره کوشش کنید.",
  server: "پاسخ‌ها فرستاده نشدند. لطفاً دوباره کوشش کنید.",
};

const ps: CommunityCopy = {
  eyebrow: "ستاسو خواړه، ستاسو غږ، زموږ دسترخوان",
  title: "د ریحانې دسترخوان",
  intro:
    "خپل د خوښې خواړه وټاکئ، د پخلنځي یوه لار زده کړئ او د یوې نوې مفکورې په اړه خپل نظر ووایئ. څلور لنډ ګامونه؛ د هر چا نظر ارزښت لري.",
  coverNote: "حساب، پېرود یا شخصي معلوماتو ته اړتیا نشته.",
  join: "زه هم د دې دسترخوان برخه کېږم",
  browse: "څلور ګامونه پیل کړئ",
  close: "تړل",
  products: "محصولاتو ته بېرته تلل",
  story: "د ریحانې کیسه لوستل",
  privacyTitle: "ستاسو انتخابونه، ستاسو محرمیت",
  privacy:
    "ستاسو ټاکل شوي ځوابونه د څلورو واړو ګامونو له بشپړولو وروسته په ناپېژندلې بڼه د ریحانې سرور ته لېږل کېږي. نوم، برېښنالیک، انځور یا نور شخصي معلومات نه غواړو او نه یې ساتو. ځوابونه د ټولنې د انتخابونو د پېژندلو لپاره کارېږي.",
  steps: ["ستاسو د خوښې خواړه", "یو خوندي عادت", "راتلونکې ګډه ډوډۍ", "ستاسو رښتینی نظر"],
  stepPreview: "څلور ګامونه، ستاسو په خوښه",
  stepPoints: "هر ګام بشپړ کړئ او {points} نمرې واخلئ.",
  stepLabel: "ګام",
  completed: "بشپړ شو",
  progress: "ستاسو پرمختګ",
  points: "نمرې",
  noBadge: "دلته ستاسو لپاره هم ځای شته",
  badges: ["د دسترخوان مېلمه", "خبر ملګری", "د دسترخوان ملګری", "د ریحانې ملګری"],
  journeyTitle: "ستاسو لاره",
  badgeCurrent: "اوسنۍ نښه",
  badgeEarned: "ترلاسه شوې",
  badgeUpcoming: "راتلونکې",
  nextStep: "راتلونکی ګام: {step} · {points} نمرې",
  journeyComplete: "ټول څلور ګامونه بشپړ شول. ستاسو له ګډون مننه.",
  badgeNote:
    "هر ګام ۲۵ نمرې لري؛ تر ټولو ډېرې ۱۰۰ نمرې دي. نښې مالي ارزښت یا د پېرود ګټه نه لري. پېرود، بیاکتنې او په ټولنیزو رسنیو کې شریکول انعام نه لري.",
  memoryTitle: "کوم خواړه مو سره راټولوي؟",
  memoryBody: "هغه خواړه وټاکئ چې له کورنۍ او ملګرو سره یې خوړل خوښوئ.",
  memoryOptions: {
    qabili: "قابلي پلو",
    rice: "بل ډول پلو",
    other: "نور خواړه",
    skip: "غواړم تېر شم",
  },
  safetyTitle: "په پخلنځي کې یو خوندي عادت",
  safetyBody:
    "لاستي ګرمېدای شي. د ریحانې سیلیکوني لاستي نیوونکي یا د تودوخې مناسب دستکش وکاروئ. تش دیګ مه تودوئ او زیانمن محافظ مه کاروئ.",
  safetyQuestion: "که د تودوخې دستکش زیانمن وي، څه کوئ؟",
  safetyOptions: {
    intact: "روغ او مناسب دستکش ټاکم",
    damaged: "هماغه زیانمن دستکش کاروم",
  },
  incorrect:
    "زیانمن دستکش ښايي لاس مو خوندي نه کړي. روغ او مناسب دستکش وټاکئ او بیا هڅه وکړئ.",
  recipeTitle: "راتلونکې ګډې ډوډۍ ته څه پخوئ؟",
  recipeBody: "هغه خواړه وټاکئ چې په راتلونکې مېلمستیا کې یې له کورنۍ او ملګرو سره خوړل غواړئ.",
  recipeOptions: {
    qabili: "قابلي پلو",
    rice: "د وریجو بل خواړه",
    suggestion: "بل خواړه",
  },
  conceptTitle: "له دیګه تر دسترخوانه: یوه مفکوره",
  conceptLabel: "یوازې مفکوره ده · د پلور لپاره نه ده",
  conceptBody:
    "د افغان غالیو له نقش څخه په الهام د دیګ لاستي نیوونکي او لاندې اېښودونکي څېړو. دا یوازې یوه مفکوره ده، نه شته محصول او نه مخکېنی فرمایش. هره نمونه باید د تولید له پرېکړې مخکې د تودوخې، ښویېدو او خوندیتوب ازموینه تېره کړي.",
  voteQuestion: "دا مفکوره درته په زړه پورې ده؟",
  voteOptions: { yes: "لېوالتیا لرم", no: "لېوالتیا نه لرم", unsure: "لا ډاډه نه یم" },
  patternQuestion: "کوم نقش مو خوښېږي؟ (اختیاري)",
  patternOptions: { simple: "ساده", carpet: "له غالۍ الهام اخیستی" },
  conceptNote: "هر ځواب ارزښت لري. ستاسو ځواب فرمایش یا د تولید ژمنه نه ده.",
  finish: "خپل ځوابونه ولېږئ",
  thanksTitle: "ستاسو غږ د ریحانې په دسترخوان کې ځای لري.",
  companionRecognition: "د ریحانې دسترخوان یوه سمبولیکه نښه، نه رسمي غړیتوب.",
  thanks:
    "د خپلو انتخابونو له شریکولو مو مننه. ستاسو ناپېژندلي ځوابونه د ګډونوالو په ټولیزو پایلو کې ثبت شول. د ریحانې کیسه ولولئ یا د پخلنځي محصولات وګورئ.",
  submitted: "ستاسو ناپېژندلي ځوابونه ولېږل شول.",
  modalIntro: "ځوابونه مو د ټولو څلورو ګامونو له بشپړېدو وروسته لېږل کېږي.",
  back: "بېرته",
  skip: "له دې ګامه تېرېدل",
  save: "دوام",
  loading: "لېږل کېږي…",
  choose: "د دوام لپاره یو ځواب وټاکئ.",
  offline: "ښايي انټرنېټ سره نه یاست نښتي. ونښلئ او بیا یې ولېږئ.",
  network: "اړیکه ټینګه نه شوه. ځوابونه مو په همدې پرانیستې فورمه کې پاتې دي؛ بیا هڅه وکړئ.",
  server: "ځوابونه ونه لېږل شول. مهرباني وکړئ بیا هڅه وکړئ.",
};

export const communityCopy: Record<CommunityLanguage, CommunityCopy> = {
  en,
  fa,
  ps,
};

export function communityBadgeLevel(points: number): number {
  if (!Number.isFinite(points) || points < 25) return -1;
  return Math.min(3, Math.floor(points / 25) - 1);
}
