import {  forwardRef } from "react";
import { motion } from "framer-motion";
import { Box } from "@chakra-ui/react";

const MotionBox = motion(forwardRef((props, ref) => 
  <Box {...props} ref={ref}/>
));

export default function HoverAnimation({ opacityTransition, ...props }) {
  return (
    <MotionBox
      {...props}
      w="100%"
      h="100%"
      position="absolute"
      left={0}
      borderRadius={10}
      backgroundSize="200% 100%"
      backgroundImage="linear-gradient(to right, #0072ff, #0072ff, #00c6ff)"
      initial="initial"
      variants={{
        initial: {
          backgroundPosition:"0 0",
          opacity: 0,
          transition: {
            opacity: {
              duration: 0
            }
          }
        },
        hover: {
          backgroundPosition: "100% 0",
          opacity: 1,
          transition: {
            backgroundPosition: {
              duration: 1,
              ease: "easeOut"
            },
            opacity: opacityTransition
          }
        }
      }}
    />
  );
}