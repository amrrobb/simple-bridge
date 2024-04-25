import React, { useEffect, useState } from "react";
import {
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Input,
  Avatar,
} from "@material-tailwind/react";
import { Token as TokenData } from "@0xsquid/sdk/dist/types";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { DirectionType } from "../types";

interface MenuChainProps {
  onSendValue: Function;
  currentTokens: TokenData[];
  currentToken: TokenData;
  direction: DirectionType;
}

export const MenuToken: React.FC<MenuChainProps> = ({
  currentTokens,
  currentToken,
  onSendValue,
  direction,
}) => {
  const [token, setToken] = useState<TokenData>();
  const [tokens, setTokens] = useState<TokenData[]>();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Update local state when currentToken prop changes
    if (token?.chainId !== currentToken.chainId) {
      setTokens(currentTokens);
    }
    setToken(currentToken);
  }, [currentTokens]);

  const filterArray = (searchTerm: string) => {
    return tokens!.filter(
      (item) =>
        searchTerm.trim() === "" ||
        item.name.toLowerCase().toString().includes(searchTerm.toLowerCase()) ||
        item.symbol.toLowerCase().toString().includes(searchTerm.toLowerCase())
    );
  };

  const handleMenuItemClick = (data: TokenData) => {
    setToken(data);
    onSendValue({ data, direction });
  };

  return (
    <>
      {token && tokens ? (
        <Menu
          placement="bottom-start"
          dismiss={{
            itemPress: false,
          }}
        >
          <MenuHandler>
            <Button
              ripple={true}
              size="sm"
              variant="outlined"
              className="
                flex items-center
                rounded-full
                font-thin
                normal-case
                hover:-translate-y-1 transition-all
                duration-500
                mb-2"
            >
              <Avatar src={token.logoURI!} alt="" size="xs" />

              <div className="mx-3">{token.symbol}</div>
              <ChevronDownIcon className="text-gray-500 h-3 w-3" />
            </Button>
          </MenuHandler>

          <MenuList>
            {/* Search input */}
            <Input
              label="Search"
              containerProps={{
                className: "mb-4",
              }}
              crossOrigin={undefined}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filterArray(searchTerm).map((item, index) => (
              <MenuItem
                key={index}
                value={item.chainId}
                onClick={() => handleMenuItemClick(item)}
                className="flex items-center"
              >
                <Avatar
                  src={item.logoURI!}
                  alt={item.symbol}
                  size="xs"
                  className="mx-3"
                />
                <div>
                  <div>{item.symbol.toString()}</div>
                  <div>{item.name.toString()}</div>
                </div>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      ) : (
        <></>
      )}{" "}
    </>
  );
};
