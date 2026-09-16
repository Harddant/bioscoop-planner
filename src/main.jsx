import { StrictMode as _biosStrictMode } from "react";
import { createRoot as _biosCreateRoot } from "react-dom/client";
import "./index.css";
import _biosApp from "./App.jsx";

_biosCreateRoot(document.getElementById("root")).render(
    <_biosStrictMode>
        <_biosApp />
    </_biosStrictMode>
);