export function startBeep(lastBeepIntervalRef: React.RefObject<NodeJS.Timeout | null>) {
  // 이미 울리는 중이면 또 만들지 않기
  if (lastBeepIntervalRef.current) return;

  const beepInterval = setInterval(() => {
    const audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
    setTimeout(() => audioCtx.close(), 300);
  }, 1000);

  lastBeepIntervalRef.current = beepInterval;
}

export function stopBeep(lastBeepIntervalRef: React.RefObject<NodeJS.Timeout | null>) {
  if (lastBeepIntervalRef.current) {
    clearInterval(lastBeepIntervalRef.current);
    lastBeepIntervalRef.current = null;
  }
}
