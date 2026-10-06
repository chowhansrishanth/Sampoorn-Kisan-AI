import { useState, useMemo } from "react";
import { X, MapPin, Compass, ArrowRight, ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2, Sprout, Check, HelpCircle, Volume2, VolumeX, Sparkles, ChevronDown, ChevronUp, Search } from "lucide-react";
import SearchableCropSelector from "./ui/SearchableCropSelector";
import { LAND_SIZE_OPTIONS, FARM_TYPES, IRRIGATION_SOURCES, SOIL_TYPES, FARMING_SEASONS, FARM_GOALS, convertToAcres } from "../data/cropsData";
import { detectGPSLocation, parseManualLocation } from "../utils/locationHelper";
import { useLanguage } from "../context/LanguageContext";
import useVoiceAssistant from "../hooks/useVoiceAssistant";
import StepVoiceGuidanceBar from "./StepVoiceGuidanceBar";

// ── Multi-Language Audio Guidance Per Step (1 to 8) ─────────────────────────
export const STEP_VOICE_GUIDANCE = {
  1: {
    EN: {
      native: "Step 1: Enter your full name and farm location, or click Detect Device Location to find your farm automatically.",
      phonetic: "Step 1: Enter your full name and farm location, or click Detect Device Location to find your farm automatically."
    },
    HI: {
      native: "चरण 1: कृपया अपना पूरा नाम और खेत का स्थान दर्ज करें, या जीपीएस से अपने खेत का पता लगाने के लिए बटन दबाएं।",
      phonetic: "Charan 1: Kripya apna poora naam aur khet ka sthan darj karein, ya GPS se khet pata karne ke liye button dabayein."
    },
    TE: {
      native: "దశ 1: దయచేసి మీ పూర్తి పేరు మరియు వ్యవసాయ స్థలాన్ని నమోదు చేయండి, లేదా జీపీఎస్ ద్వారా లొకేషన్ గుర్తించండి.",
      phonetic: "Dasha 1: Dayachesi mee poorthi peru mariyu vyavasaaya sthalaanni namodu cheyandi, leda GPS dwaara location gurtinchandi."
    },
    TA: {
      native: "படி 1: உங்கள் பெயர் மற்றும் பண்ணை இருப்பிடத்தை உள்ளிடவும், அல்லது ஜிபிஎஸ் இருப்பிடத்தைக் கண்டறியவும்.",
      phonetic: "Padi 1: Ungal peyar matrum pannai iruppidathai ullaadhavum, alladhu GPS iruppidathai kandariyavum."
    },
    KN: {
      native: "ಹಂತ 1: ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ಮತ್ತು ಜಮೀನಿನ ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ, ಅಥವಾ ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ಪತ್ತೆಹಚ್ಚಿ.",
      phonetic: "Hanta 1: Nimma poorna hesaru matthu jameenina sthalavannu namoodisi, athava GPS sthalavannu pattehacchi."
    },
    MR: {
      native: "पायरी 1: आपले पूर्ण नाव आणि शेताचे ठिकाण प्रविष्ट करा, किंवा जीपीएस स्थान शोधा.",
      phonetic: "Paayri 1: Aple poorna naav aani shetaache thikaan pravishtha kara, kiva GPS sthaan shodha."
    },
    PA: {
      native: "ਕਦਮ 1: ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਅਤੇ ਖੇਤ ਦੀ ਸਥਿਤੀ ਦਰਜ ਕਰੋ, ਜਾਂ ਜੀਪੀਐਸ ਲੱਭੋ ਬਟਨ ਦਬਾਓ।",
      phonetic: "Kadam 1: Apna poora naam atey khet di sthiti darj karo, ya GPS labho button dabaao."
    },
    BN: {
      native: "ধাপ ১: আপনার সম্পূর্ণ নাম এবং খামারের অবস্থান লিখুন, বা জিপিএস অবস্থান সনাক্ত করুন।",
      phonetic: "Dhaap 1: Aponar shompoorno naam ebong khamarer obosthan likhun, ba GPS obosthan shonakto korun."
    },
    GU: {
      native: "પગલું 1: તમારું પૂરું નામ અને ખેતરનું સ્થાન દાખલ કરો, અથવા જીપીએસ સ્થાન શોધો.",
      phonetic: "Paglu 1: Tamaru pooru naam ane khetarnu sthaan daakhal karo, athva GPS sthaan shodho."
    }
  },
  2: {
    EN: {
      native: "Step 2: Select your total land size in acres and choose your farm holding type.",
      phonetic: "Step 2: Select your total land size in acres and choose your farm holding type."
    },
    HI: {
      native: "चरण 2: एकड़ में अपने कुल खेत का आकार चुनें और अपनी जोत का प्रकार चुनें।",
      phonetic: "Charan 2: Acre mein apne kul khet ka aakaar chunein aur apni farm holding ka prakaar chunein."
    },
    TE: {
      native: "దశ 2: ఎకరాలలో మీ మొత్తం భూమి పరిమాణాన్ని మరియు మీ వ్యవసాయ రకాన్ని ఎంచుకోండి.",
      phonetic: "Dasha 2: Ekaralalo mee mottham bhoomi parimaananni mariyu vyavasaaya rakaanni enchukondi."
    },
    TA: {
      native: "படி 2: ஏக்கரில் உங்கள் மொத்த நில அளவைத் தேர்ந்தெடுத்து பண்ணை வகையைத் தேர்வுசெய்யவும்.",
      phonetic: "Padi 2: Acre-il ungal mottha nila alavai therntheduthu pannai vagaiyai therndhedukkavum."
    },
    KN: {
      native: "ಹಂತ 2: ಎಕರೆಗಳಲ್ಲಿ ನಿಮ್ಮ ಒಟ್ಟು ಭೂಮಿಯ ವಿಸ್ತೀರ್ಣವನ್ನು ಮತ್ತು ಕೃಷಿ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      phonetic: "Hanta 2: Ekaregalalli nimma ottu bhoomiya vistheernavannu matthu krushi prakaaravannu aaykemaadi."
    },
    MR: {
      native: "पायरी 2: एकरामध्ये आपल्या एकूण जमिनीचा आकार निवडा आणि शेतीचा प्रकार निवडा.",
      phonetic: "Paayri 2: Acre madhye aaplya ekun jaminicha aakaar nivda aani sheticha prakaar nivda."
    },
    PA: {
      native: "ਕਦਮ 2: ਏਕੜ ਵਿੱਚ ਆਪਣੀ ਕੁੱਲ ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ ਚੁਣੋ ਅਤੇ ਆਪਣੇ ਖੇਤ ਦੀ ਕਿਸਮ ਚੁਣੋ।",
      phonetic: "Kadam 2: Acre vich apni kull zameen da aakaar chuno atey apne khet di kism chuno."
    },
    BN: {
      native: "ধাপ ২: একরে আপনার মোট জমির পরিমাণ এবং খামারের ধরন নির্বাচন করুন।",
      phonetic: "Dhaap 2: Acre-e aponar mot jomir porimaan ebong khamarer dhoron nirbaachon korun."
    },
    GU: {
      native: "પગલું 2: એકરમાં તમારા કુલ ખેતરનું કદ પસંદ કરો અને ખેતીનો પ્રકાર પસંદ કરો.",
      phonetic: "Paglu 2: Acre ma tamara kul khetarnu kad pasand karo ane khetino prakaar pasand karo."
    }
  },
  3: {
    EN: {
      native: "Step 3: Select all your water and irrigation sources, such as borewell, canal, drip, or rainfed.",
      phonetic: "Step 3: Select all your water and irrigation sources, such as borewell, canal, drip, or rainfed."
    },
    HI: {
      native: "चरण 3: अपने पानी और सिंचाई के सभी स्रोत चुनें, जैसे बोरवेल, नहर, ड्रिप या वर्षा आधारित।",
      phonetic: "Charan 3: Apne paani aur sinchaai ke sabhi srot chunein, jaise borewell, nahar, drip ya barish aadharit."
    },
    TE: {
      native: "దశ 3: బోర్వెల్, కాలువ, డ్రిప్ లేదా వర్షాధారితం వంటి మీ నీటి మరియు సాగునీటి వనరులను ఎంచుకోండి.",
      phonetic: "Dasha 3: Borewell, kaaluva, drip leda varshaadharitham vanti mee neeti vanarulanu enchukondi."
    },
    TA: {
      native: "படி 3: ஆழ்துளை கிணறு, கால்வாய், சொட்டுநீர் அல்லது மழையளவை அடிப்படையாகக் கொண்ட நீர் ஆதாரங்களைத் தேர்ந்தெடுக்கவும்.",
      phonetic: "Padi 3: Borewell, kaalvaai, sottuneer alladhu mazhai aadhaara neeroothukalai thernthedukkavum."
    },
    KN: {
      native: "ಹಂತ 3: ಕೊಳವೆಬಾವಿ, ಕಾಲುವೆ, ಹನಿ ನೀರಾವರಿ ಅಥವಾ ಮಳೆಯಾಶ್ರಿತ ನೀರಿನ ಮೂಲಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      phonetic: "Hanta 3: Kolave baavi, kaaluve, hani neeravari athava maleyashritha neerina moolagalannu aaykemaadi."
    },
    MR: {
      native: "पायरी 3: बोअरवेल, कालवा, ठिबक किंवा पावसावर आधारित पाण्याचे सर्व स्रोत निवडा.",
      phonetic: "Paayri 3: Borewell, kaalwa, thibak kiva paavsaavar aadharit paanyache sarv srot nivda."
    },
    PA: {
      native: "ਕਦਮ 3: ਬੋਰਵੈੱਲ, ਨਹਿਰ, ਤੁਪਕਾ ਜਾਂ ਮੀਂਹ 'ਤੇ ਨਿਰਭਰ ਆਪਣੇ ਪਾਣੀ ਦੇ ਸਾਰੇ ਸਰੋਤ ਚੁਣੋ।",
      phonetic: "Kadam 3: Borewell, nehar, tupka ya meenh te nirbhar apne paani de saare srot chuno."
    },
    BN: {
      native: "ধাপ ৩: গভীর নলকূপ, খাল, ড্রিপ বা বৃষ্টির জলের মতো আপনার সমস্ত সেচের উৎস নির্বাচন করুন।",
      phonetic: "Dhaap 3: Borewell, khal, drip ba brishtir joler moto aponar shomosto shecher utso nirbaachon korun."
    },
    GU: {
      native: "પગલું 3: બોરવેલ, નહેર, ટપક પદ્ધતિ અથવા વરસાદ આધારિત તમારા પાણીના સ્ત્રોતો પસંદ કરો.",
      phonetic: "Paglu 3: Borewell, naher, tapak paddhati athva varsaad aadharit tamara paaninaa stroto pasand karo."
    }
  },
  4: {
    EN: {
      native: "Step 4: Choose your soil type, such as black soil, red soil, alluvial, or sandy soil.",
      phonetic: "Step 4: Choose your soil type, such as black soil, red soil, alluvial, or sandy soil."
    },
    HI: {
      native: "चरण 4: अपनी मिट्टी का प्रकार चुनें, जैसे काली मिट्टी, लाल मिट्टी, जलोढ़ या बलुई मिट्टी।",
      phonetic: "Charan 4: Apni mitti ka prakaar chunein, jaise kaali mitti, laal mitti, jalaudh ya balui mitti."
    },
    TE: {
      native: "దశ 4: నల్ల రేగడి, ఎర్ర నేల, లేదా ఒండ్రు నేల వంటి మీ నేల రకాన్ని ఎంచుకోండి.",
      phonetic: "Dasha 4: Nalla regadi, erra nela, leda ondru nela vanti mee nela rakaanni enchukondi."
    },
    TA: {
      native: "படி 4: கரிசல் மண், செம்மண், வண்டல் மண் அல்லது மணல் மண் போன்ற உங்கள் மண் வகையைத் தேர்ந்தெடுக்கவும்.",
      phonetic: "Padi 4: Karisal man, semman, vandal man alladhu manal man pondra ungal man vagaiyai thernthedukkavum."
    },
    KN: {
      native: "ಹಂತ 4: ಕಪ್ಪು ಮಣ್ಣು, ಕೆಂಪು ಮಣ್ಣು, ಮೆಕ್ಕಲು ಮಣ್ಣು ಅಥವಾ ಮರಳು ಮಣ್ಣಿನಂತಹ ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      phonetic: "Hanta 4: Kappu mannu, kempu mannu, mekkalu mannu athava maralu mannina nimma mannina prakaaravannu aaykemaadi."
    },
    MR: {
      native: "पायरी 4: काळी माती, तांबडी माती, गाळाची माती किंवा वालुकामय माती यापैकी आपला मातीचा प्रकार निवडा.",
      phonetic: "Paayri 4: Kaali maati, taambdi maati, gaalaachi maati kiva vaalukaamay maati yapaiki aapla maaticha prakaar nivda."
    },
    PA: {
      native: "ਕਦਮ 4: ਕਾਲੀ ਮਿੱਟੀ, ਲਾਲ ਮਿੱਟੀ, ਜਲੋੜ ਜਾਂ ਰੇਤਲੀ ਮਿੱਟੀ ਵਰਗੀ ਆਪਣੀ ਮਿੱਟੀ ਦੀ ਕਿਸਮ ਚੁਣੋ।",
      phonetic: "Kadam 4: Kaali mitti, laal mitti, jalodh ya retli mitti vargi apni mitti di kism chuno."
    },
    BN: {
      native: "ধাপ ৪: কালো মাটি, লাল মাটি, পলি মাটি বা বেলে মাটির মতো আপনার মাটির ধরন নির্বাচন করুন।",
      phonetic: "Dhaap 4: Kaalo maati, laal maati, poli maati ba bele maatir moto aponar maatir dhoron nirbaachon korun."
    },
    GU: {
      native: "પગલું 4: કાળી માટી, રાતી માટી, કાંપવાળી અથવા રેતાળ માટી જેવા તમારા જમીનનો પ્રકાર પસંદ કરો.",
      phonetic: "Paglu 4: Kaali maati, raati maati, kaampvaali athva retaal maati jeva tamara jameenno prakaar pasand karo."
    }
  },
  5: {
    EN: {
      native: "Step 5: Select your current farming season, like Kharif monsoon, Rabi winter, or Zaid summer.",
      phonetic: "Step 5: Select your current farming season, like Kharif monsoon, Rabi winter, or Zaid summer."
    },
    HI: {
      native: "चरण 5: अपना वर्तमान कृषि मौसम चुनें, जैसे खरीफ मानसून, रबी सर्दी, या जायद ग्रीष्मकालीन फसल।",
      phonetic: "Charan 5: Apna vartamaan krishi mausam chunein, jaise Kharif monsoon, Rabi sardi, ya Zaid garmi ki fasal."
    },
    TE: {
      native: "దశ 5: ఖరీఫ్ వర్షాకాలం, రబీ శీతాకాలం, లేదా వేసవి జైద్ వంటి మీ ప్రస్తుత వ్యవసాయ సీజన్‌ను ఎంచుకోండి.",
      phonetic: "Dasha 5: Kharif varshaakaalam, Rabi sheethaakaalam, leda vesavi Zaid vanti mee prastutha vyavasaaya season-nu enchukondi."
    },
    TA: {
      native: "படி 5: காரிஃப் பருவமழை, ரபி குளிர்காலம் அல்லது சையத் கோடைகாலம் போன்ற உங்கள் தற்போதைய விவசாய பருவத்தைத் தேர்ந்தெடுக்கவும்.",
      phonetic: "Padi 5: Kharif paruvamazhai, Rabi kulirkaalam alladhu Zaid kodaikaalam pondra ungal tharpodhaiya vivasaaya paruvathai thernthedukkavum."
    },
    KN: {
      native: "ಹಂತ 5: ಮುಂಗಾರು ಮುಂಗಾರು ಖಾರೀಫ್, ಚಳಿಗಾಲದ ರಬಿ, ಅಥವಾ ಬೇಸಿಗೆಯ ಝೈದ್ ಹಂಗಾಮನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      phonetic: "Hanta 5: Mungaaru Kharif, chaligaalada Rabi, athava besigeya Zaid hangaamannu aaykemaadi."
    },
    MR: {
      native: "पायरी 5: खरीप पावसाळा, रब्बी हिवाळा, किंवा उन्हाळी जायद यापैकी आपला शेतीचा हंगाम निवडा.",
      phonetic: "Paayri 5: Kharif paavsaala, Rabi hivaala, kiva unhaali Zaid yapaiki aapla sheticha hangaam nivda."
    },
    PA: {
      native: "ਕਦਮ 5: ਖਰੀਫ ਮਾਨਸੂਨ, ਰਬੀ ਸਰਦੀਆਂ, ਜਾਂ ਜ਼ੈਦ ਗਰਮੀਆਂ ਵਰਗਾ ਆਪਣਾ ਮੌਜੂਦਾ ਖੇਤੀ ਸੀਜ਼ਨ ਚੁਣੋ।",
      phonetic: "Kadam 5: Kharif monsoon, Rabi sardiyaan, ya Zaid garmiyaan varga apna maujooda kheti season chuno."
    },
    BN: {
      native: "ধাপ ৫: খরিফ বর্ষা, রবি শীত বা জায়েদ গ্রীষ্মের মতো আপনার বর্তমান চাষের মৌসুম নির্বাচন করুন।",
      phonetic: "Dhaap 5: Kharif borsha, Rabi sheet ba Zaid greeshmor moto aponar bortomaan chaasher moushum nirbaachon korun."
    },
    GU: {
      native: "પગલું 5: ખરીફ ચોમાસુ, રવિ શિયાળુ અથવા ઝાયદ ઉનાળુ જેવી તમારી ખેતીની મોસમ પસંદ કરો.",
      phonetic: "Paglu 5: Kharif chomaasu, Rabi shiyaalu athva Zaid unaalu jevi tamaari khetini mosam pasand karo."
    }
  },
  6: {
    EN: {
      native: "Step 6: Choose your farm goals, your primary farming method, and tell us if you raise livestock.",
      phonetic: "Step 6: Choose your farm goals, your primary farming method, and tell us if you raise livestock."
    },
    HI: {
      native: "चरण 6: अपने कृषि लक्ष्य, खेती का तरीका चुनें, और बताएं कि क्या आप पशुपालन करते हैं।",
      phonetic: "Charan 6: Apne krishi lakshya, kheti ka tareeqa chunein, aur batayein kya aap pashupaalan karte hain."
    },
    TE: {
      native: "దశ 6: మీ వ్యవసాయ లక్ష్యాలు, సాగు పద్ధతి మరియు పశుపోషణ వివరాలను ఎంచుకోండి.",
      phonetic: "Dasha 6: Mee vyavasaaya lakshyaalu, saagu paddhati mariyu pashuposhana vivaraalanu enchukondi."
    },
    TA: {
      native: "படி 6: உங்கள் விவசாய இலக்குகள், சாகுபடி முறை மற்றும் கால்நடை வளர்ப்பு விவரங்களைத் தேர்வுசெய்யவும்.",
      phonetic: "Padi 6: Ungal vivasaaya ilakkugal, saagubadi murai matrum kaalnadai valarppu vivarangalai therndhedukkavum."
    },
    KN: {
      native: "ಹಂತ 6: ನಿಮ್ಮ ಕೃಷಿ ಗುರಿಗಳು, ಮುಖ್ಯ ಕೃಷಿ ವಿಧಾನ ಮತ್ತು ಜಾನುವಾರು ಸಾಕಾಣಿಕೆ ವಿವರಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      phonetic: "Hanta 6: Nimma krushi gurigalu, mukhya krushi vidhaana matthu jaanuvaaru saakaanike vivarangalannu aaykemaadi."
    },
    MR: {
      native: "पायरी 6: आपली शेती उद्दिष्टे, प्राथमिक शेती पद्धत आणि पशुपालनाची माहिती निवडा.",
      phonetic: "Paayri 6: Apli sheti uddishte, praathamik sheti paddhat aani pashupaalanaachi maahiti nivda."
    },
    PA: {
      native: "ਕਦਮ 6: ਆਪਣੇ ਖੇਤੀ ਟੀਚੇ, ਮੁੱਖ ਖੇਤੀ ਵਿਧੀ ਅਤੇ ਪਸ਼ੂ ਪਾਲਣ ਦੇ ਵੇਰਵੇ ਚੁਣੋ।",
      phonetic: "Kadam 6: Apne kheti teeche, mukh kheti vidhi atey pashu paalan de veervey chuno."
    },
    BN: {
      native: "ধাপ ৬: আপনার খামারের লক্ষ্য, প্রধান চাষ পদ্ধতি এবং গবাদি পশু পালনের তথ্য নির্বাচন করুন।",
      phonetic: "Dhaap 6: Aponar khamarer lokkhyo, prodhaan chaash poddhoti ebong gobadi poshu paaloner tothyo nirbaachon korun."
    },
    GU: {
      native: "પગલું 6: તમારા ખેતીના લક્ષ્યો, મુખ્ય ખેતી પદ્ધતિ અને પશુપાલનની વિગતો પસંદ કરો.",
      phonetic: "Paglu 6: Tamara khetina lakshyo, mukhya kheti paddhati ane pashupaalanni vigato pasand karo."
    }
  },
  7: {
    EN: {
      native: "Step 7: Review your complete farm profile summary. Verify all details before proceeding to crop recommendations.",
      phonetic: "Step 7: Review your complete farm profile summary. Verify all details before proceeding to crop recommendations."
    },
    HI: {
      native: "चरण 7: अपने संपूर्ण खेत प्रोफाइल सारांश की समीक्षा करें। फसल सिफारिशों पर जाने से पहले सभी विवरण जांचें।",
      phonetic: "Charan 7: Apne sampoorna khet profile saaraansh ki samiksha karein. Fasal sifaarishon par jaane se pehle sabhi vivaran jaanchein."
    },
    TE: {
      native: "దశ 7: మీ పూర్తి వ్యవసాయ ప్రొఫైల్ వివరాలను సమీక్షించండి. పంట సిఫార్సులకు వెళ్లే ముందు వివరాలను సరిచూసుకోండి.",
      phonetic: "Dasha 7: Mee poorthi vyavasaaya profile vivaraalanu sameekshinchandi. Panta sifarshulaku velle mundu vivaraalanu sarichoosukondi."
    },
    TA: {
      native: "படி 7: உங்கள் முழு பண்ணை சுயவிவர சுருக்கத்தை மதிப்பாய்வு செய்யவும். பயிர் பரிந்துரைகளுக்குச் செல்வதற்கு முன் விவரங்களைச் சரிபார்க்கவும்.",
      phonetic: "Padi 7: Ungal muzhu pannai suyavivara surukkathai madhippaaivu seiyavum. Payir parindhuraigalukku selvadharku mun vivarangalai saripaarkkavum."
    },
    KN: {
      native: "ಹಂತ 7: ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ಸಾರಾಂಶವನ್ನು ಪರಿಶೀಲಿಸಿ. ಬೆಳೆ ಶಿಫಾರಸುಗಳಿಗೆ ಮುಂದುವರಿಯುವ ಮೊದಲು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      phonetic: "Hanta 7: Nimma sampoorna krushi profile saaraamshavannu pareekshisi. Bele shifarassugalige munduvariyuva modalu ella vivarangalannu sarinodikkoli."
    },
    MR: {
      native: "पायरी 7: आपल्या संपूर्ण शेत प्रोफाइल सारांशाचे पुनरावलोकन करा. पीक शिफारसींकडे जाण्यापूर्वी सर्व तपशील तपासा.",
      phonetic: "Paayri 7: Aaplya sampoorna shet profile saaraanshaache punaraavlokan kara. Peek shifaarasiikade jaanyaapoorvi sarv tapshil tapaasa."
    },
    PA: {
      native: "ਕਦਮ 7: ਆਪਣੇ ਪੂਰੇ ਖੇਤ ਪ੍ਰੋਫਾਈਲ ਸਾਰ ਦੀ ਸਮੀਖਿਆ ਕਰੋ। ਫਸਲ ਦੀਆਂ ਸਿਫ਼ਾਰਸ਼ਾਂ 'ਤੇ ਜਾਣ ਤੋਂ ਪਹਿਲਾਂ ਸਾਰੇ ਵੇਰਵਿਆਂ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।",
      phonetic: "Kadam 7: Apne poore khet profile saar di sameekhiya karo. Fasal di sifarishaan te jaan ton pehlaan saare veervey check karo."
    },
    BN: {
      native: "ধাপ ৭: আপনার সম্পূর্ণ খামার প্রোফাইল সারাংশ পর্যালোচনা করুন। ফসলের সুপারিশে এগিয়ে যাওয়ার আগে সমস্ত বিবরণ যাচাই করুন।",
      phonetic: "Dhaap 7: Aponar shompoorno khamar profile shaaraangsho porjalochona korun. Foshuler shupaarishe egiye jaoyar aage shomosto biboron jaachai korun."
    },
    GU: {
      native: "પગલું 7: તમારા સંપૂર્ણ ખેતર પ્રોફાઇલ સારાંશની સમીક્ષા કરો. પાકની ભલામણો તરફ આગળ વધતા પહેલા તમામ વિગતો તપાસો.",
      phonetic: "Paglu 7: Tamara sampoorna khetar profile saaraanshni sameeksha karo. Paakni bhalaamno taraf aagal vadhta pehla tamaam vigato tapaaso."
    }
  },
  8: {
    EN: {
      native: "Step 8: AI has analyzed your location, soil, and water to recommend the best crops. You can select recommended crops or click Select Crop Manually to choose any crop.",
      phonetic: "Step 8: AI has analyzed your location, soil, and water to recommend the best crops. You can select recommended crops or click Select Crop Manually to choose any crop."
    },
    HI: {
      native: "चरण 8: एआई ने आपकी मिट्टी और पानी के अनुसार सर्वोत्तम फसलों की सिफारिश की है। आप अनुशंसित फसलें चुन सकते हैं या मैनुअल फसल चुनने का विकल्प उपयोग कर सकते हैं।",
      phonetic: "Charan 8: AI ne aapki mitti aur paani ke anusaar sarvottam faslon ki sifaarish ki hai. Aap recommended faslein chun sakte hain ya manual fasal chunein."
    },
    TE: {
      native: "దశ 8: AI మీ నేల మరియు నీటి ఆధారంగా ఉత్తమ పంటలను సిఫార్సు చేసింది. మీరు సిఫార్సు చేసిన పంటలను ఎంచుకోవచ్చు లేదా మాన్యువల్ గా పంటను ఎంచుకోవచ్చు.",
      phonetic: "Dasha 8: AI mee nela mariyu neeti aadharangaa utthama pantalanu sifarashu chesindi. Meeru sifarashu chesina pantalanu enchukovacchu leda manual gaa enchukondi."
    },
    TA: {
      native: "படி 8: உங்கள் மண் மற்றும் நீரின் அடிப்படையில் சிறந்த பயிர்களை AI பரிந்துரைத்துள்ளது. பரிந்துரைக்கப்பட்ட பயிர்களைத் தேர்வுசெய்யலாம் அல்லது கைமுறையாகத் தேர்வுசெய்யலாம்.",
      phonetic: "Padi 8: Ungal man matrum neerin adipadayil sirandha payirgalai AI parindhuraithulladhu. Parindhuraikkapatta payirgalai therndhedukkalaam alladhu kaimuraiyaaga therndhedukkalaam."
    },
    KN: {
      native: "ಹಂತ 8: AI ನಿಮ್ಮ ಮಣ್ಣು ಮತ್ತು ನೀರಿನ ಆಧಾರದ ಮೇಲೆ ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಿದೆ. ನೀವು ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದು ಅಥವಾ ಹಸ್ತಚಾಲಿತವಾಗಿ ಆಯ್ಕೆ ಮಾಡಬಹುದು.",
      phonetic: "Hanta 8: AI nimma mannu matthu neerina aadharada mele athyuttama belegalannu shifarassu maadide. Neevu shifarassu maadida belegalannu aayke maadabahudu athava manual aagi maadabahudu."
    },
    MR: {
      native: "पायरी 8: AI ने आपल्या माती आणि पाण्याचा विचार करून सर्वोत्तम पिकांची शिफारस केली आहे. आपण शिफारस केलेली पिके निवडू शकता किंवा मॅन्युअली पीक निवडू शकता.",
      phonetic: "Paayri 8: AI ne aaplya maati aani paanyacha vichaar karun sarvottam pikaanchi shifaaras keli aahe. Aapan shifaaras keleli pike nivdu shakta kiva manually nivda."
    },
    PA: {
      native: "ਕਦਮ 8: AI ਨੇ ਤੁਹਾਡੀ ਮਿੱਟੀ ਅਤੇ ਪਾਣੀ ਦੇ ਅਧਾਰ 'ਤੇ ਵਧੀਆ ਫਸਲਾਂ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਹੈ। ਤੁਸੀਂ ਸਿਫਾਰਸ਼ ਕੀਤੀਆਂ ਫਸਲਾਂ ਚੁਣ ਸਕਦੇ ਹੋ ਜਾਂ ਖੁਦ ਫਸਲ ਚੁਣ ਸਕਦੇ ਹੋ।",
      phonetic: "Kadam 8: AI ne tuhadi mitti atey paani de adhaar te vadiya faslaan di sifarish kiti hai. Tusi sifarish kitiaan faslaan chun sakde ho ya khud fasal chuno."
    },
    BN: {
      native: "ধাপ ৮: এআই আপনার মাটি ও জলের ভিত্তিতে সেরা ফসলের সুপারিশ করেছে। আপনি প্রস্তাবিত ফসল নির্বাচন করতে পারেন বা ম্যানুয়ালি ফসল বেছে নিতে পারেন।",
      phonetic: "Dhaap 8: AI aponar maati o joler bhittite shera foshuler shupaarish korechhe. Aponi prostabito foshol nirbaachon korte paaren ba manually foshol bachhte paaren."
    },
    GU: {
      native: "પગલું 8: એઆઈએ તમારી માટી અને પાણીના આધારે શ્રેષ્ઠ પાકોની ભલામણ કરી છે. તમે ભલામણ કરેલ પાક પસંદ કરી શકો છો અથવા મેન્યુઅલી પાક પસંદ કરી શકો છો.",
      phonetic: "Paglu 8: AI e tamaari maati ane paanina aadhaare shreshtha paakoni bhalaaman kari chhe. Tame recommended paak pasand kari shako chho athva manually pasand karo."
    }
  }
};

