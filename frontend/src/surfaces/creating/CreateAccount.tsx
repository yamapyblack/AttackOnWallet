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

const salt = Math.floor(Math.random() * 256) + 1;
const mintETH = "0.01";

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
    args: [owner, BigInt(salt)],
    value: parseEther(mintETH),
  });

  const { data, error, isError, write } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess(data) {
      console.log("prepareData", prepareData?.result);
      localSmartContractStore.addSmartContractAccount(
        owner as string,
        prepareData?.result as string,
        chain?.id!,
        salt
      );
      //Goto next page
      router.reload();
    },
  });

  return (
    <VStack justify="center">
      <Button disabled={isLoading} onClick={() => write?.()}>
        {isLoading ? "Minting..." : `Mint ${mintETH} ETH`}
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
