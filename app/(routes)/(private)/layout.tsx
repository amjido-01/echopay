"use client";

import ConfirmTransaction from "@/components/confirm-transaction";
import useNewTransaction from "@/hooks/use-new-transaction";
import Chart from "./chat/_components/charts";
import useShowChart from "@/hooks/use-show-chart";

export default function RoutesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { newTransaction } = useNewTransaction();
  const { showChart } = useShowChart();
  return (
    <>
      {children}
      {newTransaction && <ConfirmTransaction data={newTransaction} />}
      {showChart && <Chart />}
    </>
  );
}
