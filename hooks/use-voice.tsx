import { create } from "zustand";
import { Chat } from "@/types";
import useChat from "@/hooks/use-chat";

export type VoiceStatus = "idle" | "recording" | "processing" | "speaking";

interface VoiceState {
  status: VoiceStatus;
  startRecording: () => void;
  stopRecording: () => void;
  setStatus: (value: VoiceStatus) => void;
  addTranscript: (text: string) => void;
}

const useVoice = create<VoiceState>((set, get) => ({
  status: "idle",
  startRecording: () => set({ status: "recording" }),
  stopRecording: () => set({ status: "processing" }),
  setStatus: (value: VoiceStatus) => set({ status: value }),
  addTranscript: (text: string) => {
    const transcript: Chat = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    // push to global chat history
    const { addChat } = useChat.getState();
    addChat(transcript);
  },
}));

export default useVoice;
