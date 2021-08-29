import React from "react";
import ReactDOM from "react-dom";
import App from "./App"; 
import { withDeferRender } from 'react-defer-renderer'

import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById("root")
);