import { useState } from "react";
import { IconButton } from "../atoms/IconButton";
import muteIcon from "../../../public/icons/mute.png";
import unMuteIcon from "../../../public/icons/unmute.png";
import Image from "next/image";

export function SoundButton() {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <IconButton
      size="sm"
      onClick={() => setIsMuted((prev) => !prev)}
      icon={isMuted ? <Image src={muteIcon} alt="mute" /> : <Image src={unMuteIcon} alt="mute" />}
    />
  );
}
