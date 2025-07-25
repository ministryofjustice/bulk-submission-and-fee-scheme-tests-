const { getContext } = require('./apiClient');
const { z } = require('zod');

async function generateSchema(endpoint) {
  const context = await getContext();
  const response = await context.get(endpoint);
  const data = await response.json();

  const inferred = inferZodSchema(data);
  console.log('Generated Zod Schema:\n\n', inferred);
}

function inferZodSchema(data, indent = '  ') {
  if (Array.isArray(data)) {
    if (data.length === 0) return 'z.array(z.any())';
    return `z.array(${inferZodSchema(data[0], indent + '  ')})`;
  }

  if (typeof data === 'object' && data !== null) {
    let entries = Object.entries(data).map(([key, value]) => {
      const valType = inferZodSchema(value, indent + '  ');
      return `${indent}${key}: ${valType}`;
    });
    return `z.object({\n${entries.join(',\n')}\n${indent.slice(2)}})`;
  }

  if (typeof data === 'string') return 'z.string()';
  if (typeof data === 'number') return 'z.number()';
  if (typeof data === 'boolean') return 'z.boolean()';
  return 'z.any()';
}

if (require.main === module) {
  generateSchema('/users/1');
}
