namespace Shesha.Tests.JsonLogic.TestExpressions
{
    internal static class StringExpressions
    {

        public const string EqualToValue = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""FirstName""
        },
        ""Bob""
      ]
    }
  ]
}";

        public const string NotEqualToValue = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""FirstName""
        },
        ""Bob""
      ]
    }
  ]
}";

        public const string LikeValue = @"{
  ""and"": [
    {
      ""in"": [
        ""trick"",
        {
          ""var"": ""FirstName""
        }
      ]
    }
  ]
}";

        public const string NotLikeValue = @"{
  ""and"": [
    {
      ""!"": {
        ""in"": [
          ""trick"",
          {
            ""var"": ""FirstName""
          }
        ]
      }
    }
  ]
}";

        public const string FieldIsEmpty = @"{
  ""and"": [
    {
      ""!"": {
        ""var"": ""FirstName""
      }
    }
  ]
}";

        public const string FieldIsNotEmpty = @"{
  ""and"": [
    {
      ""!!"": {
        ""var"": ""FirstName""
      }
    }
  ]
}";

        public const string FieldStartsWithValue = @"{
  ""and"": [
    {
      ""startsWith"": [
        {
          ""var"": ""FirstName""
        },
        ""bo""
      ]
    }
  ]
}";

        public const string FieldEndsWithValue = @"{
  ""and"": [
    {
      ""endsWith"": [
        {
          ""var"": ""FirstName""
        },
        ""ck""
      ]
    }
  ]
}";

        public const string EqualToField = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""firstName""
        },
        {
          ""var"": ""lastName""
        }
      ]
    }
  ]
}";
        public const string EqualToNestedField = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""homeNumber""
        },
        {
          ""var"": ""address.addressLine3""
        }
      ]
    }
  ]
}";
        public const string NotEqualToField = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""firstName""
        },
        {
          ""var"": ""lastName""
        }
      ]
    }
  ]
}";

        public const string CustomFunctions = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""firstName""
        },
        {
          ""toLowerCase"": [
            ""TeSt""
          ]
        }
      ]
    },
    {
      ""=="": [
        {
          ""var"": ""lastName""
        },
        {
          ""toUpperCase"": [
            ""VaLuE""
          ]
        }
      ]
    },
    {
      ""=="": [
        {
          ""var"": ""emailAddress1""
        },
        {
          ""toLowerCase"": [
            {
              ""var"": ""emailAddress2""
            }
          ]
        }
      ]
    }
  ]
}";
        
    }

}
