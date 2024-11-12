// "use client"
// import { Button } from "@/components/ui/button";
// import { InputWithIcon } from "@/components/ui/input-with-icon";
// import { Label } from "@/components/ui/label";
// import { Eye, Mail, Phone } from "lucide-react";
// import React from "react";
// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import logo from "@/assests/e.svg"
// import stage1 from "@/assests/stage1.png"
// import stage2 from "@/assests/stage2.png"
// import stage3 from "@/assests/stage3.png"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from "@/components/ui/select";

// const OnboardingPage = () => {
//   const [stage, setStage] = useState(0)
//   const [showLogo, setShowLogo] = useState(true)
//   const [zoomLogo, setZoomLogo] = useState(false)

//   const stages = [
//     { image: stage1, text: 'Your Future, Your Finance, Your Way', subText: "Join the future of payments, effortlessly" },
//     { image: stage2, text: 'Simple. Secure. Smart', subText: "Experience the power of voice and chat for your finances" },
//     { image: stage3, text: 'Your Money, Your Control', subText: "Manage your finances anytime, anywhere, anyhow" },
//   ]

//   useEffect(() => {
//     const timer1 = setTimeout(() => setZoomLogo(true), 2000)
//     const timer2 = setTimeout(() => {
//       setShowLogo(false)
//       setStage(1)
//     }, 3000)

//     return () => {
//       clearTimeout(timer1)
//       clearTimeout(timer2)
//     }
//   }, [])

//   const handleContinue = () => {
//     if (stage < 3) {
//       setStage(stage + 1)
//     } else if (stage === 3) {
//       // When "Get Started" is clicked, move to the language selection stage
//       setStage(4)
//     }
//   }
//   return (
//     <div className="w-full h-full flex flex-col gap-10 pt-20 px-3 pb-10">
//       <div className="flex flex-col gap-2">
//         <h1 className="text-lg font-semibold">Join the Future of Finance</h1>
//         <p className="text-base">
//           Create your EchoPay account today and experience AI powered financial
//           transactions
//         </p>
//       </div>
//       <div className="flex flex-col gap-3">
//         <div className="flex flex-col gap-1">
//           <Label>Phone Number</Label>
//           <InputWithIcon
//             type="text"
//             icon={Phone}
//             placeholder="Enter your phone number"
//           />
//         </div>
//         <div className="flex flex-col gap-1">
//           <div className="flex justify-between gap-3">
//             <Label>Email</Label>
//             <span className="text-yellow-600 capitalize">(Optioal)</span>
//           </div>
//           <InputWithIcon
//             type="email"
//             icon={Mail}
//             placeholder="Enter your email address"
//           />
//         </div>
//         <div className="flex flex-col gap-1">
//           <Label>Password</Label>
//           <InputWithIcon
//             type="password"
//             icon={Eye}
//             placeholder="Create a password"
//           />
//         </div>
//         <div className="flex gap-2">
//           <p>
//             I agree to the <a href="#">Terms and Conditions</a> and{" "}
//             <a href="#">Privacy Policy</a>
//           </p>
//         </div>
//       </div>
//       <div className="w-full flex flex-col gap-8">
//         <Button>Create Account</Button>
//         <p>
//           Already have an account? <a href="#">Sign In</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default OnboardingPage;


"use client"
import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label";
const OnboardingPage = () => {
  const [stage, setStage] = useState(0)
  const [showLogo, setShowLogo] = useState(true)
  const [zoomLogo, setZoomLogo] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const stages = [
    { image: stage1, text: 'Your Future, Your Finance, Your Way', subText: "Join the future of payments, effortlessly" },
    { image: stage3, text: 'Simple. Secure. Smart', subText: "Experience the power of voice and chat for your finances" },
    { image: stage1, text: 'Your Money, Your Control', subText: "Manage your finances anytime, anywhere, anyhow" },
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
      setStage(4)
    }
  }

  const handleLanguageSelect = (value: string) => {
    setSelectedLanguage(value)
  }


  const slideVariants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 900 : -900,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 900 : -900,
        opacity: 0
      };
    }
  };

  return (
    <div className="w-full h-full flex flex-col border-2 gap-10 relative">
      <div className="min-h-screen flex flex-col items-center justify-center">
        {showLogo && (
          <motion.div
            className={`transition-transform duration-1000 ${zoomLogo ? 'scale-110' : 'scale-100'}`}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
          >
            <Image src={logo} alt="Logo" width={200} height={200} />
          </motion.div>
        )}

        <AnimatePresence initial={false} custom={stage}>
          {!showLogo && stage >= 1 && stage <= 3 && (
            <motion.div
              key={stage}
              custom={stage}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="text-center w-[90%] absolute"
            >
              {stage && stage < 3 ? <div className="flex justify-end mx-auto md:w-[84%]"><Button className="p-0" variant="link">Skip</Button></div> : ""}
              <div className="">
                <div className="flex justify-center ">
                  <Image src={stages[stage - 1].image} alt={`Stage ${stage}`} width={382} height={400} className="mb-[80px] text-center" />
                </div>
                <div>
                  <p className="text-[20px] font-semibold text-[#1A1A1A]">{stages[stage - 1].text}</p>
                  <p className="text-[#434343] mt-[6px] w-[70%] mx-auto font-medium text-[18px]">{stages[stage - 1].subText}</p>

                  <div className="flex justify-center items-center mt-6 mb-8">
                    {[1, 2, 3].map((dot) => (
                      <motion.div
                        key={dot}
                        className={`mx-1 rounded-full ${
                          dot === stage ? 'bg-[#003056]' : 'bg-gray-300'
                        }`}
                        initial={false}
                        animate={{
                          width: dot === stage ? 30 : 15,
                          height: 9
                        }}
                        transition={{ duration: 0.3 }}
                        aria-label={dot === stage ? `Current stage ${dot}` : `Stage ${dot}`}
                      />
                    ))}
                  </div>

                  <div className="w-[90%] mx-auto">
                    <Button className="border lg:mt-[20px] mt-[40px] text-[18px] font-medium bg-[#003056] hover:bg-[#0c2941] text-[#FAFAFA] w-full py-[24px]" onClick={handleContinue}>
                      {stage === 3 ? 'Get Started' : 'Continue'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {stage === 4 && (
          <div className="text-center relative w-[85%] border-2 border-red-500 h-screen">
            <div className="mt-[77px] mb-[88px]">
              <h2 className="text-2xl font-medium text-center text-[#1A1A1A]">Choose your language</h2>
              <p className="text-[18px] font-medium text-[#434343]">Select your preferred language to continue</p>
            </div>
            <Select onValueChange={handleLanguageSelect}>
              <SelectTrigger className="w-full mt-6">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>

              <SelectContent className="border-2 w-full mt-[16px] px-0">
                <SelectItem className="my-[20px]" value="en">English</SelectItem>
                <SelectItem className="my-[20px]" value="es">Español</SelectItem>
                <SelectItem className="my-[20px]" value="fr">Français</SelectItem>
                <SelectItem className="my-[20px]" value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>

            <div className="absolute bottom-0 w-full">
              <Button 
                className="border mt-[48px] bottom-0 text-[18px] font-medium bg-[#003056] hover:bg-[#0c2941] text-[#FAFAFA] w-full py-[24px]" 
                onClick={handleContinue}
                disabled={!selectedLanguage}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;