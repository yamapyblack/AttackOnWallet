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

export function BattlePage() {
  //Battle state
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [status, setStatus] = useState("playing"); // can be "playing", "won", "lost"
  const [isEnemyBlinking, setEnemyBlinking] = useState(false);
  const [isWindowWaving, setWindowWaving] = useState(false);
  const [playerImagePosition, setPlayerImagePosition] = useState(0); // Moving only the image
  const [enemyImagePosition, setEnemyImagePosition] = useState(0); // Moving only the image
  const [isMagicSelected, setIsMagicSelected] = useState(false);

  const { state, eoaAddress, scwAddresses } = useAppState();
  const { chain } = useNetwork();
  if (state !== "HAS_SCW") {
    return null;
  }

  // Function to handle skill selection
  const handleSkill = (skill: string) => {
    if (skill === "Attack") {
      setPlayerImagePosition(10);

      setTimeout(() => {
        setPlayerImagePosition(0); // Reset player's image position
        setEnemyBlinking(true); // Start blinking

        setTimeout(() => {
          setEnemyBlinking(false); // Stop blinking
          setEnemyHP((prevHP) => Math.max(prevHP - 100, 0));
          if (enemyHP - 100 <= 0) {
            setStatus("won");
          }
          setTimeout(() => {
            // Delay enemy movement by 1 second
            setEnemyImagePosition(-10); // Move enemy's image to the left

            setTimeout(() => {
              setEnemyImagePosition(0);
              setWindowWaving(true);

              setTimeout(() => {
                setWindowWaving(false);
                setPlayerHP((prevHP) => Math.max(prevHP - 10, 0));
                if (playerHP - 10 <= 0) {
                  setStatus("lost");
                }
              }, 1000);
            }, 300);
          }, 1000);
        }, 1000); // Blinking for 1 seconds
      }, 200);
    } else if (skill === "Magic") {
      setIsMagicSelected(true);

      // You can reset this after the animation duration (1s in our case)
      setTimeout(() => {
        setIsMagicSelected(false);
      }, 1000);

      // ... other logic ...
    }
  };
  if (status === "won") {
    return <Text>You Win</Text>;
  }

  if (status === "lost") {
    return <Text>You Lose</Text>;
  }

  return (
    <>
      {/* Magic Beam Effect */}
      {isMagicSelected && <div className="green-beam beam-animation"></div>}
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
            <Box
              w={180}
              transform={`translateX(${enemyImagePosition}px)`}
              animation={isEnemyBlinking ? "blinking 0.5s 2" : "none"}
            >
              <Image alt="enemy pokemon" w="100%" src="/noun.png" />
            </Box>
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
                <Text onClick={() => handleSkill("Attack")} p={1}>
                  Attack
                </Text>
                <Text onClick={() => handleSkill("Magic")} p={1}>
                  Magic
                </Text>
                <Text onClick={() => handleSkill("Heal")} p={1}>
                  Heal
                </Text>
                <Text onClick={() => handleSkill("Defend")} p={1}>
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
