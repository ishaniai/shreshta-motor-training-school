import { describe, it, expect } from 'vitest';

describe('Health Check', () => {
  it('should be able to run tests', () => {
    expect(true).toBe(true);
  });

  it('should have Node.js environment', () => {
    expect(process.version).toBeDefined();
  });

  it('should have basic math operations', () => {
    expect(1 + 1).toBe(2);
  });
});
