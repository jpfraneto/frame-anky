import "./index.css";

import React, {
  useEffect,
  useState,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import sdk from "@farcaster/frame-sdk";
import App from "./App";
import { FrameContext } from "./components/providers/FarcasterProvider";
import FarcasterProvider from "./components/providers/FarcasterProvider";
import { WagmiProvider } from "wagmi";
import Leaderboard from "./components/leaderboard";
import Info from "./components/info";
import A0XProvider from "./components/providers/A0XProvider";
import InfoModal from "./components/info/InfoModal";
import axios from "axios";
import { config } from "./lib/wagmiConfig";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

console.log("QueryClient created:", queryClient);

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-screen bg-black text-white p-8 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <pre className="bg-gray-800 p-4 rounded mb-6 max-w-2xl overflow-auto">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export interface UserCharacteristics {
  emoji: string;
  label: string;
  description: string;
  options: [
    {
      value: string;
      description: string;
    }
  ];
}

function Root() {
  console.log("Rendering Root component");
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [frameContext, setFrameContext] = useState<FrameContext | null>(null);
  const [displayInfoModal, setDisplayInfoModal] = useState(false);
  const [fartwin, setFartwin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userCharacteristics, setUserCharacteristics] = useState<
    UserCharacteristics[]
  >([]);
  const [agentIsDead, setAgentIsDead] = useState(false);

  useEffect(() => {
    const load = async () => {
      console.log("Initializing SDK...");

      await sdk.actions.ready();
      const context = await sdk.context;
      console.log("SDK context loaded:", context);
      setFrameContext(context as FrameContext);
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    const calculateLifePercentage = (deathTimestamp: string) => {
      console.log("CALCULATING LIFE PERCENTAGE", deathTimestamp);
      const currentTimestamp = new Date().getTime();
      const lifeDuration =
        new Date(deathTimestamp).getTime() - currentTimestamp;
      console.log("LIFE DURATION", lifeDuration);
      if (lifeDuration < 0) {
        setAgentIsDead(true);
        return 0;
      }
      const lifePercentage = (lifeDuration / (88 * 60 * 60 * 1000)) * 100;
      return lifePercentage;
    };

    const fetchUserHasFartwin = async () => {
      if (frameContext?.user?.fid) {
        console.log("FRAME CONTEXT", frameContext);
        const response = await axios.get(
          `https://poiesis.anky.bot/doppelganger/agents/${frameContext?.user?.fid}`
        );
        console.log("agents api response:", response.data);

        const hasFartwin =
          response.data.agents && response.data.agents.length > 0;

        if (hasFartwin) {
          const userAgents = response.data.agents;
          setFartwin({
            fid: userAgents[0].farcasterClient.fid,
            username: userAgents[0].farcasterClient.username,
            displayName: userAgents[0].farcasterClient.display_name,
            pfpUrl: userAgents[0].farcasterClient.pfp_url,
            walletAddress: userAgents[0].agentWallet.walletAddress,
            tokenAddress: userAgents[0].token.address,
            tokenSymbol: userAgents[0].token.symbol,
            expiryTime: userAgents[0].life?.deathTimestamp,
            lifePercentage: calculateLifePercentage(
              userAgents[0].life?.deathTimestamp
            ),
            agentId: userAgents[0].agentId,
          });
          setIsLoading(false);
        } else {
          setFartwin(null);
          setUserCharacteristics(response.data.characteristics);
          setIsLoading(false);
        }
      }
    };
    fetchUserHasFartwin();
  }, [frameContext]);

  return (
    <>
      {displayInfoModal && (
        <InfoModal
          isOpen={displayInfoModal}
          onClose={() => setDisplayInfoModal(false)}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <App
              userCharacteristics={userCharacteristics}
              fartwin={fartwin}
              isAgentDead={agentIsDead}
              isLoading={isLoading}
              setIsAgentDead={setAgentIsDead}
            />
          }
        />
        <Route
          path="/leaderboard"
          element={<Leaderboard isOpen={true} onClose={() => {}} />}
        />
        <Route
          path="/info"
          element={<Info isOpen={true} onClose={() => {}} />}
        />
      </Routes>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <BrowserRouter>
            <A0XProvider>
              <FarcasterProvider>
                <Root />
              </FarcasterProvider>
            </A0XProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
