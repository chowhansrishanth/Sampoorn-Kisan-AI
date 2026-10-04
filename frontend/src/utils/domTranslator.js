/**
 * Real-Time DOM Translation Engine for Sampoorn Kisan AI
 * 
 * Translates all pages, segments, tabs, cards, headers, buttons, placeholders,
 * and dynamic components in real-time when the user switches languages.
 * 
 * React 19 safe: Manipulates TextNode.nodeValue directly without replacing DOM nodes
 * or inserting foreign elements, preventing virtual DOM reconciliation crashes.
 */

import { lookupTranslation, translateCompoundText, SUPPORTED_LANGUAGES } from "../data/multilingualDictionary";

class DOMTranslator {
  constructor() {
    this.currentLang = "EN";
    this.observer = null;
    this.isTranslating = false;
    this.pendingNodes = new Set();
    this.rafId = null;
    this.initialized = false;
  }

  /**
   * Initialize translator with initial language and mount mutation observer
   */
  init(initialLang = "EN") {
    if (typeof window === "undefined") return;
    this.currentLang = initialLang;

    if (!this.initialized) {
      this.initialized = true;
      this.setupObserver();
      this.setupNavigationListener();
    }

    if (this.currentLang !== "EN") {
      this.translatePage();
    }
  }

  /**
   * Set target language and translate or revert DOM
   */
  setLanguage(langCode) {
    if (!langCode || this.currentLang === langCode) return;
    const prevLang = this.currentLang;
    this.currentLang = langCode;

    if (typeof document !== "undefined") {
      document.documentElement.lang = langCode.toLowerCase();
    }

    if (langCode === "EN") {
      this.revertToEnglish();
    } else {
      // Revert first if changing between two non-English languages to reset source English text
      if (prevLang !== "EN") {
        this.revertToEnglish();
      }
      this.translatePage();
    }
  }

