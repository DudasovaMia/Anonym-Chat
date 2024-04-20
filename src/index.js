import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ChatRoom from "./components/ChatRoom";
import Navbar from "./components/Navbar";

const root = createRoot(document.getElementById("root"));

function App() {

  return (
    <React.StrictMode>
      <Router>
        <div className={`App`}>
          <div className="content  h-[100vh] max-w-[100%] overflow-hidden">
            <Navbar />
            <Routes>
              <Route path="/" element={<ChatRoom />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </div>
      </Router>
    </React.StrictMode>
  );
}

root.render(<App />);

reportWebVitals();
