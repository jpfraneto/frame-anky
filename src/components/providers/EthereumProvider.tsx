import { createConfig, http, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { useEffect } from "react";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [miniAppConnector()],
});

console.log("Wagmi config created:", config);

export default function EthereumProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log("EthereumProvider mounted");
  }, []);
  return (
    <div>
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </div>
  );
}
