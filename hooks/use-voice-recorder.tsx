import { useCallback, useRef, useState } from "react";
import useVoice from "@/hooks/use-voice";
import { EchoVoiceChat } from "@/actions/voice-chat";
import useChat from "@/hooks/use-chat";
import useBeneficiary from "@/hooks/use-beneficiary";
import useTransaction from "@/hooks/use-transaction";
import useNewTransaction from "@/hooks/use-new-transaction";
import useShowChart from "@/hooks/use-show-chart";
import useUserInfo from "@/hooks/use-userinfo";
import useBookKeeping from "@/hooks/use-book-keeping";
import { owner } from "@/store";
import { nanoid } from "nanoid";
import { Chat } from "@/types";
import { toast } from "sonner";
import { speak } from "@/lib/utils";

export default function useVoiceRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const start = useCallback(async () => {
    if (recording) return;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      toast.error("Microphone access denied");
      return;
    }
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      setRecording(false);
      useVoice.getState().stopRecording();
      stream.getTracks().forEach((t) => t.stop());

      try {
        const buffer = await blob.arrayBuffer();
        const bytes = Array.from(new Uint8Array(buffer));
        const base64 = btoa(String.fromCharCode(...bytes));

        const { chats } = useChat.getState();
        const { beneficiaries } = useBeneficiary.getState();
        const { transactions } = useTransaction.getState();
        const { setNewTransaction } = useNewTransaction.getState();
        const { setShowChart } = useShowChart.getState();
        const { records, addRecord } = useBookKeeping.getState();
        const { info } = useUserInfo.getState();
        const user = info || owner;
        if (!user) throw new Error("Unauthorized");

        const messages = chats.map((chat) => ({
          role: chat.role === "user" ? "user" : ("assistant" as "user" | "assistant"),
          content: chat.content,
        }));

        const data = {
          audio: base64,
          messages,
          beneficiaries: JSON.stringify(beneficiaries.map((b) => `${b.acc_name} - ${b.id} |`)),
          transactions: JSON.stringify(
            transactions.map(
              (t) => `${t.isCredit ? t.senderName : t.receiverName} - ${t.isCredit ? "Credit" : "Debit"} - ₦${t.amount} - ${t.date} |`
            )
          ),
          records: JSON.stringify(records.map((r) => `${r.narration} - ₦${r.amount} - ${r.date} |`)),
          name: user.fullname || "",
          balance: Number(user.balance) || 0,
        };

        const result = await EchoVoiceChat(data);
        if (result.transcript) {
          useVoice.getState().addTranscript(result.transcript);
        }

        if (result.reply) {
          const jsonData = JSON.parse(result.reply || "{}");
          if (jsonData.newTransaction) {
            setNewTransaction(jsonData.newTransaction);
          }
          if (jsonData.message) {
            const modelMessage: Chat = {
              id: nanoid(),
              role: "assistant",
              content: jsonData.message,
              createdAt: new Date(),
            };
            useChat.getState().addChat(modelMessage);
            await speak(jsonData.message);
          }
          if (jsonData?.transactionChart) {
            setShowChart("TRANSACTIONS");
          }
          if (jsonData?.newRecord) {
            const record = {
              id: nanoid(),
              amount: jsonData.newRecord.amount,
              narration: jsonData.newRecord.narration,
              date: new Date().toISOString(),
            };
            addRecord(record);
          }
          if (jsonData?.incomeVsSpendingChart) {
            setShowChart("INCOME_VS_SPENDING");
          }
          if (jsonData?.beneficiaryChart) {
            setShowChart("BENEFICIARY_CHART");
          }
        }
      } catch (err) {
        console.error("voice pipeline error", err);
        toast.error("Failed to process voice message. Please try again.");
      } finally {
        useVoice.getState().setStatus("idle");
      }
    };

    recorder.start();
    setRecording(true);
    useVoice.getState().startRecording();
  }, [recording]);

  const stop = useCallback(() => {
    if (!recording) return;
    mediaRecorderRef.current?.stop();
  }, [recording]);

  return {
    start,
    stop,
    recording,
    audioUrl,
  };
}
