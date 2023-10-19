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

type Attacked = Log & {
  args: {
    _battleId: bigint;
    _isPlayer: boolean;
    _playerHP: bigint;
    _enemyHP: bigint;
  };
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
    const skillId = skill === Skills.Attack ? BigInt(1) : BigInt(2);

    //1. Send tx
    const { request } = await prepareWriteContract({
      address: addresses.AoWBattle,
      abi: AoWBattleABI.abi,
      functionName: "attack",
      args: [battleId, skillId],
    });
    const { hash } = await writeContract(request);
    console.log("hash", hash);

    //2. Occur effect
    if (skill === Skills.Attack) {
      setPlayerImagePosition(15);
      await delay(300);
      setPlayerImagePosition(0);
      await delay(400);
      setEnemyBlinking(true);
      await delay(2000);
      setEnemyBlinking(false);
    } else if (skill === Skills.Magic) {
      setIsMagicEffect(true);
      await delay(1000);
      setIsMagicEffect(false);
      await delay(400);
      setEnemyBlinking(true);
      await delay(2000);
      setEnemyBlinking(false);
    }

    //3. Set endPlayerAttack
    setEndPlayerAttack(true);
  };

  // // Function to handle skill selection
  const enemyAttack = async () => {
    //1. Occur effect
    await delay(1000);
    setEnemyImagePosition(-10);
    await delay(200);

    setEnemyImagePosition(0);
    setWindowWaving(true);
    await delay(1000);
    setWindowWaving(false);

    //2. Set endEnemyAttack
    setEndEnemyAttack(true);
  };

  //---------------------- States ----------------------
  const [battleId, setBattleId] = useState(BigInt(0));
  const [playerHP, setPlayerHP] = useState(INITIAL_HP);
  const [enemyHP, setEnemyHP] = useState(INITIAL_HP);
  const [tmpPlayerHP, setTmpPlayerHP] = useState(INITIAL_HP);
  const [tmpEnemyHP, setTmpEnemyHP] = useState(INITIAL_HP);
  const [endPlayerAttack, setEndPlayerAttack] = useState(false);
  const [endEnemyAttack, setEndEnemyAttack] = useState(false);
  const [endPlayerAttackEvent, setEndPlayerAttackEvent] = useState(false);
  const [endEnemyAttackEvent, setEndEnemyAttackEvent] = useState(false);
  const [isEnemyBlinking, setEnemyBlinking] = useState(false);
  const [isWindowWaving, setWindowWaving] = useState(false);
  const [playerImagePosition, setPlayerImagePosition] = useState(0);
  const [enemyImagePosition, setEnemyImagePosition] = useState(0);
  const [isMagicEffect, setIsMagicEffect] = useState(false);
  const [attackedLogs, setAttackedLogs] = useState<Log[]>();

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

      console.log("tmpEnemyHp", tmpEnemyHP);
      setEnemyHP(tmpEnemyHP);

      //Judge win or lose
      if (playerHP <= 0 || tmpEnemyHP <= 0) {
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

      console.log("tmpPlayerHp", tmpPlayerHP);
      setPlayerHP(tmpPlayerHP);
    }
  }, [endEnemyAttack, endEnemyAttackEvent]);

  //Manage Attacked event
  useEffect(() => {
    if (attackedLogs === undefined || battleId === BigInt(0)) return;
    attackedLogs.map((l) => {
      const arg = (l as Attacked).args;
      console.log("Attacked arg", arg, battleId);
      if (arg._battleId === battleId) {
        if (arg._isPlayer) {
          console.log("set setEndPlayerAttackEvent");
          setEndPlayerAttackEvent(true);
          setTmpEnemyHP(Number(arg._enemyHP));
        } else {
          console.log("set setEndEnemyAttackEvent");
          setEndEnemyAttackEvent(true);
          setTmpPlayerHP(Number(arg._playerHP));
        }
      }
    });
  }, [attackedLogs, battleId]);

  //---------------------- Events ----------------------
  useContractEvent({
    address: addresses.AoWBattle,
    abi: AoWBattleABI.abi,
    eventName: "Attacked",
    listener(logs) {
      console.log("Attacked", logs);
      setAttackedLogs(logs);
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
              {isMagicEffect && (
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
