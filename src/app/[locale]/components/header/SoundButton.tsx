"use client";

import { IconButton } from "@/components/IconButton";
import muteIcon from "@/../public/icons/mute.png";
import unMuteIcon from "@/../public/icons/unmute.png";

import Image from "next/image";
import { useSoundStore } from "@/app/store/useSoundStore";

export function SoundButton() {
  const isMuted = useSoundStore((state) => state.isMuted);
  const toggleMute = useSoundStore((state) => state.toggleMute);

  return (
    <IconButton
      size="sm"
      onClick={toggleMute}
      icon={isMuted ? <Image src={muteIcon} alt="mute" /> : <Image src={unMuteIcon} alt="unmute" />}
    />
  );
}
