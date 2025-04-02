import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FrameContext } from "../providers/FarcasterProvider";
import axios from "axios";
import sdk from "@farcaster/frame-sdk";
import { UserCharacteristics } from "../../main";

interface DopplegangerComponentProps {
  frameContext: FrameContext;
  pfp_url: string;
  userCharacteristics: UserCharacteristics[];
}

interface DeploymentResult {
  fid: string;
  username: string;
  welcomeCastHash: string;
}

const DopplegangerComponent: React.FC<DopplegangerComponentProps> = ({
  frameContext,
  pfp_url,
  userCharacteristics,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deployedAgent, setDeployedAgent] = useState<DeploymentResult | null>(
    null
  );

  const API_BASE_URL = "https://poiesis.anky.bot";

  const handleOptionSelect = (option: string) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentStep] = option;
    setSelectedOptions(newSelectedOptions);
    setCurrentStep((prev) => prev + 1);
  };

  const handleDeploy = async () => {
    console.log("🚀 Starting deployment process...");

    if (
      !frameContext ||
      selectedOptions.length !== userCharacteristics.length
    ) {
      console.log("❌ Invalid deployment conditions, aborting");
      return;
    }

    console.log("🔄 Setting deployment state...");
    setIsDeploying(true);
    setDeploymentError(null);

    try {
      console.log("📡 Making API request to deploy doppelganger...");
      const response = await axios.post(
        `${API_BASE_URL}/doppelganger/deploy/${frameContext.user.fid}`,
        {
          choices: selectedOptions,
        }
      );

      console.log("✨ Received API response:", response.data);

      if (response.data.error) {
        console.log("💥 API returned an error");
        throw new Error(response.data.error);
      }

      if (response.data.metadata?.errorType) {
        // this means there was an error. FIX IT
        throw new Error(response.data.metadata.errorType);
      }

      console.log("🎉 Setting deployed agent details...");
      setDeployedAgent({
        fid: frameContext.user.fid.toString(),
        username: `${frameContext.user.username}-a0x`,
        welcomeCastHash: response.data.welcomeCastHash,
      });
      console.log("✅ Deployment successful!");
    } catch (error) {
      console.log("💔 Deployment failed with error:", error);
      console.error("Deployment error:", error);
      setDeploymentError(
        error instanceof Error ? error.message : "Failed to deploy FarTwin"
      );
    } finally {
      console.log("🏁 Finishing deployment process...");
      setIsDeploying(false);
    }
  };

  if (!userCharacteristics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{
            rotate: 360,
            borderColor: ["#fff", "#fff", "#fff", "#fff"],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Show deployment error with enhanced animations
  if (deploymentError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-black"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="text-white text-center p-8 border-2 border-red-500 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]"
        >
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl mb-4"
          >
            Deployment Error
          </motion.h2>
          <p className="mb-6 text-xl">{deploymentError}</p>
          <motion.button
            onClick={() => setDeploymentError(null)}
            className="px-8 py-3 bg-white text-black text-xl hover:bg-gray-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Show deployment progress with enhanced animations
  if (isDeploying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-center space-y-12"
        >
          <motion.div
            animate={{
              rotate: 360,
              boxShadow: [
                "0 0 0px rgba(255,255,255,0.5)",
                "0 0 20px rgba(255,255,255,0.8)",
                "0 0 0px rgba(255,255,255,0.5)",
              ],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="w-24 h-24 border-4 border-white border-t-transparent rounded-full mx-auto"
          />

          <div className="space-y-6">
            {[
              "Creating a new a0x AI Agent based on your preferences...",
              "Creating a wallet for your FarTwin...",
              "With it creating a new Farcaster account...",
              "Deploying to Farcaster...",
              "Generating first cast...",
            ].map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 1.5 }}
                className="text-3xl font-light"
              >
                {text}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Show success screen after deployment with enhanced animations
  if (deployedAgent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center bg-black p-8"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1.5 }}
          className="mb-12"
        >
          <motion.img
            src={pfp_url}
            className="w-64 h-64 rounded-full border-4 border-white [transform:scaleX(-1)] grayscale"
            alt="FarTwin Profile"
            animate={{
              boxShadow: [
                "0 0 0px rgba(255,255,255,0.5)",
                "0 0 30px rgba(255,255,255,0.8)",
                "0 0 0px rgba(255,255,255,0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white text-4xl mb-4"
        >
          Your FarTwin is Live!
        </motion.h2>

        <motion.p
          onClick={() => {
            sdk.actions.viewProfile({ fid: Number(deployedAgent.fid) });
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-blue-400 text-3xl mb-12"
        >
          @{deployedAgent.username}
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          onClick={() => {
            sdk.actions.openUrl(
              `https://warpcast.com/~/compose?text=${encodeURIComponent(
                `welcome to farcaster, @${deployedAgent.username}`
              )}&embeds[]=https://warpcast.com/~/conversations/${
                deployedAgent.welcomeCastHash
              }`
            );
          }}
          className="px-12 py-4 bg-white text-black text-2xl font-bold hover:bg-gray-200 border-8 border-purple-900 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Quote Cast It
        </motion.button>
      </motion.div>
    );
  }

  // Show characteristic selection interface with enhanced animations
  return (
    <div className="min-h-screen bg-black p-8">
      {/* Progress indicators */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center gap-6 mb-16"
      >
        {userCharacteristics.map((_, i) => (
          <motion.div
            key={i}
            className={`h-4 w-4 rounded-full border-2 border-white ${
              i === currentStep
                ? "bg-white"
                : i < currentStep
                ? "bg-gray-400"
                : "bg-transparent"
            }`}
            whileHover={{ scale: 1.2 }}
            animate={
              i === currentStep
                ? {
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      "0 0 0px rgba(255,255,255,0.5)",
                      "0 0 20px rgba(255,255,255,0.8)",
                      "0 0 0px rgba(255,255,255,0.5)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
          />
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {currentStep < userCharacteristics.length ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-black border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8">
              <motion.h2
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-white text-4xl mb-8"
              >
                {userCharacteristics[currentStep].label}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 mb-8 text-3xl"
              >
                {userCharacteristics[currentStep].description}
              </motion.p>

              <div className="space-y-6">
                {userCharacteristics[currentStep].options.map((option, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 + 0.5 }}
                    onClick={() => handleOptionSelect(option.value)}
                    className="w-full p-6 border-2 border-white text-white text-4xl hover:bg-white hover:text-black transition-colors"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 15px rgba(255,255,255,0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.value}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-black border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-4">
              <div className="space-y-2 my-4">
                {userCharacteristics.map((char, i) => (
                  <motion.div
                    key={i}
                    data-value={char.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between text-white text-xl"
                  >
                    <span className="font-bold">{selectedOptions[i]}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={handleDeploy}
                className="w-full py-4 bg-white text-black text-2xl font-bold hover:bg-gray-200"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(255,255,255,0.5)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Deploy FarTwin
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  setCurrentStep(0);
                  setSelectedOptions([]);
                  setDeployedAgent(null);
                }}
                className="text-black text-center mt-6 cursor-pointer hover:text-white text-xl bg-red-200 p-4 "
              >
                Start Again
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DopplegangerComponent;
