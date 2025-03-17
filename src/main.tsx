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
import EthereumProvider from "./components/providers/EthereumProvider";
import Leaderboard from "./components/leaderboard";
import Info from "./components/info";
import TopBar from "./components/interface/TopBar";
import AnkyProvider from "./components/providers/AnkyProvider";

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

function Root() {
  console.log("Rendering Root component");
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [frameContext, setFrameContext] = useState<FrameContext | null>(null);

  useEffect(() => {
    const load = async () => {
      console.log("Initializing SDK...");
      sdk.actions.ready();
      const context = await sdk.context;
      console.log("SDK context loaded:", context);
      setFrameContext(context as FrameContext);
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <>
      <TopBar />

      <Routes>
        <Route path="/" element={<App frameContext={frameContext!} />} />
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
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AnkyProvider>
            <FarcasterProvider>
              <EthereumProvider>
                <Root />
              </EthereumProvider>
            </FarcasterProvider>
          </AnkyProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>
);
