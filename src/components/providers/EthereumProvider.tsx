import { createConfig, http, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { frameConnector } from "../../lib/connector";
import { useEffect } from "react";

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [frameConnector()],
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
