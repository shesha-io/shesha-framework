# Quick GraphQL Test - 5 Minute Setup

## Fastest Way to Test (No Setup Required)

### Test Case 1: Simple Query (No Variables)

1. **Open Shesha Form Designer**
2. **Add a Button component**
3. **Configure Button Action:**
   - Action: `Call API`
   - HTTP Verb: `POST`
   - URL: `https://countries.trevorblades.com/`
   - Click **"Configure Request"**

4. **In the Modal:**
   - Go to **Body** tab
   - Select **GraphQL**
   - Go to **Query** tab
   - Paste this:
   ```graphql
   query {
     countries {
       code
       name
       capital
       emoji
     }
   }
   ```
   - Click **OK**

5. **Test:**
   - Save form
   - Click the button
   - Open browser console (F12)
   - You should see a list of countries!

### Test Case 2: Query with Variables

1. **Use the same button or create a new one**
2. **HTTP Verb:** `POST`
3. **URL:** `https://countries.trevorblades.com/`
4. **Click "Configure Request"**

5. **In the Modal:**
   - **Body** tab → Select **GraphQL**
   - **Query** tab → Paste:
   ```graphql
   query GetCountry($code: ID!) {
     country(code: $code) {
       name
       capital
       currency
       emoji
     }
   }
   ```
   - **Variables** tab → Paste:
   ```json
   {
     "code": "ZA"
   }
   ```
   - **Operation Name** tab → Type: `GetCountry`
   - Click **OK**

6. **Test:**
   - Save form
   - Click the button
   - You should see South Africa's information!

### Test Case 3: SpaceX API (More Complex)

**URL:** `https://spacex-production.up.railway.app/`

**Query:**
```graphql
query {
  launchLatest {
    mission_name
    launch_date_local
    launch_success
    rocket {
      rocket_name
    }
    links {
      article_link
      video_link
    }
  }
}
```

## Viewing the Response

### Option 1: Browser Console
```javascript
// Open DevTools (F12)
// Go to Console tab
// You'll see the response logged
```

### Option 2: Use Response in Form

Configure your button's **On Success** action to:
```javascript
// Show alert with response
message.success('Country: ' + data.country.name);

// Or update form data
setFormData({ countryData: data });
```

### Option 3: Network Tab
```
1. Open DevTools (F12)
2. Go to Network tab
3. Click your button
4. Look for the POST request to your GraphQL endpoint
5. Click on it to see Request/Response
```

## Expected Request Format

When you click your button, Shesha will send:

```http
POST https://countries.trevorblades.com/
Content-Type: application/json

{
  "query": "query GetCountry($code: ID!) { country(code: $code) { name capital } }",
  "variables": {
    "code": "ZA"
  },
  "operationName": "GetCountry"
}
```

## Common Test Scenarios

### Test Authentication Headers

If your GraphQL API requires auth:

1. In **Configure Request** modal
2. Go to **Headers** tab
3. Add:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN`
   - Enabled: ✓

### Test with URL Parameters

Some GraphQL endpoints use query params:

1. Go to **Params** tab
2. Add:
   - Key: `apiKey`
   - Value: `your-api-key`
   - Enabled: ✓

This will send request to: `https://api.example.com/graphql?apiKey=your-api-key`

## Troubleshooting

### ❌ "Failed to fetch" or CORS error
**Solution:** The public API might be down. Try a different one from the list.

### ❌ "Must provide query string"
**Solution:** Make sure you entered the query in the **Query** tab, not Variables.

### ❌ "Variable $code of type ID! was not provided"
**Solution:**
- Check you added variables in the **Variables** tab
- Verify JSON is valid (use quotes around keys)
- Make sure variable names match (case-sensitive)

### ❌ No response in console
**Solution:**
- Check Network tab in DevTools
- Look for the request and check its response
- Verify HTTP verb is set to **POST**

## Pro Tip: Test in Postman First

Before configuring in Shesha:

1. Open Postman
2. Create POST request to GraphQL endpoint
3. Select Body → GraphQL
4. Test your query there
5. Once working, copy to Shesha

## Next Steps

Once basic tests work:
1. Try with your own GraphQL backend
2. Add authentication headers
3. Use response data in your forms
4. Chain multiple API calls together

## Real-World Example: Display Country Info

Complete working example:

**Form Setup:**
1. Add a **Dropdown** component
   - Property: `countryCode`
   - Options: US, ZA, GB, FR, JP

2. Add a **Button** labeled "Get Country Info"
   - Action: Call API
   - URL: `https://countries.trevorblades.com/`
   - Configure Request → GraphQL Query:
   ```graphql
   query GetCountry($code: ID!) {
     country(code: $code) {
       name
       capital
       currency
       emoji
     }
   }
   ```
   - Variables:
   ```json
   {
     "code": "{{data.countryCode}}"
   }
   ```

3. Add **On Success** script:
```javascript
message.success(`${data.country.emoji} ${data.country.name} - Capital: ${data.country.capital}`);
```

Now users can select a country and see its information!