// ── Smart Agronomic Crop Recommendation Engine for Step 8 ─────────────────
export function getRecommendedCropsForWizard({
  soilType = "black",
  irrigation = [],
  season = "kharif",
  landAcres = 2.5,
  location = "",
  farmType = "",
  farmingMethod = ""
}) {
  const candidates = [
    {
      id: "rice",
      name: "Rice / Paddy",
      icon: "🌾",
      category: "cereals",
      soils: ["alluvial", "clay", "loamy"],
      seasons: ["kharif", "zaid"],
      waterNeeds: ["canal", "borewell", "farm_pond", "river", "reliable"],
      baseProfit: 28000,
      yieldAcre: "22-26 Q/Acre",
      why: "High yield potential in heavy clay and alluvial soils with continuous moisture."
    },
    {
      id: "cotton",
      name: "Cotton",
      icon: "🌿",
      category: "commercial",
      soils: ["black", "alluvial", "mixed"],
      seasons: ["kharif"],
      waterNeeds: ["drip", "borewell", "rainfed", "sprinkler"],
      baseProfit: 42000,
      yieldAcre: "10-14 Q/Acre",
      why: "Top cash crop for Black Regur soil with high market liquidity."
    },
    {
      id: "wheat",
      name: "Wheat",
      icon: "🌾",
      category: "cereals",
      soils: ["alluvial", "loamy", "black"],
      seasons: ["rabi"],
      waterNeeds: ["canal", "borewell", "sprinkler", "reliable"],
      baseProfit: 32000,
      yieldAcre: "18-22 Q/Acre",
      why: "Guaranteed MSP procurement and optimal for cool winter temperatures."
    },
    {
      id: "maize",
      name: "Maize / Corn",
      icon: "🌽",
      category: "cereals",
      soils: ["loamy", "red", "alluvial", "black"],
      seasons: ["kharif", "rabi", "zaid"],
      waterNeeds: ["drip", "sprinkler", "borewell", "rainfed"],
      baseProfit: 26000,
      yieldAcre: "24-30 Q/Acre",
      why: "Fast 100-day duration, dual income from grain and animal green fodder."
    },
    {
      id: "red_gram",
      name: "Red Gram / Pigeonpea (Tur)",
      icon: "🫘",
      category: "pulses",
      soils: ["black", "red", "loamy"],
      seasons: ["kharif"],
      waterNeeds: ["rainfed", "limited", "drip", "borewell"],
      baseProfit: 34000,
      yieldAcre: "7-10 Q/Acre",
      why: "Hardy pulse fixing 40kg atmospheric nitrogen/acre, thrives with limited water."
    },
    {
      id: "groundnut",
      name: "Groundnut / Peanut",
      icon: "🥜",
      category: "oilseeds",
      soils: ["red", "sandy", "loamy"],
      seasons: ["kharif", "rabi"],
      waterNeeds: ["sprinkler", "drip", "rainfed", "borewell"],
      baseProfit: 31000,
      yieldAcre: "9-12 Q/Acre",
      why: "High oil content, thrives in porous red and sandy loam soil."
    },
    {
      id: "soybean",
      name: "Soybean",
      icon: "🫘",
      category: "oilseeds",
      soils: ["black", "loamy", "clay"],
      seasons: ["kharif"],
      waterNeeds: ["rainfed", "borewell", "drip"],
      baseProfit: 29000,
      yieldAcre: "8-11 Q/Acre",
      why: "High industrial demand and rapid turnaround in central black soil belt."
    },
    {
      id: "tomato",
      name: "Tomato",
      icon: "🍅",
      category: "vegetables",
      soils: ["loamy", "red", "alluvial"],
      seasons: ["rabi", "kharif", "zaid"],
      waterNeeds: ["drip", "borewell", "sprinkler", "reliable"],
      baseProfit: 55000,
      yieldAcre: "120-160 Q/Acre",
      why: "High gross horticultural returns with drip fertigation."
    },
    {
      id: "onion",
      name: "Onion",
      icon: "🧅",
      category: "vegetables",
      soils: ["loamy", "alluvial", "red", "black"],
      seasons: ["rabi", "kharif"],
      waterNeeds: ["drip", "sprinkler", "borewell"],
      baseProfit: 48000,
      yieldAcre: "100-140 Q/Acre",
      why: "Year-round market demand and high profitability in well-drained soils."
    },
    {
      id: "chilli",
      name: "Chilli",
      icon: "🌶️",
      category: "spices",
      soils: ["black", "red", "loamy"],
      seasons: ["kharif", "rabi"],
      waterNeeds: ["drip", "borewell", "reliable"],
      baseProfit: 65000,
      yieldAcre: "15-20 Q/Acre",
      why: "High export liquidity (Guntur/Teja) with intensive IPM."
    },
    {
      id: "turmeric",
      name: "Turmeric",
      icon: "🫚",
      category: "spices",
      soils: ["loamy", "red", "alluvial", "black"],
      seasons: ["kharif", "perennial"],
      waterNeeds: ["drip", "borewell"],
      baseProfit: 58000,
      yieldAcre: "25-30 Q/Acre",
      why: "High curcumin value, shade-tolerant, excellent long-term cash returns."
    },
    {
      id: "bengal_gram",
      name: "Bengal Gram / Chickpea (Chana)",
      icon: "🫘",
      category: "pulses",
      soils: ["black", "alluvial", "loamy"],
      seasons: ["rabi"],
      waterNeeds: ["limited", "rainfed", "sprinkler", "borewell"],
      baseProfit: 27000,
      yieldAcre: "8-11 Q/Acre",
      why: "Low water requirement, deep taproot utilizes residual subsoil moisture."
    },
    {
      id: "green_gram",
      name: "Green Gram / Moong",
      icon: "🫘",
      category: "pulses",
      soils: ["loamy", "alluvial", "red", "sandy"],
      seasons: ["zaid", "kharif"],
      waterNeeds: ["rainfed", "sprinkler", "drip"],
      baseProfit: 24000,
      yieldAcre: "5-7 Q/Acre",
      why: "Ultra-short 60-day crop cycle, enriches soil nitrogen between seasons."
    },
    {
      id: "mustard",
      name: "Mustard",
      icon: "🌼",
      category: "oilseeds",
      soils: ["alluvial", "loamy", "sandy"],
      seasons: ["rabi"],
      waterNeeds: ["limited", "borewell", "sprinkler", "rainfed"],
      baseProfit: 28000,
      yieldAcre: "7-10 Q/Acre",
      why: "Minimal input costs, 2-3 protective irrigations produce top oilseed yield."
    },
    {
      id: "sugarcane",
      name: "Sugarcane",
      icon: "🎋",
      category: "commercial",
      soils: ["alluvial", "clay", "black"],
      seasons: ["perennial", "kharif"],
      waterNeeds: ["canal", "borewell", "reliable", "river"],
      baseProfit: 60000,
      yieldAcre: "350-450 Q/Acre",
      why: "Guaranteed FRP pricing with mill delivery and long ratooning."
    },
    {
      id: "potato",
      name: "Potato",
      icon: "🥔",
      category: "vegetables",
      soils: ["loamy", "sandy", "alluvial"],
      seasons: ["rabi"],
      waterNeeds: ["sprinkler", "borewell", "drip"],
      baseProfit: 52000,
      yieldAcre: "140-180 Q/Acre",
      why: "Fast bulk biomass accumulation in loose, cool winter soils."
    },
    {
      id: "banana",
      name: "Banana",
      icon: "🍌",
      category: "fruits",
      soils: ["alluvial", "loamy", "clay"],
      seasons: ["perennial", "kharif"],
      waterNeeds: ["drip", "canal", "borewell"],
      baseProfit: 75000,
      yieldAcre: "250-350 Q/Acre",
      why: "High regular income with drip fertigation throughout the crop life."
    },
    {
      id: "bajra",
      name: "Bajra / Pearl Millet",
      icon: "🌾",
      category: "millets",
      soils: ["sandy", "red", "loamy"],
      seasons: ["kharif"],
      waterNeeds: ["rainfed", "limited"],
      baseProfit: 22000,
      yieldAcre: "12-16 Q/Acre",
      why: "Extreme drought tolerance and climate resilience in arid sandy soils."
    },
    {
      id: "jowar",
      name: "Jowar / Sorghum",
      icon: "🌾",
      category: "millets",
      soils: ["black", "loamy", "clay"],
      seasons: ["kharif", "rabi"],
      waterNeeds: ["rainfed", "limited", "borewell"],
      baseProfit: 24000,
      yieldAcre: "14-18 Q/Acre",
      why: "Nutrient-dense millet, deep rooting withstands dry spells in black soils."
    }
  ];

  // Score each crop against farm's soil, season, irrigation, location, and farming method
  const locLower = (location || "").toLowerCase();
  const scored = candidates.map(crop => {
    let score = 60;
    
    // Soil match (+20)
    if (crop.soils.includes(soilType.toLowerCase())) {
      score += 20;
    } else if (soilType === "mixed" || soilType === "loamy") {
      score += 10;
    }

    // Season match (+16)
    if (crop.seasons.includes(season.toLowerCase()) || crop.seasons.includes("perennial")) {
      score += 16;
    } else {
      score -= 10;
    }

    // Water availability match (+14)
    const waterMatch = irrigation.some(irr => crop.waterNeeds.includes(irr));
    if (waterMatch) {
      score += 14;
    } else if (irrigation.includes("rainfed") && crop.waterNeeds.includes("rainfed")) {
      score += 14;
    } else if (irrigation.includes("rainfed") && !crop.waterNeeds.includes("rainfed")) {
      score -= 12; // High water crops penalised if rainfed only
    }

    // Farm Type match (+10)
    const ftLower = (farmType || "").toLowerCase();
    if (ftLower.includes("horticulture") && (crop.category === "vegetables" || crop.category === "fruits" || crop.category === "spices")) {
      score += 10;
    } else if (ftLower.includes("commercial") && (crop.category === "commercial" || crop.category === "spices" || crop.category === "oilseeds")) {
      score += 8;
    }

    // Farming method (+6)
    if (farmingMethod === "Organic" && (crop.category === "pulses" || crop.category === "millets" || crop.category === "spices")) {
      score += 6;
    }

    // Location specific matching bonus (+8 to +10)
    if (locLower) {
      if ((crop.id === "rice" || crop.id === "cotton" || crop.id === "chilli" || crop.id === "turmeric" || crop.id === "maize") &&
          (locLower.includes("telangana") || locLower.includes("andhra") || locLower.includes("warangal") || locLower.includes("guntur") || locLower.includes("khammam") || locLower.includes("karimnagar") || locLower.includes("hyderabad"))) {
        score += 9;
      }
      if ((crop.id === "cotton" || crop.id === "soybean" || crop.id === "onion" || crop.id === "jowar" || crop.id === "sugarcane") &&
          (locLower.includes("maharashtra") || locLower.includes("vidarbha") || locLower.includes("nagpur") || locLower.includes("nashik") || locLower.includes("pune") || locLower.includes("kolhapur"))) {
        score += 9;
      }
      if ((crop.id === "wheat" || crop.id === "rice" || crop.id === "mustard" || crop.id === "potato") &&
          (locLower.includes("punjab") || locLower.includes("haryana") || locLower.includes("uttar pradesh") || locLower.includes("bihar") || locLower.includes("ludhiana") || locLower.includes("meerut"))) {
        score += 9;
      }
      if ((crop.id === "groundnut" || crop.id === "cotton" || crop.id === "bajra" || crop.id === "mustard") &&
          (locLower.includes("gujarat") || locLower.includes("rajasthan") || locLower.includes("saurashtra") || locLower.includes("jaipur") || locLower.includes("ahmedabad"))) {
        score += 9;
      }
      if ((crop.id === "maize" || crop.id === "sugarcane" || crop.id === "chilli" || crop.id === "banana") &&
          (locLower.includes("karnataka") || locLower.includes("tamil") || locLower.includes("kerala") || locLower.includes("bengaluru") || locLower.includes("coimbatore"))) {
        score += 9;
      }
    }

    const matchPercent = Math.min(99, Math.max(70, score));
    const netProfit = Math.round(crop.baseProfit * landAcres);
    return {
      ...crop,
      matchPercent,
      netProfit,
      netProfitPerAcre: crop.baseProfit
    };
  });

  scored.sort((a, b) => b.matchPercent - a.matchPercent);
  return scored.slice(0, 6);
}

