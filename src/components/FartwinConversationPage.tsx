import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useFarcaster } from "./providers/FarcasterProvider";
import { parseUnits } from "viem";
import { base } from "viem/chains";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { USDC_ABI } from "../lib/constants";
import { UserCharacteristics } from "../main";
import sdk from "@farcaster/frame-sdk";

const FartwinConversationPage: React.FC<{
  fartwin: any;
  ajaxBot: any;
  isAgentDead: boolean;
  setIsAgentDead: (isAgentDead: boolean) => void;
  userCharacteristics: UserCharacteristics[];
}> = ({
  fartwin,
  ajaxBot,
  isAgentDead,
  setIsAgentDead,
  userCharacteristics,
}) => {
  const [messages, setMessages] = useState<
    {
      text: string;
      sender: "user" | "agent";
      isStreaming?: boolean;
      action?: string;
    }[]
  >([
    {
      text: "sup",
      sender: "agent",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isBuyingBattery, setIsBuyingBattery] = useState(false);
  const [isInstallingBattery, setIsInstallingBattery] = useState(false);
  const [hasHadFreeBattery, setHasHadFreeBattery] = useState(
    () => localStorage.getItem("alreadyHadTheFreeBattery") === "true"
  );
  const [cantDeployFarTwin, setCantDeployFarTwin] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [chosenCharacteristics, setChosenCharacteristics] = useState<any[]>([]);
  const [deployingOptionsDisplay, setDeployingOptionsDisplay] = useState(false);
  const [isAllowUSDCSpending, setIsAllowUSDCSpending] = useState(false);
  const [activeAgent, setActiveAgent] = useState(
    fartwin?.agentId ? fartwin : ajaxBot
  );
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { frameContext } = useFarcaster();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { address } = useAccount();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initializeAgent = () => {
      if (fartwin) {
        setActiveAgent(fartwin);
      } else {
        setActiveAgent(ajaxBot);
        if (userCharacteristics) {
          setMessages((prev) => {
            const newMessages = [...prev];
            if (
              !prev.some(
                (msg) =>
                  msg.text === "You don't have a Fartwin yet. Let's create one."
              )
            ) {
              newMessages.push({
                text: "You don't have a Fartwin yet. Let's create one.",
                sender: "agent",
              });
            }
            if (
              !prev.some(
                (msg) =>
                  msg.text === userCharacteristics[currentStep]?.description
              )
            ) {
              newMessages.push({
                text: userCharacteristics[currentStep]?.description,
                sender: "agent",
              });
            }
            return newMessages;
          });
        }
      }
    };

    initializeAgent();
  }, [fartwin, userCharacteristics, currentStep]);

  // Add initial message when component mounts
  useEffect(() => {
    if (isAgentDead) {
      setMessages([
        {
          text: "Agent is dead. My battery pack is over... help",
          sender: "agent",
          action: "buy-battery",
        },
      ]);
    }
  }, [isAgentDead]);

  useEffect(() => {
    if (!isPending && hash) {
      setIsBuyingBattery(false);
      setMessages((prev) => [
        ...prev,
        {
          text: `Transaction is being processed. The hash is ${hash}... Wait a while for confirmation...`,
          sender: "agent",
        },
      ]);
    }
  }, [isPending]);

  useEffect(() => {
    const installBattery = async () => {
      if (isSuccess && hash) {
        setIsInstallingBattery(true);
        setMessages((prev) => [
          ...prev,
          {
            text: "Transaction confirmed! Now installing the battery...",
            sender: "agent",
          },
        ]);

        try {
          await axios.post(
            `https://poiesis.anky.bot/doppelganger/buy-battery/${frameContext?.user?.fid}`,
            {
              amount: 1,
              transactionHash: hash,
              agentId: fartwin.agentId,
            }
          );

          if (!hasHadFreeBattery) {
            localStorage.setItem("alreadyHadTheFreeBattery", "true");
            setHasHadFreeBattery(true);
          }

          setMessages((prev) => [
            ...prev,
            {
              text: "Battery installation complete! I'm back online and will live for 7 more days. How can I help you today?",
              sender: "agent",
            },
          ]);
          setIsAgentDead(false);
        } catch (error) {
          console.error("Error installing battery:", error);
          setMessages((prev) => [
            ...prev,
            {
              text: "There was an error installing the battery. Please try again.",
              sender: "agent",
            },
          ]);
        } finally {
          setIsInstallingBattery(false);
        }
      }
    };

    installBattery();
  }, [isSuccess]);

  const buyBatteryPack = async () => {
    if (isBuyingBattery) return;
    console.log("isInstallingBattery", isInstallingBattery);

    setIsBuyingBattery(true);
    if (!isAllowUSDCSpending) {
      setMessages((prev) => [
        ...prev,

        {
          text: "First you need to allow the contract to spend your USDC",
          action: "allow-usdc-spending",
          sender: "agent",
        },
      ]);
      setIsAllowUSDCSpending(true);
      setIsBuyingBattery(false);
    }

    try {
      console.log("buying battery");
      const amount = parseUnits("1", 6);
      await writeContract({
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        abi: USDC_ABI,
        functionName: "transfer",
        args: ["0xA8f3F067c8Acd74Eb94d1D708Bed2e6C39AAdD81", amount],
        chainId: base.id,
      });
      console.log("THE HASH IS", hash);
      console.log("transaction sent, from ", address);
    } catch (error: any) {
      console.error("Error buying battery pack:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error during the battery purchase process. Please try again.",
          sender: "agent",
        },
      ]);
    } finally {
      setIsBuyingBattery(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !frameContext?.user?.fid) return;

    if (isAgentDead) {
      setMessages((prev) => [
        ...prev,
        {
          text: inputMessage,
          sender: "user",
        },
        {
          text: "I cannot respond right now because my battery has run out. Please buy a new battery pack to reactivate me!",
          sender: "agent",
          action: "buy-battery",
        },
      ]);
      setInputMessage("");
      return;
    }

    const newMessage = {
      text: inputMessage,
      sender: "user" as const,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoadingMessage(true);

    try {
      const conversation = [...messages, newMessage].map((msg) => ({
        content: msg.text,
        role: msg.sender === "user" ? "user" : "assistant",
      }));

      const response = await axios.post(
        `https://poiesis.anky.bot/doppelganger/chat-with-fartwin/${fartwin.agentId}`,
        {
          conversation,
          fid: frameContext.user.fid,
        }
      );
      console.log("THE RESPONSE IS", response.data);
      let action = "";
      if (response.data.text.includes("Agent is dead.")) {
        action = "buy-battery";
      }

      setMessages((prev) => [
        ...prev,
        {
          text: response.data.message,
          sender: "agent",
          isStreaming: true,
          action: action,
        },
      ]);

      // Simulate streaming by setting a timeout
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, isStreaming: false } : msg
          )
        );
        setUserOptions(["Option 1", "Option 2", "Option 3", "Option 4"]);
      }, 2000); // Adjust the timeout duration as needed
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: error?.data?.error,
          sender: "agent",
        },
      ]);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  const handleDeploy = async () => {
    console.log("🚀 Starting deployment process...");

    if (
      !frameContext ||
      chosenCharacteristics.length !== userCharacteristics.length
    ) {
      console.log("❌ Invalid deployment conditions, aborting");
      setMessages((prev) => [
        ...prev,
        {
          text: "Deployment conditions are invalid. Aborting deployment.",
          sender: "agent",
        },
      ]);
      return;
    }

    console.log("🔄 Setting deployment state...");

    setMessages((prev) => [
      ...prev,
      {
        text: "Deploying your FarTwin. Please wait...",
        sender: "agent",
      },
    ]);

    try {
      console.log("📡 Making API request to deploy FarTwin...");
      const response = await axios.post(
        `https://poiesis.anky.bot/doppelganger/deploy/${frameContext.user.fid}`,
        {
          choices: chosenCharacteristics,
        }
      );

      console.log("✨ Received API response:", response.data);

      if (response.data.error) {
        console.log("💥 API returned an error");
        throw new Error(response.data.error);
      }

      if ((response.data.action = "NONE")) {
        setCantDeployFarTwin(true);
        return setMessages((prev) => [
          ...prev,
          {
            text: response.data.text,
            sender: "agent",
          },
        ]);
      }

      if (response.data.metadata?.errorType) {
        // this means there was an error. FIX IT
        setMessages((prev) => [
          ...prev,
          {
            text: response.data.text,
            sender: "agent",
          },
        ]);
      }

      console.log("🎉 Setting deployed agent details...");
      setActiveAgent({
        fid: frameContext.user.fid.toString(),
        username: `${frameContext.user.username}-a0x`,
        welcomeCastHash: response.data.welcomeCastHash,
        agentId: response.data.agentId,
      });
      console.log("✅ Deployment successful!");
      setMessages((prev) => [
        ...prev,
        {
          text: "Deployment successful! Your FarTwin is ready.",
          sender: "agent",
        },
      ]);
    } catch (error) {
      console.log("💔 Deployment failed with error:", error);
      console.error("Deployment error:", error);

      setMessages((prev) => [
        ...prev,
        {
          text: `Deployment failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          sender: "agent",
        },
      ]);
    } finally {
      console.log("🏁 Finishing deployment process...");
    }
  };

  const handleOptionClick = (option: string) => {
    setChosenCharacteristics((prev) => [...prev, option]);
    setCurrentStep(currentStep + 1);
    setMessages((prev) => [
      ...prev,
      {
        text: option,
        sender: "user",
      },
    ]);
    setUserOptions([]);
    if (currentStep === userCharacteristics.length - 1) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Ok. Based on this, i can deploy your FarTwin. This is what i will do now for you: Create a new ethereum wallet. Use it to create a new farcaster account. Use it to deploy a clanker token that represents the agent. Then the agent will cast. And you will be given the chance to quote cast it. And the next time you open the frame you will be able to talk to it. My job here is done. Thank you.",
          sender: "agent",
        },
      ]);

      setDeployingOptionsDisplay(true);
    }
  };

  const allowUSDCSpending = async () => {
    setIsAllowUSDCSpending(true);
    setMessages((prev) => [
      ...prev,
      {
        text: "USDC spending allowed. Please buy a battery pack for 1 usdc",
        sender: "agent",
        action: "buy-battery",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#87CEEB] text-[#800080] font-mono">
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col h-screen">
        <div className="flex  gap-4 mb-4">
          <div className="flex flex-col items-left">
            <span className="text-white text-lg">
              <span
                className="text-black"
                onClick={() => {
                  console.log("the active agent is", activeAgent, fartwin);
                  // sdk.actions.viewProfile(activeAgent.fid);
                }}
              >
                @{activeAgent.username}
              </span>{" "}
            </span>
            <div className="w-48 h-6 bg-gray-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-green-800"
                style={{ width: `${activeAgent?.lifePercentage || 0}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#800080]">
                Battery Life {activeAgent?.lifePercentage || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 ">
          {messages.map((message, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={index}
              className={`mb-4 flex items-start gap-2 ${
                message.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <img
                src={frameContext?.user?.pfpUrl}
                alt={message.sender === "user" ? "User" : "Fartwin"}
                className={`w-12 h-12 rounded-full ${
                  message.sender === "agent"
                    ? "filter grayscale transform scale-x-[-1]"
                    : ""
                }`}
              />
              <div
                onClick={() => {
                  console.log("clicked", frameContext);
                }}
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-[#800080] text-white rounded-tr-none"
                    : "bg-white text-[#800080] rounded-tl-none"
                } shadow-md`}
              >
                {message.text}
                {message.isStreaming && (
                  <div className="flex gap-2">
                    <span className="animate-bounce">•</span>
                    <span
                      className="animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    >
                      •
                    </span>
                    <span
                      className="animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    >
                      •
                    </span>
                  </div>
                )}
                {message?.action === "allow-usdc-spending" && (
                  <button
                    className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded mt-4"
                    onClick={() => {
                      allowUSDCSpending();
                    }}
                  >
                    Allow USDC Spending
                  </button>
                )}
                {message?.action === "buy-battery" && (
                  <button
                    className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded mt-4"
                    onClick={buyBatteryPack}
                  >
                    <span className="mr-2">BUY BATTERY PACK</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {isLoadingMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2"
            >
              <img
                src={frameContext?.user?.pfpUrl}
                alt="Fartwin"
                className="w-12 h-12 rounded-full filter grayscale transform scale-x-[-1]"
              />
              <div className="bg-white text-[#800080] p-3 rounded-2xl rounded-tl-none shadow-md">
                <div className="flex gap-2">
                  <span className="animate-bounce">•</span>
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  >
                    •
                  </span>
                  <span
                    className="animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  >
                    •
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {!fartwin && userCharacteristics.length > 0 && (
          <div className="grid grid-cols-1 gap-6 mt-6">
            {userCharacteristics[currentStep]?.options.map((option, index) => (
              <button
                key={index}
                className={`text-white text-3xl font-bold px-6 py-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${
                  index % 3 === 0
                    ? "bg-purple-700"
                    : index % 3 === 1
                    ? "bg-purple-500"
                    : "bg-purple-600"
                } ${
                  userOptions.length === 3 && index === 2 ? "col-span-2" : ""
                }`}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.value}
              </button>
            ))}
          </div>
        )}

        {deployingOptionsDisplay && !cantDeployFarTwin && (
          <div className="mt-4 flex gap-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              onClick={handleDeploy}
            >
              Deploy
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
              onClick={() => {
                setMessages([
                  {
                    text: "sup",
                    sender: "agent",
                  },
                ]);
                setCurrentStep(0);
                setChosenCharacteristics([]);
                setDeployingOptionsDisplay(false);
              }}
            >
              Start Again
            </button>
          </div>
        )}
        {activeAgent.welcomeCastHash && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            onClick={() => {
              sdk.actions.openUrl(
                `https://warpcast.com/~/compose?text=${encodeURIComponent(
                  `welcome to farcaster, @${activeAgent.username}`
                )}&embeds[]=https://warpcast.com/~/conversations/${
                  activeAgent.welcomeCastHash
                }`
              );
            }}
            className="px-12 py-4 bg-white text-black text-2xl font-bold hover:bg-gray-200 border-8 border-purple-900 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Quote Cast It
          </motion.button>
        )}
        {fartwin && (
          <div className="mt-4 flex">
            <input
              type="text"
              className="flex-1 p-2 border border-gray-100 bg-gray-100 text-black rounded-l-lg"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FartwinConversationPage;
