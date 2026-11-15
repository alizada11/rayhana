import type { Language } from "./catalog";

export const brandStoryCopy = {
  fa: {
    eyebrow: "از خاطرهٔ خانه تا دسترخوان امروز",
    title: "گاهی با بوی یک غذا، به خانه نزدیک می‌شویم",
    intro:
      "هر جا که زندگی می‌کنیم، بعضی غذاها هنوز ما را به خانه می‌برند؛ به قابلیِ مهمانی، به صدای گفت‌وگو و به جایی که برای یک مهمان دیگر هم جا بود. ریحانه از همین پیوند با طعم خانه الهام می‌گیرد.",
    chapters: [
      {
        label: "خاطرهٔ خانه",
        title: "غذایی که قصه دارد.",
        body: "یک دیگ قابلی می‌تواند آغاز یک گفت‌وگو باشد؛ از اینکه چه کسی آن را می‌پخت، تا اینکه امروز چه کسانی دور دسترخوان می‌نشینند. هر خانه، قصهٔ خودش را دارد.",
      },
      {
        label: "آشپزخانهٔ امروز",
        title: "سنتی که با ما می‌آید.",
        body: "دیگ قابلی ریحانه با الهام از پخت‌وپز افغانی، برای آشپزخانه‌های امروز معرفی شده است. گنجایش و ویژگی‌ها را می‌بینید، روش مراقبت را می‌خوانید و برای پخت‌وپز خودتان انتخاب می‌کنید.",
      },
      {
        label: "جای شما",
        title: "دسترخوان، با همراهی شما.",
        body: "کدام غذا شما را دور هم جمع می‌کند؟ در دسترخوان ریحانه انتخابش کنید، به دستور غذای بعدی رأی بدهید و دربارهٔ ایدهٔ محصول بعدی نظر بگویید. برای سهم‌گرفتن، خرید لازم نیست.",
      },
    ],
    action: "در دسترخوان ریحانه سهم می‌گیرم",
    secondaryAction: "ویژگی‌های دیگ را می‌بینم",
    signature: "RAYHANA — Roots in Modern Life",
    caption: "برای غذاهایی که دورشان جمع می‌شویم.",
    sourceLabel: "خواندن داستان برند ریحانه",
  },
  en: {
    eyebrow: "FROM MEMORIES OF HOME TO TODAY’S TABLE",
    title: "Sometimes, the smell of a meal brings us closer to home.",
    intro:
      "Wherever we live, some meals still bring us home: qabili for a gathering, familiar conversation and room for one more guest. Rayhana takes its inspiration from that connection to the taste of home.",
    chapters: [
      {
        label: "A memory of home",
        title: "A dish with a story.",
        body: "A pot of qabili can start a conversation: who used to cook it, and who shares it with us today. Every home has its own story.",
      },
      {
        label: "A kitchen today",
        title: "Tradition that comes with us.",
        body: "Inspired by Afghan cooking, the Rayhana Qabili Pot is introduced for modern kitchens. Explore the sizes and features, read the care guidance and choose for the way you cook.",
      },
      {
        label: "Your place here",
        title: "A table you help shape.",
        body: "Which meal brings you together? Choose it at Rayhana Table, vote for the next recipe and give your view on a future product idea. You don’t need to buy anything to join in.",
      },
    ],
    action: "Take my place at Rayhana Table",
    secondaryAction: "Explore the pot’s features",
    signature: "RAYHANA — Roots in Modern Life",
    caption: "Made for the Meals That Bring Us Together.",
    sourceLabel: "Read Rayhana’s brand story",
  },
  ps: {
    eyebrow: "د کور له خاطرې تر ننني دسترخوان پورې",
    title: "کله ناکله، د یوه خوراک بوی مو کور ته نږدې کوي.",
    intro:
      "هر چېرته چې ژوند کوو، ځینې خواړه مو لا هم د کور یاد ته بیایي؛ د مېلمستیا قابلي پلو، اشنا خبرې او د یوه بل مېلمه لپاره ځای. ریحانه د کور له خوند سره له همدې اړیکې الهام اخلي.",
    chapters: [
      {
        label: "د کور خاطره",
        title: "خواړه چې کیسه لري.",
        body: "د قابلي پلو یو دیګ د خبرو پیل کېدای شي؛ څوک به یې پخاوه او نن یې له چا سره خورو؟ هر کور خپله کیسه لري.",
      },
      {
        label: "نننی پخلنځی",
        title: "دود چې راسره راځي.",
        body: "د افغاني پخلي له دود څخه الهام اخیستی د ریحانې قابلي دیګ د نننیو پخلنځیو لپاره معرفي شوی. اندازې او ځانګړنې وګورئ، د ساتنې لارښود ولولئ او د خپل پخلي لپاره انتخاب وکړئ.",
      },
      {
        label: "ستاسو ځای",
        title: "دسترخوان ستاسو په ملتیا.",
        body: "کوم خواړه مو سره راټولوي؟ د ریحانې په دسترخوان کې یې وټاکئ، راتلونکي ترکیب ته رایه ورکړئ او د محصول د مفکورې په اړه نظر ووایئ. ګډون پېرود نه غواړي.",
      },
    ],
    action: "د ریحانې په دسترخوان کې ونډه اخلم",
    secondaryAction: "د دیګ ځانګړنې ګورم",
    signature: "RAYHANA — Roots in Modern Life",
    caption: "د هغو خوړو لپاره چې موږ سره راټولوي.",
    sourceLabel: "د ریحانې د برانډ کیسه ولولئ",
  },
} satisfies Record<Language, Record<string, unknown>>;
