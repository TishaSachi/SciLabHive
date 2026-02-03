import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Experiments() {
  const [experiments, setExperiments] = useState([]);

  useEffect(() => {
    api.get("/experiments")
      .then((res) => setExperiments(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>My Experiments</h1>
      <ul>
        {experiments.map((exp) => (
          <li key={exp.experiment_id}>
            <strong>{exp.title}</strong> — {exp.experiment_type}
          </li>
        ))}
      </ul>
    </div>
  );
}
