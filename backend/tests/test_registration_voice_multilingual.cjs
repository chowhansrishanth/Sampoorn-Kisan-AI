const assert = require("assert");
const { REGISTRATION_VOICE_GUIDANCE } = require("../../frontend/src/data/registrationVoiceGuidance.js");
const { PHRASE_DICTIONARY } = require("../../frontend/src/data/multilingualDictionary.js");

const ALL_LANGUAGES = ["EN", "HI", "TE", "TA", "KN", "MR", "PA", "BN", "GU"];

console.log("=== Testing Multilingual Voiceover for Every Registration Step ===");

// 1. Verify all 9 registration steps exist
for (let step = 1; step <= 9; step++) {
  const stepData = REGISTRATION_VOICE_GUIDANCE[step];
  assert(stepData, `Step ${step} must exist in REGISTRATION_VOICE_GUIDANCE`);

  // Verify all 9 languages exist for this step
  for (const lang of ALL_LANGUAGES) {
    const langData = stepData[lang];
    assert(langData, `Step ${step} must have language ${lang}`);
    assert(typeof langData.native === "string" && langData.native.trim().length > 0, `Step ${step} (${lang}) must have non-empty native script`);
    assert(typeof langData.phonetic === "string" && langData.phonetic.trim().length > 0, `Step ${step} (${lang}) must have non-empty phonetic pronunciation`);
  }
  console.log(`PASS: Step ${step} has complete native and phonetic voice instructions for all 9 languages.`);
}

// 2. Verify button label and header action translations in dictionary
console.log("\n=== Testing Button & Action Translations in Multilingual Dictionary ===");
const requiredKeys = ["Listen to Voice", "Stop", "Listen to voice instructions for this step"];

for (const key of requiredKeys) {
  const dictEntry = PHRASE_DICTIONARY[key];
  assert(dictEntry, `Key "${key}" must exist in PHRASE_DICTIONARY`);
  for (const lang of ALL_LANGUAGES) {
    if (lang === "EN") continue;
    assert(dictEntry[lang] && dictEntry[lang].trim().length > 0, `Key "${key}" must have translation for ${lang}`);
  }
  console.log(`PASS: "${key}" has verified translations across all languages.`);
}

console.log("\n=======================================================");
console.log("SUCCESS: MULTI-LANGUAGE VOICE OVER VERIFIED FOR ALL 9 STEPS!");
console.log("=======================================================");
