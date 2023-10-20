import { Button, Heading, VStack } from "@chakra-ui/react";
import { useAccount, type Chain } from "wagmi";
import { useSimpleAccountSigner } from "~/utils/simpleAccountSigner";
import { LoadingScreen } from "~/surfaces/shared/LoadingScreen";
import { encodeFunctionData, type Hash } from "viem";
import { NFTContractABI } from "../../common/nftContractAbi";
import { SessionKeyAccountABI } from "~/common/sessionKeyAccountAbi";

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
import { getAddresses } from "../../common/getAddresses";

const RpcUrl = daappConfigurations[optimismGoerli.id]!.rpcUrl;

const createContract = async (owner: SmartAccountSigner) => {
  //owner from Private Key
  const chain: Chain = optimismGoerli;
  const addresses = getAddresses(chain?.id!)!;

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
      })
  );

  const smartAccountAddress = await provider.getAddress();
  console.log("smartAccountAddress: ", smartAccountAddress);

  // 3. send a UserOperation
  // const { hash } = await provider.sendUserOperation({
  //   target: addresses.NftContractAddress,
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
    to: addresses.NftContractAddress,
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
  const addresses = getAddresses(chain?.id!)!;

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
      args: [addresses.SessionKeyAddress, 0, 1796926626],
    }),
  });
  console.log("hash: ", hash);
};

const revokeSessionkey = async (owner: SmartAccountSigner) => {
  const chain: Chain = optimismGoerli;
  const addresses = getAddresses(chain?.id!)!;

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
      args: [addresses.SessionKeyAddress],
    }),
  });
  console.log("hash: ", hash);
};

const mintBySessionkey = async (owner: SmartAccountSigner) => {
  const chain: Chain = optimismGoerli;
  const addresses = getAddresses(chain?.id!)!;

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
      })
  );

  const smartAccountAddress = await provider.getAddress();
  console.log("smartAccountAddress: ", smartAccountAddress);

  //TODO session
  const sessionKey = LocalAccountSigner.privateKeyToAccountSigner("0x");
  const uoStruct = await provider.buildUserOperation({
    target: addresses.NftContractAddress,
    data: encodeFunctionData({
      abi: NFTContractABI.abi,
      functionName: "mintTo",
      args: [smartAccountAddress],
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
    getUserOperationHash(request, addresses.EntryPointAddress, BigInt(chain.id))
  );

  const hash = await provider.rpcClient.sendUserOperation(
    request,
    addresses.EntryPointAddress
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
