import {
  Button,
  Text,
  Box,
  Image,
  Progress,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { useAccount, type Chain } from "wagmi";
import { useSimpleAccountSigner } from "~/utils/simpleAccountSigner";
import { LoadingScreen } from "~/pages/shared/LoadingScreen";
// import {
//   SimpleSmartContractAccount,
//   SmartAccountProvider,
//   type SmartAccountSigner,
// } from "@alchemy/aa-core";
import { CreateAccount } from "./CreateAccount";

// import { optimismGoerli } from "viem/chains";
// import { daappConfigurations } from "../../configs/clientConfigs";

// const RpcUrl = daappConfigurations[optimismGoerli.id]!.rpcUrl;
// const EntryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
// const AccountFactoryAddress = "0xc9966401164FEd576Bb9f56E67E87d98663FD5a2";

// const createContract = async (owner: SmartAccountSigner) => {
//   //owner from Private Key
//   const chain: Chain = optimismGoerli;

//   // 2. initialize the provider and connect it to the account
//   const provider = new SmartAccountProvider(
//     RpcUrl,
//     EntryPointAddress,
//     optimismGoerli // chain
//   ).connect(
//     (rpcClient) =>
//       new SimpleSmartContractAccount({
//         entryPointAddress: EntryPointAddress,
//         chain: chain,
//         factoryAddress: AccountFactoryAddress,
//         rpcClient,
//         owner,
//         index: BigInt(1),
//       })
//   );

//   const smartAccountAddress = await provider.getAddress();
//   console.log("smartAccountAddress: ", smartAccountAddress);
// };

export function CreatingPage() {
  const { isConnected } = useAccount();
  const ownerResult = useSimpleAccountSigner();
  if (isConnected && !ownerResult.isLoading) {
    return (
      <VStack>
        <Text fontSize={30} textAlign="center">
          Click below to mint and get started!!
        </Text>
        <Text mt={6} fontSize={32} textAlign="center">
          yamapy
        </Text>
        <Flex mt={4} justify="center">
          <Image alt="pokemon" w={300} src="/noun.png" />
        </Flex>
        <Box mt={4} mb={4}>
          <Flex w={300} justifyContent="between">
            <Box w={10}>
              <Text>HP</Text>
            </Box>
            <Box pt={2} w={260}>
              <Progress size="sm" value={50} />
            </Box>
          </Flex>
          <Flex w={300} justifyContent="between">
            <Box w={10}>
              <Text>HP</Text>
            </Box>
            <Box pt={2} w={260}>
              <Progress size="sm" value={50} />
            </Box>
          </Flex>
          <Flex w={300} justifyContent="between">
            <Box w={10}>
              <Text>HP</Text>
            </Box>
            <Box pt={2} w={260}>
              <Progress size="sm" value={50} />
            </Box>
          </Flex>
          <Flex w={300} justifyContent="between">
            <Box w={10}>
              <Text>HP</Text>
            </Box>
            <Box pt={2} w={260}>
              <Progress size="sm" value={50} />
            </Box>
          </Flex>
          <Flex w={300} justifyContent="between">
            <Box w={10}>
              <Text>HP</Text>
            </Box>
            <Box pt={2} w={260}>
              <Progress size="sm" value={50} />
            </Box>
          </Flex>
          <Flex w={300} justifyContent="between">
            <Box w={10}>
              <Text>HP</Text>
            </Box>
            <Box pt={2} w={260}>
              <Progress size="sm" value={50} />
            </Box>
          </Flex>
        </Box>
        <CreateAccount />
      </VStack>
    );
  } else {
    return <LoadingScreen />;
  }
}
