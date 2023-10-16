import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
  useNetwork,
} from "wagmi";
import { parseEther } from "viem";
import { localSmartContractStore } from "~/clients/localStorage";
import { useRouter } from "next/router";

const AccountFactoryAddress = "0xc9966401164FEd576Bb9f56E67E87d98663FD5a2";

export function CreateAccount() {
  const router = useRouter();
  const { address: owner } = useAccount();
  const { chain } = useNetwork();

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
    data: prepareData,
  } = usePrepareContractWrite({
    address: AccountFactoryAddress,
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256",
          },
        ],
        name: "createAccount",
        outputs: [
          {
            internalType: "contract SessionKeyAccount",
            name: "ret",
            type: "address",
          },
        ],
        stateMutability: "payable",
        type: "function",
      },
    ],
    functionName: "createAccount",
    args: [owner, BigInt(6)],
    value: parseEther("0.1"),
  });

  const { data, error, isError, write } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
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
    <div>
      <button disabled={isLoading} onClick={() => write?.()}>
        {isLoading ? "Minting..." : "Mint desu"}
      </button>
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
    </div>
  );
}