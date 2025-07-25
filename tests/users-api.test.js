const { test, expect } = require('@playwright/test');
const { getContext } = require('../utils/apiClient');
const { userSchema } = require('../config/schema');

test.describe('Users API', () => {
  let context;

  test.beforeAll(async () => {
    context = await getContext();
  });

  test('GET /users should return valid users', async () => {
    const response = await context.get('/users');
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);

    const result = userSchema.safeParse(users[0]);
    expect(result.success).toBe(true);
  });
});
