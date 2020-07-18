"use strict";

const nodemailer = require("nodemailer");
const mustache = require("mustache");
const logger = require("./utils/logger");
const { getEnv } = require("./utils/env");

const sendEmail = async (event) => {
  logger.log(">> email.sendEmail has been called");

  console.log("EVENT", event);
  const products = event.Records.reduce((products, record) => {
    return products.concat(JSON.parse(record.body));
  }, []);

  const emailMessage = generateEmailMessage(products);
  console.log("emailMessage", emailMessage);

  const transporter = nodemailer.createTransport({
    host: "smtp.mandrillapp.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: "zipco",
      pass: getEnv("SMTP_PASSWORD"),
    },
  });

  const message = {
    from: "Danet Portal <portal@danet.com.au>",
    to: [
      "Robert Kulik <robert@danet.com.au>",
      "accounts@DataTransferItem.com.au",
    ],
    cc: ["Przemek Sech <przemek.sech@gmail.com>"],
    subject: "ZipMoney portal new order",
    text: JSON.stringify(products),
    html: emailMessage,
  };

  const smtpReady = await transporter
    .verify()
    .catch((error) => logger.error(error));

  if (smtpReady) {
    const response = await transporter
      .sendMail(message)
      .catch((error) => logger.error(error));

    console.log("response", response);
    return response;
  } else {
    throw new Error("Server not ready.");
  }
};

const generateEmailMessage = (products) => {
  logger.log(">> email.generateEmailMessage has been called");

  const template = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>ZipMoney portal new order</title>
        <style type="text/css">
          .tg {
            border-collapse: collapse;
            border-spacing: 0;
          }
          .tg td {
            font-family: Arial, sans-serif;
            font-size: 14px;
            padding: 10px 5px;
            border-style: solid;
            border-width: 1px;
            overflow: hidden;
            word-break: normal;
            border-color: black;
          }
          .tg th {
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: normal;
            padding: 10px 5px;
            border-style: solid;
            border-width: 1px;
            overflow: hidden;
            word-break: normal;
            border-color: black;
          }
          .tg .tg-llyw {
            background-color: #c0c0c0;
            border-color: inherit;
            text-align: left;
            vertical-align: top;
          }
          .tg .tg-0pky {
            border-color: inherit;
            text-align: left;
            vertical-align: top;
          }
        </style>
      </head>
      <body>
        <table class="tg">
          <tr>
            <th class="tg-llyw">Name</th>
            <th class="tg-llyw">ID</th>
            <th class="tg-llyw">Quantity</th>
            <th class="tg-llyw">Price</th>
          </tr>
          {{#.}}
          <tr>
            <td class="tg-0pky">{{name}}</td>
            <td class="tg-0pky">{{id}}</td>
            <td class="tg-0pky">{{qty}}</td>
            <td class="tg-0pky">{{price}}</td>
          </tr>
          {{/.}}
        </table>
      </body>
    </html>`;

  return mustache.render(template, products);
};

module.exports = { sendEmail };
