import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Add any other auth-related items you're storing
    
    // Redirect to login page
    navigate("/");
  };

  return (
    <button 
      onClick={handleLogout} 
      className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded`}
    >
      Logout
    </button>
  );
};

export default LogoutButton;