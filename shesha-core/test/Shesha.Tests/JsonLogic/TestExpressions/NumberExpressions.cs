namespace Shesha.Tests.JsonLogic.TestExpressions
{
    public static class NumberExpressions
    {
        public const string FieldEqualToValue = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""NotNullableNumeric""
        },
        100
      ]
    }
  ]
}";
        public const string FieldEqualToValue_linq = @"ent => (ent.NotNullableNumeric == 100)";

        public const string FieldNotEqualToValue = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""NotNullableNumeric""
        },
        100
      ]
    }
  ]
}";

        public const string FieldNotEqualToValue_linq = @"ent => Not((ent.NotNullableNumeric == 100))";

        public const string FieldGreaterThanValue = @"{
  ""and"": [
    {
      "">"": [
        {
          ""var"": ""NotNullableNumeric""
        },
        100
      ]
    }
  ]
}";
        public const string FieldGreaterThanValue_linq = @"ent => (ent.NotNullableNumeric > 100)";

        public const string FieldGreaterOrEqualToValue = @"{
  ""and"": [
    {
      "">="": [
        {
          ""var"": ""NotNullableNumeric""
        },
        100
      ]
    }
  ]
}";
        public const string FieldGreaterOrEqualToValue_linq = @"ent => (ent.NotNullableNumeric >= 100)";

        public const string FieldLessThanValue = @"{
  ""and"": [
    {
      ""<"": [
        {
          ""var"": ""NotNullableNumeric""
        },
        100
      ]
    }
  ]
}";
        public const string FieldLessThanValue_linq = @"ent => (ent.NotNullableNumeric < 100)";

        public const string FieldLessOrEqualToValue = @"{
  ""and"": [
    {
      ""<="": [
        {
          ""var"": ""NotNullableNumeric""
        },
        100
      ]
    }
  ]
}";

        public const string FieldLessOrEqualToValue_linq = @"ent => (ent.NotNullableNumeric <= 100)";

        public const string FieldBetweenValues = @"{
  ""and"": [
    {
      ""<="": [
        0,
        {
          ""var"": ""NotNullableNumeric""
        },
        100
      ]
    }
  ]
}";
        public const string FieldBetweenValues_linq = @"ent => ((0 <= ent.NotNullableNumeric) AndAlso (ent.NotNullableNumeric <= 100))";

        public const string FieldNotBetweenValues = @"{
  ""and"": [
    {
      ""!"": {
        ""<="": [
            0,
            {
              ""var"": ""NotNullableNumeric""
            },
            100
        ]
      }
    }
  ]
}";
        public const string FieldNotBetweenValues_linq = @"ent => Not(((0 <= ent.NotNullableNumeric) AndAlso (ent.NotNullableNumeric <= 100)))";

        ///-------------------------------------------------
        
        public const string Int64FieldEqualsToValue = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""CreatorUserId""
        },
        100
      ]
    }
  ]
}";

        public const string Int64FieldLessThanValue = @"{
  ""and"": [
    {
      ""<"": [
        {
          ""var"": ""CreatorUserId""
        },
        100
      ]
    }
  ]
}";

        public const string Int64FieldLessThanOrEqualToValue = @"{
  ""and"": [
    {
      ""<="": [
        {
          ""var"": ""CreatorUserId""
        },
        100
      ]
    }
  ]
}";

        public const string Int64FieldGreaterThanValue = @"{
  ""and"": [
    {
      "">"": [
        {
          ""var"": ""CreatorUserId""
        },
        100
      ]
    }
  ]
}";

        public const string Int64FieldGreaterThanOrEqualToValue = @"{
  ""and"": [
    {
      "">="": [
        {
          ""var"": ""CreatorUserId""
        },
        100
      ]
    }
  ]
}";

        public const string Int32FieldEqualsInt64Value = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""IntProp""
        },
        100
      ]
    }
  ]
}";

        public const string NullableInt32FieldEqualsInt64Value = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""NullableIntProp""
        },
        100
      ]
    }
  ]
}";

        public const string Equal = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""creatorUserId""
        },
        {
          ""var"": ""lastModifierUserId""
        }
      ]
    }
  ]
}";
        public const string NotEqual = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""creatorUserId""
        },
        {
          ""var"": ""lastModifierUserId""
        }
      ]
    }
  ]
}";
        public const string Greater = @"{
  ""and"": [
    {
      "">"": [
        {
          ""var"": ""creatorUserId""
        },
        {
          ""var"": ""lastModifierUserId""
        }
      ]
    }
  ]
}";
        public const string GreaterOrEqual = @"{
  ""and"": [
    {
      "">="": [
        {
          ""var"": ""creatorUserId""
        },
        {
          ""var"": ""lastModifierUserId""
        }
      ]
    }
  ]
}";
        public const string Less = @"{
  ""and"": [
    {
      ""<"": [
        {
          ""var"": ""creatorUserId""
        },
        {
          ""var"": ""lastModifierUserId""
        }
      ]
    }
  ]
}";
        public const string LessOrEqual = @"{
  ""and"": [
    {
      ""<="": [
        {
          ""var"": ""creatorUserId""
        },
        {
          ""var"": ""lastModifierUserId""
        }
      ]
    }
  ]
}";
        public const string Between = @"{
  ""and"": [
    {
      ""<="": [
        {
          ""var"": ""lastModifierUserId""
        },
        {
          ""var"": ""creatorUserId""
        },
        {
          ""var"": ""deleterUserId""
        }
      ]
    }
  ]
}";
        public const string NotBetween = @"{
  ""and"": [
    {
      ""!"": {
        ""<="": [
          {
            ""var"": ""lastModifierUserId""
          },
          {
            ""var"": ""creatorUserId""
          },
          {
            ""var"": ""deleterUserId""
          }
        ]
      }
    }
  ]
}";
    }

}
