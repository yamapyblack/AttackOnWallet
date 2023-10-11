import { Button, Heading, VStack } from "@chakra-ui/react";
import { useAccount, type Chain } from "wagmi";
import { useSimpleAccountSigner } from "~/clients/simpleAccountSigner";
import { LoadingScreen } from "~/surfaces/shared/LoadingScreen";
import {
  SimpleSmartContractAccount,
  SmartAccountProvider,
  type SmartAccountSigner,
} from "@alchemy/aa-core";

import { optimismGoerli } from "viem/chains";
import { daappConfigurations } from "../../configs/clientConfigs";

const RpcUrl = daappConfigurations[optimismGoerli.id]!.rpcUrl;
const EntryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const AccountFactoryAddress = "0xc9966401164FEd576Bb9f56E67E87d98663FD5a2";

const createContract = async (owner: SmartAccountSigner) => {
  //owner from Private Key
  const chain: Chain = optimismGoerli;

  // 2. initialize the provider and connect it to the account
  const provider = new SmartAccountProvider(
    RpcUrl,
    EntryPointAddress,
    optimismGoerli // chain
  ).connect(
    (rpcClient) =>
      new SimpleSmartContractAccount({
        entryPointAddress: EntryPointAddress,
        chain: chain,
        factoryAddress: AccountFactoryAddress,
        rpcClient,
        owner,
        index: BigInt(1),
      })
  );

  const smartAccountAddress = await provider.getAddress();
  console.log("smartAccountAddress: ", smartAccountAddress);
};

export function CreatingPage() {
  const { isConnected } = useAccount();
  const ownerResult = useSimpleAccountSigner();
  if (isConnected && !ownerResult.isLoading) {
    return (
      <VStack
        height="100%"
        width="100%"
        alignItems="center"
        justifyContent="center"
        gap={5}
      >
        <Heading>Welcome!</Heading>
        <Heading size="sm" textAlign="center">
          Click below to get started.
          <br />
          If you have a gas manager policy configured you can check the box
          below.
        </Heading>
        <Button
          onClick={() => {
            createContract(ownerResult.owner).catch((e) => {
              console.error(e);
            });
          }}
        >
          Mint
        </Button>
      </VStack>
    );
  } else {
    return <LoadingScreen />;
  }
}
