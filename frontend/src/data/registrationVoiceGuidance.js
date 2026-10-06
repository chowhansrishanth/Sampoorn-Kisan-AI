/**
 * Comprehensive Multi-Language Voice Guidance for Registration Steps (1 to 9)
 * Supports 9 Indian Languages:
 * EN (English), HI (Hindi), TE (Telugu), TA (Tamil), KN (Kannada),
 * MR (Marathi), PA (Punjabi), BN (Bengali), GU (Gujarati)
 *
 * Each step provides:
 * - native: Native Unicode Indic script for devices with native Indic TTS engines
 * - phonetic: Romanized Indic pronunciation for fallback TTS engines (e.g. Indian English voices on Windows/Linux)
 */

export const REGISTRATION_VOICE_GUIDANCE = {
  // Step 1: Account Setup (Name, Mobile, Email, Password)
  1: {
    EN: {
      native: "Step 1 of 9: Account Setup. Enter your full name, 10-digit mobile number, optional email address, and choose a secure password with at least 8 characters. Then click Continue.",
      phonetic: "Step 1 of 9: Account Setup. Enter your full name, 10-digit mobile number, optional email address, and choose a secure password with at least 8 characters. Then click Continue."
    },
    HI: {
      native: "चरण 1: खाता बनाएं। कृपया अपना पूरा नाम, 10 अंकों का मोबाइल नंबर, ईमेल और कम से कम 8 अक्षरों का पासवर्ड दर्ज करें। इसके बाद आगे बढ़ें पर क्लिक करें।",
      phonetic: "Charan 1: Khaata banayein. Kripya apna poora naam, 10 ankon ka mobile number, email aur kam se kam 8 aksharon ka password darj karein. Iske baad Aage Badhein par click karein."
    },
    TE: {
      native: "దశ 1: ఖాతా సృష్టి. దయచేసి మీ పూర్తి పేరు, 10 అంకెల మొబైల్ నంబర్, ఇమెయిల్ మరియు కనీసం 8 అక్షరాల పాస్‌వర్డ్ నమోదు చేసి కొనసాగించండి క్లిక్ చేయండి.",
      phonetic: "Dasha 1: Khaatha srushti. Dayachesi mee poorthi peru, 10 ankela mobile number, email mariyu kaneesam 8 aksharala password enter chesi continue click cheyandi."
    },
    TA: {
      native: "படி 1: கணக்கு உருவாக்கம். உங்கள் முழு பெயர், 10 இலக்க கைபேசி எண், மின்னஞ்சல் மற்றும் குறைந்தது 8 எழுத்துக்கள் கொண்ட கடவுச்சொல்லை உள்ளிட்டு தொடரவும்.",
      phonetic: "Padi 1: Kanakku uruvaakkam. Ungal muzhu peyar, 10 ilakka mobile number, email matrum kuraivadhu 8 ezhuthukkal konda password ullaadhavum, pinbu thodara continue seiyavum."
    },
    KN: {
      native: "ಹಂತ 1: ಖಾತೆ ರಚನೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು, 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ, ಇಮೇಲ್ ಮತ್ತು ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ ಮುಂದುವರಿಯಿರಿ.",
      phonetic: "Hanta 1: Khaathe rachane. Dayavittu nimma poorna hesaru, 10 ankegala mobile sankhye, email matthu kanishta 8 aksharagala password enter maadi munduvariyiri."
    },
    MR: {
      native: "पायरी 1: खाते तयार करा. कृपया आपले पूर्ण नाव, 10 अंकी मोबाईल नंबर, ईमेल आणि किमान 8 अक्षरांचा पासवर्ड प्रविष्ट करा आणि पुढे जा वर क्लिक करा.",
      phonetic: "Paayri 1: Khaate tayaar kara. Krupaya aple poorna naav, 10 anki mobile number, email aani kimaan 8 aksharaancha password enter kara aani pudhe jaa var click kara."
    },
    PA: {
      native: "ਕਦਮ 1: ਖਾਤਾ ਬਣਾਓ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪੂਰਾ ਨਾਮ, 10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ, ਈਮੇਲ ਅਤੇ ਘੱਟੋ-ਘੱਟ 8 ਅੱਖਰਾਂ ਦਾ ਪਾਸਵਰਡ ਦਰਜ ਕਰਕੇ ਅੱਗੇ ਵਧੋ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।",
      phonetic: "Kadam 1: Khaata banaao. Kirpa karke apna poora naam, 10 ankaan da mobile number, email atey ghatto ghatt 8 akkharan da password darj karke agge vadho te click karo."
    },
    BN: {
      native: "ধাপ ১: অ্যাকাউন্ট তৈরি। অনুগ্রহ করে আপনার সম্পূর্ণ নাম, ১০ ডিজিটের মোবাইল নম্বর, ইমেল এবং কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড লিখুন এবং এগিয়ে যান-এ ক্লিক করুন।",
      phonetic: "Dhaap 1: Account toiri. Onugroho kore aponar shompoorno naam, 10 digit mobile number, email ebong kompokkhe 8 okkhorer password likhun ebong egiye jaan-e click korun."
    },
    GU: {
      native: "પગલું 1: ખાતું બનાવો. કૃપા કરીને તમારું પૂરું નામ, 10 અંકનો મોબાઇલ નંબર, ઇમેઇલ અને ઓછામાં ઓછા 8 અક્ષરોનો પાસવર્ડ દાખલ કરો અને આગળ વધો પર ક્લિક કરો.",
      phonetic: "Paglu 1: Khaatu banaavo. Krupya tamaaru pooru naam, 10 aankadaano mobile number, email ane ochhaamaa ochhaa 8 aksharoni password daakhal karo ane aagal vadho par click karo."
    }
  },

  // Step 2: Farm Location & Name (Farm Step 1)
  2: {
    EN: {
      native: "Step 2 of 9: Farm Profile and Location. Enter your farmer name and farm location, or click Detect Device Location to find your farm automatically using GPS.",
      phonetic: "Step 2 of 9: Farm Profile and Location. Enter your farmer name and farm location, or click Detect Device Location to find your farm automatically using GPS."
    },
    HI: {
      native: "चरण 2: खेत प्रोफाइल और स्थान। किसान का नाम और अपने खेत का स्थान दर्ज करें, या जीपीएस से अपने खेत का पता लगाने के लिए बटन दबाएं।",
      phonetic: "Charan 2: Khet profile aur sthan. Kisaan ka naam aur apne khet ka sthan darj karein, ya GPS se khet pata karne ke liye button dabayein."
    },
    TE: {
      native: "దశ 2: వ్యవసాయ ప్రొఫైల్ మరియు స్థలం. రైతు పేరు మరియు వ్యవసాయ స్థలాన్ని నమోదు చేయండి, లేదా జీపీఎస్ ద్వారా లొకేషన్ గుర్తించండి.",
      phonetic: "Dasha 2: Vyavasaaya profile mariyu sthalam. Raithu peru mariyu vyavasaaya sthalaanni namodu cheyandi, leda GPS dwaara location gurtinchandi."
    },
    TA: {
      native: "படி 2: பண்ணை சுயவிவரம் மற்றும் இருப்பிடம். விவசாயி பெயர் மற்றும் பண்ணை இருப்பிடத்தை உள்ளிடவும், அல்லது ஜிபிஎஸ் இருப்பிடத்தைக் கண்டறியவும்.",
      phonetic: "Padi 2: Pannai suyavivaram matrum iruppidam. Vivasaayi peyar matrum pannai iruppidathai ullaadhavum, alladhu GPS iruppidathai kandariyavum."
    },
    KN: {
      native: "ಹಂತ 2: ಕೃಷಿ ವಿವರ ಮತ್ತು ಸ್ಥಳ. ರೈತರ ಹೆಸರು ಮತ್ತು ಜಮೀನಿನ ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ, ಅಥವಾ ಜಿಪಿಎಸ್ ಮೂಲಕ ಸ್ಥಳವನ್ನು ಪತ್ತೆಹಚ್ಚಿ.",
      phonetic: "Hanta 2: Krushi vivara matthu sthala. Raithara hesaru matthu jameenina sthalavannu namoodisi, athava GPS moolaka sthalavannu pattehacchi."
    },
    MR: {
      native: "पायरी 2: शेत प्रोफाइल आणि ठिकाण. शेतकऱ्याचे नाव आणि शेताचे ठिकाण प्रविष्ट करा, किंवा जीपीएस स्थान शोधा.",
      phonetic: "Paayri 2: Shet profile aani thikaan. Shetkaryaache naav aani shetaache thikaan pravishtha kara, kiva GPS sthaan shodha."
    },
    PA: {
      native: "ਕਦਮ 2: ਖੇਤ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਸਥਿਤੀ। ਕਿਸਾਨ ਦਾ ਨਾਮ ਅਤੇ ਖੇਤ ਦੀ ਸਥਿਤੀ ਦਰਜ ਕਰੋ, ਜਾਂ ਜੀਪੀਐਸ ਲੱਭੋ ਬਟਨ ਦਬਾਓ।",
      phonetic: "Kadam 2: Khet profile atey sthiti. Kisaan da naam atey khet di sthiti darj karo, ya GPS labho button dabaao."
    },
    BN: {
      native: "ধাপ ২: খামার প্রোফাইল এবং অবস্থান। কৃষকের নাম এবং খামারের অবস্থান লিখুন, অথবা জিপিএস অবস্থান সনাক্ত করুন।",
      phonetic: "Dhaap 2: Khamar profile ebong obosthan. Krishoker naam ebong khamarer obosthan likhun, othoba GPS obosthan shonakto korun."
    },
    GU: {
      native: "પગલું 2: ખેતર પ્રોફાઇલ અને સ્થાન. ખેડૂતનું નામ અને ખેતરનું સ્થાન દાખલ કરો, અથવા જીપીએસ સ્થાન શોધો.",
      phonetic: "Paglu 2: Khetar profile ane sthaan. Khedutnu naam ane khetarnu sthaan daakhal karo, athva GPS sthaan shodho."
    }
  },

  // Step 3: Land Size & Farm Type (Farm Step 2)
  3: {
    EN: {
      native: "Step 3 of 9: Land Size and Holding Type. Select your total land size in acres and choose whether your holding is marginal, small, medium, or large commercial.",
      phonetic: "Step 3 of 9: Land Size and Holding Type. Select your total land size in acres and choose whether your holding is marginal, small, medium, or large commercial."
    },
    HI: {
      native: "चरण 3: खेत का आकार और जोत का प्रकार। एकड़ में अपने कुल खेत का आकार चुनें और अपनी जोत का प्रकार चुनें।",
      phonetic: "Charan 3: Khet ka aakaar aur jot ka prakaar. Acre mein apne kul khet ka aakaar chunein aur apni holding ka prakaar chunein."
    },
    TE: {
      native: "దశ 3: భూమి పరిమాణం మరియు రకం. ఎకరాలలో మీ మొత్తం భూమి పరిమాణాన్ని మరియు మీ వ్యవసాయ రకాన్ని ఎంచుకోండి.",
      phonetic: "Dasha 3: Bhoomi parimaanam mariyu rakam. Ekaralalo mee mottham bhoomi parimaananni mariyu vyavasaaya rakaanni enchukondi."
    },
    TA: {
      native: "படி 3: நில அளவு மற்றும் பண்ணை வகை. ஏக்கரில் உங்கள் மொத்த நில அளவைத் தேர்ந்தெடுத்து பண்ணை வகையைத் தேர்வுசெய்யவும்.",
      phonetic: "Padi 3: Nila alavu matrum pannai vagai. Acre-il ungal mottha nila alavai therntheduthu pannai vagaiyai therndhedukkavum."
    },
    KN: {
      native: "ಹಂತ 3: ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಪ್ರಕಾರ. ಎಕರೆಗಳಲ್ಲಿ ನಿಮ್ಮ ಒಟ್ಟು ಭೂಮಿಯ ವಿಸ್ತೀರ್ಣವನ್ನು ಮತ್ತು ಕೃಷಿ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      phonetic: "Hanta 3: Jameenina vistheerna matthu prakaara. Ekaregalalli nimma ottu bhoomiya vistheernavannu matthu krushi prakaaravannu aaykemaadi."
    },
    MR: {
      native: "पायरी 3: जमिनीचा आकार आणि प्रकार. एकरामध्ये आपल्या एकूण जमिनीचा आकार निवडा आणि शेतीचा प्रकार निवडा.",
      phonetic: "Paayri 3: Jaminicha aakaar aani prakaar. Acre madhye aaplya ekun jaminicha aakaar nivda aani sheticha prakaar nivda."
    },
    PA: {
      native: "ਕਦਮ 3: ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ ਅਤੇ ਕਿਸਮ। ਏਕੜ ਵਿੱਚ ਆਪਣੀ ਕੁੱਲ ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ ਚੁਣੋ ਅਤੇ ਆਪਣੇ ਖੇਤ ਦੀ ਕਿਸਮ ਚੁਣੋ।",
      phonetic: "Kadam 3: Zameen da aakaar atey kism. Acre vich apni kull zameen da aakaar chuno atey apne khet di kism chuno."
    },
    BN: {
      native: "ধাপ ৩: জমির পরিমাণ এবং ধরন। একরে আপনার মোট জমির পরিমাণ এবং খামারের ধরন নির্বাচন করুন।",
      phonetic: "Dhaap 3: Jomir porimaan ebong dhoron. Acre-e aponar mot jomir porimaan ebong khamarer dhoron nirbaachon korun."
    },
    GU: {
      native: "પગલું 3: ખેતરનું કદ અને પ્રકાર. એકરમાં તમારા કુલ ખેતરનું કદ પસંદ કરો અને ખેતીનો પ્રકાર પસંદ કરો.",
      phonetic: "Paglu 3: Khetarnu kad ane prakaar. Acre ma tamara kul khetarnu kad pasand karo ane khetino prakaar pasand karo."
    }
  },

  // Step 4: Water & Irrigation Sources (Farm Step 3)
  4: {
    EN: {
      native: "Step 4 of 9: Water and Irrigation Sources. Select all your water sources, such as borewell, canal, open well, drip irrigation, sprinkler, or rainfed.",
      phonetic: "Step 4 of 9: Water and Irrigation Sources. Select all your water sources, such as borewell, canal, open well, drip irrigation, sprinkler, or rainfed."
    },
    HI: {
      native: "चरण 4: पानी और सिंचाई के स्रोत। अपने पानी के सभी स्रोत चुनें, जैसे बोरवेल, नहर, कुआं, ड्रिप, स्प्रिंकलर या वर्षा आधारित।",
      phonetic: "Charan 4: Paani aur sinchaai ke srot. Apne paani ke sabhi srot chunein, jaise borewell, nahar, kuan, drip, sprinkler ya barish aadharit."
    },
    TE: {
      native: "దశ 4: సాగునీటి వనరులు. బోర్వెల్, కాలువ, బావి, డ్రిప్ లేదా వర్షాధారితం వంటి మీ నీటి మరియు సాగునీటి వనరులను ఎంచుకోండి.",
      phonetic: "Dasha 4: Saaguneeti vanarulu. Borewell, kaaluva, baavi, drip leda varshaadharitham vanti mee neeti vanarulanu enchukondi."
    },
    TA: {
      native: "படி 4: நீர் மற்றும் பாசன ஆதாரங்கள். ஆழ்துளை கிணறு, கால்வாய், கிணறு, சொட்டுநீர் அல்லது மழையளவை அடிப்படையாகக் கொண்ட நீர் ஆதாரங்களைத் தேர்ந்தெடுக்கவும்.",
      phonetic: "Padi 4: Neer matrum paasana aadharangal. Borewell, kaalvaai, kinaru, sottuneer alladhu mazhai aadhaara neeroothukalai thernthedukkavum."
    },
    KN: {
      native: "ಹಂತ 4: ನೀರು ಮತ್ತು ನೀರಾವರಿ ಮೂಲಗಳು. ಕೊಳವೆಬಾವಿ, ಕಾಲುವೆ, ಬಾವಿ, ಹನಿ ನೀರಾವರಿ ಅಥವಾ ಮಳೆಯಾಶ್ರಿತ ನೀರಿನ ಮೂಲಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      phonetic: "Hanta 4: Neeru matthu neeravari moolagalu. Kolave baavi, kaaluve, baavi, hani neeravari athava maleyashritha neerina moolagalannu aaykemaadi."
    },
    MR: {
      native: "पायरी 4: पाणी आणि सिंचनाचे स्रोत. बोअरवेल, कालवा, विहीर, ठिबक किंवा पावसावर आधारित पाण्याचे सर्व स्रोत निवडा.",
      phonetic: "Paayri 4: Paani aani sinchanaache srot. Borewell, kaalwa, viheer, thibak kiva paavsaavar aadharit paanyache sarv srot nivda."
    },
    PA: {
      native: "ਕਦਮ 4: ਪਾਣੀ ਅਤੇ ਸਿੰਚਾਈ ਦੇ ਸਾਧਨ। ਬੋਰਵੈੱਲ, ਨਹਿਰ, ਖੂਹ, ਤੁਪਕਾ ਜਾਂ ਮੀਂਹ 'ਤੇ ਨਿਰਭਰ ਆਪਣੇ ਪਾਣੀ ਦੇ ਸਾਰੇ ਸਰੋਤ ਚੁਣੋ।",
      phonetic: "Kadam 4: Paani atey sinchaai de saadhan. Borewell, nehar, khooh, tupka ya meenh te nirbhar apne paani de saare srot chuno."
    },
    BN: {
      native: "ধাপ ৪: জল এবং সেচের উৎস। গভীর নলকূপ, খাল, কুয়ো, ড্রিপ বা বৃষ্টির জলের মতো আপনার সমস্ত সেচের উৎস নির্বাচন করুন।",
      phonetic: "Dhaap 4: Jol ebong shecher utso. Borewell, khal, kuyo, drip ba brishtir joler moto aponar shomosto shecher utso nirbaachon korun."
    },
    GU: {
      native: "પગલું 4: પાણી અને સિંચાઈના સ્ત્રોતો. બોરવેલ, નહેર, કૂવો, ટપક પદ્ધતિ અથવા વરસાદ આધારિત તમારા પાણીના સ્ત્રોતો પસંદ કરો.",
      phonetic: "Paglu 4: Paani ane sinchaaina stroto. Borewell, naher, kuvo, tapak paddhati athva varsaad aadharit tamara paaninaa stroto pasand karo."
    }
  },

  // Step 5: Soil Type (Farm Step 4)
  5: {
    EN: {
      native: "Step 5 of 9: Soil Type. Select your soil type, such as black soil, red soil, alluvial soil, clay, or sandy loam, so AI can evaluate crop compatibility.",
      phonetic: "Step 5 of 9: Soil Type. Select your soil type, such as black soil, red soil, alluvial soil, clay, or sandy loam, so AI can evaluate crop compatibility."
    },
    HI: {
      native: "चरण 5: मिट्टी का प्रकार। अपनी मिट्टी का प्रकार चुनें, जैसे काली मिट्टी, लाल मिट्टी, जलोढ़ या बलुई मिट्टी, ताकि एआई सही फसल चुन सके।",
      phonetic: "Charan 5: Mitti ka prakaar. Apni mitti ka prakaar chunein, jaise kaali mitti, laal mitti, jalaudh ya balui mitti, taaki AI sahi fasal chun sake."
    },
    TE: {
      native: "దశ 5: నేల రకం. నల్ల రేగడి, ఎర్ర నేల, ఒండ్రు నేల లేదా ఇసుక నేల వంటి మీ నేల రకాన్ని ఎంచుకోండి.",
      phonetic: "Dasha 5: Nela rakam. Nalla regadi, erra nela, ondru nela leda isuka nela vanti mee nela rakaanni enchukondi."
    },
    TA: {
      native: "படி 5: மண் வகை. கரிசல் மண், செம்மண், வண்டல் மண் அல்லது மணல் மண் போன்ற உங்கள் மண் வகையைத் தேர்ந்தெடுக்கவும்.",
      phonetic: "Padi 5: Man vagai. Karisal man, semman, vandal man alladhu manal man pondra ungal man vagaiyai thernthedukkavum."
    },
    KN: {
      native: "ಹಂತ 5: ಮಣ್ಣಿನ ಪ್ರಕಾರ. ಕಪ್ಪು ಮಣ್ಣು, ಕೆಂಪು ಮಣ್ಣು, ಮೆಕ್ಕಲು ಮಣ್ಣು ಅಥವಾ ಮರಳು ಮಣ್ಣಿನಂತಹ ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      phonetic: "Hanta 5: Mannina prakaara. Kappu mannu, kempu mannu, mekkalu mannu athava maralu mannina nimma mannina prakaaravannu aaykemaadi."
    },
    MR: {
      native: "पायरी 5: मातीचा प्रकार. काळी माती, तांबडी माती, गाळाची माती किंवा वालुकामय माती यापैकी आपला मातीचा प्रकार निवडा.",
      phonetic: "Paayri 5: Maaticha prakaar. Kaali maati, taambdi maati, gaalaachi maati kiva vaalukaamay maati yapaiki aapla maaticha prakaar nivda."
    },
    PA: {
      native: "ਕਦਮ 5: ਮਿੱਟੀ ਦੀ ਕਿਸਮ। ਕਾਲੀ ਮਿੱਟੀ, ਲਾਲ ਮਿੱਟੀ, ਜਲੋੜ ਜਾਂ ਰੇਤਲੀ ਮਿੱਟੀ ਵਰਗੀ ਆਪਣੀ ਮਿੱਟੀ ਦੀ ਕਿਸਮ ਚੁਣੋ।",
      phonetic: "Kadam 5: Mitti di kism. Kaali mitti, laal mitti, jalodh ya retli mitti vargi apni mitti di kism chuno."
    },
    BN: {
      native: "ধাপ ৫: মাটির ধরন। কালো মাটি, লাল মাটি, পলি মাটি বা বেলে মাটির মতো আপনার মাটির ধরন নির্বাচন করুন।",
      phonetic: "Dhaap 5: Maatir dhoron. Kaalo maati, laal maati, poli maati ba bele maatir moto aponar maatir dhoron nirbaachon korun."
    },
    GU: {
      native: "પગલું 5: જમીનનો પ્રકાર. કાળી માટી, રાતી માટી, કાંપવાળી અથવા રેતાળ માટી જેવા તમારા જમીનનો પ્રકાર પસંદ કરો.",
      phonetic: "Paglu 5: Jameenno prakaar. Kaali maati, raati maati, kaampvaali athva retaal maati jeva tamara jameenno prakaar pasand karo."
    }
  },

  // Step 6: Current Farming Season (Farm Step 5)
  6: {
    EN: {
      native: "Step 6 of 9: Farming Season. Select your current cropping season, such as Kharif monsoon season, Rabi winter season, or Zaid summer season.",
      phonetic: "Step 6 of 9: Farming Season. Select your current cropping season, such as Kharif monsoon season, Rabi winter season, or Zaid summer season."
    },
    HI: {
      native: "चरण 6: कृषि मौसम। अपना वर्तमान कृषि मौसम चुनें, जैसे खरीफ मानसून, रबी सर्दी, या जायद ग्रीष्मकालीन फसल।",
      phonetic: "Charan 6: Krishi mausam. Apna vartamaan krishi mausam chunein, jaise Kharif monsoon, Rabi sardi, ya Zaid garmi ki fasal."
    },
    TE: {
      native: "దశ 6: వ్యవసాయ సీజన్. ఖరీఫ్ వర్షాకాలం, రబీ శీతాకాలం, లేదా వేసవి జైద్ వంటి మీ ప్రస్తుత వ్యవసాయ సీజన్‌ను ఎంచుకోండి.",
      phonetic: "Dasha 6: Vyavasaaya season. Kharif varshaakaalam, Rabi sheethaakaalam, leda vesavi Zaid vanti mee prastutha vyavasaaya season-nu enchukondi."
    },
    TA: {
      native: "படி 6: விவசாய பருவம். காரிஃப் பருவமழை, ரபி குளிர்காலம் அல்லது சையத் கோடைகாலம் போன்ற உங்கள் தற்போதைய விவசாய பருவத்தைத் தேர்ந்தெடுக்கவும்.",
      phonetic: "Padi 6: Vivasaaya paruvam. Kharif paruvamazhai, Rabi kulirkaalam alladhu Zaid kodaikaalam pondra ungal tharpodhaiya vivasaaya paruvathai thernthedukkavum."
    },
    KN: {
      native: "ಹಂತ 6: ಕೃಷಿ ಹಂಗಾಮು. ಮುಂಗಾರು ಖಾರೀಫ್, ಚಳಿಗಾಲದ ರಬಿ, ಅಥವಾ ಬೇಸಿಗೆಯ ಝೈದ್ ಹಂಗಾಮನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      phonetic: "Hanta 6: Krushi hangaamu. Mungaaru Kharif, chaligaalada Rabi, athava besigeya Zaid hangaamannu aaykemaadi."
    },
    MR: {
      native: "पायरी 6: शेतीचा हंगाम. खरीप पावसाळा, रब्बी हिवाळा, किंवा उन्हाळी जायद यापैकी आपला शेतीचा हंगाम निवडा.",
      phonetic: "Paayri 6: Sheticha hangaam. Kharif paavsaala, Rabi hivaala, kiva unhaali Zaid yapaiki aapla sheticha hangaam nivda."
    },
    PA: {
      native: "ਕਦਮ 6: ਖੇਤੀ ਸੀਜ਼ਨ। ਖਰੀਫ ਮਾਨਸੂਨ, ਰਬੀ ਸਰਦੀਆਂ, ਜਾਂ ਜ਼ੈਦ ਗਰਮੀਆਂ ਵਰਗਾ ਆਪਣਾ ਮੌਜੂਦਾ ਖੇਤੀ ਸੀਜ਼ਨ ਚੁਣੋ।",
      phonetic: "Kadam 6: Kheti season. Kharif monsoon, Rabi sardiyaan, ya Zaid garmiyaan varga apna maujooda kheti season chuno."
    },
    BN: {
      native: "ধাপ ৬: চাষের মৌসুম। খরিফ বর্ষা, রবি শীত বা জায়েদ গ্রীষ্মের মতো আপনার বর্তমান চাষের মৌসুম নির্বাচন করুন।",
      phonetic: "Dhaap 6: Chaasher moushum. Kharif borsha, Rabi sheet ba Zaid greeshmor moto aponar bortomaan chaasher moushum nirbaachon korun."
    },
    GU: {
      native: "પગલું 6: ખેતીની મોસમ. ખરીફ ચોમાસુ, રવિ શિયાળુ અથવા ઝાયદ ઉનાળુ જેવી તમારી ખેતીની મોસમ પસંદ કરો.",
      phonetic: "Paglu 6: Khetini mosam. Kharif chomaasu, Rabi shiyaalu athva Zaid unaalu jevi tamaari khetini mosam pasand karo."
    }
  },

  // Step 7: Goals & Livestock (Farm Step 6)
  7: {
    EN: {
      native: "Step 7 of 9: Farm Goals and Livestock. Choose your primary farm goals, your farming method like organic or natural, and specify if you raise any livestock.",
      phonetic: "Step 7 of 9: Farm Goals and Livestock. Choose your primary farm goals, your farming method like organic or natural, and specify if you raise any livestock."
    },
    HI: {
      native: "चरण 7: कृषि लक्ष्य और पशुपालन। अपने कृषि लक्ष्य, जैविक या रासायनिक खेती का तरीका चुनें, और बताएं कि क्या आप पशुपालन करते हैं।",
      phonetic: "Charan 7: Krishi lakshya aur pashupaalan. Apne krishi lakshya, kheti ka tareeqa chunein, aur batayein kya aap pashupaalan karte hain."
    },
    TE: {
      native: "దశ 7: వ్యవసాయ లక్ష్యాలు మరియు పశువులు. మీ వ్యవసాయ లక్ష్యాలు, సేంద్రీయ లేదా సహజ సాగు పద్ధతి మరియు పశుపోషణ వివరాలను ఎంచుకోండి.",
      phonetic: "Dasha 7: Vyavasaaya lakshyaalu mariyu pashuvulu. Mee vyavasaaya lakshyaalu, saagu paddhati mariyu pashuposhana vivaraalanu enchukondi."
    },
    TA: {
      native: "படி 7: விவசாய இலக்குகள் மற்றும் கால்நடைகள். உங்கள் விவசாய இலக்குகள், இயற்கை அல்லது வழக்கமான சாகுபடி முறை மற்றும் கால்நடை வளர்ப்பு விவரங்களைத் தேர்வுசெய்யவும்.",
      phonetic: "Padi 7: Vivasaaya ilakkugal matrum kaalnadaigal. Ungal vivasaaya ilakkugal, saagubadi murai matrum kaalnadai valarppu vivarangalai therndhedukkavum."
    },
    KN: {
      native: "ಹಂತ 7: ಕೃಷಿ ಗುರಿಗಳು ಮತ್ತು ಜಾನುವಾರು. ನಿಮ್ಮ ಕೃಷಿ ಗುರಿಗಳು, ಮುಖ್ಯ ಕೃಷಿ ವಿಧಾನ ಮತ್ತು ಜಾನುವಾರು ಸಾಕಾಣಿಕೆ ವಿವರಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      phonetic: "Hanta 7: Krushi gurigalu matthu jaanuvaaru. Nimma krushi gurigalu, mukhya krushi vidhaana matthu jaanuvaaru saakaanike vivarangalannu aaykemaadi."
    },
    MR: {
      native: "पायरी 7: शेती उद्दिष्टे आणि पशुपालन. आपली शेती उद्दिष्टे, सेंद्रिय किंवा रासायनिक शेती पद्धत आणि पशुपालनाची माहिती निवडा.",
      phonetic: "Paayri 7: Sheti uddishte aani pashupaalan. Apli sheti uddishte, praathamik sheti paddhat aani pashupaalanaachi maahiti nivda."
    },
    PA: {
      native: "ਕਦਮ 7: ਖੇਤੀ ਟੀਚੇ ਅਤੇ ਪਸ਼ੂ ਪਾਲਣ। ਆਪਣੇ ਖੇਤੀ ਟੀਚੇ, ਮੁੱਖ ਖੇਤੀ ਵਿਧੀ ਅਤੇ ਪਸ਼ੂ ਪਾਲਣ ਦੇ ਵੇਰਵੇ ਚੁਣੋ।",
      phonetic: "Kadam 7: Kheti teeche atey pashu paalan. Apne kheti teeche, mukh kheti vidhi atey pashu paalan de veervey chuno."
    },
    BN: {
      native: "ধাপ ৭: খামারের লক্ষ্য এবং গবাদি পশু। আপনার খামারের লক্ষ্য, প্রধান চাষ পদ্ধতি এবং গবাদি পশু পালনের তথ্য নির্বাচন করুন।",
      phonetic: "Dhaap 7: Khamarer lokkhyo ebong gobadi poshu. Aponar khamarer lokkhyo, prodhaan chaash poddhoti ebong gobadi poshu paaloner tothyo nirbaachon korun."
    },
    GU: {
      native: "પગલું 7: ખેતીના લક્ષ્યો અને પશુપાલન. તમારા ખેતીના લક્ષ્યો, મુખ્ય ખેતી પદ્ધતિ અને પશુપાલનની વિગતો પસંદ કરો.",
      phonetic: "Paglu 7: Khetina lakshyo ane pashupaalan. Tamara khetina lakshyo, mukhya kheti paddhati ane pashupaalanni vigato pasand karo."
    }
  },

  // Step 8: Profile Review (Farm Step 7)
  8: {
    EN: {
      native: "Step 8 of 9: Farm Profile Summary. Review all your farm details carefully. Verify your location, land size, irrigation, and soil before AI crop recommendation.",
      phonetic: "Step 8 of 9: Farm Profile Summary. Review all your farm details carefully. Verify your location, land size, irrigation, and soil before AI crop recommendation."
    },
    HI: {
      native: "चरण 8: खेत प्रोफाइल सारांश। अपने खेत के सभी विवरणों की समीक्षा करें। फसल सिफारिशों पर जाने से पहले अपने स्थान, जमीन और पानी की जांच करें।",
      phonetic: "Charan 8: Khet profile saaraansh. Apne khet ke sabhi vivaranon ki samiksha karein. Fasal sifaarishon par jaane se pehle sabhi vivaran jaanchein."
    },
    TE: {
      native: "దశ 8: వ్యవసాయ ప్రొఫైల్ సమీక్ష. మీ పూర్తి వ్యవసాయ వివరాలను సమీక్షించండి. పంట సిఫార్సులకు వెళ్లే ముందు వివరాలను సరిచూసుకోండి.",
      phonetic: "Dasha 8: Vyavasaaya profile sameeksha. Mee poorthi vyavasaaya profile vivaraalanu sameekshinchandi. Panta sifarshulaku velle mundu vivaraalanu sarichoosukondi."
    },
    TA: {
      native: "படி 8: பண்ணை விவர சுருக்கம். உங்கள் முழு பண்ணை சுயவிவர சுருக்கத்தை மதிப்பாய்வு செய்யவும். பயிர் பரிந்துரைகளுக்குச் செல்வதற்கு முன் விவரங்களைச் சரிபார்க்கவும்.",
      phonetic: "Padi 8: Pannai vivara surukkam. Ungal muzhu pannai suyavivara surukkathai madhippaaivu seiyavum. Payir parindhuraigalukku selvadharku mun vivarangalai saripaarkkavum."
    },
    KN: {
      native: "ಹಂತ 8: ಕೃಷಿ ಪ್ರೊಫೈಲ್ ಸಾರಾಂಶ. ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ಸಾರಾಂಶವನ್ನು ಪರಿಶೀಲಿಸಿ. ಬೆಳೆ ಶಿಫಾರಸುಗಳಿಗೆ ಮುಂದುವರಿಯುವ ಮೊದಲು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      phonetic: "Hanta 8: Krushi profile saaraamsha. Nimma sampoorna krushi profile saaraamshavannu pareekshisi. Bele shifarassugalige munduvariyuva modalu ella vivarangalannu sarinodikkoli."
    },
    MR: {
      native: "पायरी 8: शेत प्रोफाइल सारांश. आपल्या संपूर्ण शेत प्रोफाइल सारांशाचे पुनरावलोकन करा. पीक शिफारसींकडे जाण्यापूर्वी सर्व तपशील तपासा.",
      phonetic: "Paayri 8: Shet profile saaraansh. Aaplya sampoorna shet profile saaraanshaache punaraavlokan kara. Peek shifaarasiikade jaanyaapoorvi sarv tapshil tapaasa."
    },
    PA: {
      native: "ਕਦਮ 8: ਖੇਤ ਪ੍ਰੋਫਾਈਲ ਸਾਰ। ਆਪਣੇ ਪੂਰੇ ਖੇਤ ਪ੍ਰੋਫਾਈਲ ਸਾਰ ਦੀ ਸਮੀਖਿਆ ਕਰੋ। ਫਸਲ ਦੀਆਂ ਸਿਫ਼ਾਰਸ਼ਾਂ 'ਤੇ ਜਾਣ ਤੋਂ ਪਹਿਲਾਂ ਸਾਰੇ ਵੇਰਵਿਆਂ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।",
      phonetic: "Kadam 8: Khet profile saar. Apne poore khet profile saar di sameekhiya karo. Fasal di sifarishaan te jaan ton pehlaan saare veervey check karo."
    },
    BN: {
      native: "ধাপ ৮: খামার প্রোফাইল সারাংশ। আপনার সম্পূর্ণ খামার প্রোফাইল সারাংশ পর্যালোচনা করুন। ফসলের সুপারিশে এগিয়ে যাওয়ার আগে সমস্ত বিবরণ যাচাই করুন।",
      phonetic: "Dhaap 8: Khamar profile shaaraangsho. Aponar shompoorno khamar profile shaaraangsho porjalochona korun. Foshuler shupaarishe egiye jaoyar aage shomosto biboron jaachai korun."
    },
    GU: {
      native: "પગલું 8: ખેતર પ્રોફાઇલ સારાંશ. તમારા સંપૂર્ણ ખેતર પ્રોફાઇલ સારાંશની સમીક્ષા કરો. પાકની ભલામણો તરફ આગળ વધતા પહેલા તમામ વિગતો તપાસો.",
      phonetic: "Paglu 8: Khetar profile saaraansh. Tamara sampoorna khetar profile saaraanshni sameeksha karo. Paakni bhalaamno taraf aagal vadhta pehla tamaam vigato tapaaso."
    }
  },

  // Step 9: Crop Recommendations & Selection (Farm Step 8)
  9: {
    EN: {
      native: "Step 9 of 9: Crop Selection. AI has analyzed your location, soil, water, and season to recommend the best crops. You can select recommended crops or click Select Crop Manually to choose any crop from over 50 Indian crops.",
      phonetic: "Step 9 of 9: Crop Selection. AI has analyzed your location, soil, water, and season to recommend the best crops. You can select recommended crops or click Select Crop Manually to choose any crop from over 50 Indian crops."
    },
    HI: {
      native: "चरण 9: फसल चयन। एआई ने आपकी मिट्टी, पानी और मौसम के आधार पर सर्वोत्तम फसलों की सिफारिश की है। आप अनुशंसित फसलें चुन सकते हैं या 50 से अधिक फसलों में से मैनुअल चुन सकते हैं।",
      phonetic: "Charan 9: Fasal chayan. AI ne aapki mitti, paani aur mausam ke aadhar par sarvottam faslon ki sifaarish ki hai. Aap recommended faslein chun sakte hain ya manual fasal chunein."
    },
    TE: {
      native: "దశ 9: పంట ఎంపిక. AI మీ నేల, నీరు మరియు సీజన్ ఆధారంగా ఉత్తమ పంటలను సిఫార్సు చేసింది. మీరు సిఫార్సు చేసిన పంటలను ఎంచుకోవచ్చు లేదా 50 కి పైగా పంటల నుండి మాన్యువల్ గా ఎంచుకోవచ్చు.",
      phonetic: "Dasha 9: Panta empika. AI mee nela, neeru mariyu season aadharangaa utthama pantalanu sifarashu chesindi. Meeru sifarashu chesina pantalanu enchukovacchu leda manual gaa enchukondi."
    },
    TA: {
      native: "படி 9: பயிர் தேர்வு. உங்கள் மண், நீர் மற்றும் பருவத்தின் அடிப்படையில் சிறந்த பயிர்களை AI பரிந்துரைத்துள்ளது. பரிந்துரைக்கப்பட்ட பயிர்களைத் தேர்வுசெய்யலாம் அல்லது 50க்கும் மேற்பட்ட பயிர்களில் இருந்து தேர்வுசெய்யலாம்.",
      phonetic: "Padi 9: Payir thervu. Ungal man, neer matrum paruvathin adipadayil sirandha payirgalai AI parindhuraithulladhu. Parindhuraikkapatta payirgalai therndhedukkalaam alladhu manual-aaga therndhedukkalaam."
    },
    KN: {
      native: "ಹಂತ 9: ಬೆಳೆ ಆಯ್ಕೆ. AI ನಿಮ್ಮ ಮಣ್ಣು, ನೀರು ಮತ್ತು ಹಂಗಾಮಿನ ಆಧಾರದ ಮೇಲೆ ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಿದೆ. ನೀವು ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದು ಅಥವಾ 50 ಕ್ಕೂ ಹೆಚ್ಚು ಬೆಳೆಗಳಿಂದ ಆಯ್ಕೆ ಮಾಡಬಹುದು.",
      phonetic: "Hanta 9: Bele aayke. AI nimma mannu, neeru matthu hangaamina aadharada mele athyuttama belegalannu shifarassu maadide. Neevu shifarassu maadida belegalannu aayke maadabahudu athava 50 kkoo hecchu belegalinda aaykemaadabahudu."
    },
    MR: {
      native: "पायरी 9: पीक निवड. AI ने आपल्या माती, पाणी आणि हंगामाचा विचार करून सर्वोत्तम पिकांची शिफारस केली आहे. आपण शिफारस केलेली पिके निवडू शकता किंवा 50 हून अधिक पिकांमधून निवडू शकता.",
      phonetic: "Paayri 9: Peek nivad. AI ne aaplya maati, paani aani hangaamaacha vichaar karun sarvottam pikaanchi shifaaras keli aahe. Aapan shifaaras keleli pike nivdu shakta kiva 50 hun adhik pikammadhun nivdu shakta."
    },
    PA: {
      native: "ਕਦਮ 9: ਫਸਲ ਚੋਣ। AI ਨੇ ਤੁਹਾਡੀ ਮਿੱਟੀ, ਪਾਣੀ ਅਤੇ ਸੀਜ਼ਨ ਦੇ ਅਧਾਰ 'ਤੇ ਵਧੀਆ ਫਸਲਾਂ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਹੈ। ਤੁਸੀਂ ਸਿਫਾਰਸ਼ ਕੀਤੀਆਂ ਫਸਲਾਂ ਚੁਣ ਸਕਦੇ ਹੋ ਜਾਂ 50 ਤੋਂ ਵੱਧ ਫਸਲਾਂ ਵਿੱਚੋਂ ਚੁਣ ਸਕਦੇ ਹੋ।",
      phonetic: "Kadam 9: Fasal chon. AI ne tuhadi mitti, paani atey season de adhaar te vadiya faslaan di sifarish kiti hai. Tusi sifarish kitiaan faslaan chun sakde ho ya 50 ton vadh faslaan vichon chun sakde ho."
    },
    BN: {
      native: "ধাপ ৯: ফসল নির্বাচন। এআই আপনার মাটি, জল ও মৌসুমের ভিত্তিতে সেরা ফসলের সুপারিশ করেছে। আপনি প্রস্তাবিত ফসল নির্বাচন করতে পারেন বা ৫০ টিরও বেশি ফসল থেকে ম্যানুয়ালি বেছে নিতে পারেন।",
      phonetic: "Dhaap 9: Foshol nirbaachon. AI aponar maati, jol o moushumer bhittite shera foshuler shupaarish korechhe. Aponi prostabito foshol nirbaachon korte paaren ba 50 tir-o beshi foshol theke manually bachhte paaren."
    },
    GU: {
      native: "પગલું 9: પાક પસંદગી. એઆઈએ તમારી માટી, પાણી અને મોસમના આધારે શ્રેષ્ઠ પાકોની ભલામણ કરી છે. તમે ભલામણ કરેલ પાક પસંદ કરી શકો છો અથવા 50 થી વધુ પાકોમાંથી મેન્યુઅલી પસંદ કરી શકો છો.",
      phonetic: "Paglu 9: Paak pasandgi. AI e tamaari maati, paani ane mosamna aadhaare shreshtha paakoni bhalaaman kari chhe. Tame recommended paak pasand kari shako chho athva manually pasand karo."
    }
  }
};