export default function FarmProfileWizard({ user, onClose, onSaveProfile }) {
  const { language, t } = useLanguage();
  const { isSpeaking, speak, stopSpeaking } = useVoiceAssistant(language);

  const [step, setStep] = useState(1);
  const totalSteps = 8;
  const [cropSelectionTab, setCropSelectionTab] = useState("both"); // "ai", "manual", or "both"

  // Initial State from existing user or defaults
  const initialLocObj = user?.locationObj || {
    formattedAddress: typeof user?.location === "string" ? user.location : "Hyderabad, Telangana, India",
    district: "Hyderabad",
    state: "Telangana",
    country: "India",
    accuracy: null
  };

  const [farmerName, setFarmerName] = useState(user?.name || "");
  const [locationInput, setLocationInput] = useState(initialLocObj.formattedAddress || "Hyderabad, Telangana, India");
  const [locationObj, setLocationObj] = useState(initialLocObj);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("");
  const [accuracyMsg, setAccuracyMsg] = useState("");

  // Land & Farm Type
  const [landPreset, setLandPreset] = useState(user?.farmProfile?.landPreset || "3 to 5 Acres");
  const [customLandSize, setCustomLandSize] = useState(user?.farmProfile?.customLandSize || "4.5");
  const [landUnit, setLandUnit] = useState(user?.farmProfile?.landUnit || "Acres");
  const [farmType, setFarmType] = useState(user?.farmProfile?.farmType || "Medium Holding");

  // Irrigation & Soil
  const [irrigation, setIrrigation] = useState(user?.farmProfile?.irrigation || ["borewell", "drip"]);
  const [soilType, setSoilType] = useState(user?.farmProfile?.soilType || "black");
  const [showSoilHelp, setShowSoilHelp] = useState(false);

  // Season & Stage
  const [season, setSeason] = useState(user?.farmProfile?.season || "kharif");

  // Goals, Method & Livestock
  const [goals, setGoals] = useState(user?.farmProfile?.goals || ["increase_profit", "market_prices", "detect_disease"]);
  const [farmingMethod, setFarmingMethod] = useState(user?.farmProfile?.farmingMethod || "Conventional");
  const [hasLivestock, setHasLivestock] = useState(user?.farmProfile?.hasLivestock || false);
  const [livestockTypes, setLivestockTypes] = useState(user?.farmProfile?.livestockTypes || ["Cattle"]);

  // Crops (Now final choice at Step 8)
  const [crops, setCrops] = useState(user?.farmProfile?.crops || [
    { id: "cotton", name: "Cotton", icon: "🌿", isPrimary: true, area: 2.5, stage: "Vegetative Growth" }
  ]);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  // Calculate Numeric Land Size in Acres
  const numericLandSizeAcres = () => {
    if (landPreset === "Custom Size") {
      return convertToAcres(parseFloat(customLandSize) || 0, landUnit);
    }
    if (landPreset === "Terrace / Urban Farming") return 0.25;
    if (landPreset === "Below 0.5 acre") return 0.4;
    if (landPreset === "0.5–1 acre") return 0.75;
    if (landPreset === "1–2 acres") return 1.5;
    if (landPreset === "2–3 acres") return 2.5;
    if (landPreset === "3–5 acres") return 4.0;
    if (landPreset === "5–10 acres") return 7.5;
    if (landPreset === "10–25 acres") return 17.5;
    if (landPreset === "25+ acres") return 30.0;
    return 3.0;
  };

  // Dynamically Recommended Crops for Step 8 based on user inputs
  const recommendedCrops = useMemo(() => {
    return getRecommendedCropsForWizard({
      soilType,
      irrigation,
      season,
      landAcres: numericLandSizeAcres(),
      location: locationInput,
      farmType,
      farmingMethod
    });
  }, [soilType, irrigation, season, landPreset, customLandSize, landUnit, locationInput, farmType, farmingMethod]);

  // Spoken Voice Guidance Trigger
  const handleStepVoice = (forcedLang = null) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const activeLang = forcedLang || language || "EN";
      const guidanceObj = STEP_VOICE_GUIDANCE[step]?.[activeLang] || STEP_VOICE_GUIDANCE[step]?.EN;
      if (guidanceObj) {
        speak(guidanceObj.native, activeLang, guidanceObj.phonetic);
      }
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleDetectGPS = async () => {
    setError("");
    setAccuracyMsg("");
    setDetectingGps(true);
    setGpsStatus(`📍 ${t("Detecting...", "Detecting...")}`);

    try {
      const res = await detectGPSLocation();

      if (res.success) {
        setLocationObj(res);
        setLocationInput(res.formattedAddress);
        if (res.accuracyWarning) {
          setAccuracyMsg(res.accuracyWarning);
        } else if (res.accuracy) {
          setAccuracyMsg(`GPS: ±${Math.round(res.accuracy)} m`);
        }
      } else {
        setError(res.error || t("Unable to detect location. Please enter manually.", "Unable to detect location. Please enter manually."));
      }
    } catch {
      setError(t("Failed to detect GPS location. Please enter manually.", "Failed to detect GPS location. Please enter manually."));
    } finally {
      setDetectingGps(false);
      setGpsStatus("");
    }
  };

  const toggleIrrigation = (id) => {
    if (irrigation.includes(id)) {
      setIrrigation(irrigation.filter(item => item !== id));
    } else {
      setIrrigation([...irrigation, id]);
    }
  };

  const toggleGoal = (id) => {
    if (goals.includes(id)) {
      setGoals(goals.filter(item => item !== id));
    } else {
      setGoals([...goals, id]);
    }
  };

  const toggleLivestock = (type) => {
    if (livestockTypes.includes(type)) {
      setLivestockTypes(livestockTypes.filter(t => t !== type));
    } else {
      setLivestockTypes([...livestockTypes, type]);
    }
  };

  const handleSelectRecommendedCrop = (recCrop) => {
    const isAlready = crops.some(c => c.name === recCrop.name || c.id === recCrop.id);
    if (isAlready) {
      // Toggle off
      const filtered = crops.filter(c => c.name !== recCrop.name && c.id !== recCrop.id);
      if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      setCrops(filtered);
    } else {
      // Add crop
      const isFirst = crops.length === 0;
      const totalAcres = numericLandSizeAcres();
      const newArea = isFirst ? totalAcres : Math.max(0.5, Math.round((totalAcres / (crops.length + 1)) * 10) / 10);
      const newCrop = {
        id: recCrop.id,
        name: recCrop.name,
        icon: recCrop.icon,
        category: recCrop.category,
        isPrimary: isFirst,
        area: newArea,
        stage: "Vegetative Growth"
      };
      setCrops([...crops, newCrop]);
    }
  };

  const handleNextStep = async () => {
    setError("");
    if (isSpeaking) stopSpeaking();

    if (step === 1) {
      if (!locationObj || locationObj.formattedAddress !== locationInput) {
        const parsed = await parseManualLocation(locationInput);
        if (parsed.success) {
          setLocationObj(parsed);
        } else {
          setError(parsed.error || t("Please enter a valid location in India.", "Please enter a valid location in India."));
          return;
        }
      }
    }

    if (step < totalSteps) {
      setStep(s => s + 1);
    }
  };

  const handlePrevStep = () => {
    setError("");
    if (isSpeaking) stopSpeaking();
    if (step > 1) {
      setStep(s => s - 1);
    }
  };

  const handleFinalSave = async () => {
    setError("");
    if (crops.length === 0) {
      setError(t("Please select at least one recommended crop or select crop manually.", "Please select at least one recommended crop or select crop manually."));
      return;
    }

    setSaving(true);

    let finalLoc = locationObj;
    if (!locationObj || locationObj.formattedAddress !== locationInput) {
      const parsed = await parseManualLocation(locationInput);
      if (parsed.success) {
        finalLoc = parsed;
      }
    }

    const calculatedAcres = numericLandSizeAcres();
    const primaryCropObj = crops.find(c => c.isPrimary) || crops[0] || { name: "Cotton" };

    const farmProfileObj = {
      location: {
        formattedAddress: finalLoc.formattedAddress || locationInput,
        district: finalLoc.district || "Hyderabad",
        state: finalLoc.state || "Telangana",
        country: "India",
        accuracy: finalLoc.accuracy || null
      },
      land: {
        preset: landPreset,
        customSize: customLandSize,
        unit: landUnit,
        sizeAcres: calculatedAcres,
        farmType
      },
      crops,
      primaryCrop: primaryCropObj.name,
      irrigation,
      soilType,
      season,
      farmingMethod,
      goals,
      hasLivestock,
      livestockTypes
    };

    const updatedUser = {
      ...user,
      name: farmerName.trim() || user?.name || "Farmer",
      location: finalLoc.formattedAddress || locationInput,
      locationObj: finalLoc,
      cropType: primaryCropObj.name,
      landSize: `${calculatedAcres} ${landUnit}`,
      farmProfile: farmProfileObj
    };

    try {
      if (onSaveProfile) {
        await onSaveProfile(updatedUser);
      }
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch {
      setError(t("Failed to save farm profile. Please try again.", "Failed to save farm profile. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const progressPct = (step / totalSteps) * 100;

  const stepTitles = {
    1: t("Farm Location", "Farm Location"),
    2: t("Land & Farm Type", "Land & Farm Type"),
    3: t("Water & Irrigation Availability", "Water & Irrigation Availability"),
    4: t("Soil Type Identification", "Soil Type Identification"),
    5: t("Farming Season & Climate", "Farming Season & Climate"),
    6: t("Farm Goals & Method", "Farm Goals & Method"),
    7: t("Review Farm Summary", "Review Farm Summary"),
    8: t("AI Crop Recommendation & Selection", "AI Crop Recommendation & Selection")
  };

  return (
    <div className="modal-overlay" style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
      display: "grid", placeItems: "center", padding: "16px"
    }}>
      <div className="modal-card" style={{
        background: "var(--fk-card)", border: "1px solid var(--fk-border)",
        borderRadius: "12px", width: "100%", maxWidth: "660px",
        padding: "24px", boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
        position: "relative", maxHeight: "90vh", display: "flex", flexDirection: "column"
      }}>
        {/* Header with Title and Vernacular Voice Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(0, 105, 72, 0.12)", color: "#006948", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Sprout size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "19px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                {t("🌾 My Farm Profile", "🌾 My Farm Profile")}
              </h2>
              <span style={{ fontSize: "13px", color: "var(--fk-text-sub)", fontWeight: "600" }}>
                {t("Step", "Step")} {step} {t("of", "of")} {totalSteps} — {stepTitles[step]}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Audio Voice Guide Button in Header */}
            <button
              type="button"
              onClick={handleStepVoice}
              title={isSpeaking ? t("Stop Voice Assistance", "Stop Voice Assistance") : t("Listen to Step Guidance", "Listen to Step Guidance")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 10px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                border: isSpeaking ? "1.5px solid #dc2626" : "1.5px solid #006948",
                background: isSpeaking ? "#fee2e2" : "rgba(0, 105, 72, 0.08)",
                color: isSpeaking ? "#b91c1c" : "#006948",
                transition: "all 0.2s ease"
              }}
            >
              {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isSpeaking ? t("Stop", "Stop") : t("Listen to Voice", "Listen")}</span>
            </button>

            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: "var(--fk-text-sub)", cursor: "pointer", padding: "4px" }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: "5px", background: "rgba(0,0,0,0.08)", borderRadius: "3px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: "#006948", transition: "width 0.3s ease" }} />
        </div>

        {error && (
          <div style={{ background: "rgba(211, 47, 47, 0.12)", border: "1px solid #d32f2f", color: "#d32f2f", padding: "8px 12px", borderRadius: "6px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {savedSuccess && (
          <div style={{ background: "rgba(56, 142, 60, 0.15)", border: "1px solid #388e3c", color: "#388e3c", padding: "8px 12px", borderRadius: "6px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <CheckCircle2 size={16} /> {t("Farm profile saved successfully! Context updated for Sahayak AI.", "Farm profile saved successfully! Context updated for Sahayak AI.")}
          </div>
        )}

        {/* Step Body Container */}
        <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px", marginBottom: "16px" }}>

          {/* Vernacular Voice Guidance Bar - Present in every step */}
          <StepVoiceGuidanceBar
            stepNumber={step}
            totalSteps={totalSteps}
            stepTitle={stepTitles[step]}
            guidanceMap={STEP_VOICE_GUIDANCE}
            isSpeaking={isSpeaking}
            onPlay={handleStepVoice}
            onStop={stopSpeaking}
          />

          {/* STEP 1: FARM LOCATION */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "rgba(0, 105, 72, 0.05)", border: "1px solid rgba(0, 105, 72, 0.15)", borderRadius: "8px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#006948", textTransform: "uppercase" }}>
                    📍 {t("Detect GPS Location", "Detect GPS Location")}
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={detectingGps}
                    style={{ background: "#006948", border: "none", color: "#ffffff", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    {detectingGps ? <Loader2 size={14} className="spin" /> : <Compass size={14} />}
                    {detectingGps ? t("Detecting...", "Detecting...") : t("Detect Device Location", "Detect Device Location")}
                  </button>
                </div>
                {accuracyMsg && (
                  <div style={{ fontSize: "12px", color: "var(--fk-text-sub)", marginTop: "4px" }}>
                    📍 {accuracyMsg}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {t("Farmer Full Name", "Farmer Full Name")}
                </label>
                <input
                  type="text"
                  placeholder={t("Enter your name", "Enter your name")}
                  value={farmerName}
                  onChange={e => setFarmerName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border)", fontSize: "15px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {t("Farm Location (Village / Mandal, District, State, India)", "Farm Location (Village / Mandal, District, State, India)")}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px", border: "1px solid var(--fk-border)", borderRadius: "6px", background: "var(--fk-card)" }}>
                  <MapPin size={18} color="#006948" />
                  <input
                    type="text"
                    placeholder={t("e.g. Warangal, Telangana, India", "e.g. Warangal, Telangana, India")}
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                    style={{ width: "100%", border: "none", outline: "none", fontSize: "15px", background: "transparent", color: "var(--fk-text)" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LAND & FARM TYPE */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {t("Total Land Size", "Total Land Size")}
                </label>
                <select
                  value={landPreset}
                  onChange={e => setLandPreset(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border)", fontSize: "15px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                >
                  {LAND_SIZE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{t(opt, opt)}</option>
                  ))}
                </select>
              </div>

              {landPreset === "Custom Size" && (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", display: "block", marginBottom: "4px" }}>
                      {t("Exact Size Number", "Exact Size Number")}
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={customLandSize}
                      onChange={e => setCustomLandSize(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border)", fontSize: "15px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", display: "block", marginBottom: "4px" }}>
                      {t("Land Unit", "Land Unit")}
                    </label>
                    <select
                      value={landUnit}
                      onChange={e => setLandUnit(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border)", fontSize: "15px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                    >
                      <option value="Acres">{t("Acres", "Acres")}</option>
                      <option value="Hectares">{t("Hectares", "Hectares")}</option>
                      <option value="Cents">{t("Cents", "Cents")}</option>
                      <option value="Guntas">{t("Guntas", "Guntas")}</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {t("Farm Holding Type", "Farm Holding Type")}
                </label>
                <select
                  value={farmType}
                  onChange={e => setFarmType(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border)", fontSize: "15px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                >
                  {FARM_TYPES.map(ft => (
                    <option key={ft} value={ft}>{t(ft, ft)}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: WATER & IRRIGATION AVAILABILITY (Moved from step 4) */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase" }}>
                {t("Select All Irrigation & Water Sources", "Select All Irrigation & Water Sources")}
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                {IRRIGATION_SOURCES.map(src => {
                  const isSelected = irrigation.includes(src.id);
                  return (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => toggleIrrigation(src.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border)",
                        background: isSelected ? "rgba(0, 105, 72, 0.12)" : "var(--fk-card)",
                        color: "var(--fk-text)",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <span style={{ fontSize: "19px" }}>{src.icon}</span>
                      <span style={{ fontSize: "14px", fontWeight: "600", flex: 1 }}>{t(src.label, src.label)}</span>
                      {isSelected && <Check size={16} color="#006948" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: SOIL TYPE IDENTIFICATION (Moved from step 5) */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase" }}>
                  {t("Select Soil Type", "Select Soil Type")}
                </label>
                <button
                  type="button"
                  className="lg-text-btn"
                  style={{ fontSize: "13px", color: "#006948", fontWeight: "700", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  onClick={() => setShowSoilHelp(!showSoilHelp)}
                >
                  <HelpCircle size={14} /> {t("Help me identify my soil", "Help me identify my soil")}
                </button>
              </div>

              {showSoilHelp && (
                <div style={{ background: "rgba(0, 105, 72, 0.08)", border: "1px solid rgba(0, 105, 72, 0.25)", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "var(--fk-text)" }}>
                  💡 <strong>{t("Soil Identification Quick Guide", "Soil Identification Quick Guide")}:</strong>
                  <ul style={{ paddingLeft: "16px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <li><strong>{t("Black Soil (Regur)", "Black Soil (Regur)")}:</strong> {t("Sticky when wet, high cotton/soybean suitability.", "Sticky when wet, high cotton/soybean suitability.")}</li>
                    <li><strong>{t("Red Soil", "Red Soil")}:</strong> {t("Porous, reddish color, ideal for groundnut and pulses.", "Porous, reddish color, ideal for groundnut and pulses.")}</li>
                    <li><strong>{t("Alluvial Soil", "Alluvial Soil")}:</strong> {t("Found in river basins, fertile silt for paddy, wheat, sugarcane.", "Found in river basins, fertile silt for paddy, wheat, sugarcane.")}</li>
                    <li><strong>{t("Sandy Soil / Desert Soil", "Sandy Soil / Desert Soil")}:</strong> {t("Fast draining loose soil.", "Fast draining loose soil.")}</li>
                  </ul>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {SOIL_TYPES.map(soil => {
                  const isSelected = soilType === soil.id;
                  return (
                    <button
                      key={soil.id}
                      type="button"
                      onClick={() => setSoilType(soil.id)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border)",
                        background: isSelected ? "rgba(0, 105, 72, 0.12)" : "var(--fk-card)",
                        color: "var(--fk-text)",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "15px" }}>{t(soil.label, soil.label)}</strong>
                        {isSelected && <Check size={16} color="#006948" />}
                      </div>
                      <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>{t(soil.desc, soil.desc)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: FARMING SEASON & CLIMATE (Moved from step 6) */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block" }}>
                {t("Current Farming Season", "Current Farming Season")}
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                {FARMING_SEASONS.map(s => {
                  const isSelected = season === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeason(s.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px",
                        borderRadius: "8px",
                        border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border)",
                        background: isSelected ? "rgba(0, 105, 72, 0.12)" : "var(--fk-card)",
                        color: "var(--fk-text)",
                        cursor: "pointer"
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>{s.icon}</span>
                      <span style={{ fontSize: "14px", fontWeight: "600", flex: 1, textAlign: "left" }}>{t(s.label, s.label)}</span>
                      {isSelected && <Check size={16} color="#006948" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: FARM GOALS & METHOD (Moved from step 7) */}
          {step === 6 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  {t("What do you want help with? (Select Goals)", "What do you want help with? (Select Goals)")}
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "8px" }}>
                  {FARM_GOALS.map(g => {
                    const isSelected = goals.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoal(g.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border)",
                          background: isSelected ? "rgba(0, 105, 72, 0.12)" : "var(--fk-card)",
                          color: "var(--fk-text)",
                          cursor: "pointer",
                          textAlign: "left"
                        }}
                      >
                        <span>{g.icon}</span>
                        <span style={{ fontSize: "13px", fontWeight: "600", flex: 1 }}>{t(g.label, g.label)}</span>
                        {isSelected && <Check size={14} color="#006948" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {t("Primary Farming Method", "Primary Farming Method")}
                </label>
                <select
                  value={farmingMethod}
                  onChange={e => setFarmingMethod(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border)", fontSize: "15px", background: "var(--fk-card)", color: "var(--fk-text)" }}
                >
                  <option value="Conventional">{t("Conventional Farming", "Conventional Farming")}</option>
                  <option value="Organic">{t("Organic Farming", "Organic Farming")}</option>
                  <option value="Natural Farming">{t("Zero Budget Natural Farming", "Zero Budget Natural Farming")}</option>
                  <option value="Integrated Farming">{t("Integrated Farming System", "Integrated Farming System")}</option>
                  <option value="Precision Farming">{t("Precision Farming", "Precision Farming")}</option>
                  <option value="Mixed">{t("Mixed / Traditional", "Mixed / Traditional")}</option>
                </select>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "700", color: "var(--fk-text)" }}>
                  <input
                    type="checkbox"
                    checked={hasLivestock}
                    onChange={e => setHasLivestock(e.target.checked)}
                  />
                  <span>{t("Do you also keep livestock on your farm?", "Do you also keep livestock on your farm?")}</span>
                </label>

                {hasLivestock && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                    {["Cattle", "Buffalo", "Goat", "Sheep", "Poultry", "Fish"].map(animal => {
                      const isSelected = livestockTypes.includes(animal);
                      return (
                        <button
                          key={animal}
                          type="button"
                          onClick={() => toggleLivestock(animal)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "16px",
                            border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border)",
                            background: isSelected ? "rgba(0, 105, 72, 0.12)" : "var(--fk-card)",
                            color: isSelected ? "#006948" : "var(--fk-text-sub)",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          {isSelected ? `✓ ${t(animal, animal)}` : t(animal, animal)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW FARM SUMMARY (Moved from step 8) */}
          {step === 7 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{
                background: "var(--fk-card)",
                border: "1px solid var(--fk-border)",
                borderRadius: "8px",
                padding: "16px"
              }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sprout size={18} color="#006948" /> {t("Farm Profile Summary", "Farm Profile Summary")}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px", color: "var(--fk-text)" }}>
                  <div>📍 <strong>{t("Location", "Location")}:</strong> {locationInput}</div>
                  <div>📐 <strong>{t("Land Size", "Land Size")}:</strong> {numericLandSizeAcres()} {t("Acres", "Acres")} ({t(landPreset, landPreset)})</div>
                  <div>🌾 <strong>{t("Farm Type", "Farm Type")}:</strong> {t(farmType, farmType)}</div>
                  <div>💧 <strong>{t("Irrigation", "Irrigation")}:</strong> {irrigation.map(i => {
                    const src = IRRIGATION_SOURCES.find(s => s.id === i);
                    const label = src ? src.label : i;
                    return t(label, label);
                  }).join(", ") || t("Rainfed", "Rainfed")}</div>
                  <div>🌍 <strong>{t("Soil Type", "Soil Type")}:</strong> {(() => {
                    const s = SOIL_TYPES.find(item => item.id === soilType);
                    const label = s ? s.label : soilType;
                    return t(label, label);
                  })()}</div>
                  <div>📅 <strong>{t("Season", "Season")}:</strong> {(() => {
                    const sea = FARMING_SEASONS.find(item => item.id === season);
                    const label = sea ? sea.label : season;
                    return t(label, label);
                  })()}</div>
                  <div>🌿 <strong>{t("Method", "Method")}:</strong> {t(farmingMethod, farmingMethod)}</div>
                  <div>🎯 <strong>{t("Goals", "Goals")}:</strong> {goals.length} {t("Selected", "Selected")}</div>
                </div>

                <div style={{ marginTop: "16px", padding: "12px", background: "rgba(0, 105, 72, 0.06)", borderRadius: "8px", border: "1px solid rgba(0, 105, 72, 0.2)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#006948", fontWeight: "600" }}>
                  <Sparkles size={16} />
                  <span>{t("All your farm factors are ready! In the next step, AI will recommend the top suited crops for your farm.", "All your farm factors are ready! In the next step, AI will recommend the top suited crops for your farm.")}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: CROP SELECTION - BOTH AI SUGGESTED & MANUAL OPTIONS */}
          {step === 8 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Top Choice Header & Dual-Option Cards */}
              <div style={{
                background: "var(--fk-card)",
                border: "1px solid var(--fk-border)",
                borderRadius: "10px",
                padding: "16px"
              }}>
                <div style={{ marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🌾</span> {t("Crop Selection", "Crop Selection")} - {t("Choose Either Option or Both", "Choose Either Option or Both")}
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--fk-text-sub)" }}>
                    {t("Select AI suggested crops tailored to your farm inputs, or choose manually from 50+ Indian crops.", "Select AI suggested crops tailored to your farm inputs, or choose manually from 50+ Indian crops.")}
                  </p>
                </div>

                {/* 2 Main Choice Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                  {/* Option 1 Card */}
                  <div
                    onClick={() => setCropSelectionTab("ai")}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: (cropSelectionTab === "ai" || cropSelectionTab === "both")
                        ? "2px solid #006948"
                        : "1.5px solid var(--fk-border)",
                      background: cropSelectionTab === "ai"
                        ? "rgba(0, 105, 72, 0.08)"
                        : "var(--fk-card)",
                      boxShadow: cropSelectionTab === "ai" ? "0 4px 12px rgba(0, 105, 72, 0.12)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "22px" }}>🤖</span>
                        <strong style={{ fontSize: "14px", color: "#006948" }}>
                          {t("Option 1: AI Suggested Crops", "Option 1: AI Suggested Crops")}
                        </strong>
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: "800", background: "#006948", color: "#fff", padding: "2px 8px", borderRadius: "10px" }}>
                        {t("RECOMMENDED", "RECOMMENDED")}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--fk-text-sub)", lineHeight: "1.4" }}>
                      {t("Smart crops suggested based on your location, soil type, irrigation, and season.", "Smart crops suggested based on your location, soil type, irrigation, and season.")}
                    </p>
                  </div>

                  {/* Option 2 Card */}
                  <div
                    onClick={() => setCropSelectionTab("manual")}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: (cropSelectionTab === "manual" || cropSelectionTab === "both")
                        ? "2px solid #2874f0"
                        : "1.5px solid var(--fk-border)",
                      background: cropSelectionTab === "manual"
                        ? "rgba(40, 116, 240, 0.08)"
                        : "var(--fk-card)",
                      boxShadow: cropSelectionTab === "manual" ? "0 4px 12px rgba(40, 116, 240, 0.12)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "22px" }}>🌾</span>
                        <strong style={{ fontSize: "14px", color: "#2874f0" }}>
                          {t("Option 2: Select Crop Manually", "Option 2: Select Crop Manually")}
                        </strong>
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: "800", background: "#2874f0", color: "#fff", padding: "2px 8px", borderRadius: "10px" }}>
                        {t("50+ CROPS", "50+ CROPS")}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--fk-text-sub)", lineHeight: "1.4" }}>
                      {t("Search, filter, and pick any crop manually from Cereals, Pulses, Vegetables, Fruits, Cash Crops.", "Search, filter, and pick any crop manually from Cereals, Pulses, Vegetables, Fruits, Cash Crops.")}
                    </p>
                  </div>
                </div>

                {/* Tab Switcher Pills */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "14px" }}>
                  <button
                    type="button"
                    onClick={() => setCropSelectionTab("ai")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: cropSelectionTab === "ai" ? "#006948" : "transparent",
                      color: cropSelectionTab === "ai" ? "#ffffff" : "var(--fk-text)",
                      border: "1px solid " + (cropSelectionTab === "ai" ? "#006948" : "var(--fk-border)")
                    }}
                  >
                    🤖 {t("Option 1: AI Suggestions", "Option 1: AI Suggestions")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropSelectionTab("manual")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: cropSelectionTab === "manual" ? "#2874f0" : "transparent",
                      color: cropSelectionTab === "manual" ? "#ffffff" : "var(--fk-text)",
                      border: "1px solid " + (cropSelectionTab === "manual" ? "#2874f0" : "var(--fk-border)")
                    }}
                  >
                    🌾 {t("Option 2: Manual Selection", "Option 2: Manual Selection")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropSelectionTab("both")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      background: cropSelectionTab === "both" ? "#ff9f00" : "transparent",
                      color: cropSelectionTab === "both" ? "#1f2937" : "var(--fk-text)",
                      border: "1px solid " + (cropSelectionTab === "both" ? "#ff9f00" : "var(--fk-border)")
                    }}
                  >
                    ✨ {t("Show Both Options", "Show Both Options")}
                  </button>
                </div>
              </div>

              {/* SECTION 1: AI SUGGESTED CROPS (if tab is "ai" or "both") */}
              {(cropSelectionTab === "ai" || cropSelectionTab === "both") && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(0, 105, 72, 0.08) 0%, rgba(40, 116, 240, 0.06) 100%)",
                  border: "1.5px solid rgba(0, 105, 72, 0.25)",
                  borderRadius: "10px",
                  padding: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#006948", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                        <Sparkles size={16} /> {t("AI Recommended Crops for Your Farm", "AI Recommended Crops for Your Farm")}
                      </h4>
                      <div style={{ fontSize: "12px", color: "var(--fk-text)", marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        <span style={{ background: "rgba(0, 105, 72, 0.1)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                          📍 {locationInput}
                        </span>
                        <span style={{ background: "rgba(0, 105, 72, 0.1)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                          🌍 {(() => {
                            const s = SOIL_TYPES.find(item => item.id === soilType);
                            const label = s ? s.label : soilType;
                            return t(label, label);
                          })()}
                        </span>
                        <span style={{ background: "rgba(0, 105, 72, 0.1)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                          💧 {irrigation.map(i => {
                            const src = IRRIGATION_SOURCES.find(s => s.id === i);
                            const label = src ? src.label : i;
                            return t(label, label);
                          }).join(", ") || t("Rainfed", "Rainfed")}
                        </span>
                        <span style={{ background: "rgba(0, 105, 72, 0.1)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                          📅 {(() => {
                            const sea = FARMING_SEASONS.find(item => item.id === season);
                            const label = sea ? sea.label : season;
                            return t(label, label);
                          })()}
                        </span>
                        <span style={{ background: "rgba(0, 105, 72, 0.1)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                          📐 {numericLandSizeAcres()} {t("Acres", "Acres")}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "800", background: "#006948", color: "#ffffff", padding: "3px 10px", borderRadius: "12px" }}>
                      AI AGRO-ENGINE
                    </span>
                  </div>

                  {/* Recommended Crop Cards Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
                    {recommendedCrops.map(rec => {
                      const isSelected = crops.some(c => c.name === rec.name || c.id === rec.id);
                      return (
                        <div
                          key={rec.id}
                          style={{
                            background: isSelected ? "rgba(0, 105, 72, 0.12)" : "var(--fk-card)",
                            border: isSelected ? "2px solid #006948" : "1px solid var(--fk-border)",
                            borderRadius: "8px",
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "8px",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "24px" }}>{rec.icon}</span>
                                <div>
                                  <strong style={{ fontSize: "14.5px", color: "var(--fk-text)" }}>{t(rec.name, rec.name)}</strong>
                                  <div style={{ fontSize: "11.5px", color: "var(--fk-text-sub)" }}>{t(rec.yieldAcre, rec.yieldAcre)}</div>
                                </div>
                              </div>
                              <span style={{
                                fontSize: "11px",
                                fontWeight: "800",
                                background: rec.matchPercent >= 90 ? "#ecfdf5" : "#eff6ff",
                                color: rec.matchPercent >= 90 ? "#047857" : "#1d4ed8",
                                border: rec.matchPercent >= 90 ? "1px solid #10b981" : "1px solid #3b82f6",
                                padding: "2px 6px",
                                borderRadius: "10px"
                              }}>
                                {rec.matchPercent}% {t("Match", "Match")}
                              </span>
                            </div>

                            <p style={{ fontSize: "12px", color: "var(--fk-text-sub)", marginTop: "8px", marginBottom: "6px", lineHeight: "1.35" }}>
                              {t(rec.why, rec.why)}
                            </p>
                            <div style={{ fontSize: "12px", color: "#006948", fontWeight: "700" }}>
                              💰 {t("Est. Net Profit", "Est. Net Profit")}: ₹{rec.netProfit.toLocaleString()} ({numericLandSizeAcres()} {t("Acres", "Acres")})
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectRecommendedCrop(rec)}
                            style={{
                              width: "100%",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              border: isSelected ? "1px solid #006948" : "1px solid #d1d5db",
                              background: isSelected ? "#006948" : "#ffffff",
                              color: isSelected ? "#ffffff" : "#1f2937",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {isSelected ? <Check size={14} /> : null}
                            {isSelected ? t("Selected", "Selected") : `+ ${t("Select This Crop", "Select This Crop")}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: MANUAL CROP SELECTION (if tab is "manual" or "both") */}
              {(cropSelectionTab === "manual" || cropSelectionTab === "both") && (
                <div style={{
                  background: "var(--fk-card)",
                  border: "1.5px solid rgba(40, 116, 240, 0.25)",
                  borderRadius: "10px",
                  padding: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#2874f0", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                        <Search size={16} /> {t("Option 2: Select Crop Manually", "Option 2: Select Crop Manually")}
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--fk-text-sub)" }}>
                        {t("Search, filter, and pick any crop manually from Cereals, Pulses, Vegetables, Fruits, Cash Crops.", "Search, filter, and pick any crop manually from Cereals, Pulses, Vegetables, Fruits, Cash Crops.")}
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "800", background: "#2874f0", color: "#ffffff", padding: "3px 10px", borderRadius: "12px" }}>
                      {t("50+ CROPS", "50+ CROPS")}
                    </span>
                  </div>

                  <SearchableCropSelector
                    selectedCrops={crops}
                    onChange={setCrops}
                    totalFarmArea={numericLandSizeAcres()}
                    landUnit={landUnit}
                  />
                </div>
              )}

              {/* SELECTED CROPS TRAY (Always Visible at bottom of Step 8) */}
              <div style={{
                background: "var(--fk-card)",
                border: "1px solid var(--fk-border)",
                borderRadius: "10px",
                padding: "14px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "#006948", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🌾</span> {t("Selected Crops for Your Farm", "Selected Crops for Your Farm")} ({crops.length})
                  </span>
                  {crops.length > 0 && (
                    <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "600" }}>
                      {t("Total Farm Area", "Total Farm Area")}: {numericLandSizeAcres()} {t("Acres", "Acres")}
                    </span>
                  )}
                </div>

                {crops.length === 0 ? (
                  <div style={{
                    padding: "12px",
                    background: "#fef3c7",
                    border: "1px solid #f59e0b",
                    borderRadius: "8px",
                    color: "#92400e",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span>⚠️</span>
                    <span>{t("Please select at least one crop from AI recommendations or manual selection to finish.", "Please select at least one crop from AI recommendations or manual selection to finish.")}</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {crops.map(c => (
                      <span key={c.name} style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        background: c.isPrimary ? "rgba(0, 105, 72, 0.15)" : "rgba(0,0,0,0.04)",
                        border: c.isPrimary ? "1.5px solid #006948" : "1px solid var(--fk-border)",
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "var(--fk-text)"
                      }}>
                        <span style={{ fontSize: "16px" }}>{c.icon}</span>
                        <span>{t(c.name, c.name)}</span>
                        {c.area ? <span style={{ fontSize: "11px", color: "var(--fk-text-sub)" }}>({c.area} {t("Acres", "Acres")})</span> : null}
                        {c.isPrimary && <span style={{ fontSize: "10px", fontWeight: "800", color: "#006948" }}>({t("PRIMARY", "PRIMARY")})</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer with Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--fk-border)" }}>
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={step === 1 || saving}
            style={{
              padding: "10px 18px",
              borderRadius: "6px",
              border: "1px solid var(--fk-border)",
              background: "var(--fk-card)",
              color: step === 1 ? "var(--fk-text-sub)" : "var(--fk-text)",
              cursor: step === 1 ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: step === 1 ? 0.5 : 1
            }}
          >
            <ArrowLeft size={16} /> {t("Back", "Back")}
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNextStep}
              style={{
                padding: "10px 22px",
                borderRadius: "6px",
                border: "none",
                background: "#006948",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(0, 105, 72, 0.3)"
              }}
            >
              {t("Continue", "Continue")} <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSave}
              disabled={saving || crops.length === 0}
              style={{
                padding: "10px 24px",
                borderRadius: "6px",
                border: "none",
                background: crops.length === 0 ? "#9ca3af" : "#006948",
                color: "#ffffff",
                cursor: crops.length === 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 10px rgba(0, 105, 72, 0.35)"
              }}
            >
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              {saving ? t("Saving Profile...", "Saving Profile...") : t("Save & Complete Farm Profile", "Save & Complete Farm Profile")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
