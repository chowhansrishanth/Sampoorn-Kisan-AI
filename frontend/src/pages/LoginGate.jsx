import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Sprout, Lock, Mail, User, MapPin, Eye, EyeOff, ArrowLeft, 
  HelpCircle, CheckCircle, CheckCircle2, AlertCircle, Loader2, ArrowRight, 
  Phone, Compass, Volume2, VolumeX, Globe, Check, Sparkles, Search 
} from "lucide-react";
import SupportModal from "../components/SupportModal";
import { detectGPSLocation, parseManualLocation } from "../utils/locationHelper";
import api, { getApiErrorMessage } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import useVoiceAssistant from "../hooks/useVoiceAssistant";

import SearchableCropSelector from "../components/ui/SearchableCropSelector";
import { 
  LAND_SIZE_OPTIONS, FARM_TYPES, IRRIGATION_SOURCES, 
  SOIL_TYPES, FARMING_SEASONS, FARM_GOALS, convertToAcres 
} from "../data/cropsData";
import { STEP_VOICE_GUIDANCE, getRecommendedCropsForWizard } from "../components/FarmProfileWizard";
import { REGISTRATION_VOICE_GUIDANCE } from "../data/registrationVoiceGuidance";
import StepVoiceGuidanceBar from "../components/StepVoiceGuidanceBar";

const LANGUAGES = [
  { code: "EN", name: "English", native: "English" },
  { code: "HI", name: "Hindi", native: "हिंदी" },
  { code: "TE", name: "Telugu", native: "తెలుగు" },
  { code: "TA", name: "Tamil", native: "தமிழ்" },
  { code: "KN", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "MR", name: "Marathi", native: "मराठी" },
  { code: "PA", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "BN", name: "Bengali", native: "বাংলা" },
  { code: "GU", name: "Gujarati", native: "ગુજરાતી" }
];

const VOICE_GUIDANCE = {
  EN: {
    native: "Welcome to Sampoorn Kisan AI. Sign in with your mobile number or email and password, or click Create Account to register.",
    phonetic: "Welcome to Sampoorn Kisan AI. Sign in with your mobile number or email and password, or click Create Account to register."
  },
  HI: {
    native: "सम्पूर्ण किसान एआई में आपका स्वागत है। लॉगिन करने के लिए अपना मोबाइल नंबर या ईमेल और पासवर्ड दर्ज करें, या नया खाता बनाएं।",
    phonetic: "Sampoorn Kisan AI mein aapka swaagat hai. Login karne ke liye apna mobile number ya email aur password darj karein, ya naya khaata banayein."
  },
  TE: {
    native: "సంపూర్ణ్ కిసాన్ AI కి స్వాగతం. లాగిన్ చేయడానికి మీ మొబైల్ నంబర్ లేదా ఇమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి, లేదా కొత్త ఖాతా సృష్టించండి.",
    phonetic: "Sampoorn Kisan AI ki swagatham. Login cheyadaniki mee mobile number leda email mariyu password enter cheyandi, leda kottha account create cheyandi."
  },
  TA: {
    native: "சம்பூர்ண் கிசான் AI க்கு வரவேற்கிறோம். உள்நுழைய உங்கள் கைபேசி எண் அல்லது மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும், அல்லது புதிய கணக்கை உருவாக்கவும்.",
    phonetic: "Sampoorn Kisan AI-kku ungalai varaverkirom. Sign in seiya ungal mobile number alladhu email matrum password enter seiyavum, alladhu pudhiya account create seiyavum."
  },
  KN: {
    native: "ಸಂಪೂರ್ಣ ಕಿಸಾನ್ AI ಗೆ ಸುಸ್ವಾಗತ. ಸೈನ್ ಇನ್ ಮಾಡಲು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ, ಅಥವಾ ಹೊಸ ಖಾತೆಯನ್ನು ರಚಿಸಿ.",
    phonetic: "Sampoorn Kisan AI ge suswaagatha. Sign in maadaloo nimma mobile sankhye athava email matthu password enter maadi, athava hosa account create maadi."
  },
  MR: {
    native: "संपूर्ण किसान AI मध्ये आपले स्वागत आहे. साइन इन करण्यासाठी आपला मोबाईल नंबर किंवा ईमेल आणि पासवर्ड प्रविष्ट करा, किंवा नवीन खाते तयार करा.",
    phonetic: "Sampoorn Kisan AI madhye aple swaagat aahe. Sign in karnyasathi aapla mobile number kiva email aani password enter kara, kiva naveen account create kara."
  },
  PA: {
    native: "ਸੰਪੂਰਨ ਕਿਸਾਨ AI ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਸਾਈਨ ਇਨ ਕਰਨ ਲਈ ਆਪਣਾ ਮੋਬਾਈਲ ਨੰਬਰ ਜਾਂ ਈਮੇਲ ਅਤੇ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ, ਜਾਂ ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ।",
    phonetic: "Sampoorn Kisan AI vich tuhada swagat hai. Sign in karan layi apna mobile number ya email atey password enter karo, ya nawaan account create karo."
  },
  BN: {
    native: "সম্পূর্ণ কিষাণ AI তে আপনাকে স্বাগতম। সাইন ইন করতে আপনার মোবাইল নম্বর বা ইমেল এবং পাসওয়ার্ড লিখুন, অথবা নতুন অ্যাকাউন্ট তৈরি করুন।",
    phonetic: "Sampoorn Kisan AI-te aponake swagata. Sign in korte aponar mobile number ba email ebong password enter korun, othoba notun account toiri korun."
  },
  GU: {
    native: "સંપૂર્ણ કિસાન AI માં આપનું સ્વાગત છે. સાઇન ઇન કરવા માટે તમારો મોબાઇલ નંબર અથવા ઇમેઇલ અને પાસવર્ડ દાખલ કરો, અથવા નવું એકાઉન્ટ બનાવો.",
    phonetic: "Sampoorn Kisan AI ma aapnu swaagat chhe. Sign in karva maate tamaro mobile number athva email ane password enter karo, athva navun account create karo."
  }
};

