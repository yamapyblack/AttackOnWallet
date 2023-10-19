import { Button, Text, VStack, Progress } from "@chakra-ui/react";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
  useNetwork,
} from "wagmi";
import { parseEther } from "viem";
import { localSmartContractStore } from "~/utils/localStorage";
import { useRouter } from "next/router";
import { getAddresses } from "../../common/getAddresses";
import { AoWAccountFactoryABI } from "../../common/aowAccountFactoryAbi";

export function CreateAccount() {
  const router = useRouter();
  const { address: owner } = useAccount();
  const { chain } = useNetwork();
  const addresses = getAddresses(chain?.id!)!;

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
    data: prepareData,
  } = usePrepareContractWrite({
    address: addresses.AccountFactoryAddress,
    abi: AoWAccountFactoryABI.abi,
    functionName: "createAccount",
    //TODO salt
    args: [owner, BigInt(8)],
    value: parseEther("0.1"),
  });

  const { data, error, isError, write } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess(data) {
      console.log("prepareData", prepareData?.result);
      localSmartContractStore.addSmartContractAccount(
        owner as string,
        prepareData?.result as string,
        chain?.id!
      );
      //TODO next page
      router.reload();
    },
  });

  return (
    <VStack justify="center">
      <Button disabled={isLoading} onClick={() => write?.()}>
        {isLoading ? "Minting..." : "Mint 0.1 ETH"}
      </Button>
      {isSuccess && (
        <div>
          Successfully minted your NFT!
          <div>
            <a href={`https://etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
      {(isPrepareError || isError) && (
        <div>Error: {(prepareError || error)?.message}</div>
      )}
    </VStack>
  );
}
