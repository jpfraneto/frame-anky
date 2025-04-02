// App.tsx
import DopplegangerComponent from "./components/doppleganger/DopplegangerComponent";
import { useFarcaster } from "./components/providers/FarcasterProvider";
import { motion } from "framer-motion";
import { UserCharacteristics } from "./main";

interface AppProps {
  userCharacteristics: UserCharacteristics[];
}

const App: React.FC<AppProps> = ({ userCharacteristics }) => {
  const { frameContext } = useFarcaster();

  if (!frameContext) {
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

  if (true)
    return (
      <DopplegangerComponent
        userCharacteristics={userCharacteristics}
        pfp_url={frameContext?.user.pfpUrl!}
        frameContext={frameContext!}
      />
    );
};

export default App;
