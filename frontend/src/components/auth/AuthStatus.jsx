import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/userApi";

export function AuthStatus() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("User");

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error("Failed to load user", error);
        setUser(null);
      }
    }

    loadUser();
  }, [token]);

  function logout() {
    sessionStorage.clear();
    setUser(null);
    navigate("/");
  }

  return (
    <div className="auth-status">
      {token ? (
        <div className="auth-status__user">
          <div>{user ? `Welcome, ${user.name}` : "Loading..."}</div>

          <button className="inverse-button" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="auth-status__guest">
          <NavLink to="/" state={{ mode: "login" }}>
            Login
          </NavLink>

          <span> / </span>

          <NavLink to="/" state={{ mode: "signup" }}>
            Sign Up
          </NavLink>
        </div>
      )}
    </div>
  );
}
