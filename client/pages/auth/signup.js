import { useState } from "react";
import Router from "next/router";

import { useRequest } from "../../hooks/use-request";

export default () => {
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");

  let { errors, doRequest } = useRequest({
    url: "/api/users/signup",
    method: "post",
    data: { email, password },
    onSuccess: () => Router.push("/"),
  });

  let onSubmit = async (event) => {
    event.preventDefault();

    doRequest();
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign up</h1>
      <div className="form-group">
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
          type="password"
        />
      </div>
      {errors}
      <button className="btn btn-primary mt-2">Signup</button>
    </form>
  );
};