export default function LoginGate({ onLoginSuccess }) {
  const { language, setLanguage, t } = useLanguage();
  const { isSpeaking, speak, stopSpeaking } = useVoiceAssistant(language);
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  // Step 1: Account credentials
  const [formData, setFormData] = useState({
    name: "", identifier: "", phone: "", email: "", password: "", confirmPassword: ""
  });

  // Steps 2 to 9: Farm Profile 8 Steps
  const [farmerName, setFarmerName] = useState("");
  const [locationInput, setLocationInput] = useState("Punjab, India");
  const [locationObj, setLocationObj] = useState({
    formattedAddress: "Punjab, India",
    district: "Punjab",
    state: "Punjab",
    country: "India",
    accuracy: null
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [accuracyMsg, setAccuracyMsg] = useState("");

  // Step 3 (Farm Profile 2): Land & Farm Type
  const [landPreset, setLandPreset] = useState("3 to 5 Acres");
  const [customLandSize, setCustomLandSize] = useState("4.5");
  const [landUnit, setLandUnit] = useState("Acres");
  const [farmType, setFarmType] = useState("Medium Holding");

  // Step 4 (Farm Profile 3): Water & Irrigation Availability
  const [irrigation, setIrrigation] = useState(["borewell", "drip"]);

  // Step 5 (Farm Profile 4): Soil Type Identification
  const [soilType, setSoilType] = useState("black");
  const [showSoilHelp, setShowSoilHelp] = useState(false);

  // Step 6 (Farm Profile 5): Farming Season & Climate
  const [season, setSeason] = useState("kharif");

  // Step 7 (Farm Profile 6): Farm Goals & Method & Livestock
  const [goals, setGoals] = useState(["increase_profit", "market_prices", "detect_disease"]);
  const [farmingMethod, setFarmingMethod] = useState("Conventional");
  const [hasLivestock, setHasLivestock] = useState(false);
  const [livestockTypes, setLivestockTypes] = useState(["Cattle"]);

  // Step 9 (Farm Profile 8): Crop Selection
  const [crops, setCrops] = useState([
    { id: "wheat", name: "Wheat & Rice", icon: "🌾", isPrimary: true, area: 2.5, stage: "Vegetative Growth" }
  ]);
  const [cropSelectionTab, setCropSelectionTab] = useState("both"); // "ai", "manual", or "both"

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
  const clearAlerts = () => { setError(""); setSuccessMsg(""); };

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

  // Dynamically Recommended Crops for Farm Profile Step 8
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

  const handleDetectLocation = async () => {
    clearAlerts();
    setGeoLoading(true);
    setAccuracyMsg("");
    try {
      const res = await detectGPSLocation();
      if (res.success) {
        setLocationInput(res.formattedAddress);
        setLocationObj(res);
        if (res.accuracyWarning) {
          setAccuracyMsg(res.accuracyWarning);
        } else if (res.accuracy) {
          setAccuracyMsg(`GPS: ±${Math.round(res.accuracy)} m`);
        }
        setSuccessMsg(`📍 GPS Location detected: ${res.formattedAddress}${res.accuracy ? ` (Accuracy: ±${Math.round(res.accuracy)}m)` : ""}`);
      } else {
        setError(res.error || t("Unable to detect device GPS location. Please enter manually."));
      }
    } catch {
      setError(t("Unable to detect device GPS location. Please enter manually."));
    } finally {
      setGeoLoading(false);
    }
  };

  const handleVoiceGuidance = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      if (mode === "register") {
        const guidanceObj = REGISTRATION_VOICE_GUIDANCE[step]?.[language] || REGISTRATION_VOICE_GUIDANCE[step]?.EN;
        if (guidanceObj) {
          speak(guidanceObj.native, language, guidanceObj.phonetic);
        }
      } else {
        const guidance = VOICE_GUIDANCE[language] || VOICE_GUIDANCE.EN;
        speak(guidance.native, language, guidance.phonetic);
      }
    }
  };

  const handleStepVoice = (forcedLang = null) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const activeLang = forcedLang || language || "EN";
      const guidanceObj = REGISTRATION_VOICE_GUIDANCE[step]?.[activeLang] || REGISTRATION_VOICE_GUIDANCE[step]?.EN;
      if (guidanceObj) {
        speak(guidanceObj.native, activeLang, guidanceObj.phonetic);
      }
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
      const filtered = crops.filter(c => c.name !== recCrop.name && c.id !== recCrop.id);
      if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      setCrops(filtered);
    } else {
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

  /**
   * Step 1 Validation Handler (Account Credentials)
   * 
   * Validates:
   * 1. Full Name: Required non-empty string.
   * 2. Phone Number: Required, must contain exactly 10 numeric digits (/^\d{10}$/).
   * 3. Email: Optional. If entered, validated against standard email format.
   * 4. Password: Required, minimum 8 characters. If fewer than 8, displays exact message:
   *    "Password should contain at least 8 characters"
   * 5. Confirm Password: Must match password.
   * 
   * @returns {string|null} Validation error message or null if valid.
   */
  const validateStep1 = () => {
    // 1. Name validation
    if (!formData.name.trim()) return "Please check your details.";

    // 2. Phone Number validation (Requirement 2): exactly 10 digits
    const rawPhone = (formData.phone || "").trim();
    if (!/^\d{10}$/.test(rawPhone)) {
      return "Phone number must contain exactly 10 digits.";
    }

    // 3. Email validation (Requirement 3): email is optional
    const rawEmail = (formData.email || "").trim();
    if (rawEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(rawEmail)) {
        return "Please enter a valid email address format.";
      }
    }

    // 4. Password validation (Requirement 1): minimum 8 characters with exact required message
    if (!formData.password || formData.password.length < 8) {
      return "Password should contain at least 8 characters";
    }

    // 5. Password matching validation
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };

  // ── Login Handler ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    clearAlerts();
    const ident = (formData.identifier || "").trim();
    const pass = (formData.password || "");

    if (!ident || !pass) {
      setError("Please enter your email or mobile number and password.");
      return;
    }

    // Enforce 8-character password constraint on login
    if (pass.length < 8) {
      setError("Password should contain at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const normalizedIdent = ident.toLowerCase();
      const res = await api.post("/api/auth/login", {
        identifier: normalizedIdent,
        email: normalizedIdent.includes("@") ? normalizedIdent : "",
        phone: !normalizedIdent.includes("@") ? ident : "",
        password: pass,
        rememberMe: true
      });

      if (res.data?.user && res.data?.token) {
        onLoginSuccess(res.data.user, res.data.token);
      } else {
        setError("Unable to sign in right now. Please try again.");
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || err.response?.data?.error;

      if (code === "INVALID_CREDENTIALS" || code === "INVALID_PASSWORD" || code === "ACCOUNT_NOT_FOUND" || err.response?.status === 401) {
        setError("Invalid email/mobile number or password.");
      } else if (code === "RATE_LIMITED" || err.response?.status === 429) {
        setError("Too many sign-in attempts. Please wait a moment and try again.");
      } else if (err.code === "ERR_NETWORK" || err.message === "Network Error" || !err.response) {
        setError("Unable to reach server. Please check your connection.");
      } else {
        setError(msg || "Unable to sign in right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step Navigation Handlers ─────────────────────────────────────────────
  const handleStepNext = async () => {
    clearAlerts();
    if (isSpeaking) stopSpeaking();

    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      if (!farmerName.trim()) {
        setFarmerName(formData.name.trim());
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!locationInput.trim()) {
        setError(t("Please enter your farm location."));
        return;
      }
      if (!locationObj || locationObj.formattedAddress !== locationInput) {
        const parsed = await parseManualLocation(locationInput);
        if (parsed.success) {
          setLocationObj(parsed);
        }
      }
    }

    if (step === 3 && landPreset === "Custom Size") {
      const val = parseFloat(customLandSize);
      if (!val || val <= 0) {
        setError(t("Please enter a valid land size number."));
        return;
      }
    }

    if (step < 9) {
      setStep(s => s + 1);
    }
  };

  const handleStepPrev = () => {
    clearAlerts();
    if (isSpeaking) stopSpeaking();
    if (step > 1) {
      setStep(s => s - 1);
    }
  };

  // ── Register (Final Step 9 Submit) ──────────────────────────────────────
  const handleRegister = async () => {
    clearAlerts();
    if (isSpeaking) stopSpeaking();

    // 1. Full name validation
    const nameToUse = farmerName.trim() || formData.name.trim();
    if (!nameToUse) {
      setError("Please check your details.");
      return;
    }

    // 2. Phone number validation (Requirement 2): must contain exactly 10 digits
    const rawPhone = (formData.phone || "").trim();
    if (!/^\d{10}$/.test(rawPhone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    // 3. Email validation (Requirement 3): email is optional
    const rawEmail = (formData.email || "").trim();
    if (rawEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(rawEmail)) {
        setError("Please enter a valid email address format.");
        return;
      }
    }

    // 4. Password validation (Requirement 1): minimum 8 characters with exact required message
    if (!formData.password || formData.password.length < 8) {
      setError("Password should contain at least 8 characters");
      return;
    }

    // 5. Password matching validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (crops.length === 0) {
      setError(t("Please select at least one crop from AI recommendations or manual selection to finish."));
      return;
    }

    setLoading(true);

    let finalLoc = locationObj;
    if (!locationObj || locationObj.formattedAddress !== locationInput) {
      const parsed = await parseManualLocation(locationInput);
      if (parsed.success) {
        finalLoc = parsed;
      }
    }

    const calculatedAcres = numericLandSizeAcres();
    const primaryCropObj = crops.find(c => c.isPrimary) || crops[0] || { name: "Wheat & Rice" };
    const finalLocation = finalLoc?.formattedAddress || locationInput || "Punjab, India";

    const farmProfileObj = {
      location: {
        formattedAddress: finalLocation,
        district: finalLoc?.district || "Punjab",
        state: finalLoc?.state || "Punjab",
        country: "India",
        accuracy: finalLoc?.accuracy || null
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

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPhone = formData.phone.trim();

    const userPayload = {
      name: nameToUse,
      email: cleanEmail,
      phone: cleanPhone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      location: finalLocation,
      locationObj: finalLoc,
      cropType: primaryCropObj.name,
      farmSizeHectares: Number((calculatedAcres * 0.404686).toFixed(2)),
      farmProfile: farmProfileObj,
      preferredLanguage: language
    };

    try {
      const res = await api.post("/api/auth/register", userPayload);
      if (res.data?.success || res.status === 201) {
        setSuccessMsg("Account created successfully. Please sign in.");
        redirectTimer.current = setTimeout(() => {
          setMode("login");
          setStep(1);
          setFormData(prev => ({
            ...prev,
            identifier: cleanEmail || cleanPhone,
            password: ""
          }));
        }, 1500);
      } else {
        setError("The account could not be created. Please try again.");
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || err.response?.data?.error;

      if (code === "USER_ALREADY_EXISTS" || msg === "User already exists") {
        setError("User already exists");
        redirectTimer.current = setTimeout(() => {
          setMode("login");
          setStep(1);
          setFormData(prev => ({
            ...prev,
            identifier: cleanEmail || cleanPhone
          }));
        }, 1500);
      } else if (code === "PASSWORD_MISMATCH" || msg === "Passwords do not match.") {
        setError("Passwords do not match.");
      } else {
        setError(getApiErrorMessage(err, "Unable to create your account right now. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ──────────────────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    clearAlerts();
    const cleanId = (formData.identifier || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId)) {
      setError("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", {
        email: cleanId.toLowerCase()
      });
      setSuccessMsg(res.data?.message || "If an account matches that email address, a password reset link has been sent.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to request password reset. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setStep(1);
    clearAlerts();
    setAnimKey(k => k + 1);
  };

  const totalSteps = 9;
  const progressPct = mode === "register" ? Math.round((step / totalSteps) * 100) : 0;

  const registrationStepTitles = {
    1: t("Account Setup", "Account Setup"),
    2: t("Farm Location & Profile", "Farm Location & Profile"),
    3: t("Land & Farm Type", "Land & Farm Type"),
    4: t("Water & Irrigation Availability", "Water & Irrigation Availability"),
    5: t("Soil Type Identification", "Soil Type Identification"),
    6: t("Farming Season & Climate", "Farming Season & Climate"),
    7: t("Farm Goals & Livestock", "Farm Goals & Livestock"),
    8: t("Review Farm Summary", "Review Farm Summary"),
    9: t("AI Crop Recommendation & Selection", "AI Crop Recommendation & Selection")
  };

  const farmStepTitles = {
    1: t("Farm Location"),
    2: t("Land & Farm Type"),
    3: t("Water & Irrigation Availability"),
    4: t("Soil Type Identification"),
    5: t("Farming Season & Climate"),
    6: t("Farm Goals & Method"),
    7: t("Review Farm Summary"),
    8: t("AI Crop Recommendation & Selection")
  };

  return (
    <div className="lg-overlay">
      <style>{`
        .lg-input-group input:-webkit-autofill,
        .lg-input-group input:-webkit-autofill:hover,
        .lg-input-group input:-webkit-autofill:focus,
        .lg-input-group input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #1a1a2e !important;
          color: #1a1a2e !important;
          background-color: #ffffff !important;
          transition: background-color 9999s ease-in-out 0s !important;
          caret-color: #1a1a2e !important;
        }
        .lg-input-group {
          background: #ffffff !important;
        }
        .lg-input-group input {
          background: transparent !important;
          background-color: transparent !important;
          color: #1a1a2e !important;
        }
      `}</style>
      <div className="lg-form-panel" key={animKey}>
        <div 
          className="lg-card lg-mode-enter"
          style={{ 
            maxWidth: (mode === "register" && step > 1) ? "680px" : "520px", 
            transition: "max-width 0.3s ease",
            width: "100%" 
          }}
        >
          {/* Multilingual Selector & Spoken Voice Guidance Bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            padding: "10px 12px",
            marginBottom: "16px",
            borderRadius: "12px",
            background: "rgba(0, 105, 72, 0.05)",
            border: "1px solid rgba(0, 105, 72, 0.15)",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#006948", fontWeight: 700, fontSize: "13px" }}>
              <Globe size={16} />
              <span>{t("Select Language")} / भाषा:</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap", flex: 1, justifyContent: "flex-end" }}>
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    title={lang.name}
                    style={{
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: isSelected ? "700" : "500",
                      borderRadius: "16px",
                      border: isSelected ? "1.5px solid #006948" : "1px solid #d1d5db",
                      background: isSelected ? "#006948" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#374151",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {lang.native}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleVoiceGuidance}
                title={isSpeaking ? t("Stop Voice Assistance") : t("Listen to Voice Assistance")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  borderRadius: "16px",
                  border: isSpeaking ? "1.5px solid #dc2626" : "1px solid #006948",
                  background: isSpeaking ? "#fee2e2" : "#ecfdf5",
                  color: isSpeaking ? "#b91c1c" : "#047857",
                  cursor: "pointer",
                  marginLeft: "2px"
                }}
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isSpeaking ? t("Stop", "Stop") : t("Listen to Voice", "Listen")}</span>
              </button>
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="lg-tabs">
              <button
                type="button"
                className={`lg-tab-btn ${mode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
              >
                {t("Sign In")}
              </button>
              <button
                type="button"
                className={`lg-tab-btn ${mode === "register" ? "active" : ""}`}
                onClick={() => {
                  const entered = (formData.identifier || "").trim();
                  if (entered && !formData.name) {
                    set("name", entered);
                  }
                  switchMode("register");
                }}
              >
                {t("Create Account")}
              </button>
            </div>
          )}

          {mode === "register" && (
            <div className="lg-progress-wrap" style={{ marginBottom: "12px" }}>
              <div className="lg-progress-bar">
                <div className="lg-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                <span className="lg-progress-label">
                  {step === 1 ? t("Step 1 of 9: Account Setup", "Step 1 of 9: Account Setup") : `${t("🌾 Farm Profile: Step", "🌾 Farm Profile: Step")} ${step - 1} ${t("of", "of")} 8 — ${registrationStepTitles[step] || farmStepTitles[step - 1]}`}
                </span>
                <span style={{ fontSize: "12px", color: "var(--fk-text-sub, #64748b)", fontWeight: "700" }}>
                  {step}/9
                </span>
              </div>
            </div>
          )}

          {/* Multilingual Voice Guidance Bar for Every Step of Registration */}
          {mode === "register" && (
            <StepVoiceGuidanceBar
              stepNumber={step}
              totalSteps={9}
              stepTitle={registrationStepTitles[step]}
              guidanceMap={REGISTRATION_VOICE_GUIDANCE}
              isSpeaking={isSpeaking}
              onPlay={handleStepVoice}
              onStop={stopSpeaking}
            />
          )}

          {error && (
            <div className="lg-alert lg-alert-error" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error === "Password should contain at least 8 characters" ? error : t(error)}</span>
              </div>
              {mode === "login" && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '14px', width: '100%', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#4b5563' }}>{t("Don't have an account or trying to sign up?")}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const entered = (formData.identifier || "").trim();
                      if (entered && !formData.name) {
                        set("name", entered);
                      }
                      switchMode("register");
                    }}
                    style={{ background: 'none', border: 'none', color: '#006948', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    {t("Click here to Create Account →")}
                  </button>
                </div>
              )}
              {error === "User already exists" && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '14px', width: '100%', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#4b5563' }}>{t("Already have an account?")}</span>
                  <button type="button" onClick={() => switchMode("login")} style={{ background: 'none', border: 'none', color: '#006948', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                    {t("Sign In →")}
                  </button>
                </div>
              )}
            </div>
          )}
          {successMsg && (
            <div className="lg-alert lg-alert-success">
              <CheckCircle size={16} />{t(successMsg)}
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {mode === "forgot" && (
            <>
              <div className="lg-form-header">
                <div className="lg-form-icon"><Lock size={24} /></div>
                <h2>{t("Reset Password")}</h2>
                <p>{t("Enter your registered email address")}</p>
              </div>
              <form onSubmit={handleForgot} className="lg-form">
                <div className="lg-input-group">
                  <Mail size={17} className="lg-input-icon" />
                  <input
                    type="email" placeholder={t("Email Address")}
                    value={formData.identifier}
                    onChange={e => set("identifier", e.target.value)}
                    required autoFocus
                  />
                </div>
                <button type="submit" className="lg-btn-primary" disabled={loading}>
                  {loading ? <><Loader2 size={16} className="spin" /> {t("Sending...")}</> : <>{t("Send Reset Link")} <ArrowRight size={16} /></>}
                </button>
              </form>
              <div className="lg-footer-link">
                <button onClick={() => switchMode("login")} className="lg-text-btn">
                  <ArrowLeft size={15} /> {t("Back to Login")}
                </button>
              </div>
            </>
          )}

          {/* REGISTER STEP 1: ACCOUNT CREDENTIALS */}
          {mode === "register" && step === 1 && (
            <>
              <div className="lg-form-header">
                <div className="lg-form-icon"><User size={24} /></div>
                <h2>{t("Create Account")}</h2>
                <p>{t("Join 38,000+ farmers on Sampoorn Kisan AI")}</p>
              </div>
              <div className="lg-form">
                <div className="lg-input-group">
                  <User size={17} className="lg-input-icon" />
                  <input
                    type="text" placeholder={t("Full Name")}
                    value={formData.name}
                    onChange={e => {
                      set("name", e.target.value);
                      setFarmerName(e.target.value);
                    }}
                    autoFocus
                  />
                </div>

                <div className="lg-input-group">
                  <Phone size={17} className="lg-input-icon" />
                  <input
                    type="tel" placeholder={t("Mobile Number (+91)")}
                    value={formData.phone}
                    onChange={e => set("phone", e.target.value)}
                  />
                </div>

                <div className="lg-input-group">
                  <Mail size={17} className="lg-input-icon" />
                  <input
                    type="email" placeholder={t("Email Address (Optional)")}
                    value={formData.email}
                    onChange={e => set("email", e.target.value)}
                  />
                </div>

                <div className="lg-input-group">
                  <Lock size={17} className="lg-input-icon" />
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder={t("Password (min 8 chars)")}
                    value={formData.password}
                    onChange={e => set("password", e.target.value)}
                  />
                  <button type="button" className="lg-eye-btn" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="lg-input-group">
                  <Lock size={17} className="lg-input-icon" />
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    placeholder={t("Confirm Password")}
                    value={formData.confirmPassword}
                    onChange={e => set("confirmPassword", e.target.value)}
                  />
                  <button type="button" className="lg-eye-btn" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                    {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button type="button" className="lg-btn-primary" onClick={handleStepNext} disabled={loading}>
                  {t("Continue")} <ArrowRight size={16} />
                </button>
              </div>
              <div className="lg-footer-link">
                <span>{t("Already have an account?")}</span>
                <button onClick={() => switchMode("login")} className="lg-text-btn">{t("Sign In")}</button>
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              FARM PROFILE 8 STEPS (CROSS ALL 8 STEPS DURING REGISTRATION)
             ═════════════════════════════════════════════════════════════════════ */}

          {mode === "register" && step > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* STEP 2: FARM PROFILE STEP 1 — LOCATION & PROFILE */}
              {step === 2 && (
                <>
                  <div className="lg-form-header" style={{ marginBottom: "12px" }}>
                    <div className="lg-form-icon"><MapPin size={24} /></div>
                    <h2>{t("Farm Profile & Location")}</h2>
                    <p>{t("Step 1 of 8: Choose or auto-detect your location")}</p>
                  </div>

                  <div className="lg-form">
                    <div style={{ background: "rgba(0, 105, 72, 0.05)", border: "1px solid rgba(0, 105, 72, 0.15)", borderRadius: "8px", padding: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#006948", textTransform: "uppercase" }}>
                          📍 {t("Detect Device Location", "Detect Device Location")}
                        </span>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={geoLoading}
                          style={{
                            background: "#006948", border: "none", color: "#ffffff", padding: "7px 14px",
                            borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "6px"
                          }}
                        >
                          {geoLoading ? <Loader2 size={14} className="spin" /> : <Compass size={14} />}
                          {geoLoading ? t("Detecting GPS Location...") : t("🎯 Detect My Device Location (GPS)")}
                        </button>
                      </div>
                      {accuracyMsg && (
                        <div style={{ fontSize: "12px", color: "var(--fk-text-sub, #64748b)", marginTop: "4px" }}>
                          📍 {accuracyMsg}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="lg-field-label">{t("Farmer Full Name", "Farmer Full Name")}</div>
                      <div className="lg-input-group">
                        <User size={17} className="lg-input-icon" />
                        <input
                          type="text"
                          placeholder={t("Enter your name", "Enter your name")}
                          value={farmerName}
                          onChange={e => setFarmerName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="lg-field-label">{t("Farm Location (Any Indian Village / District / State)")}</div>
                      <div className="lg-input-group">
                        <MapPin size={17} className="lg-input-icon" />
                        <input
                          type="text"
                          placeholder="e.g. Warangal, Telangana, India"
                          value={locationInput}
                          onChange={e => setLocationInput(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 3: FARM PROFILE STEP 2 — LAND & FARM TYPE */}
              {step === 3 && (
                <>
                  <div className="lg-form-header" style={{ marginBottom: "12px" }}>
                    <div className="lg-form-icon"><Sprout size={24} /></div>
                    <h2>{t("Land & Farm Type")}</h2>
                    <p>{t("Step 2 of 8: Specify total land size and holding type")}</p>
                  </div>

                  <div className="lg-form">
                    <div>
                      <div className="lg-field-label">{t("Total Land Size", "Total Land Size")}</div>
                      <select
                        value={landPreset}
                        onChange={e => setLandPreset(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border, #e2e8f0)", fontSize: "15px", background: "#ffffff", color: "#1a1a2e" }}
                      >
                        {LAND_SIZE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{t(opt, opt)}</option>
                        ))}
                      </select>
                    </div>

                    {landPreset === "Custom Size" && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                        <div>
                          <div className="lg-field-label">{t("Exact Size Number", "Exact Size Number")}</div>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={customLandSize}
                            onChange={e => setCustomLandSize(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border, #e2e8f0)", fontSize: "15px", background: "#ffffff", color: "#1a1a2e", boxSizing: "border-box" }}
                          />
                        </div>
                        <div>
                          <div className="lg-field-label">{t("Land Unit", "Land Unit")}</div>
                          <select
                            value={landUnit}
                            onChange={e => setLandUnit(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border, #e2e8f0)", fontSize: "15px", background: "#ffffff", color: "#1a1a2e" }}
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
                      <div className="lg-field-label">{t("Farm Holding Type", "Farm Holding Type")}</div>
                      <select
                        value={farmType}
                        onChange={e => setFarmType(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border, #e2e8f0)", fontSize: "15px", background: "#ffffff", color: "#1a1a2e" }}
                      >
                        {FARM_TYPES.map(ft => (
                          <option key={ft} value={ft}>{t(ft, ft)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 4: FARM PROFILE STEP 3 — WATER & IRRIGATION AVAILABILITY */}
              {step === 4 && (
                <>
                  <div className="lg-form-header" style={{ marginBottom: "12px" }}>
                    <div className="lg-form-icon">💧</div>
                    <h2>{t("Water & Irrigation Availability")}</h2>
                    <p>{t("Step 3 of 8: Select all water and irrigation sources")}</p>
                  </div>

                  <div className="lg-form">
                    <div className="lg-field-label">{t("Select All Irrigation & Water Sources", "Select All Irrigation & Water Sources")}</div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
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
                              gap: "8px",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border, #e2e8f0)",
                              background: isSelected ? "rgba(0, 105, 72, 0.12)" : "#ffffff",
                              color: "#1a1a2e",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <span style={{ fontSize: "18px" }}>{src.icon}</span>
                            <span style={{ fontSize: "13px", fontWeight: "600", flex: 1 }}>{t(src.label, src.label)}</span>
                            {isSelected && <Check size={16} color="#006948" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 5: FARM PROFILE STEP 4 — SOIL TYPE IDENTIFICATION */}
              {step === 5 && (
                <>
                  <div className="lg-form-header" style={{ marginBottom: "12px" }}>
                    <div className="lg-form-icon">🌍</div>
                    <h2>{t("Soil Type Identification")}</h2>
                    <p>{t("Step 4 of 8: Choose your farm's predominant soil type")}</p>
                  </div>

                  <div className="lg-form">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="lg-field-label">{t("Select Soil Type", "Select Soil Type")}</div>
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
                      <div style={{ background: "rgba(0, 105, 72, 0.08)", border: "1px solid rgba(0, 105, 72, 0.25)", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "#1a1a2e" }}>
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
                              border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border, #e2e8f0)",
                              background: isSelected ? "rgba(0, 105, 72, 0.12)" : "#ffffff",
                              color: "#1a1a2e",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <strong style={{ fontSize: "14.5px" }}>{t(soil.label, soil.label)}</strong>
                              {isSelected && <Check size={16} color="#006948" />}
                            </div>
                            <span style={{ fontSize: "12.5px", color: "var(--fk-text-sub, #64748b)" }}>{t(soil.desc, soil.desc)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 6: FARM PROFILE STEP 5 — FARMING SEASON & CLIMATE */}
              {step === 6 && (
                <>
                  <div className="lg-form-header" style={{ marginBottom: "12px" }}>
                    <div className="lg-form-icon">📅</div>
                    <h2>{t("Farming Season & Climate")}</h2>
                    <p>{t("Step 5 of 8: Select your current farming season")}</p>
                  </div>

                  <div className="lg-form">
                    <div className="lg-field-label">{t("Current Farming Season", "Current Farming Season")}</div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
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
                              border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border, #e2e8f0)",
                              background: isSelected ? "rgba(0, 105, 72, 0.12)" : "#ffffff",
                              color: "#1a1a2e",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <span style={{ fontSize: "20px" }}>{s.icon}</span>
                            <span style={{ fontSize: "13.5px", fontWeight: "600", flex: 1 }}>{t(s.label, s.label)}</span>
                            {isSelected && <Check size={16} color="#006948" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 7: FARM PROFILE STEP 6 — FARM GOALS & METHOD */}
              {step === 7 && (
                <>
                  <div className="lg-form-header" style={{ marginBottom: "12px" }}>
                    <div className="lg-form-icon">🎯</div>
                    <h2>{t("Farm Goals & Method")}</h2>
                    <p>{t("Step 6 of 8: Define your objectives, method, and livestock")}</p>
                  </div>

                  <div className="lg-form">
                    <div>
                      <div className="lg-field-label">{t("What do you want help with? (Select Goals)", "What do you want help with? (Select Goals)")}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
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
                                border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border, #e2e8f0)",
                                background: isSelected ? "rgba(0, 105, 72, 0.12)" : "#ffffff",
                                color: "#1a1a2e",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.15s ease"
                              }}
                            >
                              <span>{g.icon}</span>
                              <span style={{ fontSize: "12.5px", fontWeight: "600", flex: 1 }}>{t(g.label, g.label)}</span>
                              {isSelected && <Check size={14} color="#006948" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="lg-field-label">{t("Primary Farming Method", "Primary Farming Method")}</div>
                      <select
                        value={farmingMethod}
                        onChange={e => setFarmingMethod(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--fk-border, #e2e8f0)", fontSize: "15px", background: "#ffffff", color: "#1a1a2e" }}
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
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14.5px", fontWeight: "700", color: "#1a1a2e" }}>
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
                                  border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border, #e2e8f0)",
                                  background: isSelected ? "rgba(0, 105, 72, 0.12)" : "#ffffff",
                                  color: isSelected ? "#006948" : "var(--fk-text-sub, #64748b)",
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
                </>
              )}

              {/* STEP 8: FARM PROFILE STEP 7 — REVIEW FARM SUMMARY */}
              {step === 8 && (
                <>
                  <div className="lg-form-header" style={{ marginBottom: "12px" }}>
                    <div className="lg-form-icon">📋</div>
                    <h2>{t("Review Farm Summary")}</h2>
                    <p>{t("Step 7 of 8: Verify your farm details before crop selection")}</p>
                  </div>

                  <div className="lg-form">
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid var(--fk-border, #e2e8f0)",
                      borderRadius: "8px",
                      padding: "16px"
                    }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1a1a2e", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Sprout size={18} color="#006948" /> {t("Farm Profile Summary", "Farm Profile Summary")}
                      </h3>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", fontSize: "13.5px", color: "#1a1a2e" }}>
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

                      <div style={{ marginTop: "14px", padding: "10px 12px", background: "rgba(0, 105, 72, 0.06)", borderRadius: "8px", border: "1px solid rgba(0, 105, 72, 0.2)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#006948", fontWeight: "600" }}>
                        <Sparkles size={16} style={{ flexShrink: 0 }} />
                        <span>{t("All your farm factors are ready! In the next step, AI will recommend the top suited crops for your farm.", "All your farm factors are ready! In the next step, AI will recommend the top suited crops for your farm.")}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 9: FARM PROFILE STEP 8 — AI CROP RECOMMENDATION & SELECTION */}
              {step === 9 && (
                <>
                  <div className="lg-form-header" style={{ marginBottom: "12px" }}>
                    <div className="lg-form-icon"><Sprout size={24} /></div>
                    <h2>{t("AI Crop Recommendation & Selection")}</h2>
                    <p>{t("Step 8 of 8: Choose AI suggested crops or select manually")}</p>
                  </div>

                  <div className="lg-form">
                    {/* Top Choice Header & Dual-Option Cards */}
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid var(--fk-border, #e2e8f0)",
                      borderRadius: "10px",
                      padding: "14px"
                    }}>
                      <div style={{ marginBottom: "12px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1a1a2e", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>🌾</span> {t("Crop Selection", "Crop Selection")} - {t("Choose Either Option or Both", "Choose Either Option or Both")}
                        </h3>
                        <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--fk-text-sub, #64748b)" }}>
                          {t("Select AI suggested crops tailored to your farm inputs, or choose manually from 50+ Indian crops.", "Select AI suggested crops tailored to your farm inputs, or choose manually from 50+ Indian crops.")}
                        </p>
                      </div>

                      {/* 2 Main Choice Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                        {/* Option 1 Card */}
                        <div
                          onClick={() => setCropSelectionTab("ai")}
                          style={{
                            padding: "12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            border: (cropSelectionTab === "ai" || cropSelectionTab === "both")
                              ? "2px solid #006948"
                              : "1.5px solid var(--fk-border, #e2e8f0)",
                            background: cropSelectionTab === "ai"
                              ? "rgba(0, 105, 72, 0.08)"
                              : "#ffffff",
                            boxShadow: cropSelectionTab === "ai" ? "0 4px 12px rgba(0, 105, 72, 0.12)" : "none",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <strong style={{ fontSize: "13px", color: "#006948" }}>
                              🤖 {t("Option 1: AI Suggested Crops", "Option 1: AI Suggested Crops")}
                            </strong>
                            <span style={{ fontSize: "9px", fontWeight: "800", background: "#006948", color: "#fff", padding: "2px 6px", borderRadius: "10px" }}>
                              {t("RECOMMENDED", "RECOMMENDED")}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "11.5px", color: "var(--fk-text-sub, #64748b)", lineHeight: "1.35" }}>
                            {t("Smart crops suggested based on your location, soil type, irrigation, and season.", "Smart crops suggested based on your location, soil type, irrigation, and season.")}
                          </p>
                        </div>

                        {/* Option 2 Card */}
                        <div
                          onClick={() => setCropSelectionTab("manual")}
                          style={{
                            padding: "12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            border: (cropSelectionTab === "manual" || cropSelectionTab === "both")
                              ? "2px solid #2874f0"
                              : "1.5px solid var(--fk-border, #e2e8f0)",
                            background: cropSelectionTab === "manual"
                              ? "rgba(40, 116, 240, 0.08)"
                              : "#ffffff",
                            boxShadow: cropSelectionTab === "manual" ? "0 4px 12px rgba(40, 116, 240, 0.12)" : "none",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <strong style={{ fontSize: "13px", color: "#2874f0" }}>
                              🌾 {t("Option 2: Select Crop Manually", "Option 2: Select Crop Manually")}
                            </strong>
                            <span style={{ fontSize: "9px", fontWeight: "800", background: "#2874f0", color: "#fff", padding: "2px 6px", borderRadius: "10px" }}>
                              {t("50+ CROPS", "50+ CROPS")}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: "11.5px", color: "var(--fk-text-sub, #64748b)", lineHeight: "1.35" }}>
                            {t("Search, filter, and pick any crop manually from Cereals, Pulses, Vegetables, Fruits, Cash Crops.", "Search, filter, and pick any crop manually from Cereals, Pulses, Vegetables, Fruits, Cash Crops.")}
                          </p>
                        </div>
                      </div>

                      {/* Tab Switcher Pills */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => setCropSelectionTab("ai")}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "16px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            background: cropSelectionTab === "ai" ? "#006948" : "transparent",
                            color: cropSelectionTab === "ai" ? "#ffffff" : "#1a1a2e",
                            border: "1px solid " + (cropSelectionTab === "ai" ? "#006948" : "var(--fk-border, #e2e8f0)")
                          }}
                        >
                          🤖 {t("Option 1: AI Suggestions", "Option 1: AI Suggestions")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropSelectionTab("manual")}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "16px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            background: cropSelectionTab === "manual" ? "#2874f0" : "transparent",
                            color: cropSelectionTab === "manual" ? "#ffffff" : "#1a1a2e",
                            border: "1px solid " + (cropSelectionTab === "manual" ? "#2874f0" : "var(--fk-border, #e2e8f0)")
                          }}
                        >
                          🌾 {t("Option 2: Manual Selection", "Option 2: Manual Selection")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropSelectionTab("both")}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "16px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            cursor: "pointer",
                            background: cropSelectionTab === "both" ? "#ff9f00" : "transparent",
                            color: cropSelectionTab === "both" ? "#1f2937" : "#1a1a2e",
                            border: "1px solid " + (cropSelectionTab === "both" ? "#ff9f00" : "var(--fk-border, #e2e8f0)")
                          }}
                        >
                          ✨ {t("Show Both Options", "Show Both Options")}
                        </button>
                      </div>
                    </div>

                    {/* SECTION 1: AI SUGGESTED CROPS */}
                    {(cropSelectionTab === "ai" || cropSelectionTab === "both") && (
                      <div style={{
                        background: "linear-gradient(135deg, rgba(0, 105, 72, 0.08) 0%, rgba(40, 116, 240, 0.06) 100%)",
                        border: "1.5px solid rgba(0, 105, 72, 0.25)",
                        borderRadius: "10px",
                        padding: "14px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                          <div>
                            <h4 style={{ fontSize: "14.5px", fontWeight: "800", color: "#006948", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                              <Sparkles size={16} /> {t("AI Recommended Crops for Your Farm", "AI Recommended Crops for Your Farm")}
                            </h4>
                            <div style={{ fontSize: "11.5px", color: "#1a1a2e", marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
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
                          <span style={{ fontSize: "10px", fontWeight: "800", background: "#006948", color: "#ffffff", padding: "2px 8px", borderRadius: "10px" }}>
                            AI AGRO-ENGINE
                          </span>
                        </div>

                        {/* Recommended Crop Cards Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
                          {recommendedCrops.map(rec => {
                            const isSelected = crops.some(c => c.name === rec.name || c.id === rec.id);
                            return (
                              <div
                                key={rec.id}
                                style={{
                                  background: isSelected ? "rgba(0, 105, 72, 0.12)" : "#ffffff",
                                  border: isSelected ? "2px solid #006948" : "1px solid var(--fk-border, #e2e8f0)",
                                  borderRadius: "8px",
                                  padding: "10px",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  gap: "6px",
                                  transition: "all 0.2s ease"
                                }}
                              >
                                <div>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                      <span style={{ fontSize: "22px" }}>{rec.icon}</span>
                                      <div>
                                        <strong style={{ fontSize: "13.5px", color: "#1a1a2e" }}>{t(rec.name, rec.name)}</strong>
                                        <div style={{ fontSize: "11px", color: "var(--fk-text-sub, #64748b)" }}>{t(rec.yieldAcre, rec.yieldAcre)}</div>
                                      </div>
                                    </div>
                                    <span style={{
                                      fontSize: "10px",
                                      fontWeight: "800",
                                      background: rec.matchPercent >= 90 ? "#ecfdf5" : "#eff6ff",
                                      color: rec.matchPercent >= 90 ? "#047857" : "#1d4ed8",
                                      border: rec.matchPercent >= 90 ? "1px solid #10b981" : "1px solid #3b82f6",
                                      padding: "1px 5px",
                                      borderRadius: "8px"
                                    }}>
                                      {rec.matchPercent}% {t("Match", "Match")}
                                    </span>
                                  </div>

                                  <p style={{ fontSize: "11.5px", color: "var(--fk-text-sub, #64748b)", marginTop: "6px", marginBottom: "4px", lineHeight: "1.3" }}>
                                    {t(rec.why, rec.why)}
                                  </p>
                                  <div style={{ fontSize: "11.5px", color: "#006948", fontWeight: "700" }}>
                                    💰 {t("Est. Net Profit", "Est. Net Profit")}: ₹{rec.netProfit.toLocaleString()} ({numericLandSizeAcres()} {t("Acres", "Acres")})
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSelectRecommendedCrop(rec)}
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "5px",
                                    border: isSelected ? "1px solid #006948" : "1px solid #d1d5db",
                                    background: isSelected ? "#006948" : "#ffffff",
                                    color: isSelected ? "#ffffff" : "#1f2937",
                                    transition: "all 0.15s ease"
                                  }}
                                >
                                  {isSelected ? <Check size={13} /> : null}
                                  {isSelected ? t("Selected", "Selected") : `+ ${t("Select This Crop", "Select This Crop")}`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: MANUAL CROP SELECTION */}
                    {(cropSelectionTab === "manual" || cropSelectionTab === "both") && (
                      <div style={{
                        background: "#ffffff",
                        border: "1.5px solid rgba(40, 116, 240, 0.25)",
                        borderRadius: "10px",
                        padding: "14px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                          <div>
                            <h4 style={{ fontSize: "14.5px", fontWeight: "800", color: "#2874f0", display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
                              <Search size={16} /> {t("Option 2: Select Crop Manually", "Option 2: Select Crop Manually")}
                            </h4>
                            <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "var(--fk-text-sub, #64748b)" }}>
                              {t("Search, filter, and pick any crop manually from Cereals, Pulses, Vegetables, Fruits, Cash Crops.", "Search, filter, and pick any crop manually from Cereals, Pulses, Vegetables, Fruits, Cash Crops.")}
                            </p>
                          </div>
                          <span style={{ fontSize: "10px", fontWeight: "800", background: "#2874f0", color: "#ffffff", padding: "2px 8px", borderRadius: "10px" }}>
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

                    {/* SELECTED CROPS TRAY (Always Visible at bottom of Step 9) */}
                    <div style={{
                      background: "#ffffff",
                      border: "1px solid var(--fk-border, #e2e8f0)",
                      borderRadius: "10px",
                      padding: "12px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "4px" }}>
                        <span style={{ fontSize: "12.5px", fontWeight: "800", color: "#006948", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>🌾</span> {t("Selected Crops for Your Farm", "Selected Crops for Your Farm")} ({crops.length})
                        </span>
                        {crops.length > 0 && (
                          <span style={{ fontSize: "11.5px", color: "var(--fk-text-sub, #64748b)", fontWeight: "600" }}>
                            {t("Total Farm Area", "Total Farm Area")}: {numericLandSizeAcres()} {t("Acres", "Acres")}
                          </span>
                        )}
                      </div>

                      {crops.length === 0 ? (
                        <div style={{
                          padding: "10px",
                          background: "#fef3c7",
                          border: "1px solid #f59e0b",
                          borderRadius: "8px",
                          color: "#92400e",
                          fontSize: "12.5px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <span>⚠️</span>
                          <span>{t("Please select at least one crop from AI recommendations or manual selection to finish.", "Please select at least one crop from AI recommendations or manual selection to finish.")}</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {crops.map(c => (
                            <span key={c.name} style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "5px 10px",
                              borderRadius: "16px",
                              background: c.isPrimary ? "rgba(0, 105, 72, 0.15)" : "rgba(0,0,0,0.04)",
                              border: c.isPrimary ? "1.5px solid #006948" : "1px solid var(--fk-border, #e2e8f0)",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#1a1a2e"
                            }}>
                              <span style={{ fontSize: "15px" }}>{c.icon}</span>
                              <span>{t(c.name, c.name)}</span>
                              {c.area ? <span style={{ fontSize: "11px", color: "var(--fk-text-sub, #64748b)" }}>({c.area} {t("Acres", "Acres")})</span> : null}
                              {c.isPrimary && <span style={{ fontSize: "10px", fontWeight: "800", color: "#006948" }}>({t("PRIMARY", "PRIMARY")})</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* NAVIGATION BUTTONS FOR FARM PROFILE STEPS (STEPS 2 TO 9) */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--fk-border, #e2e8f0)" }}>
                <button
                  type="button"
                  className="lg-btn-outline"
                  onClick={handleStepPrev}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  <ArrowLeft size={15} /> {t("Back")}
                </button>

                {step < 9 ? (
                  <button
                    type="button"
                    className="lg-btn-primary"
                    onClick={handleStepNext}
                    style={{ flex: 2 }}
                  >
                    {t("Continue")} <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    id="btn-register-submit"
                    className="lg-btn-primary"
                    onClick={handleRegister}
                    disabled={loading || crops.length === 0}
                    style={{ flex: 2 }}
                  >
                    {loading ? <><Loader2 size={16} className="spin" /> {t("Creating Account...")}</> : <>{t("Create Account")} <CheckCircle size={16} /></>}
                  </button>
                )}
              </div>

            </div>
          )}

          {/* LOGIN */}
          {mode === "login" && (
            <>
              <div className="lg-form-header">
                <div className="lg-form-icon"><Sprout size={24} /></div>
                <h2>{t("Welcome Back")}</h2>
                <p>{t("Sign in with your Email or Mobile Number")}</p>
              </div>
              <form onSubmit={handleLogin} className="lg-form">
                <div className="lg-input-group">
                  <User size={17} className="lg-input-icon" />
                  <input
                    id="login-identifier"
                    type="text" placeholder={t("Email, Mobile (+91), or Full Name")}
                    value={formData.identifier}
                    onChange={e => set("identifier", e.target.value)}
                    required autoFocus
                    autoComplete="username"
                  />
                </div>
                <div className="lg-input-group">
                  <Lock size={17} className="lg-input-icon" />
                  <input
                    id="login-password"
                    type={showPwd ? "text" : "password"}
                    placeholder={t("Password")}
                    value={formData.password}
                    onChange={e => set("password", e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="lg-eye-btn" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="lg-login-extras">
                  <button
                    type="button"
                    className="lg-text-btn"
                    onClick={() => switchMode("forgot")}
                  >
                    <HelpCircle size={13} /> {t("Forgot password?")}
                  </button>
                </div>

                <button
                  type="submit"
                  className="lg-btn-primary"
                  disabled={loading || !formData.identifier?.trim() || !formData.password?.trim()}
                >
                  {loading
                    ? <><Loader2 size={16} className="spin" /> {t("Signing in...")}</>
                    : <>{t("Sign In")} <ArrowRight size={16} /></>
                  }
                </button>
              </form>

              <div className="lg-footer-link">
                <span>{t("New to Sampoorn Kisan AI?")}</span>
                <button onClick={() => switchMode("register")} className="lg-text-btn">
                  {t("Create Free Account")} <ArrowRight size={13} />
                </button>
              </div>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              className="lg-text-btn"
              style={{ fontSize: 13, color: "#637068" }}
              onClick={() => setIsSupportOpen(true)}
            >
              <HelpCircle size={12} /> {t("Need support?")}
            </button>
          </div>
        </div>
      </div>

      {isSupportOpen && <SupportModal onClose={() => setIsSupportOpen(false)} />}
    </div>
  );
}
