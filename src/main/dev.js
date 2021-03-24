// activates React DevTools for development (not included in production bundle)

const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS
} = require("electron-devtools-installer");

installExtension(REACT_DEVELOPER_TOOLS);