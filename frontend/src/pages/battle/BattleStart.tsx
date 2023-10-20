import { Button, Box } from "@chakra-ui/react";
import { useState } from "react";
import { useSimpleAccountSigner } from "~/utils/simpleAccountSigner";
import { delay } from "~/utils/delay";

import { encodeFunctionData } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { SessionKeyAccountABI } from "~/common/sessionKeyAccountAbi";
import { useNetwork, type Chain } from "wagmi";

import { daappConfigurations } from "../../configs/clientConfigs";
import { getAddresses } from "../../common/getAddresses";

import {
  SimpleSmartContractAccount,
  SmartAccountProvider,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { sessionKeyStore, localSmartContractStore } from "~/utils/localStorage";

export function BattleStart() {
  const registerSessionkey = async (
    owner: SmartAccountSigner,
    chain: Chain
  ) => {
    const addresses = getAddresses(chain?.id!)!;
    const ownerAddress = await owner.getAddress();
    const rpcUrl = daappConfigurations[chain?.id]!.rpcUrl;

    const salt = localSmartContractStore.smartAccountAddresses(
      ownerAddress as string,
      chain?.id
    )?.salt;
    console.log("salt: ", salt);

    // 2. initialize the provider and connect it to the account
    const provider = new SmartAccountProvider(
      rpcUrl,
      addresses.EntryPointAddress,
      chain
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
    setDisplayGo(true);
    await delay(1600);
    setDisplayGo(false);
  };

  const [isSessionKey, setIsSessionKey] = useState(false);
  const [displayGo, setDisplayGo] = useState(false);
  const ownerResult = useSimpleAccountSigner();
  const { chain } = useNetwork();
  // const { isConnected } = useAccount();
  // if (isConnected && ) {
  return (
    <>
      {!isSessionKey && !ownerResult.isLoading && (
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
              registerSessionkey(ownerResult.owner, chain).catch((e) => {
                console.error(e);
              });
            }}
          >
            Ready?
          </Button>
        </Box>
      )}
      {displayGo && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Box fontSize={60} fontWeight="bold">
            Fight!
          </Box>
        </Box>
      )}
    </>
  );
}
