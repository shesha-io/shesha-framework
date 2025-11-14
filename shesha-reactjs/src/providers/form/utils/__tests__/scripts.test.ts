import { executeScript } from '../scripts';

describe('executeScript', () => {
  it('should resolve with the result when expression and args are provided', async () => {
    const expression = 'return 42';
    const args = { name: 'John', age: 30 };
    const result = await executeScript<string, { name: string; age: number }>(expression, args);
    expect(result).toBe(42);
  });

  it('should reject with an error when expression is empty', async () => {
    const expression = '';
    const args = { name: 'John', age: 30 };
    await expect(executeScript<string, { name: string; age: number }>(expression, args)).rejects.toThrow('Expression must be defined');
  });

  it('should reject with an error when expression is not a function', async () => {
    const expression = '42';
    const args = { name: 'John', age: 30 };

    const result = await executeScript<string, { name: string; age: number }>(expression, args);
    expect(result).toBe(undefined);
  });

  it('should resolve with the correct result when expression has multiple arguments', async () => {
    const expression = 'return name + age';
    const args = { name: 'John', age: 30 };
    const result = await executeScript<string, { name: string; age: number }>(expression, args);
    expect(result).toBe('John30');
  });
});