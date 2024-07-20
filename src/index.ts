import { config } from "dotenv";
import express from "express";
import api from "./api";
import cors from "cors";

config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/api", api);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
