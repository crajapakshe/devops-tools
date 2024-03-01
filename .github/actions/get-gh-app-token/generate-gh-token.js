import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import core from "@actions/core";

export const generateInstallationAccessToken = async (jwt, installationId) => {
  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  };

  const result = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ organization_self_hosted_runners: "write" }),
    }
  )
    .then((res) => res.json())
    .then((res) => res.token);

  return result;
};

// Create a JWT for this application to authenticate
export const generateJwt = (appId, privatePemKey) => {
  const payload = {
    // issued at time :: milliseconds => seconds - 10 seconds (for drift)
    iat: Math.floor(Date.now() / 1000) - 10,
    // expiry :: milliseconds => seconds + 10 minutes (max)
    exp: Math.floor(Date.now() / 1000) + 10 * 60 - 10,
    // github app's identifier
    iss: appId,
  };

  const signingOptions = {
    algorithm: "RS256",
  };

  const actualJwt = jwt.sign(payload, privatePemKey, signingOptions);
  return actualJwt;
};

const main = async () => {
  const { GH_APP_WRITE_ID, GH_APP_WRITE_PEM, GH_APP_INSTALLATION_ID } = process.env;

  if (!GH_APP_INSTALLATION_ID || !GH_APP_WRITE_ID || !GH_APP_WRITE_PEM)
    throw new Error("One of the ENV VARs is missing. Please check your inputs");

  const pem = Buffer.from(GH_APP_WRITE_PEM, "base64").toString("utf-8");

  const token = generateJwt(GH_APP_WRITE_ID, pem);
  core.setOutput("jwt", token);

  const accessToken = await generateInstallationAccessToken(token, GH_APP_INSTALLATION_ID);
  core.setOutput("app_token", accessToken);
};

main();
