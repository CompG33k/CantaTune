import { useEffect, useRef } from "react";

export default function Waveform({ analyser, height = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    const buffer = new Uint8Array(analyser.fftSize);

    let raf = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      analyser.getByteTimeDomainData(buffer);

      // background
      ctx.clearRect(0, 0, w, h);

      // waveform
      ctx.beginPath();
      const slice = w / buffer.length;

      let x = 0;
      for (let i = 0; i < buffer.length; i++) {
        const v = buffer[i] / 128.0; // 0..2
        const y = (v * h) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += slice;
      }
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={height}
      style={{
        width: "100%",
        height,
        border: "1px solid #333",
        borderRadius: 12
      }}
    />
  );
}