  /**
   * Observe DOM mutations for dynamically mounted pages, tabs, and segments
   */
  setupObserver() {
    if (typeof window === "undefined" || !window.MutationObserver) return;

    this.observer = new MutationObserver((mutations) => {
      if (this.isTranslating || this.currentLang === "EN") return;

      let hasAddedNodes = false;

      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              this.pendingNodes.add(node);
              hasAddedNodes = true;
            }
          }
        } else if (mutation.type === "characterData") {
          const textNode = mutation.target;
          if (textNode._lastTranslatedValue !== textNode.nodeValue) {
            // Text was modified by React or user action, record new English baseline
            textNode._origText = textNode.nodeValue;
            this.pendingNodes.add(textNode);
            hasAddedNodes = true;
          }
        }
      }

      if (hasAddedNodes) {
        this.scheduleBatchTranslation();
      }
    });

    const rootTarget = document.getElementById("root") || document.body;
    if (rootTarget) {
      this.observer.observe(rootTarget, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  /**
   * Listen to URL / page changes to translate new routes
   */
  setupNavigationListener() {
    if (typeof window === "undefined") return;

    const handleRouteChange = () => {
      if (this.currentLang !== "EN") {
        setTimeout(() => this.translatePage(), 60);
      }
    };

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);
  }

  /**
   * Schedule batched translation with requestAnimationFrame
   */
  scheduleBatchTranslation() {
    if (this.rafId) cancelAnimationFrame(this.rafId);

    this.rafId = requestAnimationFrame(() => {
      this.isTranslating = true;
      try {
        for (const node of this.pendingNodes) {
          if (node.parentNode) {
            this.translateNode(node);
          }
        }
        this.pendingNodes.clear();
      } finally {
        this.isTranslating = false;
      }
    });
  }

  /**
   * Full page translation sweep
   */
  translatePage() {
    if (typeof document === "undefined" || this.currentLang === "EN") return;

    const root = document.getElementById("root") || document.body;
    if (!root) return;

    this.isTranslating = true;
    try {
      this.translateNode(root);
    } finally {
      this.isTranslating = false;
    }
  }

  /**
   * Check if element should be skipped from translation
   */
  shouldSkip(node) {
    if (!node) return true;

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "SVG" || tag === "CODE" || tag === "PRE" || tag === "NOSCRIPT") {
        return true;
      }
      if (node.classList && (node.classList.contains("notranslate") || node.classList.contains("no-translate") || node.classList.contains("lucide"))) {
        return true;
      }
      if (tag === "INPUT" && (node.type === "password" || node.type === "number")) {
        return true;
      }
    }

    if (node.parentNode && node.parentNode.nodeType === Node.ELEMENT_NODE) {
      const pTag = node.parentNode.tagName;
      if (pTag === "SCRIPT" || pTag === "STYLE" || pTag === "SVG" || pTag === "CODE" || pTag === "PRE") {
        return true;
      }
      if (node.parentNode.classList && (node.parentNode.classList.contains("notranslate") || node.parentNode.classList.contains("lucide"))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Translate a node and its descendants
   */
  translateNode(rootNode) {
    if (this.shouldSkip(rootNode)) return;

    // 1. If it's a TextNode, translate its content
    if (rootNode.nodeType === Node.TEXT_NODE) {
      this.translateTextNode(rootNode);
      return;
    }

    // 2. If it's an element, check attributes
    if (rootNode.nodeType === Node.ELEMENT_NODE) {
      this.translateAttributes(rootNode);

      // 3. Traverse child text nodes safely
      const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (n) => {
            if (this.shouldSkip(n)) return NodeFilter.FILTER_REJECT;
            const text = n.nodeValue ? n.nodeValue.trim() : "";
            if (!text || text.length === 0) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let textNode;
      while ((textNode = walker.nextNode())) {
        this.translateTextNode(textNode);
      }

      // Also check attributes on child inputs/buttons
      const inputs = rootNode.querySelectorAll("input, textarea, select, button, [title], [aria-label]");
      for (let i = 0; i < inputs.length; i++) {
        this.translateAttributes(inputs[i]);
      }
    }
  }

  /**
   * Translate a single text node
   */
  translateTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;

    // Save original English baseline once
    if (node._origText === undefined) {
      node._origText = node.nodeValue;
    }

    const original = node._origText;
    if (!original || !original.trim()) return;

    // Preserve leading and trailing spaces
    const match = original.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match) return;

    const leadingSpace = match[1];
    const trimmed = match[2];
    const trailingSpace = match[3];

    // Avoid translating pure numbers, code, or special symbols
    if (/^[0-9.,₹$%°\-_/+()#@!*&|\\/:;<=>?^~]+$/.test(trimmed)) {
      return;
    }

    const translated = lookupTranslation(trimmed, this.currentLang) ||
                       translateCompoundText(trimmed, this.currentLang);

    if (translated && translated !== trimmed) {
      const finalValue = leadingSpace + translated + trailingSpace;
      node._lastTranslatedValue = finalValue;
      node.nodeValue = finalValue;
    }
  }

  /**
   * Translate attributes (placeholder, title, aria-label)
   */
  translateAttributes(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;

    // Placeholder
    if (el.placeholder) {
      if (el._origPlaceholder === undefined) el._origPlaceholder = el.placeholder;
      const trans = lookupTranslation(el._origPlaceholder, this.currentLang) ||
                    translateCompoundText(el._origPlaceholder, this.currentLang);
      if (trans) el.placeholder = trans;
    }

    // Title attribute
    if (el.title) {
      if (el._origTitle === undefined) el._origTitle = el.title;
      const trans = lookupTranslation(el._origTitle, this.currentLang) ||
                    translateCompoundText(el._origTitle, this.currentLang);
      if (trans) el.title = trans;
    }

    // Aria label
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) {
      if (el._origAriaLabel === undefined) el._origAriaLabel = ariaLabel;
      const trans = lookupTranslation(el._origAriaLabel, this.currentLang) ||
                    translateCompoundText(el._origAriaLabel, this.currentLang);
      if (trans) el.setAttribute("aria-label", trans);
    }
  }

  /**
   * Revert all text nodes and attributes to their original English strings
   */
  revertToEnglish() {
    if (typeof document === "undefined") return;

    const root = document.getElementById("root") || document.body;
    if (!root) return;

    this.isTranslating = true;
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        if (node._origText !== undefined) {
          node.nodeValue = node._origText;
          node._lastTranslatedValue = undefined;
        }
      }

      const elements = root.querySelectorAll("[placeholder], [title], [aria-label]");
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (el._origPlaceholder !== undefined) {
          el.placeholder = el._origPlaceholder;
          el._origPlaceholder = undefined;
        }
        if (el._origTitle !== undefined) {
          el.title = el._origTitle;
          el._origTitle = undefined;
        }
        if (el._origAriaLabel !== undefined) {
          el.setAttribute("aria-label", el._origAriaLabel);
          el._origAriaLabel = undefined;
        }
      }
    } finally {
      this.isTranslating = false;
    }
  }
}

export const domTranslator = new DOMTranslator();
export default domTranslator;
