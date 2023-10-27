import { useRouter } from "next/router";
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
import { useSimpleAccountSigner } from "~/utils/simpleAccountSigner";
import { useAppState } from "../../utils/appState";
import { delay } from "~/utils/delay";
import { AoWBattleABI } from "../../common/aowBattleAbi";
import { getAddresses } from "~/common/getAddresses";
import { type Log, encodeFunctionData } from "viem";
import { BattleStart } from "./BattleStart";
import { PlayerImage } from "~/utils/PlayerImage";
import { daappConfigurations } from "../../configs/clientConfigs";
import { sessionKeyStore, localSmartContractStore } from "~/utils/localStorage";

import {
  useContractEvent,
  useContractRead,
  useNetwork,
  type Chain,
} from "wagmi";
import {
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import {
  SimpleSmartContractAccount,
  SmartAccountProvider,
  type SmartAccountSigner,
  LocalAccountSigner,
  deepHexlify,
  getUserOperationHash,
  type UserOperationRequest,
} from "@alchemy/aa-core";

enum Skills {
  Attack = "Attack",
  Magic = "Magic",
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

function HpComponent({ name, hp }: { name: string; hp: number }) {
  return (
    <>
      <Text>{name}</Text>
      <Flex justifyContent="between">
        <Box w={10}>
          <Text>HP</Text>
        </Box>
        <Box pt={2} w={260}>
          <Progress size="sm" value={hp} isAnimated={true} hasStripe={true} />
        </Box>
      </Flex>
    </>
  );
}

export function BattlePage() {
  const router = useRouter();
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
    //Reload
    router.reload();
  };

  const attackBySessionkey = async (
    owner: SmartAccountSigner,
    battleId: bigint,
    skillId: bigint,
    chain: Chain
  ) => {
    const addresses = getAddresses(chain?.id!)!;
    const rpcUrl = daappConfigurations[chain?.id]!.rpcUrl;

    const ownerAddress = await owner.getAddress();
    const salt = localSmartContractStore.smartAccountAddresses(
      ownerAddress as string,
      chain?.id
    )?.salt;
    console.log("salt: ", salt);

    // 2. initialize the provider and connect it to the account
    const provider = new SmartAccountProvider(
      rpcUrl,
      addresses.EntryPointAddress,
      chain
    ).connect(
      (rpcClient) =>
        new SimpleSmartContractAccount({
          entryPointAddress: addresses.EntryPointAddress,
          chain: chain,
          factoryAddress: addresses.AccountFactoryAddress,
          rpcClient,
          owner,
          index: BigInt(salt!), //salt
        })
    );

    const smartAccountAddress = await provider.getAddress();
    console.log("smartAccountAddress: ", smartAccountAddress);

    const privateSessionKey =
      sessionKeyStore.getPrivateSessionKey() as `0x${string}`;
    const sessionKey =
      LocalAccountSigner.privateKeyToAccountSigner(privateSessionKey);
    console.log("privateSessionKey: ", privateSessionKey);
    console.log("sessionKey: ", sessionKey);

    const uoStruct = await provider.buildUserOperation({
      target: addresses.AoWBattle,
      data: encodeFunctionData({
        abi: AoWBattleABI.abi,
        functionName: "attack",
        args: [battleId, skillId],
      }),
    });
    const request: UserOperationRequest = deepHexlify(
      uoStruct
    ) as UserOperationRequest;

    request.signature = await sessionKey.signMessage(
      getUserOperationHash(
        request,
        addresses.EntryPointAddress,
        BigInt(chain.id)
      )
    );

    const hash = await provider.rpcClient.sendUserOperation(
      request,
      addresses.EntryPointAddress
    );
    console.log("attackBySessionkey hash: ", hash);
    // const waitHash = await provider.waitForUserOperationTransaction(hash);
    // console.log("waitHash: ", waitHash);
  };

  const attack = async (
    owner: SmartAccountSigner,
    skill: Skills,
    chain: Chain
  ) => {
    const skillId = skill === Skills.Attack ? BigInt(1) : BigInt(2);

    //1. Send tx
    attackBySessionkey(owner, battleId, skillId, chain);
    // const { request } = await prepareWriteContract({
    //   address: addresses.AoWBattle,
    //   abi: AoWBattleABI.abi,
    //   functionName: "attack",
    //   args: [battleId, skillId],
    // });
    // const { hash } = await writeContract(request);
    // console.log("hash", hash);

    //2. Occur effect
    setPlayerImagePosition(15);
    await delay(200);
    setPlayerImagePosition(0);
    await delay(400);
    if (skill === Skills.Attack) {
      setIsAttackEffect(true);
      await delay(3000);
      setIsAttackEffect(false);
    } else if (skill === Skills.Magic) {
      setIsMagicEffect(true);
      await delay(2600);
      setIsMagicEffect(false);
    }
    await delay(500);
    setEnemyBlinking(true);
    await delay(2000);
    setEnemyBlinking(false);

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
  const [isAttackEffect, setIsAttackEffect] = useState(false);
  const [isMagicEffect, setIsMagicEffect] = useState(false);
  const [attackedLogs, setAttackedLogs] = useState<Log[]>();

  //---------------------- Set initial state ----------------------
  const { chain } = useNetwork();
  const addresses = getAddresses(chain?.id!)!;

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

  const ownerResult = useSimpleAccountSigner();
  const { state } = useAppState();
  if (!ownerResult || ownerResult.isLoading) {
    return null;
  }
  if (state !== "HAS_SCW") {
    return null;
  }
  if (chain === undefined) {
    return null;
  }

  //---------------------- Rendering ----------------------
  return (
    <>
      {enemyHP <= 0 && playerHP > 0 && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Text fontSize={120} fontWeight="bold" zIndex={1} onClick={join}>
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
              <HpComponent name="Rival" hp={enemyHP} />
            </Box>
            <VStack
              w={180}
              transform={`translateX(${enemyImagePosition}px)`}
              animation={isEnemyBlinking ? "blinking 0.5s 2" : "none"}
            >
              {/* Explosion Effect */}
              {isAttackEffect && (
                <Box position="absolute">
                  <Image alt="enemy pokemon" w="100%" src="/effect2.gif" />
                </Box>
              )}
              {isMagicEffect && (
                <Box position="absolute">
                  <Image alt="enemy pokemon" w="100%" src="/effect3.gif" />
                </Box>
              )}
              <Image alt="enemy pokemon" w="100%" src="/noun2.png" />
            </VStack>
          </Flex>
          {/* Player */}
          <Flex alignItems="flex-end" mt={-10}>
            <Box w={240} transform={`translateX(${playerImagePosition}px)`}>
              <PlayerImage />
            </Box>
            <Box ml={10}>
              <HpComponent name="You" hp={playerHP} />
            </Box>
          </Flex>
          {/* Command window */}
          <Flex border="1.5px black solid" mt={10} borderRadius={6}>
            <Box border="1px black solid" borderRadius={4} w={200}>
              <Box p={6}>
                {/* Commands */}
                {Object.values(Skills).map((skill) => (
                  <Text
                    _hover={{ cursor: "pointer" }}
                    p={1}
                    key={skill}
                    onClick={() => {
                      attack(ownerResult.owner, skill, chain).catch(
                        (error: Error) => {
                          console.error(
                            `Error handling ${skill} skill:`,
                            error
                          );
                        }
                      );
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
      <BattleStart />
    </>
  );
}
