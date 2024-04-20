import React, { useState } from "react";

const LoginUserButton = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleChange = (event) => {
    if (event.target.name === "username") {
      setUsername(event.target.value);
    } else if (event.target.name === "password") {
      setPassword(event.target.value);
    }
  };

  const loginUser = async () => {
    try {
      const userData = {
        username,
        password,
      };

      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.removeItem("selectedUserUsername")
        localStorage.setItem("loggedInUserToken", data.token);
        localStorage.setItem("loggedInUserUserId", data.userId);
        localStorage.setItem("loggedInUserUsername", data.username);
        console.log("Login successful.");
        window.location.replace("/");
      } else {
        console.error("Failed to login.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="flex flex-col w-[95%] h-[75vh] mx-auto justify-center items-center">
      <div className="flex flex-col justify-center px-10 py-7 rounded-md bg-[#1e1e1e]">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={handleChange}
          className="px-2 py-1 rounded-md bg-[#323232]"
        />
        <br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handleChange}
          className="px-2 py-1 rounded-md bg-[#323232]"
        />
        <br />
        <button onClick={loginUser} className="mb-2 bg-[#323232] border-0">
          Login
        </button>
        <div>
          I don't have an account{" "}
          <a href="/register" className="border-b-2 border-[#323232]">
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginUserButton;
