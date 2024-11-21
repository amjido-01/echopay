"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import useUserInfo from "@/hooks/use-userinfo";
import MobileInput from "./_components/mobile-input";
import SplashSlides from "./_components/splash-slides";
import OTPVerification from "./_components/otp-verification";
import { Loader2 } from "lucide-react";
import UpsetPassword from "@/components/ui/upset-password";
import SlideContainer from "@/components/slide-container";
import LanguageSelector from "@/components/language-selector";
import { useRouter } from "next/navigation";

import { Inbox, Eye } from "lucide-react";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/utils";
import useVisitor from "@/hooks/use-visitor";

const OnboardingPage = () => {
  const [stage, setStage] = useState(0);
  const [showLogo, setShowLogo] = useState(true);
  const [zoomLogo, setZoomLogo] = useState(false);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [otpError, setOtpError] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  // const newUser = true;

  const router = useRouter();
  const { setInfo, info } = useUserInfo();
  const { hasVisited, setVisit } = useVisitor();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    console.log(info, "from useeffect");
    const timer1 = setTimeout(() => setZoomLogo(true), 2000);
    const timer2 = setTimeout(() => {
      setShowLogo(false);
      if (info) {
        router.push("/dashboard");
      } else {
        if (hasVisited) {
          setStage(4);
        } else {
          setStage(1);
          setVisit(true);
        }
      }
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isMounted]);

  const handleContinue = async () => {
    console.log("handleContinue called", stage);
    console.log(mobile);
    setLoading(true);
    if (stage === 10) {
      try {
        const response = await axios.post(
          "https://echo-pay.onrender.com/api/send-otp",
          {
            phone: mobile,
            name: name,
            email: email,
          }
        );

        if (response.status === 200) {
          // OTP sent successfully, move to OTP entry stage
          setLoading(false);
          setStage(11);
        } else {
          console.error("Failed to send OTP");
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        setLoading(false);
      }
    } else {
      setStage(stage + 1);
      setLoading(false);
    }
  };

  const handleOTPVerification = async (otp: string) => {
    setIsVerifying(true);
    setOtpError("");
    // setLoading(true)
    try {
      const response = await axios.post(
        "https://echo-pay.onrender.com/api/verify-otp",
        {
          otp,
          phone: mobile,
        }
      );

      if (response.status === 200) {
        setIsVerifying(false);
        setIsVerified(true);
        if (response.data.responseBody === null) {
          setIsNewUser(true);
          setStage(7); //
        } else {
          setIsNewUser(false);
          setStage(7);
        }
      } else {
        // Handle OTP verification failure
        console.error("OTP verification failed");
        setOtpError("OTP verification failed. Please try again.");
        setIsVerifying(false);
      }
    } catch (error) {
      setOtpError("Incorrect OTP. Please check and try again.");
      console.error("Error during OTP verification:", error);
      setIsVerifying(false);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        "https://echo-pay.onrender.com/api/register",
        {
          phone: mobile,
          password: userPassword,
          language: selectedLanguage,
        }
      );

      if (response.status === 200) {
        console.log("User registered successfully");
        console.log(response.data, "from register");

        // Store user info in Zustand
        setInfo({
          id: response.data.responseBody.id || "",
          fullname: response.data.responseBody.fullname || "",
          email: response.data.responseBody.email || "",
          phone: response.data.responseBody.phone,
          password: response.data.responseBody.language,
          pin: response.data.responseBody.pin || null,
          image: response.data.responseBody.image || "",
          language: response.data.responseBody.language,
          balance: Number(response.data.responseBody.balance) | 0,
          isVerified: response.data.responseBody.isVerified,
          createdAt: response.data.responseBody.createdAt || "",
          updatedAt: response.data.responseBody.updatedAt || "",
          status: response.data.responseBody.status || "",
        });
        router.push("/dashboard"); // Redirect to dashboard
        setLoading(false);

        console.log("User registered successfully");
        console.log(response.data, "from register");
      } else {
        console.error("Registration failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // sigin in function
  const handleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://echo-pay.onrender.com/api/login",
        {
          phone,
          password,
        }
      );

      if (response.status === 200) {
        console.log("Login successful", response.data);
        console.log(response.data.responseBody.user, " from login");
        setInfo(response.data.responseBody.user);
        router.push("/dashboard"); // Redirect to dashboard
        setIsLoading(false);
        console.log("Login successful from login");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An error occurred while logging in. Please try again.");
      console.error("Error logging in:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-10 relative">
      <div className="h-screen w-full flex flex-col p-3 items-center justify-center">
        {showLogo && (
          <motion.div
            className={`transition-transform duration-1000 ${
              zoomLogo ? "scale-110" : "scale-100"
            }`}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
          >
            <Image src="/e.svg" alt="Logo" width={200} height={200} />
          </motion.div>
        )}

        <SplashSlides
          show={showLogo}
          stage={stage}
          setStage={setStage}
          onContinue={handleContinue}
        />

        {stage === 4 && (
          <SlideContainer custom={stage}>
            <div>
              <div className="p-4 h-screen w-full relative">
                <div className="w-full mt-[77px] mb-[88px]">
                  <h2 className="text-2xl font-medium text-start text-[#1A1A1A]">
                    Welcome Back!
                  </h2>
                  <p className="text-base text-start  mt-2">
                    Log in to your EchoPay account to access your funds and
                    manage your finances
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3 items-start">
                  <Label htmlFor="email" className="w-full text-left text-xl">
                    Email
                  </Label>
                  <InputWithIcon
                    icon={Inbox}
                    type="text"
                    placeholder="Enter your email address"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => speak("Please enter your email address")}
                  />
                </div>

                <div className="w-full flex  mt-6 flex-col gap-3 items-start">
                  <Label
                    htmlFor="password"
                    className="w-full text-left text-xl"
                  >
                    Password
                  </Label>
                  <InputWithIcon
                    icon={Eye}
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => speak("Please enter your password")}
                  />
                </div>

                <div className="w-full flex flex-col gap-8">
                  <Button
                    className="mt-[48px] bottom-0 text-[18px] font-medium text-white w-full py-[24px]"
                    onClick={handleSignIn}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="w-full flex justify-center items-center">
                    <div className="">
                      <p className="text-center w-full">
                        Don&apos;t have an account?
                      </p>
                    </div>
                    <Button
                      variant="link"
                      onClick={() => setStage(6)}
                      className="text-[18px] font-medium py-[24px]"
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SlideContainer>
        )}

        {/* language selector */}
        {stage === 6 && (
          <SlideContainer custom={stage}>
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              onContinue={() => setStage(10)}
            />
          </SlideContainer>
        )}

        {/* mobile input stage */}

        {stage === 10 && (
          <SlideContainer custom={stage}>
            <MobileInput
              mobile={mobile}
              setMobile={setMobile}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              onProceed={handleContinue}
              isLoading={loading}
              stageChange={() => {
                setStage(4);
              }}
            />
          </SlideContainer>
        )}

        {/* verification stage */}
        {stage === 11 && (
          <SlideContainer custom={stage}>
            <OTPVerification
              mobile={mobile}
              otpError={otpError}
              setStage={setStage}
              onVerify={handleOTPVerification}
            />
          </SlideContainer>
        )}
      </div>

      {/* if verified and is new user */}
      {stage === 7 && !isNewUser && isVerified && (
        <SlideContainer custom={stage}>
          <div>
            <div className="p-4 h-screen w-full relative">
              <div className="w-full mt-[77px] mb-[88px]">
                <h2 className="text-2xl font-medium text-start text-[#1A1A1A]">
                  Welcome Back!
                </h2>
                <p className="text-base text-start  mt-2">
                  Log in to your EchoPay account to access your funds and manage
                  your finances
                </p>
              </div>

              <div className="w-full flex flex-col gap-3 items-start">
                <Label htmlFor="email" className="w-full text-left text-xl">
                  Email
                </Label>
                <InputWithIcon
                  icon={Inbox}
                  type="text"
                  placeholder="Enter your email address"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => speak("Please enter your email address")}
                />
              </div>

              <div className="w-full flex  mt-6 flex-col gap-3 items-start">
                <Label htmlFor="password" className="w-full text-left text-xl">
                  Password
                </Label>
                <InputWithIcon
                  icon={Eye}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => speak("Please enter your password")}
                />
              </div>

              <div className="w-full flex flex-col gap-8">
                <Button
                  className="mt-[48px] bottom-0 text-[18px] font-medium text-white w-full py-[24px]"
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="w-full flex justify-center items-center">
                  <div className="">
                    <p className="text-center w-full">
                      Don&apos;t have an account?
                    </p>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => setStage(6)}
                    className="text-[18px] font-medium py-[24px]"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SlideContainer>
      )}

      {/* if verified and is existing user */}
      {stage === 7 && isNewUser && isVerified && (
        <SlideContainer custom={stage}>
          <UpsetPassword
            onFinish={(password) => {
              setUserPassword(password);
              handleRegister();
            }}
          />
        </SlideContainer>
      )}

      {/*
       loader 
       */}
      {isVerifying ||
        (isLoading && (
          <div className="fixed z-50 inset-0 w-full h-full bg-black/70 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white/90 animate-spin" />
          </div>
        ))}
    </div>
  );
};

export default OnboardingPage;
