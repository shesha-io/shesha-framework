# Phone Number Input Component

A configurable phone number input component that allows users to select their country and automatically format phone numbers according to the selected country's format.

## Features

- **Country Selection**: Dropdown with country flags and dial codes
- **Auto-formatting**: Automatically formats phone numbers based on the selected country
- **Validation**: Validates input based on the selected country's phone number format
- **Configurable Dial Codes**: Optionally restrict which countries are available for selection
- **Flexible Value Format**: Return either the full number as a string or an object with detailed information

## Configuration Options

### Value Format

Choose how the phone number value should be returned:

1. **Full Number (default)**: Returns a string like `"+27123456789"`
2. **Object**: Returns an object with:
   - `number`: The full phone number (e.g., `"+27123456789"`)
   - `dialCode`: The country dial code (e.g., `"+27"`)
   - `countryCode`: The ISO country code (e.g., `"za"`)

### Allowed Dial Codes

You can restrict which countries are available for selection by providing a list of dial codes:

- Leave empty to allow all countries (default behavior)
- Add dial codes like `+27`, `+1`, `+44` to restrict to specific countries
- Multiple countries can share the same dial code (e.g., `+1` for USA and Canada)

## Usage Example

### In a Form

Add the component to your form using the form designer. Configure the following properties:

- **Property Name**: The field name to bind to your data model
- **Value Format**: Choose between "Full Number" or "Object"
- **Allowed Dial Codes**: Optional list of allowed dial codes
- **Placeholder**: Placeholder text for the input

### Accessing the Value

#### Full Number Format (default)
```javascript
// Value will be a string
const phoneNumber = formData.phoneNumber; // "+27123456789"
```

#### Object Format
```javascript
// Value will be an object
const phoneData = formData.phoneNumber;
// {
//   number: "+27123456789",
//   dialCode: "+27",
//   countryCode: "za"
// }
```

## Validation

The component automatically validates phone numbers based on the selected country's format. You can also add custom validation rules in the Validation tab of the component settings.

## Common Use Cases

### 1. South African Numbers Only
Set Allowed Dial Codes to: `+27`

### 2. USA and Canada Only
Set Allowed Dial Codes to: `+1`

### 3. International Numbers
Leave Allowed Dial Codes empty to allow all countries

### 4. Store Detailed Phone Information
Set Value Format to "Object" to capture the dial code and country code along with the phone number

## Technical Details

- Uses `antd-phone-input` library for the phone input functionality
- Integrates with the Shesha form designer
- Supports all standard form component features (validation, events, styling, etc.)
- Compatible with read-only mode

## Dependencies

- `antd-phone-input`: ^0.3.14
- React: ^18.3.0
- Ant Design: ^5.25.4
