"use client"
import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import logo from "@/assests/e.svg"
import stage1 from "@/assests/stage1.png"
import stage2 from "@/assests/stage2.png"
import stage3 from "@/assests/stage3.png"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const OnboardingPage = () => {
  const [stage, setStage] = useState(0)
  const [showLogo, setShowLogo] = useState(true)
  const [zoomLogo, setZoomLogo] = useState(false)

  const stages = [
    { image: stage1, text: 'Your Future, Your Finance, Your Way', subText: "Join the future of payments, effortlessly" },
    { image: stage2, text: 'Simple. Secure. Smart', subText: "Experience the power of voice and chat for your finances" },
    { image: stage3, text: 'Your Money, Your Control', subText: "Manage your finances anytime, anywhere, anyhow" },
  ]

  useEffect(() => {
    const timer1 = setTimeout(() => setZoomLogo(true), 2000)
    const timer2 = setTimeout(() => {
      setShowLogo(false)
      setStage(1)
    }, 3000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const handleContinue = () => {
    if (stage < 3) {
      setStage(stage + 1)
    } else if (stage === 3) {
      // When "Get Started" is clicked, move to the language selection stage
      setStage(4)
    }
  }
  return (
    <div className="w-full h-full border-2 flex flex-col gap-10">

      <div className="min-h-screen flex flex-col items-center justify-center">
        {showLogo && (
          <motion.div
            className={`transition-transform duration-1000 border-2 border-red-500 ${zoomLogo ? 'scale-110' : 'scale-100'}`}
            initial={{ scale: 0 }}
            animate={{ scale: zoomLogo ? 1 : 1.7 }}
            transition={{ duration: 1 }}
          >
            <Image src={logo} alt="Logo" width={200} height={200} />
          </motion.div>
        )}
        {stage && stage < 3 ? <div className="flex justify-end w-[80%]"><Button className="p-0" variant="link">Skip</Button></div> : ""}

        {!showLogo && stage >= 1 && stage <= 3 && (
          <div className="text-center border-2">
            <div className="flex justify-center">
              <Image src={stages[stage - 1].image} alt={`Stage ${stage}`} width={382} height={400} className="mb-[80px] text-center" />
            </div>
            <p className="text-[20px] font-semibold text-[#1A1A1A]">{stages[stage - 1].text}</p>
            <p className="text-[#434343] mt-[6px] border-2 w-[70%] mx-auto font-medium text-[18px]">{stages[stage - 1].subText}</p>
            <Button className="border mt-[48px] text-[18px] font-medium bg-[#003056] hover:bg-[#0c2941] text-[#FAFAFA] w-full py-[24px]" onClick={handleContinue}>
              {stage === 3 ? 'Get Started' : 'Continue'}
            </Button>
          </div>
        )}

        {stage === 4 && (
          <div className="text-center border-2">
            <div className="mt-[77px]">
              <h2 className="text-2xl font-medium text-center text-[#1A1A1A]">Choose your language</h2>
              <p className=" text-[18px] font-medium text-[#434343]">Select your preferred language to continue</p>
            </div>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>

            <Button className="border mt-[48px] text-[18px] font-medium bg-[#003056] hover:bg-[#0c2941] text-[#FAFAFA] w-full py-[24px]" onClick={handleContinue}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
