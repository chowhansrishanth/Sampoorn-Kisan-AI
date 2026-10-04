import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, Sprout, Globe, ArrowLeft, RefreshCw, Copy, Check, Trash2, RotateCcw, AlertTriangle, Mic, MicOff, Volume2, VolumeX, Printer } from "lucide-react";

// ─── Language → BCP-47 locale mapping for STT & TTS ──────────────────────────
const LANG_LOCALE = {
  EN: "en-IN",
  TE: "te-IN",
  HI: "hi-IN",
  TA: "ta-IN",
  KN: "kn-IN",
  MR: "mr-IN",
  PA: "pa-IN",
};

// Get or generate a persistent unique session ID for memory isolation
function getOrGenerateSessionId(userId) {
  if (userId) return `user_${userId}`;
  try {
    let sid = localStorage.getItem("sampoorn_ai_session_id");
    if (!sid) {
      sid = "session_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      localStorage.setItem("sampoorn_ai_session_id", sid);
    }
    return sid;
  } catch {
    return "session_" + Date.now();
  }
}

export default function AIChat({ user }) {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [lang, setLang] = useState("EN");
  const [activeAgent, setActiveAgent] = useState("Sahayak AI");
  const [structuredMemory, setStructuredMemory] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [sessionId] = useState(() => getOrGenerateSessionId(user?._id || user?.id));
  
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      agent: "Sahayak AI",
      text: "Namaste! 🙏 I am **Sahayak AI**, your intelligent knowledge-grounded agricultural assistant. How can I assist you with your crops, weather, soil, or government schemes today?"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Orchestrating Knowledge Agents...");
  const [lastFailedQuery, setLastFailedQuery] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  // ── Voice Input (STT) state ──────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [sttSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const recognitionRef = useRef(null);
  const interimTranscriptRef = useRef("");

  // ── Text-to-Speech (TTS) state ───────────────────────────────────────────
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [ttsSupported] = useState(() => typeof window !== "undefined" && !!window.speechSynthesis);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceToBottom < 120;
  };

  const scrollToBottom = (force = false) => {
    if (force || isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, loading]);

  const toastTimerRef = useRef(null);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      // Clean up any active STT / TTS on unmount
      if (recognitionRef.current) recognitionRef.current.abort();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // ── STT: Start recording ─────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!sttSupported || isListening) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_LOCALE[lang] || "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      interimTranscriptRef.current = interim;
      setMessage((prev) => {
        // Replace interim portion at end of input, keep any prior typed text
        const base = prev.replace(interimTranscriptRef.current, "").trimEnd();
        return final ? (base ? base + " " + final : final).trim() : (base ? base + " " + interim : interim);
      });
    };

    recognition.onerror = (e) => {
      console.warn("STT error:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      interimTranscriptRef.current = "";
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [sttSupported, isListening, lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // ── TTS: Speak AI response ────────────────────────────────────────────────
  const speakText = useCallback((text, index) => {
    if (!ttsSupported || !ttsEnabled) return;
    window.speechSynthesis.cancel();

    // Strip markdown for cleaner TTS
    const plain = text
      .replace(/[#*`~>_|]+/g, "")
      .replace(/\n+/g, ". ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .substring(0, 1000);

    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.lang = LANG_LOCALE[lang] || "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Try to pick an Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const locale = LANG_LOCALE[lang] || "en-IN";
    const preferred = voices.find(v => v.lang === locale) ||
                      voices.find(v => v.lang.startsWith(locale.split("-")[0])) ||
                      voices.find(v => v.lang.includes("IN"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    window.speechSynthesis.speak(utterance);
  }, [ttsSupported, ttsEnabled, lang]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingIndex(null);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showToast("Response copied to clipboard!");
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async (textToSend = message) => {
    const query = (typeof textToSend === "string" ? textToSend : message).trim();
    if (!query || loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const isMarketQuery = /(mandi|market|price|prices|rate|rates|msp|apmc|sell|selling|cost|tomato|cotton|paddy|wheat|ధర|మండి|भाव|मंडी)/i.test(query);
    const isWeatherQuery = /(weather|rain|rainfall|monsoon|irrigation|water|temperature)/i.test(query);
    const isDiseaseQuery = /(disease|pest|leaf|spot|blight|yellowing|spray|dosage|insect)/i.test(query);

    let statusText = "Orchestrating Knowledge Agents...";
    if (isMarketQuery) statusText = "Retrieving verified APMC Mandi prices...";
    else if (isWeatherQuery) statusText = "Checking real-time weather & irrigation radar...";
    else if (isDiseaseQuery) statusText = "Analyzing crop pathology & CIBRC guidelines...";

    setLoadingStatus(statusText);
    setLastFailedQuery(null);

    const currentHistory = [...messages];
    setMessages(prev => [...prev, { sender: "user", text: query }]);
    setMessage("");
    setLoading(true);
    setTimeout(() => scrollToBottom(true), 30);

    try {
      const res = await axios.post(
        "/api/ai/chat", 
        { 
          message: query, 
          language: lang, 
          history: currentHistory, 
          sessionId,
          userId: user?._id || user?.id
        },
        { 
          timeout: 15000,
          signal: abortControllerRef.current.signal
        }
      );

      if (res.data && res.data.success) {
        setActiveAgent(res.data.agent || "Sahayak AI");
        if (res.data.structured_memory) {
          setStructuredMemory(res.data.structured_memory);
        }
        setMessages(prev => {
          const next = [
            ...prev,
            {
              sender: "bot",
              agent: res.data.agent || "Sahayak AI",
              text: res.data.response,
              sources: res.data.sources || [],
              confidence: res.data.confidence
            }
          ];
          if (ttsSupported && ttsEnabled) {
            speakText(res.data.response, next.length - 1);
          }
          return next;
        });
      } else {
        throw new Error(res.data.error?.message || res.data.error || "Failed to process message");
      }
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError" || err.name === "AbortError") {
        return; // aborted gracefully
      }
      console.warn("AI Service error:", err.message);
      setLastFailedQuery(query);
      setActiveAgent("Sahayak AI (Service Alert)");
      
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          agent: "Sahayak AI",
          isError: true,
          text: "AI service is temporarily unavailable. Please try again.",
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL query parameter auto-send if present
  useEffect(() => {
    const urlQuery = searchParams.get("query");
    if (urlQuery && urlQuery.trim()) {
      const timer = setTimeout(() => {
        handleSend(urlQuery.trim());
        try {
          window.history.replaceState(null, "", window.location.pathname);
        } catch {
          // ignore in unsupported contexts
        }
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleRetryLast = () => {
    if (lastFailedQuery) {
      // Remove the last error bot message before retrying
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].isError) {
          updated.pop();
        }
        if (updated.length > 0 && updated[updated.length - 1].sender === "user") {
          updated.pop();
        }
        return updated;
      });
      handleSend(lastFailedQuery);
    } else {
      const userMsgs = messages.filter(m => m.sender === "user");
      if (userMsgs.length > 0) {
        const lastUserMsg = userMsgs[userMsgs.length - 1].text;
        handleSend(lastUserMsg);
      }
    }
  };

  const handleClearMemory = async () => {
    try {
      await axios.delete(`/api/ai/memory/${sessionId}`);
    } catch {
      // Offline fallback
    }
    setStructuredMemory(null);
    setMessages([
      {
        sender: "bot",
        agent: "Sahayak AI",
        text: "Conversation context and farmer profile memory reset. 🙏 How can I assist you with your farming today?"
      }
    ]);
    showToast("Chat context reset successfully.");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Memory Pills
  const memoryPills = structuredMemory ? [
    structuredMemory.location ? `📍 ${structuredMemory.location}` : null,
    structuredMemory.soil_type ? `🌱 ${structuredMemory.soil_type}` : null,
    structuredMemory.season ? `🗓️ ${structuredMemory.season}` : null,
    structuredMemory.water_availability ? `💧 ${structuredMemory.water_availability}` : null,
    structuredMemory.current_crop ? `🌾 ${structuredMemory.current_crop}` : null
  ].filter(Boolean) : [];

  return (
    <div className="chat-page" style={{ position: 'relative' }}>
      {/* Toast Notification Floating Pill */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#16a34a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '14px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} /> {toastMessage}
        </div>
      )}

      <header className="chat-header">
        <button className="back-button" onClick={() => window.history.back()}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="chat-brand">
          <div className="chat-logo" style={{ background: '#22c55e' }}>
            <Sprout size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Sahayak AI Expert</h2>
            <span className="agent-badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>{activeAgent} Active</span>
          </div>
        </div>

        <div className="chat-header-actions" style={{ gap: '8px' }}>
          <button className="lang-toggle" onClick={handleClearMemory} title="Clear Conversation History">
            <Trash2 size={14} /> <span>Clear</span>
          </button>
          <button className="lang-toggle" onClick={() => setLang(lang === "EN" ? "TE" : lang === "TE" ? "HI" : "EN")}>
            <Globe size={16} /> <span>{lang === "EN" ? "English" : lang === "TE" ? "తెలుగు" : "हिंदी"}</span>
          </button>
          {ttsSupported && (
            <button
              className="lang-toggle"
              onClick={() => { setTtsEnabled(v => !v); if (!ttsEnabled) stopSpeaking(); }}
              title={ttsEnabled ? "Mute AI Voice" : "Enable AI Voice"}
              style={{ color: ttsEnabled ? '#22c55e' : '#64748b' }}
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{ttsEnabled ? "Voice On" : "Voice Off"}</span>
            </button>
          )}
          <button 
            className="lang-toggle" 
            onClick={() => window.print()} 
            title="Print or Save Consultation as PDF"
            style={{ color: '#38bdf8' }}
          >
            <Printer size={14} /> <span>Print</span>
          </button>
          <div className="online-status"><span className="dot" style={{ background: '#22c55e' }}></span> Online</div>
        </div>
      </header>

      {/* SPECIALIST PERSONA SELECTOR */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '8px 16px',
        background: 'var(--fk-card, #0f172a)',
        borderBottom: '1px solid var(--fk-border, #334155)',
        overflowX: 'auto',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--fk-text-sub, #94a3b8)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Specialist:
        </span>
        {[
          { id: "Sahayak Agronomist", label: "🌾 Agronomist" },
          { id: "Mandi Market Broker", label: "📈 Mandi Broker" },
          { id: "Pashu Chikitsak Vet", label: "🐄 Livestock Vet" },
          { id: "Kisan Yojana Officer", label: "🏛️ Scheme Officer" }
        ].map((p) => {
          const isAct = activeAgent === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setActiveAgent(p.id);
                showToast(`Switched to ${p.id}`);
              }}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                border: isAct ? '1px solid #22c55e' : '1px solid var(--fk-border, #334155)',
                background: isAct ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                color: isAct ? '#4ade80' : 'var(--fk-text, #cbd5e1)',
                fontSize: '13px',
                fontWeight: isAct ? 800 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* EXTRACTED FARMER CONTEXT MEMORY BAR */}
      {memoryPills.length > 0 && (
        <div style={{
          backgroundColor: '#064e3b',
          color: '#a7f3d0',
          padding: '8px 16px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ fontWeight: '700', color: '#ffffff' }}>📌 Active Context Memory:</span>
          {memoryPills.map((pill, i) => (
            <span key={i} style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {pill}
            </span>
          ))}
        </div>
      )}

      <main className="chat-container">
        <div className="messages-container" ref={messagesContainerRef} onScroll={handleScroll}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.sender}`}>
              <div className="message-avatar" style={{ background: msg.isError ? '#ef4444' : msg.sender === "bot" ? '#16a34a' : '#0f172a' }}>
                {msg.isError ? <AlertTriangle size={18} color="#ffffff" /> : msg.sender === "bot" ? <Bot size={18} color="#ffffff" /> : <User size={18} color="#ffffff" />}
              </div>
              <div className="message-bubble" style={{ position: 'relative', border: msg.isError ? '1px solid #fca5a5' : undefined }}>
                {msg.sender === "bot" && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div className="msg-agent-tag" style={{ color: msg.isError ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                      <Sprout size={12}/> {msg.agent}
                    </div>
                    {!msg.isError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {ttsSupported && ttsEnabled && (
                        <button
                          onClick={() => speakingIndex === idx ? stopSpeaking() : speakText(msg.text, idx)}
                          style={{ background: 'none', border: 'none', color: speakingIndex === idx ? '#22c55e' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                          title={speakingIndex === idx ? "Stop speaking" : "Speak response"}
                        >
                          {speakingIndex === idx
                            ? <VolumeX size={13} style={{ color: '#22c55e' }} />
                            : <Volume2 size={13} />}
                        </button>
                      )}
                      <button 
                        onClick={() => handleCopy(msg.text, idx)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                        title="Copy response"
                      >
                        {copiedIndex === idx ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                        {copiedIndex === idx ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}
                  </div>
                )}
                
                {msg.isError ? (
                  <div>
                    <p style={{ color: '#b91c1c', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {msg.text}
                    </p>
                    <button
                      onClick={handleRetryLast}
                      style={{
                        marginTop: '10px',
                        background: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <RotateCcw size={13} /> Retry
                    </button>
                  </div>
                ) : msg.sender === "bot" ? (
                  <>
                    <ReactMarkdown
                      components={{
                        table: ({ ...props }) => (
                          <div style={{ overflowX: 'auto', margin: '12px 0', borderRadius: '8px', border: '1px solid var(--fk-border)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }} {...props} />
                          </div>
                        ),
                        th: ({ ...props }) => (
                          <th style={{ background: 'var(--primary-surface)', color: 'var(--primary-light)', borderBottom: '1px solid var(--fk-border)', padding: '8px 12px', textAlign: 'left', fontWeight: 700 }} {...props} />
                        ),
                        td: ({ ...props }) => (
                          <td style={{ borderBottom: '1px solid var(--fk-border)', padding: '8px 12px' }} {...props} />
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '12px', margin: '10px 0', color: 'var(--fk-text-sub)', fontStyle: 'italic' }} {...props} />
                        )
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                    {msg.sources && msg.sources.length > 0 ? (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--fk-border)', fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🛡️ <strong>Data Trust Layer:</strong> Grounded in {msg.sources.join(" | ")}</span>
                      </div>
                    ) : (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--fk-border)', fontSize: '12px', color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⚠️ <strong>Data Trust Notice:</strong> General agronomic advice; verify with local KVK before chemical application.</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row bot">
              <div className="message-avatar" style={{ background: '#16a34a' }}><Bot size={18} color="#ffffff" /></div>
              <div className="message-bubble loading-bubble">
                <RefreshCw size={16} className="spin" style={{ color: '#16a34a' }} /> {loadingStatus}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED PROMPTS */}
        <div className="suggestions">
          <button onClick={() => handleSend(lang === "TE" ? "నేను తెలంగాణ నుండి వచ్చాను. నాకు నల్ల నేల, తక్కువ నీరు ఉంది. ఖరీఫ్‌లో ఏ పంట మంచిది?" : lang === "HI" ? "मैं तेलंगाना से हूँ। मेरे पास काली मिट्टी और कम पानी है। खरीफ में कौन सी फसल सबसे अच्छी है?" : "I am from Telangana. I have black soil, limited water, and want to grow a Kharif crop. Which crop is best?")}>
            🌾 {lang === "TE" ? "తెలంగాణ నల్ల నేల పంటలు" : lang === "HI" ? "काली मिट्टी फसल सलाह" : "Telangana Black Soil Advice"}
          </button>
          <button onClick={() => handleSend(lang === "TE" ? "పత్తి గులాబీ రంగు పురుగు నివారణకు మందుల మోతాదు ఎంత?" : lang === "HI" ? "कपास गुलाबी सुंडी की दवा की खुराक क्या है?" : "What is the spray dosage for pink bollworm in cotton?")}>
            🐛 {lang === "TE" ? "పత్తి పురుగుల నివారణ" : lang === "HI" ? "गुलाबी सुंडी स्प्रे खुराक" : "Pink Bollworm Spray Dosage"}
          </button>
          <button onClick={() => handleSend(lang === "TE" ? "ఈరోజు పెసర్లు మరియు పత్తి మండి మద్దతు ధరలు (MSP) ఎంత?" : lang === "HI" ? "मूंग और कपास का आज का मंडी भाव (MSP) क्या है?" : "What is today's MSP price for Moong and Cotton?")}>
            📈 {lang === "TE" ? "పెసర్లు & పత్తి MSP" : lang === "HI" ? "मूंग व कपास MSP" : "Moong & Cotton MSP"}
          </button>
          <button onClick={() => handleSend(lang === "TE" ? "PMKSY డ్రిప్ ప్రాజెక్ట్ పై 90% సబ్సిడీ వివరాలు" : lang === "HI" ? "PMKSY ड्रिप 90% सब्सिडी विवरण" : "How to get 90% drip subsidy under PMKSY?")}>
            🏛️ {lang === "TE" ? "డ్రిప్ 90% సబ్సిడీ" : lang === "HI" ? "ड्रिप 90% सब्सिडी" : "PMKSY Drip Subsidy"}
          </button>
        </div>

        {/* INPUT BAR */}
        <div className="chat-input-container">
          <input
            type="text"
            placeholder={
              isListening
                ? (lang === "TE" ? "🎤 వింటున్నాను..." : lang === "HI" ? "🎤 सुन रहा हूँ..." : "🎤 Listening...")
                : (lang === "TE" ? "వ్యవసాయం గురించి సహయాక్ AIని ఏదైనా అడగండి..." : lang === "HI" ? "कृषि के बारे में सहायक AI से कुछ भी पूछें..." : "Ask Sahayak anything about farming...")
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {/* Microphone Button */}
          {sttSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              title={isListening ? "Stop Recording" : "Speak your question"}
              style={{
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                padding: 0,
                justifyContent: 'center',
                background: isListening ? '#dc2626' : 'var(--fk-card, #1e293b)',
                border: isListening ? 'none' : '1px solid var(--fk-border, #334155)',
                color: isListening ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                animation: isListening ? 'pulse-mic 1.4s ease-in-out infinite' : 'none',
              }}
            >
              {isListening ? <MicOff size={17} /> : <Mic size={17} />}
            </button>
          )}
          <button 
            className="send-button" 
            onClick={() => handleSend()} 
            disabled={loading || !message.trim()} 
            style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0, justifyContent: 'center', background: '#16a34a', flexShrink: 0 }}
          >
            <Send size={18} color="#ffffff" />
          </button>
        </div>
        <p className="ai-disclaimer">
          Sahayak AI provides knowledge-grounded agricultural decision support verified against ICAR & CIBRC guidelines.
        </p>
      </main>
    </div>
  );
}