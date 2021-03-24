import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Explorer from "./Explorer";

const theme = extendTheme({
  fonts: {
    body: "Inter"
  },
  styles: {
    global: {
      body: {
        bg: "gray.800",
        color: "gray.100",
        minHeight: "100vh"
      }
    }
  }
});

export default function App() { 
  return (
    <ChakraProvider theme={theme}>
      <Explorer/>
    </ChakraProvider>
  );
}