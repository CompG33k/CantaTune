import { useEffect, useState } from "react";
import { detectPitchAutoCorrelate } from "./pitch";

export function usePitch(enabled) {
  const [pitch, setPitch] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    let audioCtx;
    let analyser;
    let data;
    let raf;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      data = new Float32Array(analyser.fftSize);

      source.connect(analyser);

      const loop = () => {
        analyser.getFloatTimeDomainData(data);
        const freq = detectPitchAutoCorrelate(data, audioCtx.sampleRate);
        setPitch(freq);
        raf = requestAnimationFrame(loop);
      };

      loop();
    });

    return () => {
      cancelAnimationFrame(raf);
      audioCtx?.close();
    };
  }, [enabled]);

  return pitch;
}
