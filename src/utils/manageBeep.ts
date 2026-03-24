export type IntervalRef = React.RefObject<ReturnType<typeof setInterval> | null>;
export type AudioGraph = { ctx: AudioContext; masterGain: GainNode };

export function startBeep(lastBeepIntervalRef: IntervalRef, audio: AudioGraph | null) {
  if (!audio) return;
  if (lastBeepIntervalRef.current) return;

  const { ctx, masterGain } = audio;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const id = setInterval(() => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, 1000);

  lastBeepIntervalRef.current = id;
}

export function stopBeep(lastBeepIntervalRef: IntervalRef) {
  if (lastBeepIntervalRef.current) {
    clearInterval(lastBeepIntervalRef.current);
    lastBeepIntervalRef.current = null;
  }
}
