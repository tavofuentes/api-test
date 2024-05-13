import jwt from "jsonwebtoken";

export function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    // "decoded" is the decoded jwt payload
    console.log({ err, decoded });

    if (err) return res.sendStatus(403);

    req.payload = decoded;

    next();
  });
}
