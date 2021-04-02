import { useEffect, useState, useRef, Profiler } from "react";
import { Box, Button, Container, HStack, Input } from "@chakra-ui/react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import FileEntry from "./FileEntry";
import { join } from "path";
import { useAnimation, motion } from "framer-motion";
import SearchBox from "./SearchBox";

// using globals instead of useRef because there is only one Explorer component
let path = null, scrolled = false, rendered = true;

const MotionSearchBox = motion(SearchBox);

export default function Explorer() {
  
  const [files, setFiles] = useState([]);
  
  const searchBox = useRef(null);
  const fileList = useRef(null);

  function openFile(file) {
    if (file.isFolder) {
      openFolder(join(path, file.name));
    } else {
      main.send("open", join(path, file.name));
    }
  }
  
  async function goBack() {
    openFolder(join(path, "../"));
  }

  async function openFolder(folderPath) {
    const resolvedPath = await server.invoke("resolvePath", folderPath);
    if (resolvedPath && path !== resolvedPath) {
      path = resolvedPath;
      const newFiles = await server.invoke("getFolder", { 
        path: folderPath,
        sort: "modified"
      });
      console.log("new");
      // need to deal with errors from above
      rendered = false;
      setFiles(newFiles);
      if (searchBox.current) searchBox.current.value = path;
      if (scrolled) {
        fileList.current?.scrollTo(0);
      }
    } else {
      console.log("Invalid path");
    }
  }

  
  useEffect(() => {
    server.on("updateFolderSizes", updatedFolders => {
      setFiles(previousFiles => {
        const filesCopy = previousFiles.slice();
        for (const { name, size } of updatedFolders) {
          const index = filesCopy.findIndex(file => file.name === name);
          filesCopy[index] = {
            ...filesCopy[index],
            size
          }
        }
        return filesCopy;
      });
    });

    openFolder("C://");

  }, []);

  useEffect(() => {
    if (!rendered) {
      rendered = true;
      setTimeout(() => server.emit("getFolderSizes"), 0);
    }
  }, [files]);

  return (
    <Profiler id="a" onRender={(id, b, actualDuration) => /* console.log(id, Date.now(), actualDuration)*/ null}>
      <Container maxW="container.xl" minH="90vh">
        <HStack py={4} verticalAlign="middle">
          <Button onClick={goBack} colorScheme="blue" boxShadow="lg" m={2}>Back</Button>
          <MotionSearchBox openFolder={openFolder} />
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
              itemKey={index => path + files[index].name}
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
    </Profiler>
  );
}