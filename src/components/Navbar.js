import { useState, useEffect } from "react";

const Navbar = () => {
  const [pfp, setPFP] = useState();
  const [loading, setLoading] = useState();

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await fetch("http://localhost:4000/profile");
        if (response.ok) {
          const data = await response.json();
          const loggedInUsername = localStorage.getItem("loggedInUserUsername");
          const profilePicture = data.profile.find(
            (user) => user.user === loggedInUsername
          );
          setPFP(profilePicture ? profilePicture.filename : null);
        } else {
          console.error("Failed to fetch profile pictures");
        }
      } catch (error) {
        console.error("Error fetching profile pictures:", error);
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };
    fetchProfilePicture();
  }, []);

  return (
    <div className="flex justify-between self-center px-10 py-4 items-center h-[8vh] bg-[#1e1e1e]">
      <h2 className="text-lg font-bold">MindHideout - 051 / 7731 000</h2>
      <div className="flex items-center">
        {localStorage.getItem("loggedInUserUsername") ? (
          <div className="flex justify-center items-center">
            <p
              className="w-fit h-fit border-[#323232]"
              onClick={() => {
                localStorage.removeItem("loggedInUserUsername");
                localStorage.removeItem("loggedInUserUserId");
                localStorage.removeItem("loggedInUserToken");
                localStorage.removeItem("selectedUserUsername");
                window.location.reload();
              }}
            >
              Logout
            </p>
          </div>
        ) : (
          <a href="/login" className="mx-5">
            Login
          </a>
        )}
      </div>
    </div>
  );
};

export default Navbar;
