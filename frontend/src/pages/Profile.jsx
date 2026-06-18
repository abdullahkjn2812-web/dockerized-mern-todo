import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const GetProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          navigate("/");
          return;
        }

        console.log("TOKEN", token);

        const response = await fetch("http://localhost:5000/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Could not load profile");
          return;
        }

        setData(data);
        console.log("Profile Data:", data);
      } catch (err) {
        setError("Could not load profile");
        console.error("Error fetching profile:", err);
      }
    };

    GetProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleGoToTodo = () => {
    navigate("/todo");
  };

  const profile = data?.user || data;

  return (
    <div className="profile-container">
      <h2>Profile Page</h2>
      {error && <p className="error">{error}</p>}
      {data ? (
        <div className="profile-details">
          <p>Name: {profile?.name || "Not found"}</p>
          <p>Email: {profile?.email || "Not found"}</p>
        </div>
      ) : (
        !error && <p>Loading profile data...</p>
      )}
      <button onClick={handleGoToTodo}>Go to Todo</button>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}
export default Profile;
