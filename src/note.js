export function freqToMidi(freq) {
  // A4=440Hz => MIDI 69
  return 69 + 12 * Math.log2(freq / 440);
}

export function midiToName(midi) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const n = ((Math.round(midi) % 12) + 12) % 12;
  const octave = Math.floor(Math.round(midi) / 12) - 1;
  return `${names[n]}${octave}`;
}

export function centsOffFromMidi(freq, targetMidi) {
  const midi = freqToMidi(freq);
  return Math.round((midi - targetMidi) * 100);
}
