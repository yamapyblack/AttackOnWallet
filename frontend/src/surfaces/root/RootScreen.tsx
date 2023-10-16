import NavigationBar from "../NavigationBar";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../clients/query";
import { ToastContainer } from "~/clients/toast";
import { WalletContext } from "~/context/Wallet";
import { OnboardingPage } from "../onboarding/OnboardingPage";
import { CreateContractWalletPage } from "../createContractWallet/CreateContractWalletPage";
import { CreatingPage } from "../creating/CreatingPage";
import { ProfilePage } from "~/surfaces/profile/ProfilePage";
import { ConnectPage } from "~/surfaces/connect/ConnectPage";
import { LoadingScreen } from "../shared/LoadingScreen";
import { AppState, useAppState } from "~/clients/appState";

function LandingScreen({ appState }) {
  // return <CreateContractWalletPage />;
  // return <CreatingPage />;

  switch (appState.state) {
    case "HAS_SCW":
      return <ProfilePage />;
    case "NO_SCW":
      return <CreatingPage />;
    case "UNCONNECTED":
      return <ConnectPage />;
    case "LOADING":
      return <LoadingScreen />;
  }
}

function Screen() {
  const state = useAppState();
  return (
    <>
      <NavigationBar appState={state} />
      <LandingScreen appState={state} />
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
