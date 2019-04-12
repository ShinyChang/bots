require("dotenv").config();
const https = require("https");

const baseUrl = process.env.AUDIT_URL;

const urls = ["https://www.honestbee.tw/"];

urls.map(url => https.get(`${baseUrl}?url=${url}`));
