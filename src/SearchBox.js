import { Box } from "@chakra-ui/react";
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";

const MotionBox = motion(Box);
export default function SearchBox({ onEnter, onChange, search, files }) {
  const [focused, setFocused] = useState(false);

  const editable = useRef(null);
  const caretIndex = useRef(0);
  const oldLength = useRef(0);

  function changeValue(e) {
    const range = window.getSelection().getRangeAt(0);
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(editable.current);

    clonedRange.setEnd(range.startContainer, range.startOffset);
    let start = clonedRange.toString().length;
    clonedRange.setEnd(range.endContainer, range.endOffset);
    let end = clonedRange.toString().length;
    if (start === end) {
      start -= e.key === "Backspace";
      end += e.key === "Delete";
    }
    const text = editable.current.textContent;
    start = Math.max(0, start);
    end = Math.min(text.length, end);


    const newText = e.key === "Backspace" || e.key === "Delete" ? "" :
      e.key ?? e.clipboardData.getData("text/plain").replace(/\n/g, "");
    caretIndex.current = end;
    onChange(text.slice(0, start) + newText + text.slice(end));
    e.preventDefault();
  }

  useLayoutEffect(() => {
    if (!focused) return;
    const range = document.createRange();
    range.setStart(editable.current, 0);
    range.selectNode(editable.current);
    const newLength = search.path.length + search.filter.length;
    let chars = caretIndex.current + newLength - oldLength.current;
    oldLength.current = newLength;

    async function addToRange(node) {
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

    addToRange(editable.current);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    const caretPosition = range.getBoundingClientRect().right;
    const inputRightEdge = editable.current.getBoundingClientRect().right;
    if (caretPosition > inputRightEdge) {
      editable.current.scrollLeft += caretPosition - inputRightEdge + 2;
    }

  }, [focused, search]);

  const controls = useAnimation();

  useEffect(() => {
    if (files.length > 0) {
      controls.start("results");
    } else {
      controls.start("noResults");
    }
  }, [controls, files]);

  const splitPath = search.path.split("/").slice(0, -1);

  const pathPortions = splitPath.map((folder, i) => {
    const pathPortion = splitPath.slice(0, i + 1).join("/");
    return (
      <MotionBox
        key={pathPortion}
        initial={{
          opacity: 0,
          x: 10,
          scale: 0.8
        }}
        animate={{
          opacity: 1,
          x: 0,
          scale: 1
        }}
        exit={{
          opacity: 0,
          x: 10,
          scale: 0.8
        }}
      >
        <MotionBox
          cursor="pointer"
          onContextMenu={() => console.log(pathPortion)}
          whileHover={{
            color: "#A0AEC0",
            scale: 0.95,
            transition: { duration: 0.1 }
          }}
        >
          {folder}
        </MotionBox>
        /
      </MotionBox>
    )
  });

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
        ref={editable}
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
          else if (e.key === "Enter") {
            onEnter();
            e.preventDefault();
          }
        }}
        onKeyPress={changeValue}
        onPaste={changeValue}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
      >
        {search.filter === "" && search.path === "" ?
          focused ? <br /> :
            <MotionBox
              color="gray.300"
              initial="initial"
              animate="animate"
              variants={{
                initial: {
                  scale: 0.9,
                  opacity: 0
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
          <>
            {
              search.path !== "" &&
              <Box mr={2}>
                {
                  //search.filter === "" ?
                  //<AnimatePresence>
                    pathPortions
                 // </AnimatePresence>
                  //: pathPortions
                }
              </Box>
            }

            {search.filter !== "" &&
              <MotionBox
                initial={{
                  opacity: 0,
                  x: 10,
                  scale: 0.8
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1
                }}
              >
                <MotionBox
                  animate={controls}
                  px={2}
                  borderRadius={10}
                  initial="results"
                  variants={{
                    results: {
                      backgroundImage: "linear-gradient(to right, #0072ff, #00c6ff)",
                      transition: {
                        duration: 0.2
                      }
                    },
                    noResults: {
                      backgroundImage: "linear-gradient(to right, #FF416C, #FF4B2B)",
                      transition: {
                        duration: 0.2
                      }
                    }
                  }}
                >
                  {search.filter}
                </MotionBox>
              </MotionBox>
            }
          </>
        }
      </Box>
    </Box>
  );
}