module.exports = {
  extends: "react-app",
  globals: {
    server: true,
    main: true
  },
  rules: {
    quotes: ["warn", "double", {
      avoidEscape: true,
      allowTemplateLiterals: true
    }]
  }
}