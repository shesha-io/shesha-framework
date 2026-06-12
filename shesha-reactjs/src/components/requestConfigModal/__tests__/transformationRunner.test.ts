import { executeResponseTransformation, validateTransformationScript } from '../transformationRunner';

describe('validateTransformationScript', () => {
  it('rejects an empty script', () => {
    expect(validateTransformationScript('')).toMatch(/cannot be empty/i);
    expect(validateTransformationScript('   ')).toMatch(/cannot be empty/i);
  });

  it('rejects a script with no return', () => {
    expect(validateTransformationScript('const x = response.a;')).toMatch(/must return/i);
  });

  it('accepts a valid script', () => {
    expect(validateTransformationScript('return response;')).toBeNull();
  });
});

describe('executeResponseTransformation', () => {
  it('transforms the response and returns the new shape', async () => {
    const script = 'return { fullName: response.firstName + " " + response.lastName, email: response.email };';
    const result = await executeResponseTransformation(script, {
      response: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      },
    });

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ fullName: 'Ada Lovelace', email: 'ada@example.com' });
  });

  it('exposes the other context constants to the script', async () => {
    const result = await executeResponseTransformation('return { ok: globalState.flag, count: response.count };', {
      response: { count: 7 },
      globalState: { flag: true },
    });
    expect(result.success).toBe(true);
    expect(result.output).toEqual({ ok: true, count: 7 });
  });

  it('supports awaiting inside the script', async () => {
    const result = await executeResponseTransformation('const v = await Promise.resolve(response.count * 2); return v;', {
      response: { count: 21 },
    });
    expect(result.success).toBe(true);
    expect(result.output).toBe(42);
  });

  it('fails validation when the script is empty', async () => {
    const result = await executeResponseTransformation('', { response: { a: 1 } });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/cannot be empty/i);
  });

  it('fails when the script does not return a value', async () => {
    const result = await executeResponseTransformation('const x = 1;', { response: { a: 1 } });
    expect(result.success).toBe(false);
    // caught at static validation (no `return` keyword)
    expect(result.error).toMatch(/must return/i);
  });

  it('reports a failure instead of throwing on a runtime error', async () => {
    // Accessing a property of undefined throws; the runner catches it and reports it as a failure.
    const result = await executeResponseTransformation('return response.a.b.c;', { response: {} });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('reports a failure instead of throwing on a syntax error', async () => {
    const result = await executeResponseTransformation('return {;', { response: {} });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('handles a transformation that returns a primitive', async () => {
    const result = await executeResponseTransformation('return response.count * 2;', { response: { count: 21 } });
    expect(result.success).toBe(true);
    expect(result.output).toBe(42);
  });
});
