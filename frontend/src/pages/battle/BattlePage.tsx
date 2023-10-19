import {
  Button,
  Text,
  Box,
  Image,
  Progress,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAppState } from "../../utils/appState";
import { delay } from "~/utils/delay";
import { AoWBattleABI } from "../../common/aowBattleAbi";
import { getAddresses } from "~/common/getAddresses";
import { Log } from "viem";

import { useContractEvent, useContractRead, useChainId } from "wagmi";
import {
  prepareWriteContract,
  writeContract,
  waitForTransaction,
  watchContractEvent,
} from "@wagmi/core";

enum Skills {
  Attack = "Attack",
  Magic = "Magic",
  Heal = "Heal",
  Defend = "Defend",
}

type Battles = {
  playerHP: bigint;
  enemyHP: bigint;
};

type Joined = Log[] & [{ args: { _battleId: bigint } }];
type Damaged = Log & {
  args: { _battleId: bigint; isPlayer: boolean; damage: bigint };
};

const INITIAL_HP = 100;

export function BattlePage() {
  //---------------------- Actions ----------------------
  const join = async () => {
    const { request } = await prepareWriteContract({
      address: addresses.AoWBattle,
      abi: AoWBattleABI.abi,
      functionName: "join",
      //TODO tokenId
      args: [BigInt(1)],
    });
    const { hash } = await writeContract(request);
    console.log("hash", hash);
    await waitForTransaction({
      hash: hash,
    });
  };

  const attack = async (skill: Skills) => {
    //1. Send tx
    const { request } = await prepareWriteContract({
      address: addresses.AoWBattle,
      abi: AoWBattleABI.abi,
      functionName: "attack",
      //TODO skill
      args: [battleId, BigInt(1)],
    });
    const { hash } = await writeContract(request);
    console.log("hash", hash);

    //2. Occur effect
    setPlayerImagePosition(10);
    await delay(150);
    setPlayerImagePosition(0);
    await delay(200);
    setEnemyBlinking(true);
    await delay(1000);
    setEnemyBlinking(false);

    //3. Set endPlayerAttack
    setEndPlayerAttack(true);
  };

  // // Function to handle skill selection
  const enemyAttack = async () => {
    //1. Occur effect
    setEnemyImagePosition(-10);
    await delay(200);

    setEnemyImagePosition(0);
    setWindowWaving(true);
    //2. Set endEnemyAttack
    setEndEnemyAttack(true);
  };

  // const enemyDamaged = async (_damage: number): Promise<boolean> => {
  //   //enemy blinking
  //   setEnemyBlinking(true);
  //   await delay(1000);

  //   setEnemyBlinking(false);
  //   const newEnemyHP = enemyHP - _damage;
  //   setEnemyHP(newEnemyHP < 0 ? 0 : newEnemyHP);

  //   if (newEnemyHP <= 0) {
  //     setStatus(BattleStatus.won);
  //     return true;
  //   }
  //   return false;
  // };

  // const handleSkill = async (skill: Skills) => {
  //   setIsActionInProgress(true);
  //   if (skill === Skills.Attack) {
  //     //Attack effect
  //     setPlayerImagePosition(10);
  //     await delay(150);
  //     setPlayerImagePosition(0);

  //     if (await enemyDamaged(30)) return;

  //     await delay(1000);
  //     await enemyAttack();
  //   } else if (skill === Skills.Magic) {
  //     //Magic effect
  //     setIsMagicSelected(true);
  //     await delay(1000);
  //     setIsMagicSelected(false);

  //     if (await enemyDamaged(60)) return;

  //     await delay(1000);
  //     await enemyAttack();
  //   }
  //   setIsActionInProgress(false);
  // };

  //---------------------- States ----------------------
  const [battleId, setBattleId] = useState(BigInt(0));
  const [playerHP, setPlayerHP] = useState(INITIAL_HP);
  const [tmpPlayerHp, setTmpPlayerHp] = useState(playerHP);
  const [enemyHP, setEnemyHP] = useState(INITIAL_HP);
  const [tmpEnemyHp, setTmpEnemyHp] = useState(enemyHP);
  const [endPlayerAttackEvent, setEndPlayerAttackEvent] = useState(false);
  const [endEnemyAttackEvent, setEndEnemyAttackEvent] = useState(false);
  const [endPlayerAttack, setEndPlayerAttack] = useState(false);
  const [endEnemyAttack, setEndEnemyAttack] = useState(false);
  const [isEnemyBlinking, setEnemyBlinking] = useState(false);
  const [isWindowWaving, setWindowWaving] = useState(false);
  const [playerImagePosition, setPlayerImagePosition] = useState(0); // Moving only the image
  const [enemyImagePosition, setEnemyImagePosition] = useState(0); // Moving only the image
  const [isMagicSelected, setIsMagicSelected] = useState(false);

  const chainId = useChainId();
  const addresses = getAddresses(chainId)!;

  //---------------------- Set initial state ----------------------
  useContractRead({
    address: addresses.AoWBattle,
    abi: AoWBattleABI.abi,
    functionName: "battleId",
    onSuccess(data) {
      console.log("read battleId", data);
      setBattleId(data as bigint);
    },
  });

  useContractRead({
    address: addresses.AoWBattle,
    abi: AoWBattleABI.abi,
    functionName: "battles",
    args: [battleId],
    onSuccess(data) {
      console.log("read battles", data);
      setPlayerHP(Number((data as unknown[])[2]));
      setEnemyHP(Number((data as unknown[])[3]));
    },
  });

  //---------------------- Effects ----------------------
  useEffect(() => {
    if (endPlayerAttack && endPlayerAttackEvent) {
      console.log("endPlayerAttack && endPlayerAttackEvent");
      //clear flags
      setEndPlayerAttack(false);
      setEndPlayerAttackEvent(false);

      console.log("tmpEnemyHp", tmpEnemyHp);
      setEnemyHP(tmpEnemyHp);

      //Judge win or lose
      if (playerHP <= 0 || enemyHP <= 0) {
        return;
      }
      //Next
      enemyAttack().catch((error: Error) => {
        console.error("Error handling enemyAttack:", error);
      });
    }
  }, [endPlayerAttack, endPlayerAttackEvent]);

  useEffect(() => {
    if (endEnemyAttack && endEnemyAttackEvent) {
      console.log("endEnemyAttack && endEnemyAttackEvent");
      //clear flags
      setEndEnemyAttackEvent(false);
      setEndEnemyAttack(false);

      console.log("tmpPlayerHp", tmpPlayerHp);
      setPlayerHP(tmpPlayerHp);
    }
  }, [endEnemyAttack, endEnemyAttackEvent]);

  //---------------------- Events ----------------------
  useContractEvent({
    address: addresses.AoWBattle,
    abi: AoWBattleABI.abi,
    eventName: "Damaged",
    listener(logs) {
      console.log("Damaged", logs);
      logs.map((l) => {
        const arg = (l as Damaged).args;
        console.log("Damaged arg", arg, battleId);
        if (arg._battleId === battleId) {
          if (!arg.isPlayer && !endPlayerAttackEvent) {
            console.log("set setEndPlayerAttackEvent");
            setEndPlayerAttackEvent(true);
            setTmpEnemyHp(enemyHP - Number(arg.damage));
          } else if (arg.isPlayer && !endEnemyAttackEvent) {
            console.log("set setEndEnemyAttackEvent");
            setEndEnemyAttackEvent(true);
            setTmpPlayerHp(playerHP - Number(arg.damage));
          }
        }
      });
    },
  });

  const { state, eoaAddress, scwAddresses } = useAppState();
  if (state !== "HAS_SCW") {
    return null;
  }

  //---------------------- Rendering ----------------------
  return (
    <>
      <Button onClick={join}>Join</Button>
      {enemyHP <= 0 && playerHP > 0 && (
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
      {playerHP <= 0 && enemyHP > 0 && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Text fontSize={120} fontWeight="bold" zIndex={1}>
            LOSE
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
                {/* Commands */}
                {Object.values(Skills).map((skill) => (
                  <Text
                    p={1}
                    key={skill}
                    onClick={() => {
                      attack(skill).catch((error: Error) => {
                        console.error(`Error handling ${skill} skill:`, error);
                      });
                    }}
                  >
                    {skill}
                  </Text>
                ))}
              </Box>
            </Box>
          </Flex>
        </Box>
      </VStack>
    </>
  );
}
