import { Router } from "express";
import cryptoJs from "crypto-js";

const router = Router();

const users = [
  {
    email: "fs@gmail.com",
    password:
      "6a33d35bd52e7259ab3dcf138feb957b34f906dba129729b73c5b38c357a37e1", // Fs@123
  },
];

router.get("/", (req, res) => {
  res.status(200).send("OK").end();
});

router.post("/", (req, res) => {
  if (
    (req.body.email === null ||
      req.body.email === undefined ||
      req.body.email.trim() === "") &&
    (req.body.password === null ||
      req.body.password === undefined ||
      req.body.password.trim() === "")
  ) {
    res.statusMessage = "Username and password cannot be empty.";
    res.status(400).end();
  } else if (
    req.body.email === null ||
    req.body.email === undefined ||
    req.body.email.trim() === ""
  ) {
    res.statusMessage = "Username cannot be empty.";
    res.status(400).end();
  } else if (
    req.body.password === null ||
    req.body.password === undefined ||
    req.body.password.trim() === ""
  ) {
    res.statusMessage = "Password cannot be empty.";
    res.status(400).end();
  } else {
    let passwordHash = cryptoJs
      .SHA256(req.body.password.trim(), "utf8")
      .toString();
    let count = 0;
    users.map((item, index) => {
      if (item.email === req.body.email && item.password === passwordHash) {
        count = 1;
        return res
          .status(200)
          .json({
            token: cryptoJs
              .SHA256(
                [
                  req.body.email.trim(),
                  req.body.password.trim(),
                  `${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()}`,
                ],
                "utf8"
              )
              .toString(),
          })
          .end();
      }
      if (index + 1 === users.length && count === 0) {
        res.statusMessage = "Please check username and password.";
        return res.status(400).end();
      }
    });
  }
});

export default router;
