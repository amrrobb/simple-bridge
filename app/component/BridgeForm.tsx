"use client";

import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import Image from "next/image";
import { Button, Switch, Spinner, Tooltip } from "@material-tailwind/react";
import {
  ArrowsUpDownIcon,
  WalletIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { Squid } from "@0xsquid/sdk";
import { ChainData, Token as TokenData } from "@0xsquid/sdk/dist/types";
import { formatBalance } from "../utils";

import { ethers } from "ethers";
import { MenuChain, MenuToken, DisplayBalance } from ".";
import debounce from "lodash.debounce";
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
import { convertDecimalToInteger, convertIntegerToDecimal } from "../utils";
import { DirectionType, RouteData } from "../types";
import Big from "big.js";

// Mainnet: Ethereum,, Optimism,, Arbitrum, Base,
const CHAIN_IDS = [mainnet.id, optimism.id, arbitrum.id, base.id]
  .join()
  .split(",");

// Testnet: Ethereum,, Optimism,, Arbitrum, Base,
const CHAIN_ID_TESTS = [
  sepolia.id,
  goerli.id,
  arbitrumGoerli.id,
  baseGoerli.id,
  optimismGoerli.id,
]
  .join()
  .split(",");

const symbolEth = "eth";
const symbolUsdc = "usdc";
const symbolUsdt = "usdt";

const isTestnet = process.env.NEXT_PUBLIC_USING_TESTNET === "true";
// baseUrl:
const baseUrl = !isTestnet
  ? "https://v2.api.squidrouter.com"
  : "https://testnet.v2.api.squidrouter.com";
const integratorId = process.env.NEXT_PUBLIC_INTEGRATOR_ID!;

const validChainIds: string[] = !isTestnet ? CHAIN_IDS : CHAIN_ID_TESTS;

export const SwapForm = () => {
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  // Address
  const { address } = useAccount();
  const [otherAddress, setOtherAddress] = useState("");
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);

  // Chains
  const [fromChain, setFromChain] = useState<ChainData>();
  const [toChain, setToChain] = useState<ChainData>();
  const [validChains, setValidChains] = useState<ChainData[]>();

  // Tokens
  const [fromToken, setFromToken] = useState<TokenData>();
  const [toToken, setToToken] = useState<TokenData>();
  const [validFromTokens, setValidFromTokens] = useState<TokenData[]>();
  const [validToTokens, setValidToTokens] = useState<TokenData[]>();

  // Amount
  const [fromTokenAmount, setFromTokenAmount] = useState("0");
  const [fromConverseAmount, setFromConverseAmount] = useState("0.00");
  const [fromTokenBalance, setFromTokenBalance] = useState("0.00");

  const [route, setRoute] = useState<RouteData>();
  const [requestId, setRquestId] = useState<string>();
  const [routeLoading, setRouteLoading] = useState(false);

  const [toTokenAmount, setToTokenAmount] = useState("0");
  const [toConverseAmount, setToConverseAmount] = useState("0.00");
  const [, setToTokenBalance] = useState("0.00");

  const squid: Squid = new Squid({
    baseUrl,
    integratorId,
  });

  function isInsufficient(): boolean {
    const fromAmount = new Big(fromTokenAmount);
    const balance = new Big(fromTokenBalance);

    if (
      fromAmount.gt(balance) ||
      (fromAmount.eq(0) && fromTokenAmount.length > 1)
    ) {
      return true;
    }
    return false;
  }

  function isRouteValid(): boolean {
    const fromAmount = new Big(fromTokenAmount);
    if (
      route &&
      fromAmount.gt(0) &&
      fromTokenAmount.length > 1 &&
      !routeLoading
    ) {
      return true;
    }
    return false;
  }

  function isChainValid(): boolean {
    if (fromChain!.chainId === walletClient!.chain.id.toString()) {
      return true;
    }
    return false;
  }

  function calculateFeeCosts(): string {
    const sum = route!.estimate.feeCosts.reduce((total, current) => {
      return total + parseFloat(current.amountUsd);
    }, 0);

    // Format the sum to have two decimal places
    const formattedSum = sum.toFixed(2);
    return formattedSum;
  }

  const handleSwitchToggle = () => {
    setIsSwitchEnabled(!isSwitchEnabled);
  };

  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove any non-numeric characters except dot (.)
    const sanitizedValue = inputValue.replace(/[^0-9.]/g, "");
    // Check if the new value contains more than one dot or if it starts with a dot
    const hasMultipleDots =
      sanitizedValue.indexOf(".") !== sanitizedValue.lastIndexOf(".");
    const startsWithDot = sanitizedValue.startsWith(".");

    // If the new value contains more than one dot or starts with a dot, ignore the input
    if (
      hasMultipleDots ||
      startsWithDot ||
      sanitizedValue.split(".")[1]?.length > 6
    )
      return;

    // Check if the new value is empty or only contains a dot
    if (sanitizedValue === "" || sanitizedValue === ".") {
      // If empty or only contains a dot, set the value to "0"
      setFromTokenAmount("0");
    } else {
      // Otherwise, update the state with the sanitized value
      setFromTokenAmount(sanitizedValue);
    }
  };

  const handleRoute = async () => {
    setRouteLoading(true);
    await squid.init();
    // Set up parameters for swapping tokens and depositing into Radiant lending pool
    const params = {
      fromAddress: address as string,
      fromChain: fromToken?.chainId!,
      fromToken: fromToken?.address!,
      fromAmount: convertDecimalToInteger(
        fromTokenAmount,
        fromToken?.decimals!
      ),
      toChain: toToken?.chainId!,
      toToken: toToken?.address!,
      toAddress: isSwitchEnabled ? otherAddress : address!,
      slippage: 0.5,
      slippageConfig: {
        autoMode: 1,
      },
      quoteOnly: false,
    };

    try {
      const { route, requestId } = await squid!.getRoute(params);
      const estimate = route.estimate;
      setRouteLoading(false);

      setRoute(route);
      setRquestId(requestId);

      setToTokenAmount(
        convertIntegerToDecimal(estimate.toAmountMin!, toToken?.decimals!)
      );
      setFromConverseAmount(estimate.fromAmountUSD!);
      setToConverseAmount(estimate.toAmountMinUSD!);
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleExecuteTx = async () => {
    try {
      await squid.init();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(address);

      //   Execute the swap and deposit transaction
      const tx = (await squid.executeRoute({
        signer,
        route: route!,
      })) as unknown as ethers.TransactionResponse;
      const txReceipt = await tx.wait();

      console.log(txReceipt, "txReceipt");

      await new Promise((resolve) => setTimeout(resolve, 5000));

      const status = await squid.getStatus({
        transactionId: txReceipt?.hash!,
        requestId: requestId!,
        integratorId: integratorId,
      });

      // Display the route status
      console.log(`Route status: ${status.squidTransactionStatus}`);
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleSwithChain = () => {
    switchChain({ chainId: Number(fromChain!.chainId!) });
  };

  const handleReceiveMenuChainValue = debounce(
    ({ data, direction }: { data: ChainData; direction: DirectionType }) => {
      function selectIdx(chainId: string) {
        return chainId === "1" ? 1 : 0;
      }

      if (direction === "from") {
        if (data.chainId === toChain?.chainId) {
          // const changed = validChains![selectIdx(data.chainId)];
          setToChain(validChains![selectIdx(data.chainId!.toString())]);
        }
        setFromChain(data);
      }
      if (direction === "to") {
        if (data.chainId === fromChain?.chainId) {
          setFromChain(validChains![selectIdx(data.chainId!.toString())]);
        }
        setToChain(data);
      }
    },
    100
  );

  const handleReceiveMenuTokenValue = debounce(
    ({ data, direction }: { data: TokenData; direction: DirectionType }) => {
      if (direction === "from") {
        setFromToken(data);
      }
      if (direction === "to") {
        setToToken(data);
      }
    },
    100
  );

  const handleReceiveBalanceValue = ({
    data,
    direction,
  }: {
    data: string;
    direction: DirectionType;
  }) => {
    if (direction === "from") {
      setFromTokenBalance(data);
    }
    if (direction === "to") {
      setToTokenBalance(data);
    }
  };

  const handleSwitch = debounce(() => {
    const tempChain = fromChain;
    setFromChain(toChain);
    setToChain(tempChain);
  }, 100);

  const initChain = async () => {
    try {
      // instantiate the SDK
      await squid.init();
      fetchChains();

      await handleFromTokens(validChainIds[0]);
      await handleToTokens(validChainIds[1]);
    } catch (error) {
      console.error("Error initializing squid or fetching data:", error);
    }
  };

  const fetchChains = () => {
    const fetchChains = squid.chains.filter((c) =>
      validChainIds.includes(c.chainId)
    );

    setFromChain(fetchChains[0]);
    setToChain(fetchChains[1]);
    setValidChains(fetchChains);
  };

  const fetchToken = (symbol: string, chainId: string) => {
    return squid.tokens.find((t) => {
      return t.symbol.toLowerCase() === symbol && t.chainId === chainId;
    });
  };

  const fetchTokens = (chainId: string): TokenData[] => {
    const tokenEth = fetchToken(symbolEth, chainId);
    const tokenUsdc = fetchToken(symbolUsdc, chainId);
    const tokenUsdt = fetchToken(symbolUsdt, chainId);

    return [tokenEth!, tokenUsdc!, tokenUsdt!].filter(
      (item) => item !== undefined
    );
  };

  const handleFromTokens = async (chainId: string) => {
    await squid.init();
    const tokens = fetchTokens(chainId);

    setValidFromTokens(tokens);
    setFromToken(tokens[0]);
  };

  const handleToTokens = async (chainId: string) => {
    await squid.init();
    const tokens = fetchTokens(chainId);
    setValidToTokens(tokens);
    setToToken(tokens[0]);
  };

  useEffect(() => {
    initChain();
  }, []);

  useEffect(() => {
    const amount = new Big(fromTokenAmount);
    const balance = new Big(fromTokenBalance);
    if (
      fromToken &&
      toToken &&
      fromTokenAmount &&
      amount.gt(0) &&
      amount.lte(balance)
    ) {
      handleRoute();
    }
  }, [fromToken, toToken, fromTokenAmount]);

  useEffect(() => {
    if (fromChain) {
      handleFromTokens(fromChain.chainId);
    }
  }, [fromChain]);

  useEffect(() => {
    if (toChain) {
      handleToTokens(toChain.chainId);
    }
  }, [toChain]);

  return (
    <div className="w-full px-9 py-5 rounded-lg my-8">
      <form className="bg-white rounded-2xl shadow-2xl px-8 py-6 mx-auto">
        <h1 className="text-gray-800 font-bold text-2xl mb-5">Bridge</h1>

        <div
          id="input-address-from"
          className="flex 
          items-center border-2 mb-4 py-2 px-3 
          rounded-2xl text-gray-500"
        >
          <div className="w-5 mr-6">
            <p>From</p>
          </div>
          <p>:</p>

          <input
            id="fromAddress"
            type="text"
            readOnly
            className="pl-2 w-full outline-none border-none bg-transparent"
            value={`${address || ""}`}
          />
        </div>

        <div
          id="bridge-input-from"
          className="border-2 mb-5 py-5 px-3 rounded-2xl"
        >
          <div className="flex justify-between mx-5">
            <div className="">
              {fromChain && validChains ? (
                <MenuChain
                  onSendValue={handleReceiveMenuChainValue}
                  chains={validChains}
                  currentChain={fromChain}
                  direction="from"
                />
              ) : (
                <></>
              )}
            </div>

            <div className="ml-auto">
              {fromToken && validFromTokens ? (
                <MenuToken
                  onSendValue={handleReceiveMenuTokenValue}
                  currentTokens={validFromTokens}
                  currentToken={fromToken}
                  direction="from"
                />
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="ml-5 my-2">
            <input
              id="token-amount"
              type="text"
              className="pl-2 w-full text-2xl text-gray-500 outline-none border-none bg-transparent"
              value={fromTokenAmount}
              onChange={handleTokenAmountChange}
              autoComplete="off"
            />
          </div>

          <div className="flex justify-between mx-7 text-gray-400">
            <p className="text-sm">$ {formatBalance(fromConverseAmount)}</p>
            <div className="flex items-center">
              <WalletIcon title={"wallet"} className="h-4 w-4 text-gray-500" />
              <p className="ml-1 text-sm">
                <>Balance : </>
                {address && fromToken ? (
                  <DisplayBalance
                    onSendValue={handleReceiveBalanceValue}
                    currentToken={fromToken}
                    direction="from"
                    address={address}
                  />
                ) : (
                  <>0.00</>
                )}
              </p>
            </div>
          </div>
        </div>

        <div id="swith-token" className="flex items-center my-2 rounded-2xl">
          <div
            className="
            rounded-2xl
            items-center my-1 mx-auto 
            hover:outline 
            hover:outline-2 
            hover:outline-offset-2 
            hover:outline-indigo-500
            "
          >
            <Button
              className="items-center my-1 mx-auto 
            hover:bg-transparent 
            hover:rotate-180
            text-gray-500"
              variant="text"
              onClick={handleSwitch}
            >
              <ArrowsUpDownIcon className="w-8 h-10  mx-auto" />
            </Button>
          </div>
        </div>

        <div className="mb-2 py-2 px-3">
          <Switch
            label="Choose other address"
            className="checked:bg-indigo-600"
            crossOrigin={undefined}
            checked={isSwitchEnabled}
            onChange={handleSwitchToggle}
          />
        </div>
        <div
          id="input-address-to"
          className="flex items-center border-2 mb-4 py-2 px-3 rounded-2xl"
        >
          <div className="w-5 mr-6 text-gray-500">
            <p>To</p>
          </div>
          <p>:</p>
          <input
            id="toAddress"
            type="text"
            className="pl-2 w-full outline-none border-none bg-transparent"
            placeholder={
              isSwitchEnabled ? "Enter Address..." : `${address || ""}`
            }
            disabled={!isSwitchEnabled}
            onChange={(e) => setOtherAddress(e.target.value)}
          />
        </div>
        <div
          id="bridge-input-to"
          className="border-2 mb-5  py-5 px-3 rounded-2xl"
        >
          <div className="flex justify-between">
            <div className="ml-7">
              {toChain && validChains ? (
                <MenuChain
                  onSendValue={handleReceiveMenuChainValue}
                  chains={validChains}
                  currentChain={toChain}
                  direction="to"
                />
              ) : (
                <></>
              )}
            </div>

            <div className="mr-7 ml-auto">
              {toToken && validToTokens ? (
                <MenuToken
                  onSendValue={handleReceiveMenuTokenValue}
                  currentTokens={validToTokens}
                  currentToken={toToken}
                  // otherChain={toChain}
                  direction="to"
                />
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="ml-5 my-2">
            <input
              id="to-token-amount"
              type="text"
              className="pl-2 w-full text-2xl text-gray-500 outline-none border-none bg-transparent"
              value={formatBalance(toTokenAmount)}
              // onChange={handleTokenAmountChange}
              autoComplete="off"
            />
          </div>

          <div className="flex justify-between mx-7 text-gray-400">
            <p className="text-sm">$ {toConverseAmount}</p>
            <div className="flex items-center">
              <WalletIcon title={"wallet"} className="h-4 w-4 text-gray-500" />
              <p className="ml-1 text-sm">
                <>Balance : </>
                {address && toToken ? (
                  <DisplayBalance
                    onSendValue={handleReceiveBalanceValue}
                    currentToken={toToken}
                    direction="to"
                    address={address}
                  />
                ) : (
                  <>0.00</>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="px-2 flex items-center">
          <Image
            src="/gas.svg"
            alt="Gas Logo"
            className="fill-gray-500 text-gray-500 dark:invert mx-2"
            width={15}
            height={15}
          />

          {isRouteValid() ? (
            <div className="flex items-center">
              <p className="text-gray-500 mr-2">$ {calculateFeeCosts()}</p>
              <div>
                <Tooltip content="Total fee costs estimation to bridge">
                  <InformationCircleIcon className="text-gray-500 w-5 h-5" />
                </Tooltip>
              </div>
            </div>
          ) : (
            <p>-</p>
          )}
        </div>

        <div className="mb-2 mt-5">
          {isInsufficient() ? (
            <Button
              variant="gradient"
              color="gray"
              className="block w-full  py-4  hover:-translate-y-1 transition-all duration-500 text-white font-semibold capitalize text-lg"
              size="lg"
              disabled={true}
            >
              Insufficient Amount
            </Button>
          ) : fromChain && walletClient && isChainValid() ? (
            <Button
              variant="outlined"
              className="block w-full bg-indigo-600 py-4 hover:-translate-y-1 transition-all duration-500 text-white font-semibold capitalize text-lg"
              size="lg"
              disabled={routeLoading}
              onClick={() => handleExecuteTx()}
            >
              {!routeLoading ? (
                "Bridge"
              ) : (
                <Spinner className="mx-auto h-6 w-6" />
              )}
            </Button>
          ) : (
            <Button
              variant="outlined"
              className="block w-full bg-indigo-600 py-4 hover:-translate-y-1 transition-all duration-500 text-white font-semibold capitalize text-lg"
              size="lg"
              onClick={handleSwithChain}
            >
              Switch Network
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
