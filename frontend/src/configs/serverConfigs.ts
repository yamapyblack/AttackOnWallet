import { optimismGoerli } from "viem/chains";
import { env } from "~/env.mjs";

// TODO: Replace with your own api urls per chain.
const API_URLs: Record<number, string> = {
  [optimismGoerli.id]: env.OPT_GOERLI_ALCHEMY_API_URL,
};

export function getApiUrl(chainId: number | string) {
  const API_URL = API_URLs[Number(chainId)];
  if (!API_URL) {
    throw new Error("Unsupported chainID.");
  }
  return API_URL;
}
