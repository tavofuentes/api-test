import crypto from "crypto";

export function getLatLongHash(latitude, longitude) {
  return crypto
    .createHash("md5")
    .update(`${latitude}${longitude}`)
    .digest("hex");
}
