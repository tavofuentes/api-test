import express from "express";
const app = express();
const env = process.env.ENVIRONMENT || "DEV";

const loggerMiddlerware = (req, res, next) => {
  const date = new Date().toDateString();
  req.dateTime = date;
  console.log(`${date}: Request URL: ${req.url}`);
  next();
};

app.use(loggerMiddlerware);

app.get("/", (req, res) => {
  res.send("Success. 🌮");
});

app.get("/more", (req, res) => {
  res.send("More success! 🌮🌮🌮🥤🍦");
});

app.get("/somepath/:index", (req, res) => {
  res.send("Some path success!🌮 test");
});

app.listen(3000, () =>
  console.log(`api-test is listening on port 3000. (env: ${env})`)
);
