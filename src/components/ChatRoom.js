import ChatComponent from "./Chat";
import UserSelect from "./Users";
import MessageList from "./Messages";
import { useEffect, useState } from "react";
import UserCheck from "./UserCheck";

function MessageRoom() {
  const [mediaOpened, setMediaOpened] = useState(false);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeUsersCount, setActiveUsersCount] = useState(0); // State to store the count of active users

  useEffect(() => {
    if (!localStorage.getItem("loggedInUserUsername")) {
      window.location.replace("/login");
    }
  });

  useEffect(() => {
    async function fetchUserType() {
      try {
        const response = await fetch(
          `http://localhost:4000/userType/${localStorage.getItem(
            "loggedInUserUsername"
          )}`
        );
        const data = await response.json();
        setUserType(data.userType);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user type:", error);
        setLoading(false);
      }
    }

    fetchUserType();
  }, []);

  useEffect(() => {
    async function fetchActiveUsersCount() {
      try {
        const response = await fetch("http://localhost:4000/users");
        const data = await response.json();
        const activeUsers = data.users.filter(
          (user) => user.status === "active"
        );
        setActiveUsersCount(activeUsers.length);
      } catch (error) {
        console.error("Error fetching active users count:", error);
      }
    }

    fetchActiveUsersCount();
  }, []);

  return (
    <div className="flex justify-center items-center h-[92vh]">
      {userType === "chatter" && (
        <div className="flex w-full h-full">
          {localStorage.getItem("selectedUserUsername") ? (
            <>
              <div className="w-[25%]">
                <UserSelect />
                <UserCheck />
              </div>
              <div className="flex flex-col w-[75%] px-2 py-1 bg-[#1e1e1e] mx-4 my-3 rounded-lg">
                <div className="w-[100%] h-[100%]">
                  <MessageList />
                  <ChatComponent />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col w-[25%] mx-auto justify-center my-auto items-center text-center">
              <div>
                Welcome back! Get to the work. {activeUsersCount} users are
                waiting for you.
              </div>
              <UserSelect />
            </div>
          )}
        </div>
      )}
      {userType === "user" && (
        <>
          <div className="flex flex-col w-[65%] h-[95%] my-auto rounded-lg px-2 py-1 bg-[#1e1e1e] mr-2">
            <div className="w-[100%] h-[100%]">
              <MessageList />
              <ChatComponent />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MessageRoom;
