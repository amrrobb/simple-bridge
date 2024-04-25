import BigNumber from "bignumber.js";
import Big from "big.js";

export const formatBalance = (balance: string | number): string => {
  // Convert balance to string if it's a number
  const balanceString: string =
    typeof balance === "number" ? balance.toString() : balance;

  // Find the index of the decimal point
  const decimalIndex = balanceString.indexOf(".");

  // If the decimal point exists and there are more than 6 characters after it
  if (decimalIndex !== -1 && balanceString.length - decimalIndex > 7) {
    // Truncate the string to 6 decimal places without rounding
    return balanceString.slice(0, decimalIndex + 7);
  }

  // Otherwise, return the original balance
  return balanceString;
};

export function convertDecimalToInteger(
  decimalString: string,
  decimals: number
): string {
  // Convert the decimal string to a BigNumber using a library like BigNumber.js
  const decimalValue = new BigNumber(decimalString);

  // Calculate the multiplier based on the number of decimals
  const multiplier = new BigNumber(10).exponentiatedBy(decimals);

  // Multiply the decimal value by the multiplier to get the integer representation
  const integerValue = decimalValue.multipliedBy(multiplier);

  // Return the integer value as a string
  return integerValue.toString(10);
}

export function convertIntegerToDecimal(
  integerString: string,
  decimals: number
): string {
  // Convert the integer string to a BigNumber
  const integerValue = new BigNumber(integerString);

  // Calculate the divisor based on the number of decimals
  const divisor = new BigNumber(10).exponentiatedBy(decimals);

  // Divide the integer value by the divisor to get the decimal representation
  const decimalValue = integerValue.dividedBy(divisor);

  // Return the decimal value as a string
  return decimalValue.toString(10);
}
