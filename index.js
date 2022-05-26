import express, { json } from "express";
import cors from "cors";
import loginRouter from "./routes/login.js";
import databaseRouter from "./routes/database.js";

const expressInstance = express();
const port  = process.env.PORT || 5001;

expressInstance.use(cors({ origin: "*" }));
expressInstance.use(json());
expressInstance.use("/login", loginRouter);
expressInstance.use("/database", databaseRouter);

expressInstance.get("/", (req, res) => {
  res.status(200).send("server up and running");
});

expressInstance.listen(port, () => {
  console.log(`server upon port => ${port}`);
});
