import React, { useEffect } from "react";
import { loadElevenlabsWidget } from "@/services/elevenlabs";

const ChatHeaderElevenLabsWidget = () => {
  useEffect(() => {
    loadElevenlabsWidget();
  }, []);

  return (
    <div>
      {/* Aquí se inyecta el widget ElevenLabs dinámicamente */}
    </div>
  );
};

export default ChatHeaderElevenLabsWidget;
