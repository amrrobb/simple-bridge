"use client";

import * as React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SwapForm } from "./component/BridgeForm";
import { Avatar } from "@material-tailwind/react";

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between py-12 px-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
            <div className="flex items-center">
              <Avatar
                src="/bridge.png"
                alt="Bridge Logo"
                className="bg-white"
                size="md"
              />
              <p className="ml-2 font-extrabold	italic font-mono text-2xl subpixel-antialiased	">
                Verdex
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: 12,
            }}
          >
            <ConnectButton />
          </div>
        </div>

        <div className="w-3/4 mx-auto">
          <SwapForm />
        </div>
      </main>
    </>
  );
}
