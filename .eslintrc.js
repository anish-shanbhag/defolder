module.exports = {
  extends: "react-app",
  globals: {
    electron: true
  },
  rules: {
    quotes: ["warn", "double", {
      avoidEscape: true,
      allowTemplateLiterals: true
    }]
  }
}