import { useState } from "react";
import axios from "axios";

export let useRequest = ({ url, method, data, onSuccess }) => {
  let [errors, setErrors] = useState(null);

  let doRequest = async (props = {}) => {
    try {
      setErrors(null);
      let response = await axios[method](url, { ...data, ...props });

      onSuccess(response.data);
    } catch (err) {
      let errors = err.response.data.errors;

      setErrors(
        <div className="alert alert-danger">
          <h4>Oops</h4>
          <ul className="my-0">
            {errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};
