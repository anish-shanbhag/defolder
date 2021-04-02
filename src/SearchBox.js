import { Box } from "@chakra-ui/react";
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const MotionBox = motion(Box);
export default function SearchBox({ openFolder }) {
  const [value, setValue] = useState("Anish");
  const [focused, setFocused] = useState(false);

  const input = useRef(null);
  const search = useRef(null);
  const caretIndex = useRef(0);

  function changeValue(e) {
    const range = window.getSelection().getRangeAt(0);
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(search.current);

    clonedRange.setEnd(range.startContainer, range.startOffset);
    let start = clonedRange.toString().length;
    clonedRange.setEnd(range.endContainer, range.endOffset);
    let end = clonedRange.toString().length;

    if (start === end) {
      start -= e.key === "Backspace";
      end += e.key === "Delete";
    }
    const text = search.current.textContent;
    start = Math.max(0, start);
    end = Math.min(text.length, end);

    const newText = e.key === "Backspace" || e.key === "Delete" ? "" :
      e.key ?? e.clipboardData.getData("text/plain").replace(/\n/g, "");
    caretIndex.current = start + newText.length;
    setValue(text.slice(0, start) + newText + text.slice(end));
    e.preventDefault();
  }

  useLayoutEffect(() => {
    if (!focused) return;
    const range = document.createRange();
    range.setStart(search.current, 0);
    range.selectNode(search.current);
    let chars = caretIndex.current;

    function addToRange(node) {
      if (chars === 0) range.setEnd(node, 0);
      else if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.length < chars) {
          chars -= node.textContent.length;
        } else {
          range.setEnd(node, chars);
          chars = 0;
        }
      } else {
        for (const child of node.childNodes) {
          addToRange(child);
          if (chars === 0) break;
        }
      }
    }

    addToRange(search.current);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    const caretPosition = range.getBoundingClientRect().right;
    const inputRightEdge = search.current.getBoundingClientRect().right;
    if (caretPosition > inputRightEdge) {
      search.current.scrollLeft += caretPosition - inputRightEdge + 2;
    }
  }, [value, focused]);

  useEffect(() => {
    //setInterval(() => controls.start({ opacity: Math.random() }), 2000);
  }, []);

  const controls = useAnimation();

  return (
    <Box
      fontSize="3xl"
      fontWeight={700}
      bg="gray.600"
      boxShadow="0 10px 20px 2px black"
      minW="90%"
      px={4}
      py={2}
      borderRadius={10}
    >
      <Box
        ref={search}
        contentEditable
        suppressContentEditableWarning
        cursor="text"
        border="1px solid transparent"
        _focus={{ outline: "none" }}
        spellCheck={false}
        whiteSpace="pre"
        overflowX="auto"
        sx={{
          "::-webkit-scrollbar": {
            display: "none"
          },
          "*": {
            whiteSpace: "pre",
            display: "inline-block"
          }
        }}
        onKeyDown={e => {
          if (e.key === "Backspace" || e.key === "Delete") changeValue(e);
          else if (e.key === "Enter") e.preventDefault();
        }}
        onKeyPress={changeValue}
        onPaste={changeValue}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
      >
        {value === "" ?
          focused ? <br /> :
            <MotionBox
              color="gray.300"
              initial="initial"
              animate="animate"
              variants={{
                initial: {
                  scale: 0.9,
                  opacity: 0,
                },
                animate: {
                  scale: 1,
                  opacity: 1,
                  transition: { duration: 0.2 }
                }
              }}
            >
              Search for anything...
            </MotionBox>
          :
          <MotionBox
            animate={controls}
          >
            {value}
          </MotionBox>
        }
      </Box>
    </Box>
  );
}