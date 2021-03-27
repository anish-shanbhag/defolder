import { Box, HStack, Image, Text } from "@chakra-ui/react";
import icons from "./icon-mappings.json";
import filesize from "filesize";
import { memo, forwardRef } from "react";
import { motion, useAnimation } from "framer-motion";

const requireFileIcon = require.context("./assets/file-icons", true);

const MotionHStack = motion(forwardRef((props, ref) => <HStack {...props} ref={ref}/>));
const MotionBox = motion(forwardRef((props, ref) => <Box {...props} ref={ref}/>))

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
  const controls = useAnimation();
  const hoverAnimation = {
    initial: {
      background: "none",
      backgroundSize: "200% 100%",
      backgroundPosition:"0 0",
    },
    hovered: {
      backgroundPosition: "100% 0",
      background: "linear-gradient(to right, #0072ff, #0072ff, #00c6ff)",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  }
  return (
    <MotionHStack
      style={style}
      onClick={() => onClick(file)}
      spacing={1}
      pl={3}
      py={1}
      ml={4}
      borderRadius={5}
      maxW="95%"
      userSelect="none"
      cursor="pointer"
      animate={controls}
      variants={hoverAnimation}
      initial="initial"
      onHoverStart={() => controls.start("hovered")}
      onHoverEnd={() => controls.start("initial")}
      whileTap={{
        scale: 0.97,
        transition: 0.1
      }}
    >
      <MotionBox
        zIndex="-1"
        position="absolute"
        top="0%"
        left={0}
        filter="blur(10px)"
        w="100%"
        h="100%"
        variants={{
          initial: {
            ...hoverAnimation.initial,
            opacity: 0
          },
          hovered: {
            ...hoverAnimation.hovered,
            opacity: 1,
            transition: {
              opacity: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
                ease: "easeOut"
              }
            }
          }
        }}
      >
      </MotionBox>
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
    </MotionHStack>
  );
}, (prev, next) => {
  const prevFile = prev.data.files[prev.index];
  const prevKeys = Object.keys(prevFile);
  const nextFile = next.data.files[next.index];
  return prevKeys.length === Object.keys(nextFile).length 
    && prevKeys.every(key => prevFile[key] === nextFile[key]);
});