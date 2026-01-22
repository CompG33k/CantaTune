import { useState } from "react";
import { usePitch } from "./usePitch";
import "./App.css";

export default function App() {
  const [micOn, setMicOn] = useState(false);
  const pitch = usePitch(micOn);

  return (
    <div style={{ padding: 40 }}>
      <h1>🎤 CantaTune</h1>
      <p>Karaoke & Keep-in-Tune Trainer</p>

      <button onClick={() => setMicOn(!micOn)}>
        {micOn ? "Stop Mic" : "Start Mic"}
      </button>

      <div style={{ marginTop: 20 }}>
        {pitch
          ? `Pitch: ${pitch.toFixed(1)} Hz`
          : micOn
          ? "Listening..."
          : "Mic off"}
      </div>
    </div>
  );
}
