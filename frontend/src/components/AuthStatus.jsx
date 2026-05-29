import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function AuthStatus() {
  const user = {
    name: sessionStorage.getItem("Name"),
    email: sessionStorage.getItem("Email"),
    token: sessionStorage.getItem("User"),
  };

  const navigate = useNavigate();

  function logout() {
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <div className="auth-status">
      {user.token ? (
        <div className="auth-status__user">
          <div>Welcome, {user.name}</div>

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
