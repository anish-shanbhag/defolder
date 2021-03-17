//let {byFileName, byExtension, svgMapping} = require("./src/icon-mappings.json");
//byExtension = Object.keys(byExtension).filter(a => a[0] === ".").reduce( (res, key) => (res[key.substring(1)] = byExtension[key], res), {} )

/*
const svgMapping = [];
const byFileName = {};
const byExtension = {};

for (const a of icons.byFileName) {
  const name = Object.keys(a)[0].slice(0, Object.keys(a)[0].indexOf("."))
  if (svgMapping.includes(name)) {
    for (const c of Object.values(a)[0]) {
      byFileName[c] = svgMapping.indexOf(name);
    }
  } else {
    svgMapping.push(name);
    for (const c of Object.values(a)[0]) {
      byFileName[c] = svgMapping.length - 1;
    }
  }
}

for (const a of icons.byExtension) {
  const name = Object.keys(a)[0].slice(0, Object.keys(a)[0].indexOf("."))
  if (svgMapping.includes(name)) {
    for (const c of Object.values(a)[0]) {
      if (!c.substring(1).includes(".") && c.includes(".")) {
        byExtension[c.substring(1)] = svgMapping.indexOf(name);
      } else if (c.toLowerCase() === "dockerfile") {
        if (svgMapping.includes(name)) {
          byFileName[c] = svgMapping.indexOf(name);
        } else {
          svgMapping.push(name);
          byFileName[c] = svgMapping.length - 1;
        }
      }
    }
  } else if (Object.values(a)[0].some(x => !x.substring(1).includes(".") && x.includes("."))) {
    svgMapping.push(name);
    for (const c of Object.values(a)[0]) {
      if (!c.substring(1).includes(".") && c.includes(".")) {
        byExtension[c.substring(1)] = svgMapping.length - 1;
      } else if (c.toLowerCase() === "dockerfile") {
        if (svgMapping.includes(name)) {
          byFileName[c] = svgMapping.indexOf(name);
        } else {
          svgMapping.push(name);
          byFileName[c] = svgMapping.length - 1;
        }
      }
    }
  }
}

console.log(byFileName);
console.log(byExtension);
console.log(svgMapping);

require("fs").writeFileSync('icon-mappings.json', JSON.stringify({
  byFileName,
  byExtension,
  svgMapping
}), () => null);

/*
const byFileName = {};

for (const a of icons.byFileName) {
  if (byFileName[Object.keys(a)[0]]) {
    byFileName[Object.keys(a)[0]] = byFileName[Object.keys(a)[0]].concat(Object.values(a)[0])
  } else {
    byFileName[Object.keys(a)[0]] = Object.values(a)[0]
  }
}

console.log(icons.byExtension)
icons.byExtension = Object.assign(...icons.byExtension)

for (const a in icons.byExtension) {
  icons.byExtension[a.slice(0, a.indexOf("."))] = icons.byExtension[a]
  delete icons.byExtension[a]
}

const byExtension = {};


console.log(icons.byExtension);

//console.log(Object.entries(out).filter(([k, v]) => v.some(a => a[0] === ".")));
/*
const fileMap = [];
const iconMap = [];
let i = 0;
for (const [icon, files] of Object.entries(out)) {
  console.log(icon, files);
  for (const file of files) {
    fileMap[file] = i;
  }
  iconMap[i] = icon;
  i++;
}
console.log(fileMap, iconMap);

*/

//fs.writeFile('icon-mappings.json', icons);