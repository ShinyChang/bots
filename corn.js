require('dotenv').config();
const https = require('https');

const baseUrl = process.env.AUDIT_URL;

const urls = [
  'https://www.honestbee.tw/',
  'https://www.honestbee.tw/zh-TW/groceries',
  'https://www.honestbee.tw/zh-TW/groceries/stores/american-wholesaler',
  'https://www.honestbee.tw/zh-TW/groceries/stores/american-wholesaler/products/2186868',
  'https://deliveroo.com.sg/',
  'https://deliveroo.com.sg/restaurants/singapore/tiong-bahru?postcode=159919',
  'https://deliveroo.com.sg/menu/singapore/orchard/5-star-hainanese-chicken-rice-river-valley-road?day=today&postcode=159919&time=ASAP'
];

urls.map(url => https.get(`${baseUrl}?url=${url}`));
