import { Box, HStack, Image, Text } from "@chakra-ui/react";
import icons from "./icon-mappings.json";
import filesize from "filesize";
import { areEqual } from "react-window";
import { memo } from "react";

const requireFileIcon = require.context("./assets/file-icons", true, /\.svg$/);

export default memo(function FileEntry({ data, index, style }) {
  const { files, onClick } = data;
  const file = files[index];
  if (file.name === "log") console.log("rerendered");
  return (
    <Box>
      <HStack
        onClick={() => onClick(file)}
        style={style}
        spacing={1}
        transition="0.2s"
        cursor="pointer"
        borderRadius={5}
        my={2}
        pl={3}
        maxW="97%"
        _hover={{
          background: "blue.500",
          boxShadow: "0 10px 20px 2px black"
        }}
      >
        <Image
          src={
            requireFileIcon(`./${
              file.isFolder ? "folder" :
              icons.svgMapping[icons.byFileName[file.name + file.extension]] ||
              (file.extension && icons.svgMapping[icons.byExtension[file.extension.substring(1)]]) ||
              "file"
            }.svg`).default
          }
          width="30px"
          ignoreFallback
        />
        
        <Text
          px={2}
          fontWeight={500}
          fontSize="2xl"
          letterSpacing={-0.2}
          isTruncated
          w="50%"
        >
          {file.name}
          <Box as="span" color="gray.400">{file.extension}</Box>
        </Text>
        <Text as="span" fontSize="xl">{file.size === undefined ? "Loading..." : filesize(file.size)}</Text>
      </HStack>
    </Box>
  );
}, areEqual);