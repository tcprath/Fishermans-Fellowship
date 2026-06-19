export interface BibleBook {
  name: string;
  chapters: number;
  osis: string; // hello.ao / OSIS code
  nlt: string;  // Tyndale NLT API ref abbreviation
}

export interface BibleTranslation {
  id: string;
  short: string;
  name: string;
  apiId: string | null;
  apiSource: "bible-api" | "esv" | "helloao" | "nlt" | null;
}

export const BOOKS: BibleBook[] = [
  { name: "Genesis",         chapters: 50,  osis: "GEN", nlt: "Gen"  },
  { name: "Exodus",          chapters: 40,  osis: "EXO", nlt: "Exod" },
  { name: "Leviticus",       chapters: 27,  osis: "LEV", nlt: "Lev"  },
  { name: "Numbers",         chapters: 36,  osis: "NUM", nlt: "Num"  },
  { name: "Deuteronomy",     chapters: 34,  osis: "DEU", nlt: "Deut" },
  { name: "Joshua",          chapters: 24,  osis: "JOS", nlt: "Josh" },
  { name: "Judges",          chapters: 21,  osis: "JDG", nlt: "Judg" },
  { name: "Ruth",            chapters: 4,   osis: "RUT", nlt: "Ruth" },
  { name: "1 Samuel",        chapters: 31,  osis: "1SA", nlt: "1Sam" },
  { name: "2 Samuel",        chapters: 24,  osis: "2SA", nlt: "2Sam" },
  { name: "1 Kings",         chapters: 22,  osis: "1KI", nlt: "1Kgs" },
  { name: "2 Kings",         chapters: 25,  osis: "2KI", nlt: "2Kgs" },
  { name: "1 Chronicles",    chapters: 29,  osis: "1CH", nlt: "1Chr" },
  { name: "2 Chronicles",    chapters: 36,  osis: "2CH", nlt: "2Chr" },
  { name: "Ezra",            chapters: 10,  osis: "EZR", nlt: "Ezra" },
  { name: "Nehemiah",        chapters: 13,  osis: "NEH", nlt: "Neh"  },
  { name: "Esther",          chapters: 10,  osis: "EST", nlt: "Esth" },
  { name: "Job",             chapters: 42,  osis: "JOB", nlt: "Job"  },
  { name: "Psalms",          chapters: 150, osis: "PSA", nlt: "Ps"   },
  { name: "Proverbs",        chapters: 31,  osis: "PRO", nlt: "Prov" },
  { name: "Ecclesiastes",    chapters: 12,  osis: "ECC", nlt: "Eccl" },
  { name: "Song of Solomon", chapters: 8,   osis: "SNG", nlt: "Song" },
  { name: "Isaiah",          chapters: 66,  osis: "ISA", nlt: "Isa"  },
  { name: "Jeremiah",        chapters: 52,  osis: "JER", nlt: "Jer"  },
  { name: "Lamentations",    chapters: 5,   osis: "LAM", nlt: "Lam"  },
  { name: "Ezekiel",         chapters: 48,  osis: "EZK", nlt: "Ezek" },
  { name: "Daniel",          chapters: 12,  osis: "DAN", nlt: "Dan"  },
  { name: "Hosea",           chapters: 14,  osis: "HOS", nlt: "Hos"  },
  { name: "Joel",            chapters: 3,   osis: "JOL", nlt: "Joel" },
  { name: "Amos",            chapters: 9,   osis: "AMO", nlt: "Amos" },
  { name: "Obadiah",         chapters: 1,   osis: "OBA", nlt: "Obad" },
  { name: "Jonah",           chapters: 4,   osis: "JON", nlt: "Jon"  },
  { name: "Micah",           chapters: 7,   osis: "MIC", nlt: "Mic"  },
  { name: "Nahum",           chapters: 3,   osis: "NAM", nlt: "Nah"  },
  { name: "Habakkuk",        chapters: 3,   osis: "HAB", nlt: "Hab"  },
  { name: "Zephaniah",       chapters: 3,   osis: "ZEP", nlt: "Zeph" },
  { name: "Haggai",          chapters: 2,   osis: "HAG", nlt: "Hag"  },
  { name: "Zechariah",       chapters: 14,  osis: "ZEC", nlt: "Zech" },
  { name: "Malachi",         chapters: 4,   osis: "MAL", nlt: "Mal"  },
  { name: "Matthew",         chapters: 28,  osis: "MAT", nlt: "Matt" },
  { name: "Mark",            chapters: 16,  osis: "MRK", nlt: "Mark" },
  { name: "Luke",            chapters: 24,  osis: "LUK", nlt: "Luke" },
  { name: "John",            chapters: 21,  osis: "JHN", nlt: "John" },
  { name: "Acts",            chapters: 28,  osis: "ACT", nlt: "Acts" },
  { name: "Romans",          chapters: 16,  osis: "ROM", nlt: "Rom"  },
  { name: "1 Corinthians",   chapters: 16,  osis: "1CO", nlt: "1Cor" },
  { name: "2 Corinthians",   chapters: 13,  osis: "2CO", nlt: "2Cor" },
  { name: "Galatians",       chapters: 6,   osis: "GAL", nlt: "Gal"  },
  { name: "Ephesians",       chapters: 6,   osis: "EPH", nlt: "Eph"  },
  { name: "Philippians",     chapters: 4,   osis: "PHP", nlt: "Phil" },
  { name: "Colossians",      chapters: 4,   osis: "COL", nlt: "Col"  },
  { name: "1 Thessalonians", chapters: 5,   osis: "1TH", nlt: "1Th"  },
  { name: "2 Thessalonians", chapters: 3,   osis: "2TH", nlt: "2Th"  },
  { name: "1 Timothy",       chapters: 6,   osis: "1TI", nlt: "1Tim" },
  { name: "2 Timothy",       chapters: 4,   osis: "2TI", nlt: "2Tim" },
  { name: "Titus",           chapters: 3,   osis: "TIT", nlt: "Tit"  },
  { name: "Philemon",        chapters: 1,   osis: "PHM", nlt: "Phlm" },
  { name: "Hebrews",         chapters: 13,  osis: "HEB", nlt: "Heb"  },
  { name: "James",           chapters: 5,   osis: "JAS", nlt: "Jas"  },
  { name: "1 Peter",         chapters: 5,   osis: "1PE", nlt: "1Pet" },
  { name: "2 Peter",         chapters: 3,   osis: "2PE", nlt: "2Pet" },
  { name: "1 John",          chapters: 5,   osis: "1JN", nlt: "1Jn"  },
  { name: "2 John",          chapters: 1,   osis: "2JN", nlt: "2Jn"  },
  { name: "3 John",          chapters: 1,   osis: "3JN", nlt: "3Jn"  },
  { name: "Jude",            chapters: 1,   osis: "JUD", nlt: "Jude" },
  { name: "Revelation",      chapters: 22,  osis: "REV", nlt: "Rev"  },
];

export const TRANSLATIONS: BibleTranslation[] = [
  { id: "kjv",  short: "KJV",  name: "King James Version",           apiId: "kjv",  apiSource: "bible-api" },
  { id: "nkjv", short: "NKJV", name: "New King James Version",       apiId: null,   apiSource: null        },
  { id: "esv",  short: "ESV",  name: "English Standard Version",     apiId: "esv",  apiSource: "esv"       },
  { id: "nasb", short: "NASB", name: "New American Standard Bible",  apiId: null,   apiSource: null        },
  { id: "nlt",  short: "NLT",  name: "New Living Translation",       apiId: "NLT",  apiSource: "nlt"       },
  { id: "csb",  short: "CSB",  name: "Christian Standard Bible",     apiId: null,   apiSource: null        },
  { id: "bsb",  short: "BSB",  name: "Berean Standard Bible",        apiId: "BSB",  apiSource: "helloao"   },
  { id: "web",  short: "WEB",  name: "World English Bible",          apiId: "WEB",  apiSource: "helloao"   },
];
