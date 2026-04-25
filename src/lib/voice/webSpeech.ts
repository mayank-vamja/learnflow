export type SpeechSupport = {
  tts: boolean;
  stt: boolean;
};

// Minimal Web Speech API typings (TS doesn't ship these by default).
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: Array<{
    isFinal: boolean;
    0?: { transcript?: string };
  }>;
};

type SpeechRecognitionErrorEventLike = {
  error?: string;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function getSpeechSupport(): SpeechSupport {
  if (typeof window === "undefined") return { tts: false, stt: false };
  const tts = typeof window.speechSynthesis !== "undefined";
  const stt = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  return { tts, stt };
}

export function stopSpeak() {
  if (typeof window === "undefined") return;
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // ignore
  }
}

export function speak(text: string, opts?: { lang?: string; rate?: number; pitch?: number; volume?: number }) {
  if (typeof window === "undefined") return false;
  if (!window.speechSynthesis) return false;
  const cleaned = text.trim();
  if (!cleaned) return false;

  stopSpeak();
  const u = new SpeechSynthesisUtterance(cleaned);
  u.lang = opts?.lang ?? "en-US";
  u.rate = opts?.rate ?? 1;
  u.pitch = opts?.pitch ?? 1;
  u.volume = opts?.volume ?? 1;
  window.speechSynthesis.speak(u);
  return true;
}

export type ListeningSession = {
  stop: () => void;
};

export function startListening(args: {
  lang?: string;
  interimResults?: boolean;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (err: string) => void;
}): ListeningSession | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = args.lang ?? "en-US";
  rec.interimResults = args.interimResults ?? true;
  rec.continuous = true;
  rec.maxAlternatives = 1;

  rec.onresult = (event) => {
    let interim = "";
    let finalText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      const text = res[0]?.transcript ?? "";
      if (res.isFinal) finalText += text + " ";
      else interim += text + " ";
    }
    if (interim.trim()) args.onPartial?.(interim.trim());
    if (finalText.trim()) args.onFinal?.(finalText.trim());
  };

  rec.onerror = (e) => {
    args.onError?.(String((e as SpeechRecognitionErrorEventLike).error ?? "speech_error"));
  };

  try {
    rec.start();
  } catch (e) {
    args.onError?.(String(e));
    return null;
  }

  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    },
  };
}

