import { useEffect, useMemo, useRef, useState } from "react";
import YouTubePlayer from "./YouTubePlayer";
import Waveform from "./Waveform";
import { useMic } from "./useMic";
import "./App.css";

// --- LRC parser: [mm:ss.xx] line ---
function parseLRC(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  const re = /^\s*\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)\s*$/;

  for (const line of lines) {
    const m = line.match(re);
    if (!m) continue;
    const mm = Number(m[1]);
    const ss = Number(m[2]);
    const t = mm * 60 + ss;
    const lyric = m[3] ?? "";
    out.push({ t, text: lyric });
  }

  out.sort((a, b) => a.t - b.t);
  return out;
}

function currentLyricIndex(lyrics, time) {
  if (!lyrics.length) return 0;
  let idx = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].t <= time) idx = i;
    else break;
  }
  return idx;
}

export default function App() {
  // Mic (pitch + waveform)
  const [micOn, setMicOn] = useState(false);
  const { pitchHz, analyser, error: micError } = useMic(micOn);

  // YouTube
  const [ytUrl, setYtUrl] = useState("");
  const playerRef = useRef(null);
  const [time, setTime] = useState(0);

  // Poll YouTube time for lyric sync
  useEffect(() => {
    let raf = 0;
    const tick = async () => {
      const p = playerRef.current;
      try {
        if (p?.getCurrentTime) {
          const t = await p.getCurrentTime();
          if (Number.isFinite(t)) setTime(t);
        }
      } catch {}
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Lyrics (LRC input)
  const [lrcText, setLrcText] = useState(
`[00:00.00]Paste LRC lyrics here
[00:03.00]Example: [mm:ss.xx] Lyric line
[00:06.00]Play YouTube karaoke and it will highlight
[00:09.00]Waveform shows your mic input`
  );

  const lyrics = useMemo(() => parseLRC(lrcText), [lrcText]);
  const idx = useMemo(() => currentLyricIndex(lyrics, time), [lyrics, time]);

  const prev = lyrics[idx - 1]?.text ?? "";
  const current = lyrics[idx]?.text ?? "";
  const next = lyrics[idx + 1]?.text ?? "";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 6 }}>🎤 CantaTune</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        YouTube karaoke + big synced lyrics + mic waveform + pitch
      </p>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setMicOn(v => !v)}>
          {micOn ? "Stop Mic" : "Start Mic"}
        </button>

        <div style={{ opacity: 0.85 }}>
          {micError
            ? `Mic error: ${micError}`
            : micOn
            ? (pitchHz ? `Pitch: ${pitchHz.toFixed(1)} Hz` : "Listening…")
            : "Mic off"}
        </div>

        <div style={{ opacity: 0.7 }}>
          YouTube time: {time.toFixed(2)}s
        </div>
      </div>

      {/* Mic Waveform */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
          Mic waveform (your voice)
        </div>
        <Waveform analyser={analyser} height={140} />
      </div>

      {/* YouTube */}
      <div style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>YouTube Karaoke</h2>

        <input
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #333",
            outline: "none"
          }}
          placeholder="Paste a YouTube karaoke URL or video ID"
          value={ytUrl}
          onChange={(e) => setYtUrl(e.target.value)}
        />

        {ytUrl && (
          <div style={{ marginTop: 12 }}>
            <YouTubePlayer
              video={ytUrl}
              onReady={(e) => {
                playerRef.current = e.target;
              }}
            />
          </div>
        )}
      </div>

      {/* Big Karaoke Lyrics */}
      <div style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Lyrics (LRC)</h2>

        <textarea
          value={lrcText}
          onChange={(e) => setLrcText(e.target.value)}
          rows={7}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #333",
            outline: "none",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          }}
        />

        <div
          style={{
            marginTop: 14,
            border: "1px solid #333",
            borderRadius: 16,
            padding: 18
          }}
        >
          <div style={{ fontSize: 22, opacity: 0.55, minHeight: 32 }}>
            {prev}
          </div>

          <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.1, padding: "10px 0" }}>
            {current || "—"}
          </div>

          <div style={{ fontSize: 22, opacity: 0.55, minHeight: 32 }}>
            {next}
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          Tip: LRC format is <code>[mm:ss.xx] lyric text</code>. Paste from an LRC file for karaoke timing.
        </div>
      </div>
    </div>
  );
}