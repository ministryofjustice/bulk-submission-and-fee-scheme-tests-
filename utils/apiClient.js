const { request } = require('@playwright/test');
const { baseURL, authToken } = require('../config/env');

async function getContext() {
  return await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });
}

module.exports = { getContext };
