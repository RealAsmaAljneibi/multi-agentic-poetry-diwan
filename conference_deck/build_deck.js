// Build the conference deck for The Emirati Multi-Agentic Poetic Majlis.
// Heritage palette (parchment + ink + gold + crimson + sage) lifted from the app.
// Ten slides, mission-first arc:
//   title → the cause (endangered oral tradition) → the council → the live debate
//   → about-never-as → no fabricated verses → the hand-built corpus
//   → architecture + responsible governance → status → asks + close.

const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE"; // 13.33 × 7.5"
pptx.title = "The Emirati Multi-Agentic Poetic Majlis";
pptx.author = "Asma Aljneibi";

// ── Palette ─────────────────────────────────────────────────────────
const C = {
  parchment:    "FDF9F0",
  parchmentDeep:"F5EBD3",
  ink:          "2C1F11",
  ink2:         "4A3825",
  inkSoft:      "6B5742",
  gold:         "A8821F",
  goldLight:    "D2B373",
  goldFaint:    "E8D9A8",
  crimson:      "8B2A24",
  crimsonDeep:  "6E211C",
  sage:         "5B6B4D",
  forest:       "2C5F2D",
  // Per-Critic accent (matches the app)
  majidi:       "5D4037",
  ousha:        "7E2C2C",
  zayed:        "1B5E20",
};

// ── Fonts ───────────────────────────────────────────────────────────
const F = {
  display: "Playfair Display",  // English headlines
  arabic:  "Amiri",              // Arabic
  body:    "Aptos",              // body
};

// ── Helpers ─────────────────────────────────────────────────────────
function bgParchment(slide) {
  slide.background = { color: C.parchment };
}

function ornamentalDivider(slide, x, y, w) {
  slide.addShape("line", { x, y, w: w/2 - 0.18, h: 0, line: { color: C.gold, width: 0.6 } });
  slide.addText("۞", {
    x: x + w/2 - 0.18, y: y - 0.12, w: 0.36, h: 0.24,
    fontSize: 14, color: C.gold, align: "center", fontFace: F.arabic,
  });
  slide.addShape("line", { x: x + w/2 + 0.18, y, w: w/2 - 0.18, h: 0, line: { color: C.gold, width: 0.6 } });
}

function kicker(slide, text, x, y, w, color) {
  slide.addText(text, {
    x, y, w, h: 0.3,
    fontSize: 9, fontFace: F.body, color: color || C.gold, bold: true,
    charSpacing: 4, align: "center",
  });
}

