import { Token as TokenData } from "@0xsquid/sdk/dist/types";
import { DirectionType } from "../types";
import { useEffect, useState } from "react";
import { useBalance } from "wagmi";
import { formatBalance } from "../utils";

interface DisplayBalanceProps {
  address: `0x${string}`;
  onSendValue: Function;
  currentToken: TokenData;
  direction: DirectionType;
}

const nativeToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const DisplayBalance: React.FC<DisplayBalanceProps> = ({
  address,
  onSendValue,
  currentToken,
  direction,
}) => {
  const [balance, setBalance] = useState<string>();

  const { data, isError, isLoading } = useBalance({
    address,
    token:
      currentToken.address === nativeToken
        ? undefined
        : (currentToken.address as `0x${string}`),
    chainId: Number(currentToken.chainId),
  });

  useEffect(() => {
    if (!isError && !isLoading) {
      console.log(data, "from use dynamic balance");

      setBalance(data?.formatted);
      onSendValue({ data: data?.formatted, direction });
    }
  }, [currentToken, isError, isLoading]);

  return <>{balance ? formatBalance(balance) : "0.00"}</>;
};
