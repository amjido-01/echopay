"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import useUserInfo from "@/hooks/use-userinfo";
import { Home, Wallet, MessageSquare, Menu } from "lucide-react";
import { useState, useEffect } from "react";

const features = [
  {
    image: "/arrow-up-down.svg",
    title: "Transfer",
    url: "/transfer",
  },
  {
    image: "/globe-02.svg",
    title: "Buy Data",
    url: "/buy-data",
  },
  {
    image: "/invoice-01.svg",
    title: "Buy Airtime",
    url: "/airtime",
  },
  {
    image: "/coins-01.svg",
    title: "Get Loans",
    url: "/loan",
  },
];

const Page = () => {
  const { info } = useUserInfo();
  const router = useRouter();

  const [activeView, setActiveView] = useState("home");

  useEffect(() => {
    // Update URL based on active view
    router.push(`/dashboard/${activeView}`);
  }, [activeView, router]);
  const navigateToKyc = () => {
    router.push("/kyc");
    console.log("navigate to kyc");
  };

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto ">
        <div className="flex-grow px-4 py-4 relative">
          <div className="flex mt-[20px] justify-between items-center">
            <div className="flex md:w-1/2 gap-[16px] items-center">
            <div 
              className="bg-[#003056] rounded-full w-[40px] cursor-pointer h-[40px] flex items-center justify-center text-white font-medium text-lg"
              >
            {info?.email ? info.email.charAt(0).toUpperCase() : 'U'}
          </div>

              <div>
                <p className="text-[#434343]">Good morning</p>
                <p className="text-[#1A1A1A] font-medium text-[20px]">
                  {info?.fullname}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[#434343]">Good morning</p>
              <p className="text-[#1A1A1A] font-medium text-[20px]">
                {info?.phone}
              </p>
            </div>
          </div>
          <div>
            <Image
              src="/notification.svg"
              width={24}
              height={24}
              alt="notification icon"
            />
          </div>
        </div>

        <div className="h-[111px] w-full text-white mt-[60px] flex p-4 justify-between rounded-[8px] bg-[#003056]">
          <div className="flex flex-col justify-between">
            <p className="">Balance</p>
            <p className="text-[22px] md:text-[24px] font-semibold">
              N {info?.balance}
            </p>
          </div>
          <div className="relative flex flex-col justify-end w-1/2">
            <Image
              className="absolute h-[80px] w-[74px] -top-4 -right-4"
              src="/echo.svg"
              width={0}
              height={0}
              alt="logo"
            />
            <div className="flex justify-end">
              <Image
                className=" h-[20px] mb-1 w-[20px]"
                src="/eye.svg"
                width={20}
                height={14}
                alt="eye icon"
              />
            </div>
          </div>
        </div>

        <div className="w-full h-[90px] flex justify-evenly mt-[34px]">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col justify-between">
              <div className="flex justify-center rounded-[8px] mb-[8px] items-center p-2 bg-[#FAFAFA] h-[64px]">
                <Link href={feature.url}>
                  <Image
                    className=" h-[24px] w-[24px]"
                    src={feature.image}
                    alt={feature.title}
                    width={12}
                    height={12}
                  />
                </Link>
              </div>
            ))}
          </div>
      {/* {showPopup &&  ( */}
      {info?.isVerified === false && (
         <div className="mt-[24px] mb-5">
         <Card className=" shadow-none">
           <CardHeader>
             <CardTitle className="border-b pb-[10px]">Verify Account</CardTitle>
           </CardHeader>
           <CardContent>
             <p>
               To ensure the security of your account and enable full access to
               EchoPay&apos;s features, please complete the verification process
             </p>
           </CardContent>
           <CardFooter>
             <Button
               onClick={navigateToKyc}
               size="lg"
               className="text-[18px] py-[24px] font-medium bg-[#003056] hover:bg-[#0c2941] text-[#FAFAFA] w-full"
             >
               Verify
             </Button>
           </CardFooter>
         </Card>
       </div>
      )}
     
      {/* )} */}

      <Link
        href="/chat"
        className={`${info?.isVerified && "mt-[60px]"} h-[224px] mb-[24px] rounded-[8px] bg-[#D1DCE5] m[60px] p-4 flex flex-col justify-between`}	
      >
        <div className=" h-[48px] rounded-full mt-[35px] flex justify-center items-center">
          <Image
            className="w-[68px] h-[68px] -rotate-[35deg]"
            src="/mic-01.svg"
            alt="mic"
            width={32}
            height={32}
          />
          <Image
            className="w-[68px] h-[68px]"
            src="/chatting.svg"
            alt="mic"
            width={32}
            height={32}
          />
        </div>
        {/* {showPopup &&  ( */}
        <div className="mt-[24px] mb-5">
          <Card className=" shadow-none">
            <CardHeader>
              <CardTitle className="border-b pb-[10px]">
                Verify Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                To ensure the security of your account and enable full access to
                EchoPay&apos;s features, please complete the verification
                process
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={navigateToKyc}
                size="lg"
                className="text-[18px] py-[24px] font-medium bg-[#003056] hover:bg-[#0c2941] text-[#FAFAFA] w-full"
              >
                Verify
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Link>


      <nav className={` ${info?.isVerified && "mt-[60px] fixd bottom-0"} mt-[36px]  w-full bg-white border-t border-gray-200 pt-5`}>
          <div className="flex justify-around">
  
            <button
              onClick={() => {setActiveView("home"); router.push("/dashoard")}}
              className={`flex flex-col items-center ${
                activeView === "home" ? "text-[#003056]" : "text-gray-500"
              }`}
            >
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button
              onClick={() => {setActiveView("transaction"); router.push("/dashboard/transaction")}}
              className={`flex flex-col items-center ${
                activeView === "wallet" ? "text-[#003056]" : "text-gray-500"
              }`}
            >
              <Wallet size={24} />
              <span className="text-xs mt-1">Transaction</span>
            </button>
            <button
              onClick={() => {setActiveView("ai"); router.push("/dashoard/ai")}}
              className={`flex flex-col items-center ${
                activeView === "ai" ? "text-[#003056]" : "text-gray-500"
              }`}
            >
              <MessageSquare size={24} />
              <span className="text-xs mt-1">Ai</span>
            </button>
            <button
              onClick={() => {setActiveView("more"); router.push("/dashoard/more")}}
              className={`flex flex-col items-center ${
                activeView === "more" ? "text-[#003056]" : "text-gray-500"
              }`}
            >
              <Menu size={24} />
              <span className="text-xs mt-1">More</span>
            </button>
          </div>
          <div className="flex justify-between items-center">
            <p className=" text-[18px] text-[#1A1A1A] font-medium">Echo Ai</p>
            <Image
              className="w-[6px] h-[12px]"
              src="/right.svg"
              width={6}
              height={12}
              alt="icon"
            />
          </div>
        </Link>

        <div className="fixed bottom-0 w-full flex justify-center">
          <nav className="w-full max-w-lg mx-auto bg-white border-t border-gray-200 py-2">
            <div className="flex justify-around">
              <button
                onClick={() => {
                  setActiveView("home");
                  router.push("/dashoard");
                }}
                className={`flex flex-col items-center ${
                  activeView === "home" ? "text-[#003056]" : "text-gray-500"
                }`}
              >
                <Home size={24} />
                <span className="text-xs mt-1">Home</span>
              </button>
              <button
                onClick={() => {
                  setActiveView("transaction");
                  router.push("/dashboard/transaction");
                }}
                className={`flex flex-col items-center ${
                  activeView === "wallet" ? "text-[#003056]" : "text-gray-500"
                }`}
              >
                <Wallet size={24} />
                <span className="text-xs mt-1">Transaction</span>
              </button>
              <button
                onClick={() => {
                  setActiveView("ai");
                  router.push("/dashoard/ai");
                }}
                className={`flex flex-col items-center ${
                  activeView === "ai" ? "text-[#003056]" : "text-gray-500"
                }`}
              >
                <MessageSquare size={24} />
                <span className="text-xs mt-1">Ai</span>
              </button>
              <button
                onClick={() => {
                  setActiveView("more");
                  router.push("/dashoard/more");
                }}
                className={`flex flex-col items-center ${
                  activeView === "more" ? "text-[#003056]" : "text-gray-500"
                }`}
              >
                <Menu size={24} />
                <span className="text-xs mt-1">More</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Page;
