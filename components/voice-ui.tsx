import React from "react";
import { Mic, StopCircle, X, RotateCcw } from "lucide-react";
import useVoiceRecorder from "@/hooks/use-voice-recorder";
import useVoice from "@/hooks/use-voice";
import useChat from "@/hooks/use-chat";
import { speak } from "@/lib/utils";
import ThreeDotLoader from "@/components/ui/three-dot-loader";

export default function VoiceUI() {
  const { start, stop } = useVoiceRecorder();
  const { status, setStatus } = useVoice();
  const { chats } = useChat();

  const repeatLast = async () => {
    const last = [...chats].reverse().find((c) => c.role === "assistant");
    if (last) {
      setStatus("speaking");
      await speak(last.content);
      setStatus("idle");
    }
  };

  const cancel = () => {
    setStatus("idle");
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-md">
      {status === "idle" && (
        <button
          onClick={start}
          className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md"
        >
          <Mic className="w-4 h-4" /> Start
        </button>
      )}
      {status === "recording" && (
        <div className="flex flex-col items-center gap-2">
          <div className="loader">
            <div className="circle" />
            <div className="circle" />
            <div className="circle" />
            <div className="circle" />
          </div>
          <button
            onClick={stop}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md"
          >
            <StopCircle className="w-4 h-4" /> Stop
          </button>
          <p className="text-xs text-gray-500">Listening...</p>
        </div>
      )}
      {status === "processing" && (
        <div className="flex flex-col items-center gap-2">
          <ThreeDotLoader />
          <p className="text-xs text-gray-500">Processing...</p>
          <button
            onClick={cancel}
            className="flex items-center gap-1 px-3 py-1 text-xs text-red-600"
          >
            <X className="w-3 h-3" /> Cancel
          </button>
        </div>
      )}
      {status === "speaking" && (
        <div className="flex flex-col items-center gap-2">
          <ThreeDotLoader />
          <p className="text-xs text-gray-500">Speaking...</p>
          <button
            onClick={cancel}
            className="flex items-center gap-1 px-3 py-1 text-xs text-red-600"
          >
            <X className="w-3 h-3" /> Cancel
          </button>
        </div>
      )}
      <button
        onClick={repeatLast}
        className="flex items-center gap-1 px-2 py-1 text-xs border rounded-md"
      >
        <RotateCcw className="w-3 h-3" /> Repeat last reply
      </button>
    </div>
  );
}
