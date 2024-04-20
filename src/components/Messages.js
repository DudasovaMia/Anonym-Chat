import React, { useState, useEffect } from "react";
import axios from "axios";

const MessageList = () => {
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const loggedId = localStorage.getItem("loggedInUserUsername");
        const selectedId = localStorage.getItem("selectedUserUsername") || "chatter";
        const response = await axios.get("http://localhost:4000/messages", {
          params: {
            loggedId: loggedId,
            selectedId: selectedId,
          },
        });
        setAllMessages((prevMessages) => {
          const newMessages = response.data.messages.filter(
            (message) => !prevMessages.some((m) => m._id === message._id)
          );
          return [...prevMessages, ...newMessages];
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="flex flex-col w-[95%] min-h-[83%] max-h-[83%] py-2 bg-[#323232] rounded-md mx-auto my-5 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col w-[95%] justify-center mx-auto">
        {allMessages
          .sort(function (a, b) {
            return new Date(a.timestamp) - new Date(b.timestamp);
          })
          .map((message) => (
            <div
              className="flex justify-between px-4 py-2 bg-[#1e1e1e] my-2 rounded-md"
              key={message._id}
            >
              <div className="w-fit">
                <div className="text-sm">
                  {message.from ==
                  localStorage.getItem("loggedInUserUsername") ? (
                    <>
                      {new Date(message.timestamp)
                        .toLocaleString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                        .replace(",", "")}
                      {"  "}
                      From: me{" "}
                    </>
                  ) : (
                    <>
                      {new Date(message.timestamp)
                        .toLocaleString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                        .replace(",", "")}
                      {"  "}From: your help
                    </>
                  )}
                </div>
                {message.text && <strong>{message.text}</strong>}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MessageList;
