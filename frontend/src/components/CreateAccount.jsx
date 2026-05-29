import { createUser } from "../BLDDBapi";
import { verifyUser } from "../BLDDBapi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export function CreateAccount() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      let response = await createUser(user);
      if (response.data.message) {
        alert(response.data.message);
        return;
      }
      response = await verifyUser(user);
      if (response.data.success) {
        sessionStorage.setItem("User", response.data.token);
        sessionStorage.setItem("Name", response.data.name);
        sessionStorage.setItem("Email", response.data.email);
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.token}`;
        navigate("/home");
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder={"Name"}
        onChange={handleChange}
        name="name"
        required
        maxLength={20}
      />
      <input
        placeholder={"Email"}
        onChange={handleChange}
        name="email"
        required
        maxLength={40}
      />
      <input
        placeholder={"Password"}
        onChange={handleChange}
        name="password"
        type="password"
        required
        maxLength={20}
      />
      <button type="submit">Create Account</button>
    </form>
  );
}
