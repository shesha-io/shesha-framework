# Debug API Call Configuration

## Issue: Properties parameter not appearing in URL

### Quick Debug Steps

#### Step 1: Check Browser Console

Before clicking your button, open the console (F12) and run:

```javascript
// This will show what's being sent
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🔍 API Call Debug:', {
    url: args[0],
    options: args[1]
  });
  return originalFetch.apply(this, args);
};
```

Then click your button and check the console output.

#### Step 2: Verify requestConfig Structure

The requestConfig should look like this:

```javascript
{
  params: [
    {
      key: "properties",
      value: "firstName\naddress { id }",
      description: "",
      enabled: true
    }
  ],
  headers: [],
  body: {
    type: "none",
    content: ""
  }
}
```

#### Step 3: Check Action Arguments

Add a temporary console.log in your action's On Success handler:

```javascript
console.log('Action arguments:', arguments);
```

### Common Issues

#### Issue 1: requestConfig is undefined

**Symptoms:**
- URL ends with `?` but no parameters
- finalParams is empty

**Cause:**
- The modal configuration wasn't saved
- Or the form wasn't saved after configuration

**Solution:**
1. Open Configure Request modal
2. Verify parameters are there
3. Click **OK** (not Cancel!)
4. **Save the form** (Ctrl+S or click Save button)
5. Refresh the page
6. Try again

#### Issue 2: Parameter not enabled

**Symptoms:**
- Parameter exists but not sent

**Cause:**
- The "Enabled" toggle is OFF

**Solution:**
- Check the toggle switch is ON (blue/green)
- It should show ✓ or be in the "on" position

#### Issue 3: Empty parameter value

**Symptoms:**
- Parameter key exists but value is empty string

**Cause:**
- Value field was left empty
- Or whitespace-only value

**Solution:**
- Make sure you entered actual property names
- Check for typos

### Temporary Debug Code

Add this to the API call executer to see what's happening:

In `api-call.ts`, add console logs:

```javascript
console.log('🔍 Debug Info:', {
  hasRequestConfig: !!requestConfig,
  requestConfig: requestConfig,
  enabledParams: requestConfig?.params?.filter(p => p.enabled),
  finalParams: finalParams,
  verb: verb,
  encodeAsQueryString: ['get', 'delete'].includes(verb?.toLowerCase()),
});
```

### Expected vs Actual

#### Expected Configuration:

**Action Arguments:**
```json
{
  "url": "/api/dynamic/Shesha/Person/Crud/GetAll",
  "verb": "GET",
  "sendStandardHeaders": true,
  "requestConfig": {
    "params": [
      {
        "key": "properties",
        "value": "firstName\naddress { id }",
        "enabled": true
      }
    ],
    "headers": [],
    "body": { "type": "none", "content": "" }
  }
}
```

#### Expected Processing:

1. `requestConfig` exists ✓
2. `enabledParams` = `[{ key: "properties", value: "firstName\naddress { id }", enabled: true }]`
3. Normalization runs: `"firstName\naddress { id }"` → `"firstName address { id }"`
4. `finalParams` = `{ properties: "firstName address { id }" }`
5. `verb` = `"GET"` → `encodeAsQueryString` = true
6. URL = `/api/dynamic/Shesha/Person/Crud/GetAll?properties=firstName%20address%20%7B%20id%20%7D`

#### Actual Result (from your fetch):

```
URL: https://...GetAll?
```

**This means one of these is happening:**
- ❌ `requestConfig` is undefined/null
- ❌ `requestConfig.params` is empty array
- ❌ Parameters are not enabled
- ❌ `finalParams` is empty object `{}`

### Verification Checklist

Go through each step:

- [ ] 1. Open form in designer
- [ ] 2. Select your button
- [ ] 3. Action type is "Call API" (not "Execute Script")
- [ ] 4. HTTP Verb is "GET"
- [ ] 5. URL is set correctly
- [ ] 6. Click "Configure Request" button (should exist)
- [ ] 7. Modal opens with tabs: Params, Headers, Body
- [ ] 8. Go to Params tab
- [ ] 9. See your parameter with key="properties"
- [ ] 10. Toggle is ON (blue/green, enabled state)
- [ ] 11. Value has content (not empty)
- [ ] 12. Click "OK" to close modal
- [ ] 13. See button shows summary like "1 param"
- [ ] 14. **SAVE THE FORM** (this is critical!)
- [ ] 15. Refresh the browser
- [ ] 16. Click button to test

### Alternative: Check Form JSON

1. In form designer, open developer tools
2. Go to Application/Local Storage
3. Find the form configuration
4. Look for your button configuration
5. Check the action configuration JSON

It should contain:
```json
{
  "actionName": "API Call",
  "actionArguments": {
    "requestConfig": {
      "params": [...]
    }
  }
}
```

If `requestConfig` is missing or `params` is empty, the configuration wasn't saved properly.

### Quick Fix Test

Try this simpler test first:

1. Add a simple parameter without properties:
   - Key: `test`
   - Value: `123`
   - Enabled: ✓

2. Save and test

3. Check if you see: `/api/...GetAll?test=123`

If this works, then the basic parameter system is working.
If this doesn't work, the issue is with how requestConfig is being saved/loaded.

### Report Back

Please check and let me know:

1. Does the "Configure Request" button exist on your form?
2. When you click it, does the modal open?
3. Can you add parameters in the Params tab?
4. Does the button show a summary after clicking OK (e.g., "1 param, 0 headers")?
5. Are you saving the form after configuring?
6. What do you see in the console after adding the debug code?
