import { describe, test, expect } from 'vitest';
import { z as zodV3 } from 'zod/v3';
import { z as zodV4 } from 'zod/v4';
import { z as zodV4mini } from 'zod/v4-mini';
import { isZodV4Schema } from '../lib/utils';

describe("utils test", () => {
  test('should correct detect zod v3 schema', async () => {
    const schema = zodV3.object({});
    expect(isZodV4Schema(schema)).toBe(false);
  });

  test('should correct detect zod v4 schema', async () => {
    const schema = zodV4.object({});
    expect(isZodV4Schema(schema)).toBe(true);
  });

  test('should correct detect zod v4-mini schema', async () => {
    const schema = zodV4mini.object({});
    expect(isZodV4Schema(schema)).toBe(true);
  });
})