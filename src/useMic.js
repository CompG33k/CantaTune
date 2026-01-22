import { useEffect, useRef, useState } from "react";
import { detectPitchAutoCorrelate } from "./pitch";

/**
 * Mic hook that provides:
 * - pitchHz: number|null
 * - analyser: AnalyserNode|null (for waveform)
 * - error: string|null
 */
export function useMic(enabled) {
  const [pitchHz, setPitchHz] = useState(null);
  const [error, setError] = useState(null);

  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      setPitchHz(null);
      setError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
        if (cancelled) return;

        streamRef.current = stream;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        source.connect(analyser);

        const buf = new Float32Array(analyser.fftSize);

        const tick = () => {
          analyser.getFloatTimeDomainData(buf);
          const f = detectPitchAutoCorrelate(buf, audioCtx.sampleRate);
          setPitchHz(f ?? null);
          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        setError(e?.message || "Mic permission error");
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };

    function cleanup() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      if (analyserRef.current) {
        try { analyserRef.current.disconnect(); } catch {}
      }
      analyserRef.current = null;

      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
      audioCtxRef.current = null;

      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop();
      }
      streamRef.current = null;
    }
  }, [enabled]);

  return { pitchHz, analyser: analyserRef.current, error };
}