import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useFarcaster } from "./providers/FarcasterProvider";
import sdk from "@farcaster/frame-sdk";
import { parseUnits } from "viem";
import { base } from "viem/chains";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

const USDC_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "implementationContract",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousAdmin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "AdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newAdmin", type: "address" }],
    name: "changeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newImplementation", type: "address" },
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newImplementation", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const FartwinConversationPage: React.FC<{
  fartwin: any;
  isAgentDead: boolean;
}> = ({ fartwin, isAgentDead }) => {
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "agent" }[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isBuyingBattery, setIsBuyingBattery] = useState(false);
  const [isInstallingBattery, setIsInstallingBattery] = useState(false);
  const [hasHadFreeBattery, setHasHadFreeBattery] = useState(
    () => localStorage.getItem("alreadyHadTheFreeBattery") === "true"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { frameContext } = useFarcaster();

  const { writeContract, data: hash, isPending, isError } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { address, isConnected } = useAccount();

  const isAgentActive =
    fartwin?.expiryTime && new Date(fartwin.expiryTime) > new Date();
  console.log(isInstallingBattery);
  console.log(isAgentActive);
  console.log(isPending);
  console.log(isSuccess);
  console.log(isError);
  console.log("THE ADDRESS IS", address);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial message when component mounts
  useEffect(() => {
    if (isAgentDead) {
      setMessages([
        {
          text: "My battery pack is over... help",
          sender: "agent",
        },
      ]);
    }
  }, [isAgentDead]);

  const buyBatteryPack = async () => {
    if (isBuyingBattery) return;

    setIsBuyingBattery(true);

    setMessages((prev) => [
      ...prev,
      {
        text: "Starting the battery purchase process... Please confirm the transaction in your wallet.",
        sender: "agent",
      },
    ]);

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
      console.log("transaction sent, from ", address);

      setMessages((prev) => [
        ...prev,
        {
          text: "Transaction sent! Waiting for confirmation...",
          sender: "agent",
        },
      ]);

      if (isSuccess) {
        setIsInstallingBattery(true);
        setMessages((prev) => [
          ...prev,
          {
            text: "Transaction confirmed! Now installing the battery...",
            sender: "agent",
          },
        ]);

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
        setIsInstallingBattery(false);
      }
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

      setMessages((prev) => [
        ...prev,
        {
          text: response.data.reply,
          sender: "agent",
        },
      ]);
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

  return (
    <div className="min-h-screen bg-[#87CEEB] text-[#800080] font-mono">
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col h-screen">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            <span className="text-black">YOUR {"     "}</span>
            <span className="text-[#800080]">FAR</span>
            <span className="text-black">TWIN</span>
          </h1>
        </div>
        <div>
          <p>
            <span
              onClick={() => {
                sdk.actions.viewProfile(fartwin.fid);
              }}
            >
              @{fartwin?.username}
            </span>{" "}
            is a Clanker token. Its CA is:{" "}
            <span
              className="cursor-pointer hover:opacity-70 relative group"
              onClick={() => {
                navigator.clipboard.writeText(fartwin.tokenAddress);
                const tooltip = document.createElement("div");
                tooltip.className =
                  "absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-sm";
                tooltip.textContent = "Copied!";
                document.body.appendChild(tooltip);
                setTimeout(() => tooltip.remove(), 2000);
              }}
            >
              {fartwin.tokenAddress}
              <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                Click to copy
              </span>
            </span>
          </p>
        </div>

        <div className="bg-white/80 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#800080]">
              Battery Life {fartwin?.lifePercentage || 0}%
            </span>
            {!isAgentDead && (
              <span className="text-sm text-gray-600">
                Dies on:{" "}
                {fartwin?.expiryTime
                  ? new Date(fartwin.expiryTime).toLocaleString()
                  : "No active battery"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden border-2 border-[#800080]">
              <div
                className="h-full bg-[#800080] rounded-full transition-all duration-300 relative"
                style={{ width: `${fartwin?.lifePercentage || 0}%` }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold"></span>
              </div>
            </div>
            {isConnected ? (
              <div className="flex flex-col">
                <motion.button
                  onClick={buyBatteryPack}
                  className="px-4 py-2 bg-[#800080] text-white text-sm font-bold rounded-lg
                         hover:bg-[#87CEEB] hover:text-[#800080] border-2 border-[#800080] transition-all duration-300
                         flex items-center gap-2 whitespace-nowrap"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isBuyingBattery}
                >
                  <span>⚡</span>
                  <span>Buy Battery Pack (1 USDC)</span>
                </motion.button>
                <p className="text-purple-600 text-sm mt-1 text-center">
                  (only on mobile)
                </p>
                <p className="text-red-500 text-sm mt-1 text-center">
                  (the first one is on us!)
                </p>
              </div>
            ) : (
              <div>
                <p>Connect your wallet to buy a battery pack</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 bg-white/80 rounded-lg p-4 shadow-inner">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Start chatting with your Fartwin!
            </div>
          ) : (
            messages.map((message, index) => (
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
                  className={`w-8 h-8 rounded-full ${
                    message.sender === "agent"
                      ? "filter grayscale transform scale-x-[-1]"
                      : ""
                  }`}
                />
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === "user"
                      ? "bg-[#800080] text-white rounded-tr-none"
                      : "bg-white text-[#800080] rounded-tl-none"
                  } shadow-md`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))
          )}
          {isLoadingMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2"
            >
              <img
                src={frameContext?.user?.pfpUrl}
                alt="Fartwin"
                className="w-8 h-8 rounded-full filter grayscale transform scale-x-[-1]"
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

        <div className="flex gap-2 bg-white/80 p-4 rounded-lg shadow-lg">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && !e.shiftKey && sendMessage()
            }
            className="flex-1 p-4 rounded-lg border-2 border-[#800080] bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#800080] focus:border-[#800080] transition-all duration-200"
            placeholder={`Chat with ${fartwin?.name || "your Fartwin"}...`}
            disabled={isLoading}
          />
          <motion.button
            onClick={sendMessage}
            className="px-8 py-4 bg-[#800080] text-white font-bold rounded-lg
                     hover:bg-[#87CEEB] hover:text-[#800080] border-2 border-[#800080] transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || !inputMessage.trim()}
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FartwinConversationPage;
