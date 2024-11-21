"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, X, SendHorizonal } from "lucide-react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import useEcho from "@/hooks/use-echo";
import useChat from "@/hooks/use-chat";
import useTransaction from "@/hooks/use-transaction";
import useBeneficiary from "@/hooks/use-beneficiary";
import useUserInfo from "@/hooks/use-userinfo";
import { toast } from "sonner";
import { Chat } from "@/types";
import { nanoid } from "nanoid";
import ConfirmTransaction from "@/components/confirm-transaction";
import { TTS } from "@/actions/voice";
import { ChatStructure, EchoVoiceChat } from "@/actions/voice-chat";
import { owner } from "@/store";
import useNewTransaction from "@/hooks/use-new-transaction";
import useShowChart from "@/hooks/use-show-chart";
import useBookKeeping from "@/hooks/use-book-keeping";
import FourDotLoader from "@/components/ui/four-dot-loader";
import ThreeDotLoader from "@/components/ui/three-dot-loader";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const Echo = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  const [transcript, setTranscript] = useState("");
  const [tempTranscript, setTempTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<Window["SpeechRecognition"] | null>(null);

  const { chats, addChat } = useChat();
  const { info } = useUserInfo();
  const { beneficiaries } = useBeneficiary();
  const { transactions } = useTransaction();
  const { openEcho, setOpenEcho } = useEcho();
  const { newTransaction, setNewTransaction } = useNewTransaction();
  const { setShowChart } = useShowChart();
  const { addRecord, records } = useBookKeeping();

  const speak = async (text: string) => {
    try {
      const audioSource = await TTS(text);
      const audio = new Audio(audioSource);

      // Set audio output to use bluetooth/headphones if available
      if (audio.setSinkId && typeof audio.setSinkId === "function") {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioOutputs = devices.filter(
            (device) => device.kind === "audiooutput"
          );

          // Find bluetooth/headphone device
          const bluetoothDevice = audioOutputs.find(
            (device) =>
              device.label.toLowerCase().includes("bluetooth") ||
              device.label.toLowerCase().includes("headphone")
          );

          if (bluetoothDevice) {
            await audio.setSinkId(bluetoothDevice.deviceId);
          }
        } catch (err) {
          console.warn("Unable to set audio output device:", err);
        }
      }

      return new Promise<void>((resolve) => {
        audio.onended = () => {
          startRecording();
          resolve();
        };

        audio.onerror = (error) => {
          console.error("Error playing audio:", error);
          startRecording();
          resolve();
        };

        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
          startRecording();
          resolve();
        });
      });
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      startRecording();
    }
  };

  useEffect(() => {
    if (openEcho) {
      cleanupAudioResources();
      startRecording();
    }
  }, [openEcho]);

  const cleanupAudioResources = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + " " + result);
          } else {
            currentTranscript += result;
          }
        }
        setTempTranscript(currentTranscript); // Update temporary transcript
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setIsRecording(false);
          toast.warning("tap to continue");
        }
      };
    }

    return () => {
      cleanupAudioResources();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        toast.error("Speech recognition not supported");
        return;
      }

      setIsRecording(true);
      setTranscript("");
      setTempTranscript(""); // Reset temporary transcript
      visualize();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const draw = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      const normalizedData = Array.from(dataArray)
        .slice(0, 50)
        .map((value) => value / 255)
        .reverse();
      setVisualizerData(normalizedData);
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const pauseRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.start();
      setIsPaused(false);
    }
  };

  const stopAndSendRecording = async () => {
    if (!isRecording || isProcessing) return;

    try {
      setIsProcessing(true);

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const finalTranscript = transcript + " " + tempTranscript; // Combine both transcripts
      if (!finalTranscript.trim()) {
        toast.error("Please say something");
        setIsRecording(false);
        setIsPaused(false);
        setIsProcessing(false);
        return startRecording();
      }

      const user = info || owner;
      if (!user) {
        toast.error("Unauthorized");
        setIsRecording(false);
        setIsPaused(false);
        return;
      }

      setIsRecording(false);
      setIsPaused(false);
      setIsThinking(true);

      try {
        const messages: ChatStructure[] = [
          ...chats.map((chat) => ({
            role:
              chat.role === "user"
                ? "user"
                : ("assistant" as "user" | "assistant"),
            content: `${chat.content}`,
          })),
          {
            role: "user",
            content: finalTranscript,
          },
        ];

        const data = {
          messages,
          beneficiaries: JSON.stringify(
            beneficiaries?.map(
              (b) => `id:${b?.id || ""} - name:${b?.acc_name || ""}  |`
            ) || []
          ),
          transactions: JSON.stringify(
            transactions?.map((t) => {
              if (!t) return "";
              return `${t.isCredit ? t.senderName : t.receiverName} - ${
                t.isCredit ? "Credit" : "Debit"
              } - NGN${t.amount} - ${t.date} |`;
            }) || []
          ),
          records: JSON.stringify(
            records.map((r) => `${r.narration} - NGN${r.amount} - ${r.date} |`)
          ),
          name: user.fullname || "",
          balance: Number(user.balance) || 0,
        };

        const response = await EchoVoiceChat(data);

        console.log(data, response);

        if (!response) {
          setIsRecording(false);
          setIsPaused(false);
          throw new Error("No response received");
        }

        const jsonData = JSON.parse(response);

        if (
          !jsonData.message &&
          !jsonData.newTransaction &&
          !jsonData.transactionChart
        ) {
          setIsRecording(false);
          setIsPaused(false);
          throw new Error("Invalid response format");
        }

        if (jsonData.newTransaction) {
          console.log("newTransaction", jsonData.newTransaction);
          setNewTransaction(jsonData.newTransaction);
        }

        // Only add record once if it exists in response
        if (jsonData.newRecord) {
          const record = {
            id: nanoid(),
            amount: jsonData.newRecord.amount,
            narration: jsonData.newRecord.narration,
            date: new Date().toISOString(),
          };
          addRecord(record);
        }

        if (jsonData.message) {
          setIsThinking(false);
          setIsSpeaking(true);
          await speak(jsonData.message);
          setIsSpeaking(false);

          const userMessage: Chat = {
            id: nanoid(),
            role: "user",
            content: finalTranscript,
            createdAt: new Date(),
          };
          const modelMessage: Chat = {
            id: nanoid(),
            role: "assistant",
            content: jsonData.message,
            createdAt: new Date(),
          };

          addChat(userMessage);
          addChat(modelMessage);
        }

        if (jsonData.transactionChart) {
          setShowChart("TRANSACTIONS");
        }
      } catch (error) {
        console.log(`Error processing response: ${error}`);
        toast.error("Failed to process response. Please try again.");
        startRecording();
      } finally {
        setVisualizerData([]);
        setTranscript("");
        setTempTranscript(""); // Reset temporary transcript
        setIsProcessing(false);
        setIsThinking(false);
      }
    } catch (error) {
      console.error("Error in stopAndSendRecording:", error);
      toast.error("Something went wrong. Please try again.");
      setIsSpeaking(false);
      setIsProcessing(false);
      startRecording();
    }
  };

  const cancelRecording = () => {
    cleanupAudioResources();
    setVisualizerData([]);
    setTranscript("");
    setTempTranscript(""); // Reset temporary transcript
    setIsRecording(false);
    setIsPaused(false);
    setOpenEcho(false);
  };

  return (
    <Drawer open={openEcho} onClose={() => setOpenEcho(false)}>
      <DrawerContent className="min-h-[60%] w-full">
        <div className="flex-1 flex flex-col items-center justify-between">
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto">
            <ConfirmTransaction
              data={newTransaction}
              setNewTransaction={setNewTransaction}
            />
            {isThinking && <FourDotLoader />}
            {isSpeaking && <ThreeDotLoader />}
            {!isThinking && !isSpeaking && (
              <div
                className={`flex w-auto gap-1 h-20 max-w-xs mx-auto items-center justify-center ${
                  isPaused ? "opacity-50" : ""
                }`}
              >
                {visualizerData.map((value, index) => (
                  <div
                    key={index}
                    className={`w-1.5 rounded-full ${
                      isPaused ? "bg-rose-500" : "bg-theme-primary"
                    }`}
                    style={{
                      height: `${value * 100}%`,
                      transition: "height 0.05s ease",
                    }}
                  />
                ))}
              </div>
            )}
            {(transcript || tempTranscript) && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg max-w-xs text-sm">
                {transcript} {tempTranscript}
              </div>
            )}
          </div>

          <div className="w-full flex justify-evenly gap-4 p-4 pb-8 lg:pb-4 bg-white mt-auto sticky bottom-0 max-w-lg mx-auto">
            {isRecording && (
              <>
                <button
                  onClick={cancelRecording}
                  className="w-16 h-16 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center aspect-square"
                >
                  <X className="w-8 h-8 text-red-600" />
                </button>

                <button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className={`w-16 h-16 rounded-full ${
                    isPaused
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  } flex items-center justify-center aspect-square`}
                >
                  {isPaused ? (
                    <Play className="w-8 h-8 text-white" />
                  ) : (
                    <Pause className="w-8 h-8 text-gray-600" />
                  )}
                </button>

                <button
                  onClick={stopAndSendRecording}
                  // disabled={isProcessing}
                  className={`w-16 h-16 rounded-full ${
                    isProcessing ? "opacity-100" : "hover:opacity-90"
                  } bg-theme-primary flex items-center justify-center aspect-square`}
                >
                  <SendHorizonal className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            {!isRecording && (
              <button
                onClick={startRecording}
                className="w-16 h-16 mx-auto rounded-full bg-theme-primary hover:opacity-90 flex items-center justify-center aspect-square"
              >
                <Mic className="w-8 h-8 text-white" />
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Echo;
