// App.tsx
import { useFarcaster } from "./components/providers/FarcasterProvider";
import { motion } from "framer-motion";
import { UserCharacteristics } from "./main";
import FartwinConversationPage from "./components/FartwinConversationPage";
import { ajaxBot } from "./lib/constants";

interface AppProps {
  userCharacteristics: UserCharacteristics[];
  fartwin: any;
  isAgentDead: boolean;
  setIsAgentDead: (isAgentDead: boolean) => void;
  isLoading: boolean;
}

const App: React.FC<AppProps> = ({
  userCharacteristics,
  fartwin,
  isAgentDead,
  setIsAgentDead,
  isLoading,
}) => {
  const { frameContext } = useFarcaster();
  console.log("IS LOADING", isLoading);
  if (isLoading || !frameContext) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-24 h-24 rounded-full bg-white"
        />
      </div>
    );
  }

  if (userCharacteristics) {
    return (
      <FartwinConversationPage
        setIsAgentDead={setIsAgentDead}
        userCharacteristics={userCharacteristics}
        fartwin={fartwin}
        ajaxBot={ajaxBot}
        isAgentDead={isAgentDead}
      />
    );
  }
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-24 h-24 rounded-full bg-white"
      />
    </div>
  );
};

export default App;
