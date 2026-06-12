/**
 * Execution of a user-authored response-transformation script.
 *
 * The script is a JavaScript function body that must `return` the transformed value. It runs as a
 * standard Shesha async script, so it has access to the same constants as every other code editor in
 * the designer — `globalState`, `pageContext`, `http`, `moment`, `form`, `data` (form data),
 * `selectedRow`, etc. — plus `response`, the raw API response being transformed. Because it is async,
 * scripts may `await` (e.g. a follow-up `http` call). The available constants are supplied by the
 * caller through the `context` argument (typically the object returned by `useAvailableConstantsData`,
 * with `response` layered in).
 */

// The AsyncFunction constructor isn't a global binding, so derive it from an async arrow.
const AsyncFunction = (async () => {
  // noop
}).constructor as FunctionConstructor;

export interface ITransformationResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

/**
 * Static validation of a transformation script, independent of any input.
 * Returns an error message, or null when the script passes validation.
 */
export const validateTransformationScript = (script: string): string | null => {
  if (!script || !script.trim()) {
    return 'Transformation script cannot be empty when transformation is enabled.';
  }
  if (!/\breturn\b/.test(script)) {
    return 'Transformation script must return a value.';
  }
  return null;
};

/**
 * Executes the transformation script against the given execution context.
 * Never throws — all failures are reported via the returned result so callers can never crash.
 */
export const executeResponseTransformation = async (script: string, context: object): Promise<ITransformationResult> => {
  const validationError = validateTransformationScript(script);
  if (validationError) {
    return { success: false, error: validationError };
  }

  let output: unknown;
  try {
    // Mirrors Shesha's standard async `executeScript`: the context exposes the available constants
    // (and `response`) via `with(context)`; references to anything not in the context fall through
    // to the real global scope (JSON, Math, etc.). Inlined rather than imported so this module stays
    // dependency-free and unit-testable (the test runner doesn't resolve the `@/` alias).
    // eslint-disable-next-line no-new-func
    const fn = new AsyncFunction('context', `with(context) {\n${script}\n}`);
    output = await fn(context);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }

  if (output === undefined) {
    return { success: false, error: 'Transformation script did not return a value.' };
  }

  return { success: true, output };
};
