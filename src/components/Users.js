import React, { useState, useEffect } from "react";

const UserSelect = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userStatuses, setUserStatuses] = useState({});

  useEffect(() => {
    if (!localStorage.getItem("loggedInUserUsername")) {
      window.location.replace("/login");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:4000/users");
      if (response.ok) {
        const data = await response.json();
        const filteredUsers = data.users.filter(
          (user) => user._id !== localStorage.getItem("userId")
        );
        setUsers(filteredUsers);
        await fetchAndSetUserStatuses(filteredUsers);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAndSetUserStatuses = async (users) => {
    try {
      const statusPromises = users.map(async (user) => {
        const response = await fetch(
          `http://localhost:4000/status/${user.username}`
        );
        const data = await response.json();
        return { [user.username]: data.status };
      });
      const statuses = await Promise.all(statusPromises);
      const mergedStatuses = Object.assign({}, ...statuses);
      setUserStatuses(mergedStatuses);
    } catch (error) {
      console.error("Error fetching user statuses:", error);
    }
  };

  const handleChange = (username) => {
    if (localStorage.getItem("selectedUserUsername") === username) {
      localStorage.removeItem("selectedUserUsername");
      window.location.reload();
      return;
    }
    setSelectedUser(username);
    localStorage.setItem("selectedUserUsername", username);
    window.location.reload();
  };

  const getUserTextColor = (username) => {
    const status = userStatuses[username];
    return status === "done" ? "text-gray-500" : "text-blue-500";
  };

  return (
    <div className="w-[100%] flex flex-col px-2 py-1 max-h-[75vh]">
      <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-hidden">
        {users.map((user, index) => (
          <div key={user._id}>
            {" "}
            {user.username !== localStorage.getItem("loggedInUserUsername") && (
              <div
                className={`flex w-[100%] bg-[#1e1e1e] rounded-md mx-1 my-2 px-4 py-2 justify-between ${getUserTextColor(
                  user.username
                )}`}
                onClick={() => handleChange(user.username)}
              >
                <div>User {index}</div>
                {user.username ===
                localStorage.getItem("selectedUserUsername") ? (
                  <div>{"<"}</div>
                ) : (
                  <div>{">"}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSelect;
