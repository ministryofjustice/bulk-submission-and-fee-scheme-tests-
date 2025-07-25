const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { getContext } = require('../../../utils/apiClient');

When('I send a GET request to {string}', async function (endpoint) {
    const context = await getContext();
    this.response = await context.get(endpoint);
    this.data = await this.response.json();
});

Then('the response status should be {int}', function (status) {
    expect(this.response.status()).toBe(status);
});

Then('the response should be an array', function () {
    expect(Array.isArray(this.data)).toBe(true);
});
