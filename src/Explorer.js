import { useEffect, useState, useRef, Profiler } from "react";
import { Box, Button, Container, HStack, Input } from "@chakra-ui/react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import FileEntry from "./FileEntry";
import { join } from "path";
import { motion } from "framer-motion";

// using globals instead of useRef because there is only one Explorer component
let path = null, scrolled = false;

export default function Explorer() {
  
  const [files, setFiles] = useState([]);
  
  const searchBox = useRef(null);
  const fileList = useRef(null);

  function openFile(file) {
    if (file.isFolder) {
      openFolder(join(path, file.name));
    } else {
      ipc.emit("open", join(path, file.name));
    }
  }
  
  async function goBack() {
    openFolder(join(path, "../"));
  }

  async function openFolder(folderPath) {
    // may want to move setting path to after the folder is received
    path = folderPath;
    ipc.emit("getFolder", { 
      path,
      sort: "modified"
    });
  }

  
  useEffect(() => {
    openFolder("C:/");

    ipc.on("getFolder", newFiles => {
      setFiles(newFiles);
      if (searchBox.current) searchBox.current.value = path;
      if (scrolled) {
        fileList.current?.scrollTo(0);
      }
    });

    ipc.on("updateFile", ({ name, size }) => {
      setFiles(previousFiles => {
        const filesCopy = previousFiles.slice();
        const index = filesCopy.findIndex(file => file.name === name);
        filesCopy[index] = {
          ...filesCopy[index],
          size
        }
        return filesCopy;
      });
    });
  }, []);

  return (
    <Profiler id="a" onRender={(id, b, actualDuration) => /* console.log(id, Date.now(), actualDuration)*/ null}>
      <Container maxW="container.xl" minH="90vh">
        <HStack py={4} verticalAlign="middle">
          <Button onClick={goBack} colorScheme="blue" boxShadow="lg" m={2}>Back</Button>
          <Input
            ref={searchBox}
            placeholder="Enter directory"
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
          />
        </HStack>

        <AutoSizer>
          {({ height, width }) => files &&
            <List
              itemCount={files.length}
              itemSize={45}
              height={height - 100}
              width={width}
              overscanCount={5}
              itemData={{ files, onClick: openFile}}
              itemKey={index => files[index].name}
              ref={fileList}
              onScroll={({ scrollOffset, scrollUpdateWasRequested }) => {
                scrolled = !scrollUpdateWasRequested && scrollOffset !== 0;
              }}
            >
              {FileEntry}
            </List>
          }
        </AutoSizer>
      </Container>
      <motion.div
        animate={{
          backgroundColor: "#FF0000",
          transition: {
            duration: 0.5,
            yoyo: Infinity
          }
        }}
      >
        Test Element
      </motion.div>
    </Profiler>
  );
}