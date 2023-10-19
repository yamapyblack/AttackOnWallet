import { Button, Text, Box } from "@chakra-ui/react";
import { useState } from "react";
import { useSimpleAccountSigner } from "~/utils/simpleAccountSigner";

import { type Chain } from "wagmi";
import { encodeFunctionData, type Hash } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const privateKey = generatePrivateKey();
import { SessionKeyAccountABI } from "~/common/sessionKeyAccountAbi";

import { optimismGoerli } from "viem/chains";
import { daappConfigurations } from "../../configs/clientConfigs";
import { getAddresses } from "../../common/getAddresses";

import {
  SimpleSmartContractAccount,
  SmartAccountProvider,
  type SmartAccountSigner,
  LocalAccountSigner,
  deepHexlify,
  getUserOperationHash,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import { sessionKeyStore, localSmartContractStore } from "~/utils/localStorage";

const RpcUrl = daappConfigurations[optimismGoerli.id]!.rpcUrl;

export function BattleStart() {
  const registerSessionkey = async (owner: SmartAccountSigner) => {
    const chain: Chain = optimismGoerli;
    const addresses = getAddresses(chain?.id!)!;
    const ownerAddress = await owner.getAddress();

    const salt = localSmartContractStore.smartAccountAddresses(
      ownerAddress as string,
      chain?.id
    )?.salt;
    console.log("salt: ", salt);

    // 2. initialize the provider and connect it to the account
    const provider = new SmartAccountProvider(
      RpcUrl,
      addresses.EntryPointAddress,
      optimismGoerli // chain
    ).connect(
      (rpcClient) =>
        new SimpleSmartContractAccount({
          entryPointAddress: addresses.EntryPointAddress,
          chain: chain,
          factoryAddress: addresses.AccountFactoryAddress,
          rpcClient,
          owner,
          index: BigInt(salt!), //salt
        })
    );

    const smartAccountAddress = await provider.getAddress();
    console.log("smartAccountAddress: ", smartAccountAddress);

    //Set session key
    const privateSessionKey = generatePrivateKey();
    const sessionKey = privateKeyToAccount(privateSessionKey).address;
    console.log("privateSessionKey: ", privateSessionKey);
    console.log("sessionKey: ", sessionKey);
    sessionKeyStore.setPrivateSessionKey(privateSessionKey);

    const hash = await provider.sendTransaction({
      from: await owner.getAddress(),
      to: smartAccountAddress,
      data: encodeFunctionData({
        abi: SessionKeyAccountABI.abi,
        functionName: "registerSessionKey",
        args: [sessionKey, 0, 1796926626],
      }),
    });
    console.log("hash: ", hash);
    setIsSessionKey(true);
  };

  const [isSessionKey, setIsSessionKey] = useState(false);

  const ownerResult = useSimpleAccountSigner();
  // const { isConnected } = useAccount();
  // if (isConnected && ) {
  if (!isSessionKey && !ownerResult.isLoading) {
    return (
      <>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Button
            fontSize={60}
            fontWeight="bold"
            onClick={() => {
              registerSessionkey(ownerResult.owner).catch((e) => {
                console.error(e);
              });
            }}
          >
            Ready?
          </Button>
        </Box>
      </>
    );
  }
}
