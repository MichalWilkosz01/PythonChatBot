import React from "react";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage/HomePage.jsx";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <HomePage />
    </>
  );
}

export default App;