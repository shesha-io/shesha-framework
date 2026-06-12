# Properties Parameter Normalization - Testing Guide

## How It Works

When you enter the `properties` parameter in multi-line format, it's automatically normalized to a single line before being sent to the API.

### Example Transformation

**Your Input (Multi-line):**
```
firstName
lastName
address {
  addressLine1
  city
}
```

**Normalized to:**
```
firstName lastName address { addressLine1 city }
```

**Final URL:**
```
GET /api/dynamic/Shesha/Person/Crud/GetAll?properties=firstName%20lastName%20address%20%7B%20addressLine1%20city%20%7D
```

## Testing the Normalization

### Test Case 1: Simple Properties

**Input:**
```
firstName
lastName
email
```

**Expected Result:**
```
firstName lastName email
```

**URL:**
```
?properties=firstName%20lastName%20email
```

### Test Case 2: Nested Properties

**Input:**
```
firstName
address {
  city
  country
}
```

**Expected Result:**
```
firstName address { city country }
```

**URL:**
```
?properties=firstName%20address%20%7B%20city%20country%20%7D
```

### Test Case 3: Multiple Nested Objects

**Input:**
```
firstName
lastName
address {
  addressLine1
  city
}
organization {
  name
  code
}
```

**Expected Result:**
```
firstName lastName address { addressLine1 city } organization { name code }
```

**URL:**
```
?properties=firstName%20lastName%20address%20%7B%20addressLine1%20city%20%7D%20organization%20%7B%20name%20code%20%7D
```

### Test Case 4: Deep Nesting

**Input:**
```
firstName
address {
  city
  country {
    name
    code
  }
}
```

**Expected Result:**
```
firstName address { city country { name code } }
```

**URL:**
```
?properties=firstName%20address%20%7B%20city%20country%20%7B%20name%20code%20%7D%20%7D
```

### Test Case 5: Extra Whitespace (Should be cleaned up)

**Input:**
```
firstName


lastName

address   {
  city
}
```

**Expected Result:**
```
firstName lastName address { city }
```

**URL:**
```
?properties=firstName%20lastName%20address%20%7B%20city%20%7D
```

## How to Test in Shesha

### Step 1: Configure the API Call

1. Create a button with **Call API** action
2. Set **HTTP Verb:** `GET`
3. Set **URL:** `/api/dynamic/Shesha/Person/Crud/GetAll`
4. Click **Configure Request**

### Step 2: Add Properties Parameter

1. Go to **Params** tab
2. Click **Add Parameter**
3. Set **Key:** `properties`
4. Set **Value:** (use multi-line format)
   ```
   firstName
   lastName
   address {
     city
   }
   ```
5. Enable the parameter
6. Click **OK**

### Step 3: Verify the Request

1. Save and run the form
2. Open Browser DevTools (F12)
3. Go to **Network** tab
4. Click your button
5. Look for the request to `/api/dynamic/Shesha/Person/Crud/GetAll`
6. Check the query string

**Expected Query String:**
```
properties=firstName%20lastName%20address%20%7B%20city%20%7D
```

**URL Decoded:**
```
properties=firstName lastName address { city }
```

## Normalization Logic

The normalization process:

1. **Split by newlines** - Each line becomes separate
2. **Trim whitespace** - Remove leading/trailing spaces from each line
3. **Filter empty lines** - Remove any blank lines
4. **Join with spaces** - Combine all lines with single spaces

### Code Example

```javascript
// Input
const input = `firstName
lastName
address {
  city
}`;

// Normalization
const normalized = input
  .split('\n')           // ["firstName", "lastName", "address {", "  city", "}"]
  .map(line => line.trim())  // ["firstName", "lastName", "address {", "city", "}"]
  .filter(line => line)      // ["firstName", "lastName", "address {", "city", "}"]
  .join(' ');                // "firstName lastName address { city }"

// Result: "firstName lastName address { city }"
```

## Common Issues and Solutions

### Issue 1: Properties Not Sent
**Symptom:** The `properties` parameter doesn't appear in the URL

**Check:**
- Is the parameter key exactly `properties` (lowercase)?
- Is the parameter **Enabled** (toggle switched on)?
- Is the value not empty?

### Issue 2: Malformed Query
**Symptom:** Server returns error about invalid properties syntax

**Check:**
- Are braces balanced? Every `{` needs a `}`
- Are property names valid (no typos)?
- Do nested properties exist in your entity?

### Issue 3: URL Too Long
**Symptom:** 414 URI Too Long error

**Solution:**
- Reduce the number of properties
- Use fewer nested levels
- Or switch to POST if endpoint supports it

## Best Practices

1. **Use Line Breaks for Readability**
   ```
   ✅ Good (easy to read):
   firstName
   lastName
   address {
     city
   }

   ⚠️ Works but harder to read:
   firstName lastName address { city }
   ```

2. **Indent Nested Properties**
   ```
   ✅ Good:
   address {
     city
     country {
       name
     }
   }

   ⚠️ Works but harder to read:
   address { city country { name } }
   ```

3. **One Property Per Line**
   ```
   ✅ Good:
   firstName
   lastName
   email

   ❌ Avoid (mixing styles):
   firstName lastName
   email
   ```

## Testing Checklist

- [ ] Parameter key is `properties`
- [ ] Parameter is enabled
- [ ] Multi-line value is entered
- [ ] Request is GET (not POST)
- [ ] URL contains encoded properties parameter
- [ ] Response contains only requested fields
- [ ] Nested properties are included in response
- [ ] Braces are balanced in syntax

## Example: Complete Working Test

**Configuration:**
```
HTTP Verb: GET
URL: /api/dynamic/Shesha/Person/Crud/GetAll

Params:
  Key: properties
  Value:
    firstName
    lastName
    email
    address {
      city
      country
    }
  Enabled: ✓
```

**Expected Request:**
```
GET /api/dynamic/Shesha/Person/Crud/GetAll?properties=firstName%20lastName%20email%20address%20%7B%20city%20country%20%7D
```

**Expected Response:**
```json
{
  "result": {
    "items": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "address": {
          "city": "Johannesburg",
          "country": "South Africa"
        }
      }
    ]
  }
}
```

## Debugging Tips

### 1. Check the Normalized Value

Add a console log in your browser console:
```javascript
// In browser console before request
console.log('Properties param:', params.properties);
```

### 2. Check the Actual URL

In Network tab:
```
Request URL: https://yourapp.com/api/dynamic/Shesha/Person/Crud/GetAll?properties=...
```

Copy the URL and decode it using:
```javascript
decodeURIComponent('firstName%20lastName%20address%20%7B%20city%20%7D')
// Result: "firstName lastName address { city }"
```

### 3. Test in Swagger First

1. Go to `/swagger`
2. Find the GetAll endpoint
3. Enter the normalized (single-line) version directly
4. If it works in Swagger, it should work in Shesha

## Summary

The normalization ensures that:
- ✅ Multi-line format is user-friendly
- ✅ URL encoding is handled automatically
- ✅ Newlines don't break the query string
- ✅ Extra whitespace is cleaned up
- ✅ The parameter works exactly like Swagger

Now you can use readable multi-line format, and it will automatically be converted to the correct single-line format! 🎉
