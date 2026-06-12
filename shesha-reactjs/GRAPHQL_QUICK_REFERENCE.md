# GraphQL Quick Reference - Shesha API Call Configuration

## Two GraphQL Approaches in Shesha

### 1️⃣ Shesha Properties Parameter (GraphQL-like)

**Use Case:** Fetching data from Shesha CRUD endpoints with field selection

**Configuration:**
- **HTTP Verb:** `GET`
- **URL:** `/api/dynamic/Shesha/{Entity}/Crud/GetAll`
- **Location:** Params tab
- **Parameter Key:** `properties`

**Syntax:**
```
firstName lastName address { addressLine1 city }
```

**Example:**
```
Key: properties
Value:
  firstName
  lastName
  email
  address {
    addressLine1
    city
    postalCode
  }
```

**Result URL:**
```
GET /api/dynamic/Shesha/Person/Crud/GetAll?properties=firstName%20lastName%20email%20address%20%7B%20addressLine1%20city%20postalCode%20%7D
```

---

### 2️⃣ Standard GraphQL Body

**Use Case:** Calling external GraphQL APIs or Shesha GraphQL endpoints

**Configuration:**
- **HTTP Verb:** `POST`
- **URL:** `https://api.example.com/graphql` or `/api/graphql`
- **Location:** Body tab → GraphQL type

**Syntax:**
```graphql
query {
  persons {
    firstName
    lastName
    address {
      addressLine1
      city
    }
  }
}
```

**Tabs:**
- **Query Tab:** Your GraphQL query/mutation
- **Variables Tab:** JSON variables (optional)
- **Operation Name Tab:** Operation name (optional)

**Result Request:**
```http
POST /graphql
Content-Type: application/json

{
  "query": "query { persons { firstName lastName } }",
  "variables": {},
  "operationName": null
}
```

---

## Quick Comparison

| Feature | Shesha Properties | Standard GraphQL |
|---------|------------------|------------------|
| **HTTP Verb** | GET | POST |
| **Configuration** | Params tab | Body tab |
| **Syntax** | GraphQL-like | Full GraphQL |
| **Pagination** | ✅ Built-in | ❌ Manual |
| **Filtering** | ✅ Built-in | ❌ Manual |
| **Sorting** | ✅ Built-in | ❌ Manual |
| **Variables** | ❌ Not supported | ✅ Supported |
| **Mutations** | ❌ N/A | ✅ Supported |
| **External APIs** | ❌ No | ✅ Yes |
| **Shesha CRUD** | ✅ Yes | ⚠️ Limited |

---

## Example 1: Fetch Persons with Addresses

### Using Shesha Properties
```
GET /api/dynamic/Shesha/Person/Crud/GetAll

Params:
  properties = firstName lastName address { city }
  maxResultCount = 20
  skipCount = 0
```

### Using Standard GraphQL
```
POST /api/graphql

Body (GraphQL):
  query {
    persons(first: 20, skip: 0) {
      firstName
      lastName
      address {
        city
      }
    }
  }
```

---

## Example 2: Fetch Single Entity

### Using Shesha Properties
```
GET /api/dynamic/Shesha/Person/Crud/Get?id={personId}

Params:
  properties = firstName lastName email address { addressLine1 city country { name } }
```

### Using Standard GraphQL
```
POST /api/graphql

Body (GraphQL):
  Query:
    query GetPerson($id: ID!) {
      person(id: $id) {
        firstName
        lastName
        email
        address {
          addressLine1
          city
          country {
            name
          }
        }
      }
    }

  Variables:
    {
      "id": "{{data.personId}}"
    }
```

---

## Example 3: Fetch with Dynamic Properties

### Using Shesha Properties
```
Params:
  properties = {{data.fieldsToFetch}}
```

Where `data.fieldsToFetch` could be:
```javascript
// Set in form
setFormData({
  fieldsToFetch: 'firstName lastName email'
});
```

### Using Standard GraphQL
```
Query:
  {{data.graphqlQuery}}

Variables:
  {{data.graphqlVariables}}
```

---

## Example 4: External API (Countries)

### ❌ Cannot use Shesha Properties
(Only works with Shesha CRUD endpoints)

### ✅ Use Standard GraphQL
```
POST https://countries.trevorblades.com/

Body (GraphQL):
  Query:
    query GetCountry($code: ID!) {
      country(code: $code) {
        name
        capital
        emoji
      }
    }

  Variables:
    {
      "code": "ZA"
    }
```

---

## When to Use Each

### Use Shesha Properties When:
✅ Fetching from Shesha CRUD endpoints
✅ Need pagination/filtering/sorting
✅ Want simple GET requests
✅ Working with Shesha entities

### Use Standard GraphQL When:
✅ Calling external GraphQL APIs
✅ Need mutations or subscriptions
✅ Require complex queries
✅ Using variables and operation names

---

## Testing Tips

### Test Shesha Properties:
1. Open Swagger: `/swagger`
2. Find CRUD endpoint: `/api/dynamic/Shesha/{entity}/Crud/GetAll`
3. Try the `properties` parameter
4. Copy working syntax to Configure Request

### Test Standard GraphQL:
1. Use the `test-graphql.html` file
2. Or use Postman with GraphQL body type
3. Verify query works
4. Copy to Configure Request → Body → GraphQL

---

## Common Patterns

### Pattern 1: List View
```
properties = id firstName lastName email createdOn
```

### Pattern 2: Detail View
```
properties =
  id
  firstName
  lastName
  email
  mobileNumber
  address {
    addressLine1
    addressLine2
    city
    postalCode
    country { name }
  }
  organization {
    name
    code
  }
```

### Pattern 3: Dropdown Options
```
properties = id displayName
```

### Pattern 4: Reference Data
```
properties = id name code description
```

---

## Syntax Cheat Sheet

### Shesha Properties Syntax
```
// Simple properties
field1 field2 field3

// Nested object
field1 nestedObject { nestedField1 nestedField2 }

// Multiple nested objects
field1 obj1 { field } obj2 { field }

// Deep nesting
field obj1 { field obj2 { field obj3 { field } } }

// Multiple root and nested
firstName lastName address { city } org { name contact { email } }
```

### Standard GraphQL Syntax
```graphql
# Query
query {
  entities {
    field1
    field2
    nested {
      field
    }
  }
}

# Query with variables
query GetEntity($id: ID!) {
  entity(id: $id) {
    field1
  }
}

# Mutation
mutation CreateEntity($input: CreateInput!) {
  createEntity(input: $input) {
    id
    name
  }
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Properties not working | Use exact key: `properties` (lowercase) |
| Nested props null | Check entity relationships are configured |
| URL too long | Use fewer properties or switch to POST |
| GraphQL mutation not working | Use POST verb and Body → GraphQL |
| Variables not working | Only works with standard GraphQL body |
| CORS error in external API | API must allow CORS from your domain |

---

## Pro Tips

1. **Use the textarea:** When key is `properties`, the UI shows a multi-line editor
2. **Format for readability:** Use line breaks in properties value
3. **Test first:** Try in Swagger (Shesha) or HTML tester (GraphQL) first
4. **Dynamic values:** Use `{{expressions}}` in both approaches
5. **Combine params:** Shesha properties works with other query params
6. **Check docs:** See full guides:
   - `SHESHA_GRAPHQL_GUIDE.md` for Shesha properties
   - `GRAPHQL_TESTING_GUIDE.md` for standard GraphQL

---

## Summary

- **Shesha Properties** = GET + Query Params + GraphQL-like syntax
- **Standard GraphQL** = POST + JSON Body + Full GraphQL

Both are now supported in the Configure Request modal! 🎉
