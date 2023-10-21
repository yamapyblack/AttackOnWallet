import { Chain, optimismGoerli } from "viem/chains";
import { env } from "~/env.mjs";

export interface DAAppConfiguration {
  nftContractAddress: `0x${string}`;
  simpleAccountFactoryAddress: `0x${string}`;
  gasManagerPolicyId: string;
  rpcUrl: string;
  chain: Chain;
}

// TODO: Replace with your own contract addresses and policy ids, feel free to add or remove chains.
export const daappConfigurations: Record<number, DAAppConfiguration> = {
  [optimismGoerli.id]: {
    nftContractAddress: "0x835629117Abb8cfe20a2e8717C691905A4725b7c",
    simpleAccountFactoryAddress: "0x9406cc6185a346906296840746125a0e44976454",
    gasManagerPolicyId: env.NEXT_PUBLIC_OPT_GOERLI_POLICY_ID,
    rpcUrl: `/api/rpc/proxy?chainId=${optimismGoerli.id}`,
    chain: optimismGoerli,
  },
};
