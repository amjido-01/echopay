"use server";

import { speechToText } from "@/actions/speech-recognition";
import { EchoTextChat, ChatStructure } from "@/actions/text-chat";

export type VoiceChatData = {
  audio: string;
  messages: ChatStructure[];
  beneficiaries: string;
  transactions: string;
  name: string;
  balance: number;
  records: string;
};

export type VoiceChatResult = {
  transcript: string;
  reply: string;
};

export async function EchoVoiceChat(data: VoiceChatData): Promise<VoiceChatResult> {
  const {
    audio,
    messages,
    beneficiaries,
    transactions,
    name,
    balance,
    records,
  } = data;

  try {
    const transcript = await speechToText(audio);
    if (!transcript) {
      return { transcript: "", reply: "" };
    }

    const replyRaw = await EchoTextChat({
      messages: [...messages, { role: "user", content: transcript }],
      beneficiaries,
      transactions,
      name,
      balance,
      records,
    });
    const reply = replyRaw || "";

    return { transcript, reply };
  } catch (error) {
    console.error("voice chat failed", error);
    return { transcript: "", reply: "" };
  }
}
