## Project-Specific Guidelines
 
 
 
 
### Refactoring the Forms Designer: Addressing Issues in `InputComponent`
 
 
 
**Context:** During the recent refactoring of the forms designer in the debugger, several issues were identified causing side effects, unnecessary updates, and re-renders. The root cause is the current implementation of the InputComponent.
 
 
 
#### 1. Strengthening TypeScript Conventions
 
 
 
We must leverage TypeScript to its full potential. Using it merely as a fancy linter negates its primary benefits.
 
 
 
##### 1.1 Eliminate the `any` Type
 
 
 
The use of `any` is now **restricted**. If the type of a constant, argument, or property is unknown, use the `unknown` type instead. This forces explicit type checking and is much safer.
 
 
 
##### 1.2 Prefer Type Guards Over Type Casting
 
 
 
For type checking, use type guards instead of direct type casting. This is the correct, type-safe approach and is possible in most scenarios.
 
 
 
##### 1.3 Avoid Monolithic Types; Use Discriminated Unions
 
 
 
Creating a single, flattened type that contains all possible properties is a bad practice. It leads to confusing and error-prone code. Instead, use subtypes with a discriminator property (e.g., `type` or `itemType`).
 
 
 
**Example: Using Discriminated Unions and Type Guards**
 
 
 
```typescript
 
 
// Define specific subtypes
 
 
type TextInputProps = {
 
 
  type: 'text';
 
 
  value: string;
 
 
  maxLength: number;
 
 
};
 
 
 
type NumberInputProps = {
 
 
  type: 'number';
 
 
  value: number;
 
 
  min: number;
 
 
  max: number;
 
 
};
 
 
 
// Create a union type
 
 
type InputProps = TextInputProps | NumberInputProps;
 
 
 
// Use a type guard to check the type
 
 
function isTextInput(props: InputProps): props is TextInputProps {
 
 
  return props.type === 'text';
 
 
}
 
 
 
// Component logic can now safely handle each type
 
 
function MyComponent(props: InputProps) {
 
 
  if (isTextInput(props)) {
 
 
    // TypeScript knows `props` is TextInputProps here
 
 
    console.log(props.maxLength);
 
 
  } else {
 
 
    // TypeScript knows `props` is NumberInputProps here
 
 
    console.log(props.min);
 
 
  }
 
 
}
 
 
```
 
 
 
#### 2. Correct Handling of Default Values
 
 
 
Default values must be part of the model initialization logic, **not** the editor component.
 
 
 
A controlled editor should follow this base structure:
 
 
 
```typescript
 
 
type EditorProps<TValue> = {
 
 
  value: TValue;
 
 
  onChange: (newValue: TValue) => void;
 
 
}
 
 
```
 
 
 
This can be extended with additional props like `readOnly`, but the core contract of `value` and `onChange` must remain consistent.
 
 
 
#### 3. Current Problems with InputComponent
 
 
 
The current InputComponent is implemented as a monolithic component that renders all possible editors. Its props are a flattened set of properties from every supported editor.
 
 
 
**This has led to:**
 
 
- Different internal editors using different combinations of `value` and `defaultValue`
 
 
- Some editors incorrectly using the `useEffect` hook to reset values to a default
 
 
- Confirmed source of existing bugs and high risk for future ones
 
 
 
#### 4. Important Note
 
 
 
**The `defaultValue` pattern is being removed entirely from controlled editors.**
 
 
 
When reviewing code:
 
 
- **Flag any use of `any` type** - should use `unknown` instead
 
 
- **Flag type casting without type guards** - prefer type guards
 
 
- **Flag monolithic types** - should use discriminated unions
 
 
- **Flag `defaultValue` in controlled editor components** - defaults should be in model initialization
 
 
- **Flag incorrect `value`/`onChange` patterns** - controlled components must follow the standard contract
 
 
- **Flag `useEffect` used for value resets** - this causes unnecessary re-renders
 
 
 
Do not accept or suggest reintroducing the `defaultValue` pattern in controlled editor components.
 
 
 
---
 
