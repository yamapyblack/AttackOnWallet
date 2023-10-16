import NavigationBar from "./NavigationBar";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../utils/query";
import { ToastContainer } from "~/utils/toast";
import { WalletContext } from "~/context/Wallet";
import { OnboardingPage } from "../onboarding/OnboardingPage";
import { CreateContractWalletPage } from "../createContractWallet/CreateContractWalletPage";
import { CreatingPage } from "../creating/CreatingPage";
import { ProfilePage } from "~/pages/profile/ProfilePage";
import { ConnectPage } from "~/pages/connect/ConnectPage";
import { LoadingScreen } from "../shared/LoadingScreen";
import { useAppState } from "~/utils/appState";

function Screen() {
  const appState = useAppState();
  return (
    <>
      <NavigationBar appState={appState} />
      {appState.state === "HAS_SCW" ? (
        <ProfilePage />
      ) : appState.state === "NO_SCW" ? (
        <CreatingPage />
      ) : appState.state === "UNCONNECTED" ? (
        <ConnectPage />
      ) : appState.state === "LOADING" ? (
        <LoadingScreen />
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}

export default function RootScreen() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <WalletContext>
          <Screen />
        </WalletContext>
      </ChakraProvider>
      <ToastContainer />
    </QueryClientProvider>
  );
}