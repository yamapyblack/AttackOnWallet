import { type NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";

const RootScreen = dynamic(
  () => {
    return import("~/pages/root/RootScreen");
  },
  { ssr: false }
);

const Root: NextPage = () => {
  return (
    <>
      <RootScreen />
    </>
  );
};

export default Root;
