const { z } = require('zod');

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
});

module.exports = { userSchema };
