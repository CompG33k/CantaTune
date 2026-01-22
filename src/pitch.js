export function detectPitchAutoCorrelate(buffer, sampleRate) {
  let size = buffer.length;
  let rms = 0;

  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.01) return null;

  let bestOffset = -1;
  let bestCorr = 0;

  for (let offset = 20; offset < size / 2; offset++) {
    let corr = 0;
    for (let i = 0; i < size / 2; i++) {
      corr += buffer[i] * buffer[i + offset];
    }
    corr /= size / 2;

    if (corr > bestCorr) {
      bestCorr = corr;
      bestOffset = offset;
    }
  }

  if (bestOffset === -1) return null;
  return sampleRate / bestOffset;
}
