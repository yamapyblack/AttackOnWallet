import { Image } from "@chakra-ui/react";
import { useAccount } from "wagmi";

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

export function PlayerImage() {
  const { address } = useAccount();

  const numbers = ethereumAddressToNumbers(address as string);

  const image = `https://noun.pics/${numbers[0]}.jpg`;
  return <Image alt="pokemon" w="100%" src={image} />;
}
