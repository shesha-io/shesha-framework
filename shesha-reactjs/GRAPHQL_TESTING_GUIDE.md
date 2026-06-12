# GraphQL Testing Guide

This guide shows you how to test the new GraphQL support in the API Call Action configuration.

## Option 1: Use a Public GraphQL API (Quickest)

### 1. SpaceX GraphQL API

**Endpoint:** `https://spacex-production.up.railway.app/`

**Test Query 1: Get Latest Launch**
```graphql
query {
  launchLatest {
    mission_name
    launch_date_local
    launch_success
    rocket {
      rocket_name
      rocket_type
    }
  }
}
```

**Test Query 2: Get Specific Launch with Variables**
```graphql
query GetLaunch($id: ID!) {
  launch(id: $id) {
    mission_name
    launch_year
    launch_success
  }
}
```

**Variables:**
```json
{
  "id": "109"
}
```

### 2. Countries GraphQL API

**Endpoint:** `https://countries.trevorblades.com/`

**Test Query 1: Get Countries**
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

**Test Query 2: Get Specific Country with Variables**
```graphql
query GetCountry($code: ID!) {
  country(code: $code) {
    name
    native
    capital
    emoji
    currency
    languages {
      code
      name
    }
  }
}
```

**Variables:**
```json
{
  "code": "ZA"
}
```

### 3. Rick and Morty GraphQL API

**Endpoint:** `https://rickandmortyapi.com/graphql`

**Test Query:**
```graphql
query {
  characters(page: 1) {
    results {
      id
      name
      status
      species
      type
      gender
    }
  }
}
```

## Option 2: Set Up Local GraphQL Server

### Quick Setup with json-graphql-server

1. **Install the package:**
```bash
npm install -g json-graphql-server
```

2. **Create a test data file (db.js):**
```javascript
module.exports = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
  ],
  posts: [
    { id: 1, title: 'Hello World', content: 'This is my first post', userId: 1 },
    { id: 2, title: 'GraphQL is awesome', content: 'Learning GraphQL', userId: 2 }
  ]
}
```

3. **Start the server:**
```bash
json-graphql-server db.js
```

4. **Test endpoint:** `http://localhost:3000/graphql`

**Example Queries:**

Get all users:
```graphql
query {
  allUsers {
    id
    name
    email
    age
  }
}
```

Get specific user:
```graphql
query GetUser($id: Int!) {
  User(id: $id) {
    id
    name
    email
  }
}
```

Variables:
```json
{
  "id": 1
}
```

## Option 3: Use GraphQL Playground/Apollo Studio

You can also test queries first in a GraphQL client before using them in Shesha:

1. **GraphQL Playground:** https://www.graphqlbin.com/
2. **Apollo Studio:** https://studio.apollographql.com/sandbox/explorer

## How to Test in Shesha

### Step 1: Open Form Designer

1. Open any form in the Shesha form designer
2. Add a button or configure an existing action

### Step 2: Configure API Call Action

1. Select **"Call API"** as the action type
2. Set **HTTP Verb:** `POST`
3. Set **URL:** One of the endpoints above (e.g., `https://countries.trevorblades.com/`)
4. Click **"Configure Request"** button

### Step 3: Configure GraphQL Request

1. In the modal, go to the **Body** tab
2. Select **"GraphQL"** as the body type
3. Switch to the **Query** tab and paste your GraphQL query
4. (Optional) Switch to **Variables** tab and add variables as JSON
5. (Optional) Switch to **Operation Name** tab and add operation name
6. Click **OK** to save

### Step 4: Test Headers (Optional)

Some GraphQL APIs might require authentication:

1. Go to the **Headers** tab
2. Add headers like:
   - Key: `Authorization`, Value: `Bearer YOUR_TOKEN`
   - Key: `X-API-Key`, Value: `YOUR_API_KEY`
3. Toggle **Enabled** on

### Step 5: Execute and View Response

1. Save the form
2. Run the form
3. Click the button to execute the API call
4. Check the browser console or use the response in your form

## Example: Complete Test Setup

Here's a complete example you can test immediately:

**Endpoint:** `https://countries.trevorblades.com/`

**Configuration:**
- **HTTP Verb:** `POST`
- **URL:** `https://countries.trevorblades.com/`
- **Body Type:** `GraphQL`

**Query Tab:**
```graphql
query GetCountry($code: ID!) {
  country(code: $code) {
    name
    native
    capital
    emoji
    currency
    languages {
      code
      name
    }
  }
}
```

**Variables Tab:**
```json
{
  "code": "US"
}
```

**Operation Name Tab:**
```
GetCountry
```

**Expected Response:**
```json
{
  "data": {
    "country": {
      "name": "United States",
      "native": "United States",
      "capital": "Washington D.C.",
      "emoji": "🇺🇸",
      "currency": "USD",
      "languages": [
        {
          "code": "en",
          "name": "English"
        }
      ]
    }
  }
}
```

## Testing Mutations

If your GraphQL API supports mutations, you can test those too:

**Example Mutation:**
```graphql
mutation CreateUser($name: String!, $email: String!) {
  createUser(name: $name, email: $email) {
    id
    name
    email
  }
}
```

**Variables:**
```json
{
  "name": "Test User",
  "email": "test@example.com"
}
```

## Debugging Tips

### 1. Check Browser Console
Open DevTools (F12) and check:
- Network tab for the actual request/response
- Console tab for any errors

### 2. Verify Request Format
The request should look like:
```http
POST /graphql HTTP/1.1
Content-Type: application/json

{
  "query": "query { ... }",
  "variables": { ... },
  "operationName": "..."
}
```

### 3. Common Issues

**Issue:** "Must provide query string"
- **Solution:** Make sure you've entered a query in the Query tab

**Issue:** "Variable not defined"
- **Solution:** Check that variable names in Variables tab match those in the query (e.g., `$code`)

**Issue:** "Syntax error"
- **Solution:** Validate your GraphQL syntax in a GraphQL playground first

**Issue:** CORS error
- **Solution:** Use a public API that allows CORS, or configure your server to allow CORS

## Testing with Postman (Alternative)

You can also test the same queries in Postman first:

1. Create a new POST request
2. URL: `https://countries.trevorblades.com/`
3. Body → GraphQL
4. Paste your query and variables
5. Send

This helps verify the API works before configuring it in Shesha.

## Need Help?

If you encounter issues:
1. Test the API in Postman or GraphQL Playground first
2. Check the browser console for errors
3. Verify the endpoint supports POST requests
4. Check if authentication/headers are required
