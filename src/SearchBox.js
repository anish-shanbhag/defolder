import { Input, Box } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import ReactDOMServer from "react-dom/server";


export default function SearchBox({ openFolder }) {

  const [value, setValue] = useState("asdfasdf");
  const [selected, setSelected] = useState("");

  const input = useRef(null);
  const search = useRef(null);
  const hovered = useRef(false);
  const caretPosition = useRef(0);

  useEffect(() => {
    const range = document.createRange();
    range.setStart(search.current, 0);
    range.selectNode(search.current);
    let chars = caretPosition.current;
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
  }, [value]);

  return (
    <>
      <Input
        placeholder="Enter directory"
        w="50%"
        ref={input}
        px={3}
        py={6}
        variant="filled"
        bg="gray.600"
        boxShadow="0 10px 20px 2px black"
        fontWeight={700}
        letterSpacing={0}
        fontSize="3xl"
        _hover={{ bg: "gray.500", boxShadow: "0 10px 40px 5px black" }}
        _focus={{
          bg: "gray.600",
          borderRadius: 20,
          boxShadow: "0 10px 60px 5px black"
        }}
        onKeyDown={e => e.key === "Enter" && openFolder(e.target.value)}
        onSelect={e => {
          setSelected(e.target.value.slice(e.target.selectionStart, e.target.selectionEnd));
        }}
      />
      <Box
        ref={search}
        w="50%"
        fontSize="3xl"
        fontWeight={700}
        pl={3}
        cursor="text"
        bg="gray.600"
        boxShadow="0 10px 20px 2px black"
        borderRadius={10}
        onMouseEnter={() => hovered.current = true}
        onMouseLeave={() => hovered.current = false}
        contentEditable="true"
        _focus={{ outline: "none" }}
        onInput={() => {
          const selection = window.getSelection();
          let chars = selection.focusOffset, node = selection.focusNode;
          function isChildOfSearchBox(node) {
            while ((node = node.parentNode)) {
              if (node === search.current) return true;
            }
            return false;
          }
          while (isChildOfSearchBox(node)) {
            if (node.previousSibling) {
              node = node.previousSibling;
              chars += node.textContent.length;
            } else node = node.parentNode;
          }
          caretPosition.current = chars;
          setValue(search.current.textContent);
        }}
        dangerouslySetInnerHTML={{
          __html: ReactDOMServer.renderToString(
            <>
              <Box as="span" bg="green">{value.slice(0, 2)}</Box>
              <Box as="span" bg="red">{value.slice(2)}</Box>
            </>
          )
        }}
      >
      </Box>
    </>
  );
}