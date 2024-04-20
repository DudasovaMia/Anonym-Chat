import React, { useState, useEffect } from "react";

const UserCheck = () => {
  const handleSetUserToDone = async () => {
    const selectedUserUsername = localStorage.getItem("selectedUserUsername");
    try {
      const response = await fetch(
        `http://localhost:4000/user/status/${selectedUserUsername}`,
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
    window.location.reload()
  };

  return (
    <div className="w-[100%] flex flex-col px-2 py-1 max-h-[75vh]">
      <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-hidden">
        <div
          onClick={handleSetUserToDone}
          className="flex w-[100%] bg-[#1e1e1e] rounded-md mx-1 my-2 px-4 py-2 justify-between"
        >
          Set this user to done.
        </div>
      </div>
    </div>
  );
};

export default UserCheck;
