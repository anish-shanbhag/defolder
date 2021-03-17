import { HashRouter as Router, Route } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Explorer from "./Explorer";

const theme = extendTheme({
  fonts: {
    body: "Inter"
  },
  textStyles: {
    
  },
  styles: {
    global: {
      html: {
        cursor: "crosshair !important"
      },
      body: {
        bg: "gray.800",
        color: "gray.100",
        cursor: "default !important",
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

function Options() {
  return <h2>Options</h2>;
}