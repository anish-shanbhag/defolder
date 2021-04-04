import { useEffect, useState, useRef, Profiler } from "react";
import { Box, Button, Container, HStack, Input } from "@chakra-ui/react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import FileEntry from "./FileEntry";
import { join } from "path";
import SearchBox from "./SearchBox";

// using globals instead of useRef because there is only one Explorer component
let scrolled = false, loading = false;

export default function Explorer() {


  const [search, setSearch] = useState({ path: "", filter: "" });
  const [files, setFiles] = useState([]);

  const fileList = useRef(null);

  function openFile(file) {
    if (file.isFolder) {
      changeSearch(join(search.path, file.name, "/"));
    } else {
      main.send("open", join(search.path, file.name));
    }
  }

  async function goBack() {
    changeSearch(join(search.path, "../"));
  }

  async function changeSearch(value) {
    const newSearch = await server.invoke("changeSearch", value);
    if (search.path !== newSearch.path) {
      loading = true;
      setSearch({
        path: newSearch.path,
        filter: newSearch.filter
      });
      const newFiles = await server.invoke("getFolder", {
        sort: "modified"
      });
      loading = false;
      setFiles(newFiles);
      if (scrolled) {
        fileList.current?.scrollTo(0);
      }
      server.emit("getFolderSizes");
    } else {
      setSearch({
        path: newSearch.path,
        filter: newSearch.filter
      });
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

    // openFolder("C:/");

  }, []);

  const filteredFiles = loading ? [] : files.filter(file => file.name.includes(search.filter));

  return (
    <Profiler id="a" onRender={(id, b, actualDuration) => /* console.log(id, Date.now(), actualDuration)*/ null}>
      <Container maxW="container.xl" minH="90vh">
        <HStack py={4} verticalAlign="middle">
          <Button onClick={goBack} colorScheme="blue" boxShadow="lg" m={2}>Back</Button>
          <SearchBox
            onChange={changeSearch}
            // onEnter={openFolder}
            search={search}
            files={filteredFiles}
          />
        </HStack>

        <AutoSizer>
          {({ height, width }) => !filteredFiles.length ? null :
            <List
              itemCount={filteredFiles.length}
              itemSize={45}
              height={height - 100}
              width={width}
              overscanCount={5}
              itemData={{ files: filteredFiles, onClick: openFile }}
              itemKey={index => search.path + filteredFiles[index].name}
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