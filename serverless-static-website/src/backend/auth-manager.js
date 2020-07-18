"use strict";

const qs = require("qs");
const axios = require("axios");
const logger = require("./utils/logger");
const { getEnv } = require("./utils/env");

const authorize = async () => {
  logger.log(">> auth-manager.authorize has been called");

  const requestOptions = {
    method: "POST",
    url: "https://identity.prismportal.online/core/connect/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "cache-control": "no-cache"
    },
    data: qs.stringify({
      grant_type: "client_credentials",
      client_id: getEnv("CLIENT_ID"),
      client_secret: getEnv("CLIENT_SECRET"),
      scope: "rhipeapi"
    })
  };

  const response = await axios.request(requestOptions);
  return response.data;
};

module.exports = {
  authorize
};
