# Shesha GraphQL-like Properties Parameter Guide

Shesha has built-in support for GraphQL-like property selection in CRUD API endpoints. This allows you to fetch only the fields you need, including nested properties.

## How It Works

Shesha CRUD endpoints accept a `properties` query parameter with GraphQL-like syntax to specify which fields to fetch.

### Endpoint Pattern
```
GET /api/dynamic/Shesha/{EntityName}/Crud/GetAll?properties={property selection}
```

### Example
```
GET /api/dynamic/Shesha/Person/Crud/GetAll?properties=firstName%20lastName%20address%20%7B%20addressLine1%20city%20%7D
```

**Decoded:**
```
properties=firstName lastName address { addressLine1 city }
```

## Syntax

### Basic Properties
Select simple fields:
```
firstName lastName email
```

### Nested Properties
Use curly braces `{}` for nested objects:
```
address { addressLine1 city country }
```

### Multiple Nested Properties
```
firstName lastName address { addressLine1 city } organization { name code }
```

### Deep Nesting
```
person { name address { street city country { name code } } }
```

## Using in Shesha Configure Request

### Step 1: Configure the API Call

1. **HTTP Verb:** `GET`
2. **URL:** `/api/dynamic/Shesha/Person/Crud/GetAll`
3. Click **"Configure Request"**

### Step 2: Add Properties Parameter

1. Go to **Params** tab
2. Click **"Add Parameter"**
3. Set:
   - **Key:** `properties`
   - **Value:** (use multi-line textarea)
     ```
     firstName
     lastName
     email
     address {
       addressLine1
       city
       postalCode
     }
     ```
   - **Description:** `GraphQL-like property selection`
   - **Enabled:** ✓

### Step 3: Save and Test

The request will be sent as:
```
GET /api/dynamic/Shesha/Person/Crud/GetAll?properties=firstName%20lastName%20email%20address%20%7B%20addressLine1%20city%20postalCode%20%7D
```

## Common Examples

### Example 1: User List with Basic Info
```
GET /api/dynamic/Shesha/User/Crud/GetAll?properties=firstName lastName email mobileNumber
```

**Properties parameter:**
```
firstName lastName email mobileNumber
```

### Example 2: Person with Address
```
GET /api/dynamic/Shesha/Person/Crud/GetAll?properties=firstName lastName address { addressLine1 city postalCode }
```

**Properties parameter:**
```
firstName lastName address { addressLine1 city postalCode }
```

### Example 3: Organization with Multiple Nested Properties
```
GET /api/dynamic/Shesha/Organisation/Crud/GetAll?properties=name code primaryAddress { addressLine1 city } primaryContact { firstName lastName email }
```

**Properties parameter:**
```
name
code
primaryAddress {
  addressLine1
  city
  country
}
primaryContact {
  firstName
  lastName
  email
  mobileNumber
}
```

### Example 4: Deep Nesting
```
GET /api/dynamic/Shesha/Person/Crud/GetAll?properties=firstName organisation { name primaryAddress { city country { name code } } }
```

**Properties parameter:**
```
firstName
organisation {
  name
  primaryAddress {
    city
    country {
      name
      code
    }
  }
}
```

## Tips for Configure Request UI

### Using the Params Tab

When you set `properties` as the parameter key, the UI automatically:
- Provides a **multi-line textarea** for easier editing
- Shows **monospace font** for better readability
- Displays a helpful **tooltip** with syntax examples

### Formatting Your Properties

**Good formatting (easier to read):**
```
firstName
lastName
address {
  addressLine1
  city
  postalCode
}
organization {
  name
  code
}
```

**Also valid (single line):**
```
firstName lastName address { addressLine1 city postalCode } organization { name code }
```

## Combining with Other Parameters

You can use `properties` alongside other query parameters:

### Example: Filter + Properties
```
Params:
  - Key: maxResultCount
    Value: 10

  - Key: skipCount
    Value: 0

  - Key: properties
    Value: firstName lastName email

  - Key: filter
    Value: firstName contains "John"
```

Result:
```
GET /api/dynamic/Shesha/Person/Crud/GetAll?maxResultCount=10&skipCount=0&properties=firstName%20lastName%20email&filter=firstName%20contains%20%22John%22
```

## Advanced Use Cases

### Dynamic Properties from Form Data

You can use Shesha expressions to make properties dynamic:

**Properties parameter value:**
```
{{data.selectedFields}}
```