function smallFooter(slide) {
  slide.addText(
    "Asma Aljneibi · Abu Dhabi Government Employee + Master's Student (MBZUAI)  ·  مدعوم بالذكاء الاصطناعي",
    { x: 0.5, y: 7.15, w: 12.33, h: 0.25, fontSize: 8, color: C.inkSoft, fontFace: F.body, align: "center", italic: true }
  );
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE  (sparse, ethical-posture-first)
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bgParchment(s);

  s.addShape("rect", {
    x: 9.5, y: -0.5, w: 4.3, h: 4, fill: { color: C.goldFaint }, line: { color: C.parchment, width: 0 },
    rotate: 12,
  });
  s.addText("۞", { x: 0.6, y: 0.6, w: 0.4, h: 0.4, fontSize: 22, color: C.gold, align: "center", fontFace: F.arabic });

  kicker(s, "● EMIRATI NABATI POETRY · MULTI-AGENT SYSTEM ●", 1.5, 1.3, 10.33);

  s.addText("مجلس القصيد الإماراتي - متعدد الوكلاء", {
    x: 0.5, y: 2.0, w: 12.33, h: 1.0,
    fontSize: 50, fontFace: F.arabic, color: C.ink, align: "center",
    rtlMode: true,
  });

  s.addText("The Emirati Multi-Agentic Poetic Majlis", {
    x: 0.5, y: 3.05, w: 12.33, h: 0.7,
    fontSize: 32, fontFace: F.display, color: C.crimson, italic: true, align: "center",
  });

  ornamentalDivider(s, 4.5, 4.1, 4.33);

  s.addText("A multi-agent council that critiques Nabati poetry —\nwithout ever speaking in a deceased master's voice.", {
    x: 1.5, y: 4.4, w: 10.33, h: 1.1,
    fontSize: 18, fontFace: F.display, color: C.ink2, italic: true, align: "center",
    paraSpaceAfter: 4,
  });

  s.addText("مجلس وكلاء يُقيِّم القصيد النبطي — دون أن يتقمّص صوت شاعر راحل", {
    x: 1.5, y: 5.55, w: 10.33, h: 0.55,
    fontSize: 18, fontFace: F.arabic, color: C.crimson, align: "center",
    rtlMode: true,
  });

  s.addText("Asma Aljneibi  ·  أسماء الجنيبي", {
    x: 0.5, y: 6.5, w: 12.33, h: 0.3,
    fontSize: 13, fontFace: F.body, color: C.inkSoft, align: "center",
  });
  s.addText("Abu Dhabi Government Employee  ·  Master's Student, MBZUAI", {
    x: 0.5, y: 6.78, w: 12.33, h: 0.25,
    fontSize: 10, fontFace: F.body, color: C.inkSoft, italic: true, align: "center",
  });

  s.addNotes(
    "Title slide. Read the hook line aloud. The whole pitch is in that one sentence: " +
    "the system critiques but never impersonates. Pause for two beats before clicking through. " +
    "Do NOT mention how quickly the software was built — the work here is the curation and the " +
    "ethical design, and that took months of hand work and expert conversations."
  );
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 2 — THE CAUSE (anchor: an endangered living oral tradition)
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bgParchment(s);

  kicker(s, "● THE CAUSE WE CHAMPION · القضية التي نتبنّاها ●", 0.5, 0.35, 12.33);

  s.addText("One of the oldest living oral traditions in the Gulf —\nand it is at risk of falling silent", {
    x: 0.5, y: 0.72, w: 12.33, h: 1.05,
    fontSize: 26, fontFace: F.display, color: C.ink, align: "center",
  });
  s.addText("من أقدم التقاليد الشفهيّة الحيّة في الخليج — وهو مهدَّدٌ بالصمت", {
    x: 0.5, y: 1.78, w: 12.33, h: 0.45,
    fontSize: 17, fontFace: F.arabic, color: C.crimson, align: "center", rtlMode: true,
  });

  ornamentalDivider(s, 5.5, 2.38, 2.33);

  const problems = [
    {
      icon: "✦",
      en_title: "An oral tradition is fragile",
      ar_title: "التقليد الشفهي هشّ",
      en: "Nabati poetry lives in voices and majālis, not archives. Each master who passes takes unrecorded verse with them.",
      ar: "القصيد النبطي يعيش في الأصوات والمجالس لا في الأرشيف؛ وكلّ شاعرٍ يرحل يأخذ معه أبياتاً لم تُدوَّن.",
      color: C.crimson,
    },
    {
      icon: "✦",
      en_title: "Younger generations are drifting away",
      ar_title: "الأجيال الجديدة تبتعد",
      en: "The meters, diction, and depth of authentic Nabati feel out of reach to many young readers today.",
      ar: "انحسار حضور القصيد الأصيل، ومفرداتٌ باتت غريبة على الأجيال الجديدة.",
      color: C.gold,
    },
    {
      icon: "✦",
      en_title: "Generic AI makes it worse",
      ar_title: "الذكاء الاصطناعي العام قاصر",
      en: "LLMs hallucinate meters, conflate Nabati wazn with classical buḥūr, and miss the cultural context entirely.",
      ar: "تخلط النماذج اللغوية العامّة بين الوزن النبطي وبحور الفصحى، وتغفل السياق الثقافي.",
      color: C.sage,
    },
  ];

  const colW = 3.9;
  const startX = (13.33 - (colW * 3 + 0.4 * 2)) / 2;
  const cardY = 2.65;
  const cardH = 3.45;

  problems.forEach((p, i) => {
    const x = startX + i * (colW + 0.4);

    s.addShape("roundRect", {
      x, y: cardY, w: colW, h: cardH,
      fill: { color: "FFFFFF" },
      line: { color: C.goldFaint, width: 0.75 },
      rectRadius: 0.06,
    });
    s.addShape("rect", {
      x, y: cardY, w: 0.08, h: cardH,
      fill: { color: p.color }, line: { width: 0 },
    });
    s.addText(p.icon, {
      x: x + 0.25, y: cardY + 0.18, w: 0.5, h: 0.4,
      fontSize: 18, color: p.color, fontFace: F.arabic,
    });
    s.addText(p.en_title, {
      x: x + 0.3, y: cardY + 0.5, w: colW - 0.5, h: 0.65,
      fontSize: 15, fontFace: F.display, color: C.ink, bold: true,
    });
    s.addText(p.ar_title, {
      x: x + 0.3, y: cardY + 1.15, w: colW - 0.5, h: 0.4,
      fontSize: 13, fontFace: F.arabic, color: p.color, rtlMode: true, align: "right",
    });
    s.addShape("line", {
      x: x + 0.3, y: cardY + 1.6, w: colW - 0.6, h: 0,
      line: { color: C.goldFaint, width: 0.5 },
    });
    s.addText(p.en, {
      x: x + 0.3, y: cardY + 1.72, w: colW - 0.5, h: 0.95,
      fontSize: 10.5, fontFace: F.body, color: C.ink2,
    });
    s.addText(p.ar, {
      x: x + 0.3, y: cardY + 2.7, w: colW - 0.5, h: 0.7,
      fontSize: 10.5, fontFace: F.arabic, color: C.ink2, rtlMode: true, align: "right",
    });
  });

  // Bottom belt — the mission, not the software
  s.addShape("rect", {
    x: 0.5, y: 6.3, w: 12.33, h: 0.55,
    fill: { color: C.crimsonDeep },
    line: { width: 0 },
  });
  s.addText("Our mission: keep this tradition heard — by listening, weighing, and teaching. Never by replacing the poet.", {
    x: 0.5, y: 6.3, w: 12.33, h: 0.55,
    fontSize: 13.5, fontFace: F.display, color: C.parchment, italic: true, align: "center", valign: "middle",
  });

  smallFooter(s);

  s.addNotes(
    "The anchor slide. Open with the headline as a story: Nabati poetry is one of the oldest " +
    "LIVING oral traditions in the Gulf, and it is at risk of disappearing. That sentence is the " +
    "reason this project exists — lead with mission, not technology. The three cards are the " +
    "three faces of the risk. Land on the crimson belt: listening, weighing, teaching — never replacing."
  );
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 3 — THE COUNCIL (the three Critics as cultural figures)
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bgParchment(s);

  kicker(s, "● THE COUNCIL · مجلس النقّاد ●", 0.5, 0.35, 12.33);

  s.addText("Three Critics speaking from three schools", {
    x: 0.5, y: 0.75, w: 12.33, h: 0.6,
    fontSize: 30, fontFace: F.display, color: C.ink, align: "center",
  });
  s.addText("ثلاثةُ نقّاد يتكلّمون عن ثلاث مدارسَ شعريّة", {
    x: 0.5, y: 1.4, w: 12.33, h: 0.45,
    fontSize: 18, fontFace: F.arabic, color: C.crimson, align: "center", rtlMode: true,
  });

  ornamentalDivider(s, 5.5, 2.05, 2.33);

  const critics = [
    {
      ar_name: "الماجدي بن ظاهر",
      en_name: "Al-Mājidī bin Ẓāhir",
      era: "c. 1560s–1630s · Ras Al Khaimah",
      epithet: "Father of Emirati Nabati Poetry",
      judges: "Wazn · Qāfiyah · Bedouin diction · Moral clarity",
      ar_judges: "الوزن · القافية · المعجم البدوي · الوضوح الأخلاقي",
      color: C.majidi,
      glyph: "❖",
    },
    {
      ar_name: "عوشة بنت خليفة",
      en_name: "Ousha bint Khalifa",
      era: "1920–2018 · Al Ain",
      epithet: "Fatat Al-Arab — The Arabian Maiden",
      judges: "Truth of feeling · Economy of image · Intimate register",
      ar_judges: "صدق الشعور · اقتصاد الصورة · سجلٌّ حميم",
      color: C.ousha,
      glyph: "❀",
    },
    {
      ar_name: "الشيخ زايد بن سلطان",
      en_name: "Sheikh Zayed",
      era: "1918–2004 · Al Ain & Abu Dhabi",
      epithet: "Founding Father of the UAE",
      judges: "Steadfastness · Cohesion · Bond with the land",
      ar_judges: "الرسوخ · اللُّحمة · الصِّلة بالأرض",
      color: C.zayed,
      glyph: "✦",
    },
  ];

  const colW2 = 3.9;
  const startX2 = (13.33 - (colW2 * 3 + 0.4 * 2)) / 2;
  const cardY2 = 2.4;
  const cardH2 = 3.7;

  critics.forEach((c, i) => {
    const x = startX2 + i * (colW2 + 0.4);

    s.addShape("roundRect", {
      x, y: cardY2, w: colW2, h: cardH2,
      fill: { color: "FFFFFF" },
      line: { color: c.color, width: 1.0 },
      rectRadius: 0.06,
    });

    s.addShape("ellipse", {
      x: x + colW2/2 - 0.5, y: cardY2 + 0.2, w: 1.0, h: 1.0,
      fill: { color: c.color }, line: { width: 0 },
    });
    s.addText(c.glyph, {
      x: x + colW2/2 - 0.5, y: cardY2 + 0.32, w: 1.0, h: 0.78,
      fontSize: 36, color: "FFFFFF", align: "center", fontFace: F.arabic,
    });

    s.addText(c.ar_name, {
      x: x + 0.2, y: cardY2 + 1.35, w: colW2 - 0.4, h: 0.45,
      fontSize: 22, fontFace: F.arabic, color: C.ink, align: "center", rtlMode: true,
    });
    s.addText(c.en_name, {
      x: x + 0.2, y: cardY2 + 1.85, w: colW2 - 0.4, h: 0.4,
      fontSize: 17, fontFace: F.display, color: c.color, bold: true, align: "center",
    });
    s.addText(c.era, {
      x: x + 0.2, y: cardY2 + 2.25, w: colW2 - 0.4, h: 0.25,
      fontSize: 9, fontFace: F.body, color: C.inkSoft, align: "center", italic: true,
    });
    s.addText(c.epithet, {
      x: x + 0.2, y: cardY2 + 2.5, w: colW2 - 0.4, h: 0.3,
      fontSize: 10, fontFace: F.body, color: C.ink2, align: "center",
    });

    s.addShape("line", {
      x: x + 0.4, y: cardY2 + 2.9, w: colW2 - 0.8, h: 0,
      line: { color: c.color, width: 0.6 },
    });

    s.addText("JUDGES ON", {
      x: x + 0.2, y: cardY2 + 3.0, w: colW2 - 0.4, h: 0.2,
      fontSize: 8, fontFace: F.body, color: c.color, bold: true, charSpacing: 3, align: "center",
    });
    s.addText(c.judges, {
      x: x + 0.2, y: cardY2 + 3.2, w: colW2 - 0.4, h: 0.3,
      fontSize: 10, fontFace: F.body, color: C.ink, align: "center",
    });
    s.addText(c.ar_judges, {
      x: x + 0.2, y: cardY2 + 3.45, w: colW2 - 0.4, h: 0.25,
      fontSize: 10, fontFace: F.arabic, color: C.ink2, align: "center", rtlMode: true,
    });
  });

  // Bottom belt — the integrity claim
  s.addShape("rect", {
    x: 0.5, y: 6.3, w: 12.33, h: 0.55,
    fill: { color: C.ink },
    line: { width: 0 },
  });
  s.addText("The Critics speak from the schools — never as the masters themselves.", {
    x: 0.5, y: 6.3, w: 12.33, h: 0.55,
    fontSize: 14, fontFace: F.display, color: C.parchment, italic: true, align: "center", valign: "middle",
  });

  smallFooter(s);

  s.addNotes(
    "The Council slide. Each Critic appears as a distinct cultural figure with their own school's " +
    "evaluative dimensions. The dark belt previews the integrity claim — the next slides give it " +
    "its own stage. Keep this slide brisk; the live debate is what you want time for."
  );
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 4 — THE LIVE DEBATE (the centerpiece: a real poem meets the Majlis)
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bgParchment(s);

  kicker(s, "● THE LIVE DEBATE · المناظرة الحيّة ●", 0.5, 0.35, 12.33);

  s.addText("Watch a real poem meet the Majlis", {
    x: 0.5, y: 0.72, w: 12.33, h: 0.55,
    fontSize: 28, fontFace: F.display, color: C.ink, align: "center",
  });
  s.addText("قصيدةٌ حقيقية تدخل المجلس — وثلاثة أصواتٍ نقديّة تتداول", {
    x: 0.5, y: 1.28, w: 12.33, h: 0.4,
    fontSize: 15, fontFace: F.arabic, color: C.crimson, align: "center", rtlMode: true,
  });

  // The submitted verse — a real library verse with provenance
  s.addShape("roundRect", {
    x: 2.3, y: 1.85, w: 8.73, h: 1.5,
    fill: { color: "FFFFFF" }, line: { color: C.gold, width: 1.25 },
    rectRadius: 0.06,
  });
  s.addText("أنا لو اوزّع على الناس ابتساماتي", {
    x: 2.5, y: 1.95, w: 8.33, h: 0.5,
    fontSize: 20, fontFace: F.arabic, color: C.ink, align: "center", rtlMode: true,
  });
  s.addText("“I don't distribute my smiles to people / O you with dead feelings, what can revive them?”", {
    x: 2.5, y: 2.45, w: 8.33, h: 0.35,
    fontSize: 11, fontFace: F.display, color: C.ink2, italic: true, align: "center",
  });
  s.addText("Mohammed bin Al Theeb · Fakhr · audio-aligned corpus, full provenance on file", {
    x: 2.5, y: 2.85, w: 8.33, h: 0.3,
    fontSize: 9, fontFace: F.body, color: C.inkSoft, align: "center", italic: true,
  });

  // Down-arrows from verse to the three voices
  [3.0, 6.665, 10.33].forEach(cx => {
    s.addShape("line", {
      x: cx, y: 3.38, w: 0, h: 0.32,
      line: { color: C.gold, width: 1, endArrowType: "triangle" },
    });
  });

  // Three distinct critical voices — different emphases on the SAME bayt
  const voices = [
    {
      name: "THE MĀJIDĪ VOICE",
      ar: "صوت المدرسة الماجديّة",
      reads: "Measures the wazn, weighs the rhyme letter, tests every word against the Bedouin register.",
      verdict: "“The defiance is licit — but does the diction earn its desert lineage?”",
      color: C.majidi,
    },
    {
      name: "THE OUSHA VOICE",
      ar: "صوت مدرسة عوشة",
      reads: "Asks whether the feeling is earned — is “dead feelings” a true image, or decoration?",
      verdict: "“Pride is easy. Show me the wound the pride is guarding.”",
      color: C.ousha,
    },
    {
      name: "THE ZAYED VOICE",
      ar: "صوت مدرسة زايد",
      reads: "Listens for steadfastness and cohesion — does the defiance bind the poet to his people?",
      verdict: "“A proud bayt — but pride that stands alone serves no majlis.”",
      color: C.zayed,
    },
  ];

  const vW = 3.9;
  const vX0 = (13.33 - (vW * 3 + 0.4 * 2)) / 2;
  const vY = 3.78;
  const vH = 2.35;

  voices.forEach((v, i) => {
    const x = vX0 + i * (vW + 0.4);
    s.addShape("roundRect", {
      x, y: vY, w: vW, h: vH,
      fill: { color: "FFFFFF" }, line: { color: v.color, width: 1.25 },
      rectRadius: 0.06,
    });
    s.addShape("rect", { x, y: vY, w: vW, h: 0.42, fill: { color: v.color }, line: { width: 0 } });
    s.addText(v.name, {
      x, y: vY, w: vW, h: 0.42,
      fontSize: 11, fontFace: F.display, color: "FFFFFF", bold: true, charSpacing: 2,
      align: "center", valign: "middle",
    });
    s.addText(v.ar, {
      x: x + 0.2, y: vY + 0.5, w: vW - 0.4, h: 0.3,
      fontSize: 11, fontFace: F.arabic, color: v.color, align: "center", rtlMode: true,
    });
    s.addText(v.reads, {
      x: x + 0.25, y: vY + 0.82, w: vW - 0.5, h: 0.75,
      fontSize: 10.5, fontFace: F.body, color: C.ink2, align: "center",
    });
    s.addShape("line", {
      x: x + 0.5, y: vY + 1.62, w: vW - 1.0, h: 0,
      line: { color: v.color, width: 0.5 },
    });
    s.addText(v.verdict, {
      x: x + 0.25, y: vY + 1.7, w: vW - 0.5, h: 0.6,
      fontSize: 10.5, fontFace: F.display, color: C.ink, italic: true, align: "center",
    });
  });

  // Deliberation note
  s.addText("The Critics hear each other: each may build on — or temper — the reading before it. A deliberation, not three monologues.", {
    x: 0.5, y: 6.22, w: 12.33, h: 0.3,
    fontSize: 10.5, fontFace: F.body, color: C.inkSoft, italic: true, align: "center",
  });

  // Bottom belt
  s.addShape("rect", {
    x: 0.5, y: 6.55, w: 12.33, h: 0.5,
    fill: { color: C.crimsonDeep }, line: { width: 0 },
  });
  s.addText("This is the experience. Everything else is infrastructure.", {
    x: 0.5, y: 6.55, w: 12.33, h: 0.5,
    fontSize: 14, fontFace: F.display, color: C.parchment, italic: true, align: "center", valign: "middle",
  });

  smallFooter(s);

  s.addNotes(
    "THE centerpiece. If the room remembers one slide, make it this one. A real verse from the " +
    "corpus (with provenance) is submitted, and three distinct critical voices weigh in with " +
    "different emphases — meter and diction, truth of feeling, cohesion with the community. " +
    "The sample verdict lines are illustrative of system output — say so if asked. If a live demo " +
    "is possible, run it here. Close on the belt: this is the experience; everything else is infrastructure."
  );
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 5 — ABOUT, NEVER AS (the impersonation line we will not cross)
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: C.ink };  // dark — this is the moral spine, part one

  s.addText("● THE CURATOR & CRITIC PROTOCOL · ميثاق الناقد والقَيِّم ●", {
    x: 0.5, y: 0.4, w: 12.33, h: 0.3,
    fontSize: 9, fontFace: F.body, color: C.gold, bold: true,
    charSpacing: 4, align: "center",
  });

  s.addText("Our Critics speak about the masters.\nNever as them.", {
    x: 0.5, y: 0.85, w: 12.33, h: 1.3,
    fontSize: 32, fontFace: F.display, color: C.parchment, align: "center",
  });
  s.addText("نقّادنا يتحدّثون عن الشعراء — لا بألسنتهم", {
    x: 0.5, y: 2.15, w: 12.33, h: 0.45,
    fontSize: 18, fontFace: F.arabic, color: C.goldLight, align: "center", rtlMode: true,
  });

  // Two-column contrast: persona AI vs the Majlis
  const colY5 = 2.85;
  const colH5 = 3.3;
  const colW5 = 5.7;

  // LEFT — what persona AI does (the line others cross)
  s.addShape("roundRect", {
    x: 0.7, y: colY5, w: colW5, h: colH5,
    fill: { color: "3A2B1A" }, line: { color: C.crimson, width: 1.25 }, rectRadius: 0.06,
  });
  s.addText("✗  WHAT PERSONA AI DOES", {
    x: 0.7, y: colY5 + 0.15, w: colW5, h: 0.35,
    fontSize: 13, fontFace: F.display, color: C.goldLight, bold: true, charSpacing: 2, align: "center",
  });
  const personaRows = [
    "“Becomes” the historical figure and speaks in first person",
    "Invents words the person never said — with their name on it",
    "No sources, no provenance, no accountability to the family or the tradition",
  ];
  personaRows.forEach((t, i) => {
    s.addText("✗", {
      x: 1.0, y: colY5 + 0.65 + i * 0.85, w: 0.35, h: 0.35,
      fontSize: 15, color: C.crimson, bold: true,
    });
    s.addText(t, {
      x: 1.4, y: colY5 + 0.62 + i * 0.85, w: colW5 - 1.0, h: 0.8,
      fontSize: 12.5, fontFace: F.body, color: C.parchment,
    });
  });

  // RIGHT — what the Majlis does
  s.addShape("roundRect", {
    x: 0.7 + colW5 + 0.53, y: colY5, w: colW5, h: colH5,
    fill: { color: "243321" }, line: { color: C.forest, width: 1.25 }, rectRadius: 0.06,
  });
  s.addText("✓  WHAT THE MAJLIS DOES", {
    x: 0.7 + colW5 + 0.53, y: colY5 + 0.15, w: colW5, h: 0.35,
    fontSize: 13, fontFace: F.display, color: C.goldLight, bold: true, charSpacing: 2, align: "center",
  });
  const majlisRows = [
    "Speaks in third person, from each school's documented principles",
    "Quotes only attested verse — and cites where every line comes from",
    "Designed to be defensible to the families and institutions that hold these legacies",
  ];
  majlisRows.forEach((t, i) => {
    s.addText("✓", {
      x: 0.7 + colW5 + 0.83, y: colY5 + 0.65 + i * 0.85, w: 0.35, h: 0.35,
      fontSize: 15, color: "7CB068", bold: true,
    });
    s.addText(t, {
      x: 0.7 + colW5 + 1.23, y: colY5 + 0.62 + i * 0.85, w: colW5 - 1.0, h: 0.8,
      fontSize: 12.5, fontFace: F.body, color: C.parchment,
    });
  });

  // Bottom line
  s.addText("A deceased master's voice belongs to them, their family, and the tradition — not to a model.", {
    x: 0.5, y: 6.45, w: 12.33, h: 0.4,
    fontSize: 14, fontFace: F.display, color: C.goldLight, italic: true, align: "center",
  });

  s.addText("Asma Aljneibi · Abu Dhabi Government Employee + Master's Student (MBZUAI)", {
    x: 0.5, y: 7.15, w: 12.33, h: 0.25, fontSize: 8, color: C.goldLight, fontFace: F.body, align: "center", italic: true,
  });

  s.addNotes(
    "The impersonation slide — the first half of the moral spine. Most persona AI products " +
    "recklessly 'become' historical figures. The Majlis refuses that line by design: Critics speak " +
    "ABOUT poets, never AS them, always from documented school principles, always third person. " +
    "Read the closing line aloud. This is the slide that earns trust from cultural institutions."
  );
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 6 — NO FABRICATED VERSES, EVER (moral spine, part two)
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bgParchment(s);

  kicker(s, "● THE CURATOR & CRITIC PROTOCOL · ميثاق الناقد والقَيِّم ●", 0.5, 0.4, 12.33);

  s.addText("It will never write a fake poem.", {
    x: 0.5, y: 0.85, w: 12.33, h: 0.75,
    fontSize: 36, fontFace: F.display, color: C.crimson, align: "center",
  });
  s.addText("لا ابتكار للأبيات تحت أيّ ظرف", {
    x: 0.5, y: 1.6, w: 12.33, h: 0.45,
    fontSize: 19, fontFace: F.arabic, color: C.ink, align: "center", rtlMode: true,
  });

  s.addText("Where attested verses don't exist, the system says so — out loud.\nNo verse is ever generated and passed off as a master's. Not as a fallback, not as a demo, not once.", {
    x: 1.5, y: 2.2, w: 10.33, h: 0.85,
    fontSize: 14, fontFace: F.body, color: C.ink2, align: "center",
  });

  ornamentalDivider(s, 5.5, 3.2, 2.33);

  // The remaining protocol promises, as supporting guarantees
  const guarantees = [
    {
      title: "Traceable",
      ar: "قابلٌ للتعقّب",
      body: "Every quoted verse carries its source: manuscript, folio, retrieval date — all visible.",
      color: C.gold,
    },
    {
      title: "Labelled",
      ar: "مُعلَّم",
      body: "Every AI output is marked “Inspired by [Poet] — AI Assisted.” Always visible, never hidden.",
      color: C.crimson,
    },
    {
      title: "Private",
      ar: "خصوصيّة محفوظة",
      body: "Private submissions stay private. The system never trains on a poet's unpublished work.",
      color: C.sage,
    },
  ];

  const gW = 3.9;
  const gX0 = (13.33 - (gW * 3 + 0.4 * 2)) / 2;
  const gY = 3.5;
  const gH = 2.2;

  guarantees.forEach((g, i) => {
    const x = gX0 + i * (gW + 0.4);
    s.addShape("roundRect", {
      x, y: gY, w: gW, h: gH,
      fill: { color: "FFFFFF" }, line: { color: g.color, width: 1.0 },
      rectRadius: 0.06,
    });
    s.addText(g.title, {
      x, y: gY + 0.2, w: gW, h: 0.4,
      fontSize: 18, fontFace: F.display, color: g.color, bold: true, align: "center",
    });
    s.addText(g.ar, {
      x, y: gY + 0.62, w: gW, h: 0.35,
      fontSize: 13, fontFace: F.arabic, color: C.ink2, align: "center", rtlMode: true,
    });
    s.addShape("line", {
      x: x + 0.5, y: gY + 1.05, w: gW - 1.0, h: 0,
      line: { color: g.color, width: 0.5 },
    });
    s.addText(g.body, {
      x: x + 0.3, y: gY + 1.15, w: gW - 0.6, h: 0.95,
      fontSize: 11, fontFace: F.body, color: C.ink2, align: "center",
    });
  });

  // Bottom belt
  s.addShape("rect", {
    x: 0.5, y: 6.1, w: 12.33, h: 0.55,
    fill: { color: C.ink }, line: { width: 0 },
  });
  s.addText("If a verse appears in the Majlis, it existed before the Majlis.", {
    x: 0.5, y: 6.1, w: 12.33, h: 0.55,
    fontSize: 14, fontFace: F.display, color: C.parchment, italic: true, align: "center", valign: "middle",
  });

  smallFooter(s);

  s.addNotes(
    "The fabrication slide — second half of the moral spine. Any expert in the room will be " +
    "quietly worried about exactly this; answer the worry before it is asked. The headline is the " +
    "promise; the three cards are the supporting guarantees (traceable, labelled, private). " +
    "The belt is the line to quote: if a verse appears in the Majlis, it existed before the Majlis."
  );
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 7 — THE CORPUS (built by hand, verse by verse)
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bgParchment(s);

  kicker(s, "● THE CORPUS · المدوّنة ●", 0.5, 0.35, 12.33);

  s.addText("A corpus built by hand, verse by verse", {
    x: 0.5, y: 0.75, w: 12.33, h: 0.6,
    fontSize: 30, fontFace: F.display, color: C.ink, align: "center",
  });
  s.addText("مدوّنةٌ بُنيت يداً بيد — بيتاً بيتاً", {
    x: 0.5, y: 1.38, w: 12.33, h: 0.45,
    fontSize: 18, fontFace: F.arabic, color: C.crimson, align: "center", rtlMode: true,
  });

  // Stats strip
  const stats = [
    { n: "80",    l: "curated verses",            ar: "بيتاً منتقى" },
    { n: "10",    l: "Khaleeji masters",          ar: "شعراء خليجيون" },
    { n: "61",    l: "DCT-attested bayts (Ousha)",ar: "بيتاً موثّقاً" },
    { n: "3,340", l: "audio-aligned clips",       ar: "مقطعاً صوتيّاً" },
    { n: "20",    l: "dictionary entries",        ar: "مدخلاً معجميّاً" },
  ];

  const stW = (12.33 - 0.4 * 4) / stats.length;
  const stY = 2.0;
  stats.forEach((st, i) => {
    const x = 0.5 + i * (stW + 0.4);
    s.addShape("roundRect", {
      x, y: stY, w: stW, h: 1.05,
      fill: { color: "FFFFFF" }, line: { color: C.goldFaint, width: 0.75 },
      rectRadius: 0.06,
    });
    s.addText(st.n, {
      x, y: stY + 0.05, w: stW, h: 0.55,
      fontSize: 30, fontFace: F.display, color: C.crimson, bold: true, align: "center",
    });
    s.addText(st.l, {
      x, y: stY + 0.6, w: stW, h: 0.25,
      fontSize: 9.5, fontFace: F.body, color: C.ink2, align: "center",
    });
    s.addText(st.ar, {
      x, y: stY + 0.82, w: stW, h: 0.22,
      fontSize: 10, fontFace: F.arabic, color: C.ink2, align: "center", rtlMode: true,
    });
  });

  // How it was made — the hand work
  s.addText("HOW IT WAS MADE", {
    x: 0.7, y: 3.3, w: 12.0, h: 0.3,
    fontSize: 10, fontFace: F.body, color: C.gold, bold: true, charSpacing: 3, align: "center",
  });

  const handwork = [
    {
      t: "Curated and translated by hand",
      b: "Each of the 80 verses was selected, transcribed, translated, and tagged for genre, emotion, and imagery — manually, not scraped.",
    },
    {
      t: "Provenance recorded per verse",
      b: "Every verse carries its source, audio alignment, and attribution chain. The Ousha corpus is verified against DCT publications.",
    },
    {
      t: "Shaped with heritage experts",
      b: "The Critic personas and corpus choices were shaped through conversations with heritage specialists and practitioners of the tradition.",
    },
  ];

  const hW = 3.9;
  const hX0 = (13.33 - (hW * 3 + 0.4 * 2)) / 2;
  const hY = 3.65;
  const hH = 2.3;

  handwork.forEach((h, i) => {
    const x = hX0 + i * (hW + 0.4);
    s.addShape("roundRect", {
      x, y: hY, w: hW, h: hH,
      fill: { color: "FFFFFF" }, line: { color: C.goldFaint, width: 0.75 },
      rectRadius: 0.06,
    });
    s.addShape("rect", { x, y: hY, w: 0.08, h: hH, fill: { color: C.gold }, line: { width: 0 } });
    s.addText(h.t, {
      x: x + 0.3, y: hY + 0.2, w: hW - 0.5, h: 0.65,
      fontSize: 14, fontFace: F.display, color: C.ink, bold: true,
    });
    s.addText(h.b, {
      x: x + 0.3, y: hY + 0.9, w: hW - 0.5, h: 1.3,
      fontSize: 11, fontFace: F.body, color: C.ink2,
    });
  });

  // Bottom belt
  s.addShape("rect", {
    x: 0.5, y: 6.2, w: 12.33, h: 0.55,
    fill: { color: C.crimsonDeep }, line: { width: 0 },
  });
  s.addText("The curation is the contribution. The code exists to serve it.", {
    x: 0.5, y: 6.2, w: 12.33, h: 0.55,
    fontSize: 14, fontFace: F.display, color: C.parchment, italic: true, align: "center", valign: "middle",
  });

  smallFooter(s);

  s.addNotes(
    "The corpus slide. This is where the real labor lives — months of hand curation, translation, " +
    "provenance tracking, and conversations with heritage experts. NEVER frame this project by how " +
    "fast the software came together; frame it by the corpus and the consultations. If asked about " +
    "effort, talk about verse-by-verse verification, not coding hours."
  );
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 8 — THE ARCHITECTURE (brief, in service of the mission)
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bgParchment(s);

  kicker(s, "● HOW THE MAJLIS WORKS · هندسة النظام ●", 0.5, 0.35, 12.33);

  s.addText("The machinery — briefly", {
    x: 0.5, y: 0.75, w: 12.33, h: 0.55,
    fontSize: 28, fontFace: F.display, color: C.ink, align: "center",
  });
  s.addText("هندسة النظام — باختصار، في خدمة الرسالة", {
    x: 0.5, y: 1.32, w: 12.33, h: 0.4,
    fontSize: 16, fontFace: F.arabic, color: C.crimson, align: "center", rtlMode: true,
  });

  // Protocol guardrail bar — at top, framing everything below
  s.addShape("roundRect", {
    x: 0.7, y: 1.95, w: 11.93, h: 0.55,
    fill: { color: C.crimsonDeep }, line: { width: 0 },
    rectRadius: 0.05,
  });
  s.addText("⚖  CURATOR & CRITIC PROTOCOL  ·  every output passes this gate  ·  ميثاق الناقد والقَيِّم", {
    x: 0.7, y: 1.95, w: 11.93, h: 0.55,
    fontSize: 11, fontFace: F.body, color: C.parchment, bold: true, charSpacing: 1.5,
    align: "center", valign: "middle",
  });

  // Pipeline row — four stages with arrows
  const stages = [
    { en: "INPUT", ar: "الرافد", body: "Verse · Voice (Phase 2) · Image (Phase 2)", color: C.gold },
    { en: "CONVENER", ar: "الموجِّه", body: "Routes the verse to the right Critic(s)", color: C.sage },
    { en: "COUNCIL", ar: "المجلس", body: "Three Critics deliberate & speak in turn", color: C.crimson },
    { en: "SYNTHESIS", ar: "الخلاصة", body: "Verdict + qāfiyah analysis + attribution", color: C.zayed },
  ];

  const stageW = 2.7;
  const arrowW = 0.45;
  const totalW = stages.length * stageW + (stages.length - 1) * arrowW;
  const startX3 = (13.33 - totalW) / 2;
  const stageY = 2.85;
  const stageH = 1.5;

  stages.forEach((st, i) => {
    const x = startX3 + i * (stageW + arrowW);
    s.addShape("roundRect", {
      x, y: stageY, w: stageW, h: stageH,
      fill: { color: "FFFFFF" }, line: { color: st.color, width: 1.5 },
      rectRadius: 0.06,
    });
    s.addShape("ellipse", {
      x: x + stageW/2 - 0.18, y: stageY - 0.18, w: 0.36, h: 0.36,
      fill: { color: st.color }, line: { width: 0 },
    });
    s.addText(String(i + 1), {
      x: x + stageW/2 - 0.18, y: stageY - 0.18, w: 0.36, h: 0.36,
      fontSize: 13, fontFace: F.display, color: "FFFFFF", bold: true, align: "center", valign: "middle",
    });
    s.addText(st.en, {
      x, y: stageY + 0.25, w: stageW, h: 0.35,
      fontSize: 14, fontFace: F.display, color: st.color, bold: true, charSpacing: 3, align: "center",
    });
    s.addText(st.ar, {
      x, y: stageY + 0.6, w: stageW, h: 0.3,
      fontSize: 13, fontFace: F.arabic, color: C.ink2, align: "center", rtlMode: true,
    });
    s.addText(st.body, {
      x: x + 0.15, y: stageY + 0.95, w: stageW - 0.3, h: 0.5,
      fontSize: 10, fontFace: F.body, color: C.ink2, align: "center",
    });

    if (i < stages.length - 1) {
      const ax = x + stageW + 0.05;
      const ay = stageY + stageH/2;
      s.addShape("rightTriangle", {
        x: ax, y: ay - 0.12, w: arrowW - 0.1, h: 0.24,
        fill: { color: C.gold }, line: { width: 0 },
        rotate: 0,
      });
    }
  });

  // Living Dictionary — substrate band underneath
  s.addShape("roundRect", {
    x: 0.7, y: 4.7, w: 11.93, h: 1.0,
    fill: { color: C.parchmentDeep }, line: { color: C.gold, width: 1, dashType: "dash" },
    rectRadius: 0.06,
  });
  s.addText("📜  LIVING DICTIONARY  ·  المعجم الحيّ", {
    x: 0.9, y: 4.78, w: 4.5, h: 0.35,
    fontSize: 13, fontFace: F.display, color: C.gold, bold: true,
  });
  s.addText("Verified entries · Meter & rhyme tags · Provenance graph · Community contributions", {
    x: 0.9, y: 5.13, w: 11.5, h: 0.3,
    fontSize: 10, fontFace: F.body, color: C.ink2,
  });
  s.addText("مدخلات موثَّقة · أوزان وقوافٍ · سلسلة الإسناد · مساهمات مجتمعيّة", {
    x: 0.9, y: 5.4, w: 11.5, h: 0.3,
    fontSize: 11, fontFace: F.arabic, color: C.ink2, rtlMode: true, align: "right",
  });

  // Substrate-to-pipeline arrows
  const dictTopY = 4.7;
  for (let i = 0; i < stages.length; i++) {
    const x = startX3 + i * (stageW + arrowW) + stageW/2;
    s.addShape("line", {
      x, y: stageY + stageH, w: 0, h: dictTopY - (stageY + stageH),
      line: { color: C.gold, width: 0.5, dashType: "dash" },
    });
  }

  // Responsible governance band — replaces any "local only" framing
  s.addShape("roundRect", {
    x: 0.7, y: 5.95, w: 11.93, h: 0.85,
    fill: { color: C.sage }, line: { width: 0 },
    rectRadius: 0.06,
  });
  s.addText("RESPONSIBLE GOVERNANCE · حوكمة مسؤولة", {
    x: 0.9, y: 6.03, w: 11.5, h: 0.25,
    fontSize: 9.5, fontFace: F.body, color: C.parchment, bold: true, charSpacing: 3,
  });
  s.addText("We deliberately didn't rush to a public URL — the corpus and Critic personas require institutional validation first.", {
    x: 0.9, y: 6.28, w: 11.5, h: 0.45,
    fontSize: 12.5, fontFace: F.display, color: C.parchment, italic: true,
  });

  // Tech stack strip
  s.addText("FastAPI  ·  Next.js 14  ·  TypeScript  ·  SQLite  ·  OpenAI gpt-4o-mini  ·  AraPoemBERT t-SNE", {
    x: 0.5, y: 6.95, w: 12.33, h: 0.25,
    fontSize: 8.5, fontFace: F.body, color: C.inkSoft, align: "center", italic: true,
  });

  smallFooter(s);

  s.addNotes(
    "Architecture slide — keep it under ninety seconds; the audience cares about the mission, " +
    "not the plumbing. Walk left to right once, point at the Protocol bar as a real gate, and " +
    "then land on the governance band: we deliberately haven't rushed to a public URL because " +
    "the corpus and personas require institutional validation first. That framing turns a " +
    "limitation into a posture of respect."
  );
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 9 — STATUS · WHAT WORKS / WHAT'S NEXT
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bgParchment(s);

  kicker(s, "● PROTOTYPE STATUS · حالة النموذج ●", 0.5, 0.35, 12.33);

  s.addText("Honest about Phase 1 vs Phase 2", {
    x: 0.5, y: 0.75, w: 12.33, h: 0.55,
    fontSize: 28, fontFace: F.display, color: C.ink, align: "center",
  });
  s.addText("شفافيّة بين المرحلة الأولى والثانية", {
    x: 0.5, y: 1.32, w: 12.33, h: 0.4,
    fontSize: 16, fontFace: F.arabic, color: C.crimson, align: "center", rtlMode: true,
  });

  ornamentalDivider(s, 5.5, 1.95, 2.33);

  // Two columns — what works / what's next
  const colW3 = 5.85;
  const startX4 = 0.6;
  const colY = 2.25;
  const colH = 4.0;

  // PHASE 1 column — forest
  s.addShape("roundRect", {
    x: startX4, y: colY, w: colW3, h: colH,
    fill: { color: "FFFFFF" }, line: { color: C.forest, width: 1.2 }, rectRadius: 0.06,
  });
  s.addShape("rect", { x: startX4, y: colY, w: colW3, h: 0.5, fill: { color: C.forest }, line: { width: 0 } });
  s.addText("PHASE 1 — WHAT WORKS TODAY", {
    x: startX4, y: colY, w: colW3, h: 0.5,
    fontSize: 13, fontFace: F.display, color: C.parchment, bold: true,
    charSpacing: 2, align: "center", valign: "middle",
  });

  const phase1 = [
    "Three-Critic council with single-Critic convene",
    "Live Debate UI · qāfiyah analysis · attribution",
    "Poet/Scholar Gate · public/private/anonymous",
    "Library of 80 verses · t-SNE projection",
    "Verse detail pages with full poem reconstruction",
    "Ousha bint Khalifa: 3 DCT-attested poems · 61 bayts",
    "Dictionary with provenance · 20 curated entries",
  ];
  phase1.forEach((line, i) => {
    s.addText("✓", {
      x: startX4 + 0.25, y: colY + 0.7 + i * 0.44, w: 0.3, h: 0.3,
      fontSize: 14, color: C.forest, bold: true,
    });
    s.addText(line, {
      x: startX4 + 0.6, y: colY + 0.7 + i * 0.44, w: colW3 - 0.7, h: 0.35,
      fontSize: 11.5, fontFace: F.body, color: C.ink,
    });
  });

  // PHASE 2 column — gold
  const startX5 = startX4 + colW3 + 0.4;
  s.addShape("roundRect", {
    x: startX5, y: colY, w: colW3, h: colH,
    fill: { color: "FFFFFF" }, line: { color: C.gold, width: 1.2 }, rectRadius: 0.06,
  });
  s.addShape("rect", { x: startX5, y: colY, w: colW3, h: 0.5, fill: { color: C.gold }, line: { width: 0 } });
  s.addText("PHASE 2 — WHAT'S NEXT", {
    x: startX5, y: colY, w: colW3, h: 0.5,
    fontSize: 13, fontFace: F.display, color: C.parchment, bold: true,
    charSpacing: 2, align: "center", valign: "middle",
  });

  const phase2 = [
    "Voice intake — Khaleeji ASR fine-tuning",
    "Manuscript image OCR — handwritten Nabati",
    "Al-Mājidī corpus — Sheikha Al-Jabri 2019 diwan",
    "Sheikh Zayed corpus — pending attribution review",
    "Living-master inspirers (formal estate consent)",
    "Knowledge graph migration (SQLite → Neo4j)",
    "Hosted pilot with institutional partners",
  ];
  phase2.forEach((line, i) => {
    s.addText("→", {
      x: startX5 + 0.25, y: colY + 0.7 + i * 0.44, w: 0.3, h: 0.3,
      fontSize: 14, color: C.gold, bold: true,
    });
    s.addText(line, {
      x: startX5 + 0.6, y: colY + 0.7 + i * 0.44, w: colW3 - 0.7, h: 0.35,
      fontSize: 11.5, fontFace: F.body, color: C.ink2,
    });
  });

  // Closing line
  s.addShape("rect", {
    x: 0.5, y: 6.5, w: 12.33, h: 0.45,
    fill: { color: C.crimsonDeep }, line: { width: 0 },
  });
  s.addText("Preserving our heritage  ·  teaching our generations  ·  shaping the future of our verse", {
    x: 0.5, y: 6.5, w: 12.33, h: 0.45,
    fontSize: 12, fontFace: F.display, color: C.parchment, italic: true, align: "center", valign: "middle",
  });

  s.addText(
    "Asma Aljneibi · Abu Dhabi Government Employee + Master's Student (MBZUAI)",
    { x: 0.5, y: 7.1, w: 12.33, h: 0.18, fontSize: 7.5, color: C.inkSoft, fontFace: F.body, align: "center", italic: true }
  );

  s.addNotes(
    "Status slide. Two columns — Phase 1 (working today, green) and Phase 2 (next, gold). " +
    "Conferences reward maturity, and maturity is showing the seam. Do not describe the build " +
    "timeline; describe the roadmap. Then move to the asks."
  );
}

