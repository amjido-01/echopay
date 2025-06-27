import { EchoTextChat, ChatStructure } from "@/actions/text-chat";
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

export default async function sendVoiceChat(messageToSend: string) {
  const { info } = useUserInfo.getState();
  const user = info || owner;
  if (!user) {
    toast.error("Unauthorized");
    return;
  }

  const { chats, addChat } = useChat.getState();
  const history = [...chats];
  const { beneficiaries } = useBeneficiary.getState();
  const { transactions } = useTransaction.getState();
  const { setNewTransaction } = useNewTransaction.getState();
  const { setShowChart } = useShowChart.getState();
  const { records, addRecord } = useBookKeeping.getState();

  const userMessage: Chat = {
    id: nanoid(),
    role: "user",
    content: messageToSend,
    createdAt: new Date(),
  };
  addChat(userMessage);

  const messages: ChatStructure[] = [
    ...history.map((chat) => ({
      role: chat.role === "user" ? "user" : ("assistant" as "user" | "assistant"),
      content: chat.content,
    })),
    { role: "user", content: messageToSend },
  ];

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
          } - ₦${t.amount} - ${t.date} |`
      )
    ),
    records: JSON.stringify(
      records.map((r) => `${r.narration} - ₦${r.amount} - ${r.date} |`)
    ),
    name: user.fullname || "",
    balance: Number(user.balance) || 0,
  };

  try {
    const response = await EchoTextChat(data);
    const jsonData = JSON.parse(response || "{}");

    if (
      !jsonData.message &&
      !jsonData.newTransaction &&
      !jsonData.transactionChart
    ) {
      throw new Error("Invalid response format");
    }

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
      addChat(modelMessage);
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
  } catch (error) {
    console.error("API request failed:", error);
    toast.error("Failed to process voice message. Please try again.");
  }
}