Where `data.selectedFields` could be set by user selection:
```javascript
// In form script
setFormData({
  selectedFields: 'firstName lastName email'
});
```

### Conditional Properties

Use JavaScript evaluation:
```
{{data.includeAddress ? 'firstName lastName address { addressLine1 }' : 'firstName lastName'}}
```

## Comparison: Shesha Properties vs Standard GraphQL

### Shesha Approach (Current)
```
GET /api/dynamic/Shesha/Person/Crud/GetAll?properties=firstName lastName address { city }
```

**Advantages:**
- ✅ Works with existing REST endpoints
- ✅ Simple query parameters
- ✅ No need for separate GraphQL server
- ✅ Integrates with existing Shesha CRUD operations
- ✅ Supports pagination, filtering, sorting alongside properties

### Standard GraphQL (Also Supported)
```
POST /graphql
Content-Type: application/json

{
  "query": "query { persons { firstName lastName address { city } } }"
}
```

**Advantages:**
- ✅ Standard GraphQL syntax
- ✅ Better tooling support (GraphQL Playground, etc.)
- ✅ Introspection and type system
- ✅ Support for mutations, subscriptions

## When to Use Each Approach

### Use Shesha Properties Parameter When:
- ✅ Working with Shesha CRUD endpoints
- ✅ Need pagination, filtering, sorting
- ✅ Want simpler GET requests
- ✅ Integrating with existing Shesha forms
- ✅ Don't need mutations or subscriptions

### Use Standard GraphQL Body When:
- ✅ Connecting to external GraphQL APIs
- ✅ Need complex queries with multiple root fields
- ✅ Using mutations or subscriptions
- ✅ Working with GraphQL-first APIs
- ✅ Need operation names and fragments

## Complete Example: Configure Request Setup

Here's a full example for fetching persons with addresses:

### Configuration
1. **HTTP Verb:** `GET`
2. **URL:** `/api/dynamic/Shesha/Person/Crud/GetAll`

### Params Tab
| Key | Value | Enabled |
|-----|-------|---------|
| `maxResultCount` | `20` | ✓ |
| `skipCount` | `0` | ✓ |
| `properties` | `firstName`<br>`lastName`<br>`email`<br>`mobileNumber`<br>`address {`<br>`  addressLine1`<br>`  city`<br>`  postalCode`<br>`}` | ✓ |

### Headers Tab
| Key | Value | Enabled |
|-----|-------|---------|
| (empty - uses Send Standard Headers) | | |

### Body Tab
- Type: **none**

### Result
```json
{
  "result": {
    "items": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "mobileNumber": "+27821234567",
        "address": {
          "addressLine1": "123 Main Street",
          "city": "Johannesburg",
          "postalCode": "2000"
        }
      }
    ],
    "totalCount": 1
  }
}
```

## Troubleshooting

### Issue: Properties not being respected
**Solution:** Make sure the parameter key is exactly `properties` (lowercase)

### Issue: Nested properties returning null
**Solution:**
- Check that the navigation property exists on the entity
- Verify the property is properly mapped in your domain model
- Ensure Include statements are configured in the repository

### Issue: Syntax error in properties
**Solution:**
- Check matching braces `{ }`
- Ensure proper spacing
- Validate property names match entity properties

### Issue: URL too long
**Solution:**
- Consider using fewer properties
- Or switch to POST if endpoint supports it
- Or use standard GraphQL body approach instead

## Testing Properties Syntax

You can test your properties syntax directly in Swagger:

1. Navigate to: `/swagger`
2. Find: `/api/dynamic/Shesha/{entityName}/Crud/GetAll`
3. Click "Try it out"
4. In the `properties` parameter, enter your syntax
5. Execute to see results

## Best Practices

1. **Start Simple:** Test with basic properties first, then add nesting
2. **Format for Readability:** Use line breaks and indentation in the Configure Request UI
3. **Document Usage:** Add descriptions to your parameter configurations
4. **Test in Swagger:** Verify syntax in Swagger before configuring in forms
5. **Use Wisely:** Only fetch properties you actually need
6. **Consider Performance:** Deep nesting can impact query performance

## Summary

Shesha's GraphQL-like properties parameter provides:
- ✅ Flexible field selection
- ✅ Nested property fetching
- ✅ Integration with existing REST endpoints
- ✅ Easy-to-use query parameter syntax
- ✅ Works alongside pagination and filtering

Use it whenever you need to optimize data fetching in Shesha CRUD operations!
