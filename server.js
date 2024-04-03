const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Success. 🌮");
});

app.get("/more", (req, res) => {
  res.send("More success! 🌮🌮🌮");
});

app.listen(3000, () => console.log("Example app is listening on port 3000."));
