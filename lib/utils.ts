import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function countDoubleQuotes(str: string) {
  // Use a regular expression to find all occurrences of double quotes
  const matches = str.match(/"/g);

  // If matches exist, return the length of the matches array, otherwise return 0
  return matches ? matches.length : 0;
}

export function completeJsonStructure(jsonString: string) {
  // Initialize arrays to store opening and closing characters
  const closers = [];

  // Iterate through the string to track opening and closing characters
  for (let i = 0; i < jsonString?.length; i++) {
    const char = jsonString[i];
    if (char === "{") {
      closers.push("}");
    } else if (char === "[") {
      closers.push("]");
    }

    if (char === "}" || char === "]") {
      closers.pop();
    } else if (char === '"') {
      const count = countDoubleQuotes(jsonString.slice(0, i + 1));
      if (count % 2 === 1) {
        closers.push('"');
      } else {
        closers.pop();
      }
    }
  }

  // Append necessary closing characters to complete the structure
  //  const closingCharacters = [...openers.reverse(), ...closers.reverse()].join('');
  return (
    jsonString +
    closers.reverse().join(`
 `)
  );
}

export function isValidJson(text: string) {
  try {
    JSON.parse(text);
    return true;
  } catch () {
    return false;
  }
}

export const cleanPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, "");
};

export const formatBalance = (balance: number): string => {
  return balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
