import React, { useEffect, useState, useRef } from "react";
import { Button, Container, HStack, Input, Table, Td } from "@chakra-ui/react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import FileEntry from "./FileEntry";

export default function Explorer() {
  
  const [path, setPath] = useState("C:/");
  const [files, setFiles] = useState([]);

  const searchBox = useRef(null);
  const fileList = useRef(null);

  function openFile(file) {
    if (file.isFolder) {
      setPath(file.path);
    } else {
      electron.ipcRenderer.send("open", file.path);
    }
  }
  
  async function goBack() {
    const trimmedPath = path.endsWith("/") ? path.slice(0, -1) : path;
    setPath(path.substring(0, trimmedPath.lastIndexOf("/") + 1));
  }

  useEffect(() => {    
    (async () => {
      const newFiles = await electron.ipcRenderer.invoke("getFolder", path, {
        // foldersFirst: true,
        sort: "modified"
      });
      setFiles(newFiles);

      searchBox.current.value = path;
      fileList.current?.scrollTo(0);
    })();
  }, [path]);

  useEffect(() => {
    electron.ipcRenderer.on("updateFiles", (event, files) => {
      setFiles(files);
    });
    electron.ipcRenderer.on("log", (event, msg) => {
      console.log(msg);
    });
  }, []);

  return (
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
          onKeyDown={e => e.key === "Enter" && openFile({ path: e.target.value, isFolder: true})}
        />
      </HStack>
      <AutoSizer>
        {({ height, width }) => files &&
          <List
            height={height - 100}
            itemCount={files.length}
            itemSize={40}
            width={width}
            overscanCount={5}
            itemData={{files, onClick: openFile}}
            ref={fileList}
          >
            {FileEntry}
          </List>
        }
      </AutoSizer>
    </Container>
  );
}