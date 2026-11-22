import type { Language } from "./catalog";

export const brandStoryCopy = {
  fa: {
    eyebrow: "از خاطرهٔ خانه تا دسترخوان امروز",
    title: "گاهی با بوی یک غذا، به خانه نزدیک می‌شویم",
    intro:
      "طعم‌های آشنا با ما می‌مانند، حتی وقتی خانه دور است. ریحانه از فرهنگ پخت‌وپز افغانی برای زندگی امروز الهام می‌گیرد.",
    chapters: [
      {
        label: "خاطرهٔ خانه",
        title: "هر خانه، یک قصه.",
        body: "بوی قابلی، یاد یک عزیز یا رسم مهمانی؛ هر خانه خاطره‌ای در غذایش دارد.",
      },
      {
        label: "آشپزخانهٔ امروز",
        title: "طعم آشنا، انتخاب امروز.",
        body: "دیگ قابلی ریحانه این پیوند را به آشپزخانهٔ امروز می‌آورد. گنجایش، ویژگی‌ها و روش مراقبتش را با نیاز خودتان بسنجید.",
      },
      {
        label: "دسترخوان فردا",
        title: "جای صدای شما.",
        body: "غذای دلخواه را انتخاب کنید و دربارهٔ دستور و ایدهٔ محصول بعدی نظر بدهید. برای سهم‌گرفتن، خرید لازم نیست.",
      },
    ],
    action: "به دسترخوان ریحانه بپیوندید",
    secondaryAction: "ویژگی‌های دیگ را ببینید",
    signature: "RAYHANA — Roots in Modern Life",
    caption: "قابلی؛ پیوندی میان خاطره و امروز.",
    sourceLabel: "داستان ریحانه را بخوانید",
  },
  en: {
    eyebrow: "FROM MEMORIES OF HOME TO TODAY’S TABLE",
    title: "Sometimes, the smell of a meal brings us closer to home.",
    intro:
      "Familiar flavours stay with us, even when home is far away. Rayhana draws on Afghan cooking traditions for life today.",
    chapters: [
      {
        label: "A memory of home",
        title: "Every home has a story.",
        body: "The aroma of qabili, someone we miss or a family gathering—every home holds memories in its food.",
      },
      {
        label: "A kitchen today",
        title: "Familiar food. Today’s choice.",
        body: "The Rayhana Qabili Pot brings that connection into today’s kitchen. Explore its sizes, features and care guidance for the way you cook.",
      },
      {
        label: "Tomorrow’s table",
        title: "A place for your voice.",
        body: "Choose a favourite dish and share your view on a recipe and a future product idea. No purchase is needed to join in.",
      },
    ],
    action: "Join the Rayhana Table",
    secondaryAction: "Explore the pot",
    signature: "RAYHANA — Roots in Modern Life",
    caption: "Qabili: a link between then and now.",
    sourceLabel: "Read Rayhana’s story",
  },
  ps: {
    eyebrow: "د کور له خاطرې تر ننني دسترخوان پورې",
    title: "کله ناکله، د یوه خوراک بوی مو کور ته نږدې کوي.",
    intro:
      "اشنا خوندونه راسره پاتې کېږي، که کور هم لرې وي. ریحانه د ننني ژوند لپاره د افغاني پخلي له دودونو الهام اخلي.",
    chapters: [
      {
        label: "د کور خاطره",
        title: "هر کور خپله کیسه لري.",
        body: "د قابلي بوی، د یوه عزیز یاد یا د مېلمستیا دود؛ هر کور په خپلو خوړو کې خاطرې لري.",
      },
      {
        label: "نننی پخلنځی",
        title: "اشنا خوند، د نن انتخاب.",
        body: "د ریحانې قابلي دیګ دا اړیکه ننني پخلنځي ته راوړي. اندازه، ځانګړنې او د ساتنې لارښود یې د خپلو اړتیاوو له مخې وګورئ.",
      },
      {
        label: "د سبا دسترخوان",
        title: "ستاسو د غږ ځای.",
        body: "د خوښې خواړه وټاکئ او د ترکیب او راتلونکي محصول د مفکورې په اړه نظر ورکړئ. ګډون پېرود نه غواړي.",
      },
    ],
    action: "د ریحانې له دسترخوان سره یوځای شئ",
    secondaryAction: "د دیګ ځانګړنې وګورئ",
    signature: "RAYHANA — Roots in Modern Life",
    caption: "قابلي؛ د خاطرې او نن ترمنځ اړیکه.",
    sourceLabel: "د ریحانې کیسه ولولئ",
  },
} satisfies Record<Language, Record<string, unknown>>;
