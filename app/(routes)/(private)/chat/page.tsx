"use client";

import CustomTextareaForm from "@/components/ui/custom-textarea";
import { Chat, NewTransactionType } from "@/types";
import React, { useEffect, useState, useRef } from "react";
import { nanoid } from "nanoid";
import ChatItem from "@/components/chat-item";
import axios from "axios";
import useChat from "@/hooks/use-chat";
import ConfirmTransaction from "@/components/confirm-transaction";
import useBeneficiary from "@/hooks/use-beneficiary";
import { AudioLines, ChevronLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import Chart, { ChartType } from "./_components/chart";
import useTransaction from "@/hooks/use-transaction";
import Echo from "./_components/echo";
import useEcho from "@/hooks/use-echo";
import useUserInfo from "@/hooks/use-userinfo";
import { EchoChatText } from "@/actions/text-chat";
import { ChatStructure } from "@/actions/voice-chat";
import { toast } from "sonner";

const ChatPage = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [lastAttemptedMessage, setLastAttemptedMessage] = useState("");
  const [showRetry, setShowRetry] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [newTransaction, setNewTransaction] =
    useState<NewTransactionType | null>(null);
  const [chartType, setChartType] = useState<ChartType>(null);

  const { info } = useUserInfo();
  const { openEcho, setOpenEcho } = useEcho();
  const { chats, addChat } = useChat();
  const { beneficiaries } = useBeneficiary();
  const { transactions } = useTransaction();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  // useEffect(() => {
  //   if (newTransaction) {
  //     // Reset transaction after handling
  //     setNewTransaction(null);
  //   }
  // }, [newTransaction]);

  const handleSubmit = async () => {
    let messageToSend = newMessage;
    const lastMessage = chats[chats.length - 1];

    if (lastMessage.role === "user") {
      messageToSend = lastAttemptedMessage;
    }

    if (!info) {
      return toast.error("Unauthorized");
    }

    if (!messageToSend) return;

    console.log("messageToSend", messageToSend);

    const history = [...chats];
    setIsLoading(true);
    setShowRetry(false);

    const filteredPrompt = messageToSend;
    setLastAttemptedMessage(messageToSend);

    const userMessage: Chat = {
      id: nanoid(),
      role: "user",
      content: filteredPrompt,
      createdAt: new Date(),
    };

    addChat(userMessage);
    setNewMessage("");

    const messages: ChatStructure[] = [
      ...history.map((chat) => ({
        role: (chat.role === "model" ? "assistant" : "user") as
          | "user"
          | "assistant",
        content: `${chat.content}`,
      })),
      {
        role: "user",
        content: `${filteredPrompt} respond in JSON format`,
      },
    ];

    try {
      const data = {
        messages,
        beneficiaries: JSON.stringify(
          beneficiaries.map((b) => `${b.acc_name} - ${b.id} |`)
        ),
        transactions: JSON.stringify(
          transactions.map(
            (t) =>
              `${t.isCredit ? t.senderName : t.receiverName} - ${
                t.isCredit ? "Credit" : "Debit"
              } - NGN${t.amount} - ${t.date} |`
          )
        ),
        name: info.fullname || "",
        balance: info.balance || 0,
      };

      // const config = {
      //   method: "post",
      //   maxBodyLength: Infinity,
      //   url: "https://raj-assistant-api.vercel.app/api/echopay-models/chat",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   data: data,
      // };

      // const response = await axios.request(config);

      const response = await EchoChatText(data);

      if (!response) {
        return toast.error("Something went wrong");
      }

      const jsonData = JSON.parse(response);

      if (
        !jsonData.message &&
        !jsonData.newTransaction &&
        !jsonData.transactionChart
      ) {
        setShowRetry(true);
        return;
      }

      if (jsonData.newTransaction) {
        setNewTransaction(jsonData.newTransaction);
      }

      if (jsonData.message) {
        const modelMessage: Chat = {
          id: nanoid(),
          role: "model",
          content: jsonData.message,
          createdAt: new Date(),
        };
        addChat(modelMessage);
      }

      if (jsonData.transactionChart) {
        setChartType("TRANSACTIONS");
      }
    } catch (error) {
      console.error("API request failed:", error);
      setShowRetry(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col w-full h-screen p-4 pt-0">
      <div className="flex items-center justify-between sticky top-0 z-50 bg-white py-2">
        <Link href="/dashboard" className="flex items-center">
          <ChevronLeft className="w-10 h-10 p-1.5" />
          <h2 className="text-base lg:text-lg font-semibold">Chat</h2>
        </Link>
        <button onClick={() => setOpenEcho(true)}>
          <AudioLines className="w-10 h-10 p-1.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {chats.map((chat, index) => (
          <ChatItem
            key={chat.id}
            data={chat}
            isLast={index === chats.length - 1}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 px-4">
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
          </div>
        )}

        {showRetry ||
          (chats[chats.length - 1].role === "user" && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ))}

        <div ref={messagesEndRef} />
      </div>

      <CustomTextareaForm
        value={newMessage}
        onChange={setNewMessage}
        placeholder="Type your message..."
        className="flex-1 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onSubmit={handleSubmit}
        disabled={isLoading}
      />

      <ConfirmTransaction
        data={newTransaction}
        setNewTransaction={setNewTransaction}
      />
      {chartType && <Chart type={chartType} setType={setChartType} />}
      {openEcho && <Echo />}
    </div>
  );
};

export default ChatPage;
