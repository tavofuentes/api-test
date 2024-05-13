import express from "express";
import redis from "redis";

import { authenticateToken, generateAccessToken } from "./auth/auth.js";
import { getLocationWeather } from "./services/weatherService.js";
import { getLatLongHash } from "./utils/hash.js";

// Redis Client
let redisClient;

(async () => {
  redisClient = redis.createClient({ url: "redis://redis:6379" });

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

const app = express();
const env = process.env.ENVIRONMENT || "DEV";

// Middleware
const loggerMiddlerware = (req, res, next) => {
  const date = new Date().toDateString();
  req.dateTime = date;
  console.log(`${date}: Request URL: ${req.url}`);
  // console.log("Params:", req.params);
  // console.log("Query:", req.query);
  next();
};

app.use(express.json());
app.use(loggerMiddlerware);

// Routes
app.get(["/", "/ping"], (req, res) => {
  res.send("Pong! 🏓");
});

app.get("/more", async (req, res) => {
  res.send("More success! 🌮🌮🌮🥤🍦");
});

app.get("/somepath/:tacoCount", async (req, res) => {
  const tacoCount = parseInt(req.params.tacoCount) || null;

  if (tacoCount === null) {
    return res.send("You get NO tacos.");
  }

  return res.send(
    `You get ${tacoCount} taco${tacoCount > 1 ? "s" : ""}! ${[
      ...Array(parseInt(tacoCount)),
    ]
      .map((item) => "🌮")
      .join("")}`
  );
});

app.post("/api/create-token", (req, res) => {
  // Unsafe token creation for testing purposes, there is nothing being validated. In reality, this would be done after creating a user or validating login credentials
  if (!req.body?.username) {
    res.status(400);
    res.send("Invalid request");
  }

  const token = generateAccessToken({ username: req.body.username });
  res.json({ token });
});

app.post("/api/some-protected-path", authenticateToken, (req, res) => {
  const username = req.payload.username;

  console.log(`Token is valid! username: ${username}`);
  res.json({ foo: "secret payload", username });
});

app.post("/api/location-weather", authenticateToken, async (req, res) => {
  const latitude = Number(req.body.latitude).toFixed(2);
  const longitude = Number(req.body.longitude).toFixed(2);

  const cacheKey = getLatLongHash(latitude, longitude);

  try {
    const cachedLocationWeather = await redisClient.get(cacheKey);

    if (cachedLocationWeather) {
      return res.json({
        ...JSON.parse(cachedLocationWeather),
        fromCache: true,
      });
    }

    const locationWeather = await getLocationWeather(latitude, longitude);

    await redisClient.set(cacheKey, JSON.stringify(locationWeather));

    return res.json({ ...locationWeather, fromCache: false });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error, please try again.");
  }
});

app.listen(3000, () =>
  console.log(`api-test is listening on port 3000. (env: ${env})`)
);
