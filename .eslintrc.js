module.exports = {
  extends: "react-app",
  globals: {
    ipc: true,
    main: true
  },
  rules: {
    quotes: ["warn", "double", {
      avoidEscape: true,
      allowTemplateLiterals: true
    }]
  }
}