import { Box, HStack, Image, Text } from "@chakra-ui/react";
import icons from "./icon-mappings.json";
import filesize from "filesize";
import { memo } from "react";
import { motion } from "framer-motion";

const requireFileIcon = require.context("./assets/file-icons", true);

export default memo(function FileEntry({ data, index, style }) {
  const { files, onClick } = data;
  const file = files[index];
  let baseName, extension;
  const split = file.name.split(".");
  if (file.isFolder || split.length === 1) {
    baseName = file.name;
    extension = null;
  } else {
    extension = split.pop();
    baseName = split.join(".");
  }
  return (
    <motion.div
      style={{
        ...style,
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        width: "95%",
        cursor: "pointer",
        userSelect: "none"
      }}
      whileHover={{
        backgroundColor: "#3182CE",
        boxShadow: "0 10px 20px 2px black",
        transition: {
          duration: 0
        }
      }}
      onClick={() => onClick(file)}
    >
      <HStack
        spacing={1}
        my={2}
        pl={3}
        w="100%"
      >
        <Image
          src={
            requireFileIcon(`./${
              file.isFolder ? "folder" :
              icons.svgMapping[icons.byFileName[file.name]] ||
              (extension && icons.svgMapping[icons.byExtension[extension]]) ||
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
          {baseName}
          <Box as="span" color="gray.400">{extension && ("." + extension)}</Box>
        </Text>
        <Text as="span" fontSize="xl">{file.size === undefined ? "Loading..." : filesize(file.size)}</Text>
      </HStack>
    </motion.div>
  );
}, (prev, next) => {
  const prevFile = prev.data.files[prev.index];
  const prevKeys = Object.keys(prevFile);
  const nextFile = next.data.files[next.index];
  return prevKeys.length === Object.keys(nextFile).length 
    && prevKeys.every(key => prevFile[key] === nextFile[key]);
});