// ════════════════════════════════════════════════════════════════════
// SLIDE 10 — THE ASKS + CLOSE
// ════════════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  bgParchment(s);

  kicker(s, "● HOW YOU CAN HELP · كيف يكبر المجلس بكم ●", 0.5, 0.35, 12.33);

  s.addText("The Majlis grows with its partners", {
    x: 0.5, y: 0.75, w: 12.33, h: 0.6,
    fontSize: 30, fontFace: F.display, color: C.ink, align: "center",
  });
  s.addText("ثلاث دعوات للشراكة", {
    x: 0.5, y: 1.4, w: 12.33, h: 0.45,
    fontSize: 18, fontFace: F.arabic, color: C.crimson, align: "center", rtlMode: true,
  });

  ornamentalDivider(s, 5.5, 2.05, 2.33);

  const asks = [
    {
      who: "CULTURAL BODIES",
      ar: "الهيئات الثقافية",
      ask: "Access to archival corpora — and institutional validation of the corpus and Critic personas.",
      icon: "🏛",
      color: C.crimson,
    },
    {
      who: "TECHNOLOGY PARTNERS",
      ar: "شركاء التقنية",
      ask: "Compute and deployment support for a hosted pilot serving cultural institutions.",
      icon: "⚙",
      color: C.sage,
    },
    {
      who: "ACADEMIC PARTNERS",
      ar: "الشركاء الأكاديميون",
      ask: "Co-authorship on Nabati prosody research — meter detection, qāfiyah analysis, Khaleeji ASR.",
      icon: "✎",
      color: C.gold,
    },
  ];

  const aW = 3.9;
  const aX0 = (13.33 - (aW * 3 + 0.4 * 2)) / 2;
  const aY = 2.4;
  const aH = 2.6;

  asks.forEach((a, i) => {
    const x = aX0 + i * (aW + 0.4);
    s.addShape("roundRect", {
      x, y: aY, w: aW, h: aH,
      fill: { color: "FFFFFF" }, line: { color: a.color, width: 1.25 },
      rectRadius: 0.06,
    });
    s.addShape("rect", { x, y: aY, w: aW, h: 0.5, fill: { color: a.color }, line: { width: 0 } });
    s.addText(a.who, {
      x, y: aY, w: aW, h: 0.5,
      fontSize: 12.5, fontFace: F.display, color: "FFFFFF", bold: true, charSpacing: 2,
      align: "center", valign: "middle",
    });
    s.addText(a.ar, {
      x: x + 0.2, y: aY + 0.62, w: aW - 0.4, h: 0.35,
      fontSize: 13, fontFace: F.arabic, color: a.color, align: "center", rtlMode: true,
    });
    s.addText(a.icon, {
      x: x + aW/2 - 0.3, y: aY + 1.0, w: 0.6, h: 0.45,
      fontSize: 22, color: a.color, align: "center",
    });
    s.addText(a.ask, {
      x: x + 0.3, y: aY + 1.5, w: aW - 0.6, h: 1.0,
      fontSize: 11.5, fontFace: F.body, color: C.ink2, align: "center",
    });
  });

  ornamentalDivider(s, 4.5, 5.4, 4.33);

  // The close — reverence line, full stage
  s.addText("Built with reverence for Emirati Nabati tradition.", {
    x: 0.5, y: 5.65, w: 12.33, h: 0.6,
    fontSize: 24, fontFace: F.display, color: C.crimson, italic: true, align: "center",
  });
  s.addText("بُنيَ بإجلالٍ لتراث الشعر النبطي الإماراتي", {
    x: 0.5, y: 6.3, w: 12.33, h: 0.5,
    fontSize: 18, fontFace: F.arabic, color: C.ink, align: "center", rtlMode: true,
  });

  s.addText("Asma Aljneibi  ·  أسماء الجنيبي  ·  asljneibi@scad.gov.ae", {
    x: 0.5, y: 6.95, w: 12.33, h: 0.3,
    fontSize: 11, fontFace: F.body, color: C.inkSoft, align: "center",
  });

  s.addNotes(
    "The asks + close. Be concrete: cultural bodies → archival corpora and validation; tech " +
    "partners → compute and deployment for a hosted pilot; academic partners → co-authorship on " +
    "the prosody research. Then stop, breathe, and read the reverence line as the final words of " +
    "the talk. Built with reverence for Emirati Nabati tradition. Thank you."
  );
}

// ── Save ────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: "Poetic_Majlis_Conference_Deck.pptx" })
  .then(p => console.log("Wrote:", p));
