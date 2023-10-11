import { Button, Heading, VStack } from "@chakra-ui/react";
import { useAccount, type Chain } from "wagmi";
import { useSimpleAccountSigner } from "~/clients/simpleAccountSigner";
import { LoadingScreen } from "~/surfaces/shared/LoadingScreen";
import { encodeFunctionData, type Hash } from "viem";
import { NFTContractABI } from "../../clients/nftContract";
import { SessionKeyAccountABI } from "~/clients/sessionKeyAccountAbi";

import {
  SimpleSmartContractAccount,
  SmartAccountProvider,
  type SmartAccountSigner,
  LocalAccountSigner,
  deepHexlify,
  getUserOperationHash,
  type UserOperationRequest,
} from "@alchemy/aa-core";

import { optimismGoerli } from "viem/chains";
import { daappConfigurations } from "../../configs/clientConfigs";

const RpcUrl = daappConfigurations[optimismGoerli.id]!.rpcUrl;

const NftContractAddress = "0x835629117Abb8cfe20a2e8717C691905A4725b7c";
const EntryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const SimpleAccountFactoryAddress =
  "0xc1777F38F660C5b381fb69904058636962C1fc8B";
const SessionKeyAddress = "0xC275b7e36faF2eBdaBf2B256443e88d911fd822e";

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
        factoryAddress: SimpleAccountFactoryAddress,
        rpcClient,
        owner,
      })
  );

  const smartAccountAddress = await provider.getAddress();
  console.log("smartAccountAddress: ", smartAccountAddress);

  // 3. send a UserOperation
  // const { hash } = await provider.sendUserOperation({
  //   target: NftContractAddress,
  //   data: encodeFunctionData({
  //     abi: NFTContractABI.abi,
  //     functionName: "mintTo",
  //     args: [await owner.getAddress()],
  //   }),
  // });
  // console.log("hash: ", hash);

  const mintDeployTxnHash = await provider.sendTransaction({
    // from: await owner.getAddress(),
    from: smartAccountAddress,
    to: NftContractAddress,
    data: encodeFunctionData({
      abi: NFTContractABI.abi,
      functionName: "mintTo",
      args: [smartAccountAddress],
    }),
  });
  console.log("mintDeployTxnHash: ", mintDeployTxnHash);
};

const registerSessionkey = async (owner: SmartAccountSigner) => {
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
        factoryAddress: SimpleAccountFactoryAddress,
        rpcClient,
        owner,
      })
  );

  const smartAccountAddress = await provider.getAddress();
  console.log("smartAccountAddress: ", smartAccountAddress);

  const hash = await provider.sendTransaction({
    from: await owner.getAddress(),
    to: smartAccountAddress,
    data: encodeFunctionData({
      abi: SessionKeyAccountABI.abi,
      functionName: "registerSessionKey",
      args: [SessionKeyAddress, 0, 1796926626],
    }),
  });
  console.log("hash: ", hash);
};

const revokeSessionkey = async (owner: SmartAccountSigner) => {
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
        factoryAddress: SimpleAccountFactoryAddress,
        rpcClient,
        owner,
      })
  );

  const smartAccountAddress = await provider.getAddress();
  console.log("smartAccountAddress: ", smartAccountAddress);

  const hash = await provider.sendTransaction({
    from: await owner.getAddress(),
    to: smartAccountAddress,
    data: encodeFunctionData({
      abi: SessionKeyAccountABI.abi,
      functionName: "revokeSessionKey",
      args: [SessionKeyAddress],
    }),
  });
  console.log("hash: ", hash);
};

const mintBySessionkey = async (owner: SmartAccountSigner) => {
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
        factoryAddress: SimpleAccountFactoryAddress,
        rpcClient,
        owner,
      })
  );

  const smartAccountAddress = await provider.getAddress();
  console.log("smartAccountAddress: ", smartAccountAddress);

  //TODO session
  const sessionKey = LocalAccountSigner.privateKeyToAccountSigner("0x");
  const uoStruct = await provider.buildUserOperation({
    target: NftContractAddress,
    data: encodeFunctionData({
      abi: NFTContractABI.abi,
      functionName: "mintTo",
      args: [SmartContractAddress],
    }),
  });
  const request: UserOperationRequest = deepHexlify(
    uoStruct
  ) as UserOperationRequest;
  // if (!isValidRequest(request)) {
  //   // this pretty prints the uo
  //   throw new Error(
  //     `Request is missing parameters. All properties on UserOperationStruct must be set. uo: ${JSON.stringify(
  //       request,
  //       null,
  //       2
  //     )}`
  //   );
  // }

  request.signature = await sessionKey.signMessage(
    getUserOperationHash(
      request,
      EntryPointAddress as `0x${string}`,
      BigInt(chain.id)
    )
  );

  const hash = await provider.rpcClient.sendUserOperation(
    request,
    EntryPointAddress
  );
  // console.log("hash: ", hash);
  const waitHash = await provider.waitForUserOperationTransaction(hash);
  console.log("waitHash: ", waitHash);
};

export function CreateContractWalletPage() {
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
          Setup Your Wallet
        </Button>
        <Button
          onClick={() => {
            registerSessionkey(ownerResult.owner).catch((e) => {
              console.error(e);
            });
          }}
        >
          Register Session Key
        </Button>
        <Button
          onClick={() => {
            revokeSessionkey(ownerResult.owner).catch((e) => {
              console.error(e);
            });
          }}
        >
          Revoke Session Key
        </Button>
        <Button
          onClick={() => {
            mintBySessionkey(ownerResult.owner).catch((e) => {
              console.error(e);
            });
          }}
        >
          Mint By Session Key
        </Button>
      </VStack>
    );
  } else {
    return <LoadingScreen />;
  }
}
