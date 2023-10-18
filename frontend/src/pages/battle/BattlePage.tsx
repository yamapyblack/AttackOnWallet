import {
  Button,
  Spacer,
  Text,
  Box,
  Image,
  Progress,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { optimismGoerli } from "viem/chains";
import { daappConfigurations } from "../../configs/clientConfigs";
import { useAppState } from "../../utils/appState";
import { useNetwork } from "wagmi";
import { delay } from "~/utils/delay";
import { useContractEvent } from "wagmi";
import { AoWBattleABI } from "../../common/aowBattleAbi";
import { getAddresses } from "~/common/getAddresses";
import { useContractRead } from "wagmi";
import { Log } from "viem";

enum Skills {
  Attack = "Attack",
  Magic = "Magic",
  Heal = "Heal",
  Defend = "Defend",
}

enum battleStatus {
  playing = "playing",
  won = "won",
  lost = "lost",
}

type Joined = Log[] & [{ args: { _battleId: number } }];

export function BattlePage() {
  const { chain } = useNetwork();
  const addresses = getAddresses(chain?.id!)!;
  useContractEvent({
    address: addresses.AoWBattle,
    abi: AoWBattleABI.abi,
    eventName: "Joined",
    listener(logs) {
      console.log("Joined", logs);

      console.log("Joined data", logs[0]?.data);

      const _battleId = (logs as Joined)[0]?.args?._battleId;
      console.log("_battleId:", _battleId);
    },
  });

  const { data } = useContractRead({
    address: addresses.AoWBattle,
    abi: AoWBattleABI.abi,
    functionName: "battleId",
  });
  console.log("read battleId", data?.toString());

  //Battle state
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [status, setStatus] = useState(battleStatus.playing);
  const [isEnemyBlinking, setEnemyBlinking] = useState(false);
  const [isWindowWaving, setWindowWaving] = useState(false);
  const [playerImagePosition, setPlayerImagePosition] = useState(0); // Moving only the image
  const [enemyImagePosition, setEnemyImagePosition] = useState(0); // Moving only the image
  const [isMagicSelected, setIsMagicSelected] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  const { state, eoaAddress, scwAddresses } = useAppState();
  if (state !== "HAS_SCW") {
    return null;
  }

  // Function to handle skill selection
  const enemyAttack = async () => {
    setEnemyImagePosition(-10);
    await delay(200);

    setEnemyImagePosition(0);
    setWindowWaving(true);
    await delay(1000);

    setWindowWaving(false);
    const newPlayerHP = playerHP - 10;
    setPlayerHP(newPlayerHP < 0 ? 0 : newPlayerHP);

    if (newPlayerHP <= 0) {
      setStatus(battleStatus.lost);
    }
  };

  const enemyDamaged = async (_damage: number): Promise<boolean> => {
    //enemy blinking
    setEnemyBlinking(true);
    await delay(1000);

    setEnemyBlinking(false);
    const newEnemyHP = enemyHP - _damage;
    setEnemyHP(newEnemyHP < 0 ? 0 : newEnemyHP);

    if (newEnemyHP <= 0) {
      setStatus(battleStatus.won);
      return true;
    }
    return false;
  };

  const handleSkillWrapper = (skill: Skills) => {
    handleSkill(skill).catch((error: Error) => {
      console.error("Error handling skill:", error);
    });
  };

  const handleSkill = async (skill: Skills) => {
    setIsActionInProgress(true);
    if (skill === Skills.Attack) {
      //Attack effect
      setPlayerImagePosition(10);
      await delay(150);
      setPlayerImagePosition(0);

      if (await enemyDamaged(30)) return;

      await delay(1000);
      await enemyAttack();
    } else if (skill === Skills.Magic) {
      //Magic effect
      setIsMagicSelected(true);
      await delay(1000);
      setIsMagicSelected(false);

      if (await enemyDamaged(60)) return;

      await delay(1000);
      await enemyAttack();
    }
    setIsActionInProgress(false);
  };

  if (status === battleStatus.lost) {
    return <Text>You Lose</Text>;
  }

  return (
    <>
      {status === battleStatus.won && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Text fontSize={120} fontWeight="bold" zIndex={1}>
            WIN
          </Text>
        </Box>
      )}
      <VStack mt={16} className={isWindowWaving ? "shaking" : ""}>
        <Box w={680}>
          {/* Enemy */}
          <Flex justifyContent="end">
            <Box mr={10}>
              <Text>yamapy</Text>
              <Flex justifyContent="between">
                <Box w={10}>
                  <Text>HP</Text>
                </Box>
                <Box pt={2} w={260}>
                  <Progress
                    size="sm"
                    value={enemyHP}
                    isAnimated={true}
                    hasStripe={true}
                  />
                </Box>
              </Flex>
            </Box>
            <VStack
              w={180}
              transform={`translateX(${enemyImagePosition}px)`}
              animation={isEnemyBlinking ? "blinking 0.5s 2" : "none"}
            >
              {/* Explosion Effect */}
              {isMagicSelected && (
                <Box top={10} className="explosion explosion-animation"></Box>
              )}
              <Image alt="enemy pokemon" w="100%" src="/noun.png" />
            </VStack>
          </Flex>
          {/* Player */}
          <Flex alignItems="flex-end" mt={-10}>
            <Box w={240} transform={`translateX(${playerImagePosition}px)`}>
              <Image alt="player pokemon" w="100%" src="/noun.png" />
            </Box>
            <Box ml={10}>
              <Text>yamapy</Text>
              <Flex justifyContent="between">
                <Box w={10}>
                  <Text>HP</Text>
                </Box>
                <Box pt={2} w={260}>
                  <Progress
                    size="sm"
                    value={playerHP}
                    isAnimated={true}
                    hasStripe={true}
                  />
                </Box>
              </Flex>
            </Box>
          </Flex>
          {/* Command window */}
          <Flex border="1.5px black solid" mt={10} borderRadius={6}>
            <Box border="1px black solid" borderRadius={4} w={200}>
              <Box p={6}>
                <Text
                  onClick={() => {
                    handleSkill(Skills.Attack).catch((error: Error) => {
                      console.error("Error handling skill:", error);
                    });
                  }}
                  p={1}
                >
                  Attack
                </Text>
                <Text
                  onClick={() => {
                    handleSkill(Skills.Magic).catch((error: Error) => {
                      console.error("Error handling skill:", error);
                    });
                  }}
                  p={1}
                >
                  Magic
                </Text>
                <Text
                  onClick={() => {
                    handleSkill(Skills.Heal).catch((error: Error) => {
                      console.error("Error handling skill:", error);
                    });
                  }}
                  p={1}
                >
                  Heal
                </Text>
                <Text
                  onClick={() => {
                    handleSkill(Skills.Defend).catch((error: Error) => {
                      console.error("Error handling skill:", error);
                    });
                  }}
                  p={1}
                >
                  Defend
                </Text>
              </Box>
            </Box>
          </Flex>
        </Box>
      </VStack>
    </>
  );
}
