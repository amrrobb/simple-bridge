"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "@material-tailwind/react";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  sepolia,
  goerli,
  arbitrumGoerli,
  baseGoerli,
  optimismGoerli,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const { wallets } = getDefaultWallets();

const CHAINS =
  process.env.NEXT_PUBLIC_USING_TESTNET === "true"
    ? [goerli, arbitrumGoerli, baseGoerli, optimismGoerli]
    : [mainnet, optimism, arbitrum, base];

const config = getDefaultConfig({
  appName: "Simple Bridge",
  projectId: "YOUR_PROJECT_ID",
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: CHAINS as any,
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            theme={lightTheme({
              accentColor: "#31363F",
              accentColorForeground: "white",
              fontStack: "rounded",
              overlayBlur: "small",
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
