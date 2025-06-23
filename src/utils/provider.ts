import { BrowserProvider } from "ethers";

export function getProvider(): BrowserProvider | null {
  if (typeof window !== "undefined" && window.ethereum) {
    return new BrowserProvider(window.ethereum);
  }
  return null;
}
