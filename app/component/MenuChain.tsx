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
import { ChainData } from "@0xsquid/sdk/dist/types";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import debounce from "lodash.debounce";
import { DirectionType } from "../types";

interface MenuChainProps {
  onSendValue: Function;
  chains: ChainData[];
  currentChain: ChainData;
  direction: DirectionType;
}

export const MenuChain: React.FC<MenuChainProps> = ({
  currentChain,
  chains,
  onSendValue,
  direction,
}) => {
  const [chain, setChain] = useState<ChainData>();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Update local state when currentChain prop changes
    if (chain?.chainId !== currentChain.chainId) {
      setChain(currentChain);
    }
  }, [currentChain]);

  const filterArray = (searchTerm: string) => {
    return chains.filter(
      (item) =>
        searchTerm.trim() === "" ||
        item.networkName
          .toLowerCase()
          .toString()
          .includes(searchTerm.toLowerCase())
    );
  };

  const handleChainMenuItemClick = debounce((data: ChainData) => {
    if (data.chainId !== currentChain.chainId) {
      setChain(data);
      onSendValue({ data, direction });
    }
  }, 100);

  return (
    <>
      {!chain ? (
        <></>
      ) : (
        <Menu
          placement="bottom-end"
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
              <Avatar src={chain.chainIconURI} alt="" size="xs" />

              <div className="mx-3">{chain?.networkName}</div>
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
                onClick={() => handleChainMenuItemClick(item)}
                className="flex items-center"
              >
                <Avatar
                  src={item?.chainIconURI.toString()}
                  alt={item.networkName}
                  size="xs"
                  className="mx-3"
                />
                {item.networkName.toString()}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      )}
    </>
  );
};
