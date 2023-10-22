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
import { LoadingScreen } from "~/surfaces/shared/LoadingScreen";
import { CreateAccount } from "./CreateAccount";
import { PlayerImage } from "~/utils/PlayerImage";

const names = [
  "Alice",
  "Bob",
  "Charlie",
  "Dave",
  "Eve",
  "Faythe",
  "Grace",
  "Heidi",
  "Ivan",
  "Judy",
  "Mallory",
  "Oscar",
  "Peggy",
  "Trent",
  "Walter",
];

function ethereumAddressToNumbers(address: string): number[] {
  // アドレスをビット列に変換
  const bits = BigInt("0x" + address.slice(2))
    .toString(2)
    .padStart(160, "0");

  // ビット列を 7 つのセグメントに分割
  const segmentSize = Math.ceil(bits.length / 7);
  const segments = Array.from({ length: 7 }, (_, i) =>
    parseInt(bits.slice(i * segmentSize, (i + 1) * segmentSize), 2)
  );

  // 各セグメントを 1 〜 100 の範囲に変換
  return segments.map((segment) => (segment % 100) + 1);
}

export function CreatingPage() {
  const { address, isConnected } = useAccount();
  const ownerResult = useSimpleAccountSigner();

  const numbers = ethereumAddressToNumbers(address as string);

  const image = `https://noun.pics/${numbers[0]}.jpg`;
  const name = names[numbers[1] ? numbers[1] % names.length : 0];
  const status = [
    { HP: 100 },
    { AT: numbers[2] },
    { DF: numbers[3] },
    { MA: numbers[4] },
    { MD: numbers[5] },
    { SP: numbers[6] },
  ];
  if (isConnected && !ownerResult.isLoading) {
    return (
      <VStack>
        <Text mt={6} fontSize={32} textAlign="center">
          {name}
        </Text>
        <Flex mt={4} w={300} justify="center">
          <PlayerImage />
        </Flex>
        <Box mt={4} mb={4}>
          {status.map((item, i) => (
            <Flex w={300} justifyContent="between" key={i}>
              <Box w={10}>
                <Text>{Object.keys(item)}</Text>
              </Box>
              <Box pt={2} w={260}>
                <Progress size="sm" value={Object.values(item)[0] as number} />
              </Box>
            </Flex>
          ))}
        </Box>
        <CreateAccount />
      </VStack>
    );
  } else {
    return <LoadingScreen />;
  }
}
