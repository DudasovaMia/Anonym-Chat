import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("loggedInUserUsername")) {
      window.location.replace("/login");
    }
  });

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("messageHistory", (history) => {
      setMessages(history);
    });

    return () => {
      socket.off("message");
      socket.off("messageHistory");
    };
  }, [socket]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("loggedInUserUsername");
    setUsername(storedUsername);
  }, []);

  const sendMessage = async () => {
    const logged = localStorage.getItem("loggedInUserUsername");
    const selected = localStorage.getItem("selectedUserUsername") || "chatter";
    if (!inputMessage.trim() || !username) return;

    if (logged && selected && inputMessage) {
      const message = {
        logged: logged,
        selected: selected,
        text: inputMessage,
        timestamp: new Date(),
      };
      socket.emit("message", message);
      fetch("/updateStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username:
            localStorage.getItem("selectedUserUsername") ||
            localStorage.getItem("loggedInUserUsername"),
          status: "active",
        }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error updating user status:", error));
      setInputMessage("");
      await handleSetUserToActive()
      window.location.reload();
    }
  };

const handleSetUserToActive = async () => {
  const selectedUserUsername = localStorage.getItem("loggedInUserUsername");
  try {
    const response = await fetch(
      `http://localhost:4000/users/status/${selectedUserUsername}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    console.log("User status updated successfully.");
  } catch (error) {
    console.error("There was a problem with updating user status:", error);
  }
};

  return (
    <div className="flex flex-col">
      <div className="flex w-[95%] justify-between mx-auto my-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-[95%] bg-[#323232] rounded-md px-2"
        />
        <button
          onClick={sendMessage}
          className="ml-1 px-2 py-1 bg-[#323232] border-0"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
