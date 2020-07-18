"use strict";

const AWS = require("aws-sdk");
const sqs = new AWS.SQS({ region: "ap-southeast-2" });

const { authorize } = require("./auth-manager");
const logger = require("./utils/logger");
const prism = require("./prismportal-manager");
const middy = require("middy");
const { cors } = require("middy/middlewares");
const { getEnv } = require("./utils/env");

const getProducts = async event => {
  logger.log(">> handler.getProducts has been called");

  try {
    const authToken = await authorize();
    const availableProducts = await prism.getAvailableProducts(authToken);

    // TODO: Consider filtering response to return limited json object
    // as full API response is not needed and may reveal some sensitive information.

    return {
      statusCode: 200,
      // headers: {
      //   "Access-Control-Allow-Origin": "*",
      //   "Access-Control-Allow-Credentials": true
      // },
      body: JSON.stringify(availableProducts)
    };
  } catch (error) {
    logger.error(error);
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};

const makeOrder = async event => {
  logger.log(">> handler.makeOrder has been called");

  const products = JSON.parse(event.body);
  const order = products.map(p => ({
    productId: p.id,
    qty: p.qty
  }));

  try {
    const authToken = await authorize();
    await Promise.all([
      prism.makeOrder(authToken, order),
      requestEmail(products)
    ]);

    return {
      statusCode: 204
    };
  } catch (error) {
    logger.error(error);
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};

const requestEmail = async products => {
  logger.log(">> handler.testEmail has been called");

  const params = {
    MessageBody: JSON.stringify(products),
    QueueUrl: getEnv("EMAIL_QUEUE_URL")
  };

  try {
    return await sqs.sendMessage(params).promise();
  } catch (error) {
    logger.error(error);
    throw new Error("Could not send the message");
  }
};

const getProductsHandler = middy(getProducts).use(cors());
const makeOrderHandler = middy(makeOrder).use(cors());

module.exports = { getProductsHandler, makeOrderHandler, requestEmail };
