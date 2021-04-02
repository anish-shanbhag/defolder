import { Box, HStack, Text } from "@chakra-ui/react";
import icons from "./assets/icon-mappings.json";
import filesize from "filesize";
import { memo, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

const requireFileIcon = require.context("./assets/file-icons", true);

const MotionHStack = motion(HStack), MotionBox = motion(Box), MotionText = motion(Text);

const hoverShadow = {
  initial: {
    filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 0))"
  },
  hover: {
    filter: "drop-shadow(0 0 5px rgba(0, 0, 0, 1))",
    transition: { duration: 0 }
  }
}

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

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);

  return (
    <MotionHStack
      style={style}
      onClick={() => onClick(file)}
      userSelect="none"
      spacing={0}
      pl={3}
      py={1}
      ml={4}
      borderRadius={10}
      maxW="95%"
      cursor="pointer"
      backgroundSize="200% 100%"
      initial="initial"
      animate={controls}
      variants={{
        initial: {
          backgroundPosition: "0 0",
          backgroundImage: `linear-gradient(to right${", rgba(0, 0, 0, 0)".repeat(3)})`,
          transition: {
            backgroundPosition: { duration: 0 },
            backgroundImage: { duration: 0 }
          }
        },
        hover: {
          backgroundPosition: "100% 0",
          backgroundImage: "linear-gradient(to right, #0072ff, #0072ff, #00c6ff)",
          transition: {
            backgroundPosition: {
              duration: 1,
              ease: "easeOut"
            },
            backgroundImage: { duration: 0 }
          }
        }
      }}
      onMouseOver={() => mounted.current && controls.start("hover")}
      onMouseOut={() => mounted.current && controls.start("initial")}
      whileTap={{ scale: 0.97 }}
    >
      <MotionBox
        zIndex="-1"
        filter="blur(5px)"
        w="100%"
        h="100%"
        position="absolute"
        left={0}
        backgroundSize="200% 100%"
        backgroundImage="linear-gradient(to right, #0072ff, #0072ff, #00c6ff)"
        variants={{
          initial: {
            backgroundPosition: "0 0",
            opacity: 0,
            transition: { opacity: { duration: 0 } }
          },
          hover: {
            backgroundPosition: "100% 0",
            opacity: 1,
            transition: {
              backgroundPosition: {
                duration: 1,
                ease: "easeOut"
              },
              opacity: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
                ease: "easeOut"
              }
            }
          }
        }}
      />
      <motion.img
        src={
          requireFileIcon(
            `./
              ${file.isFolder ? "folder" :
              icons.svgMapping[icons.byFileName[file.name]] ||
              (extension && icons.svgMapping[icons.byExtension[extension]]) ||
              "file"}
            .svg`
          ).default
        }
        width="30px"
        variants={hoverShadow}
      />

      <MotionText
        px={2}
        fontWeight={500}
        fontSize="2xl"
        letterSpacing={-0.2}
        isTruncated
        w="50%"
      // variants={hoverShadow}
      >
        {baseName}
        <Box as="span" color="gray.400">{extension && ("." + extension)}</Box>
      </MotionText>
      <MotionText /* variants={hoverShadow} */ as="span" fontSize="xl">
        {file.size === undefined ? "Loading..." : filesize(file.size)}
      </MotionText>
    </MotionHStack>
  );
}, (prev, next) => {
  const prevFile = prev.data.files[prev.index];
  const prevKeys = Object.keys(prevFile);
  const nextFile = next.data.files[next.index];
  return prevKeys.length === Object.keys(nextFile).length
    && prevKeys.every(key => prevFile[key] === nextFile[key]);
});