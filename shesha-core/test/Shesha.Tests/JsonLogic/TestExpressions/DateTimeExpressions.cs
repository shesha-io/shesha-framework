namespace Shesha.Tests.JsonLogic.TestExpressions
{
    public static class DateTimeExpressions
    {
        public const string NullableFieldLessThanValue = @"{
  ""and"": [
    {
      ""<"": [
        {
          ""var"": ""NullableDateTimeProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";
        public const string NullableFieldLessThanOrEqualsToValue = @"{
  ""and"": [
    {
      ""<="": [
        {
          ""var"": ""NullableDateTimeProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";
        public const string NullableFieldGreaterThanValue = @"{
  ""and"": [
    {
      "">"": [
        {
          ""var"": ""NullableDateTimeProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";
        public const string NullableFieldGreaterThanOrEqualsToValue = @"{
  ""and"": [
    {
      "">="": [
        {
          ""var"": ""NullableDateTimeProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";
        public const string NullableFieldEqualsToValue = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""NullableDateTimeProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";
        public const string NullableFieldNotEqualsToValue = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""NullableDateTimeProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";
        public const string NullableFieldBetweenValues = @"{""<="":[""2022-08-01T16:46:00Z"",{""var"":""CreationTime""},""2022-08-04T16:47:00Z""]}";

        public const string Equal = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""lastModificationTime""
        },
        {
          ""var"": ""creationTime""
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
          ""var"": ""lastModificationTime""
        },
        {
          ""var"": ""creationTime""
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
          ""var"": ""lastModificationTime""
        },
        {
          ""var"": ""creationTime""
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
          ""var"": ""lastModificationTime""
        },
        {
          ""var"": ""creationTime""
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
          ""var"": ""lastModificationTime""
        },
        {
          ""var"": ""creationTime""
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
          ""var"": ""lastModificationTime""
        },
        {
          ""var"": ""creationTime""
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
          ""var"": ""creationTime""
        },
        {
          ""var"": ""lastModificationTime""
        },
        {
          ""var"": ""deletionTime""
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
            ""var"": ""creationTime""
          },
          {
            ""var"": ""lastModificationTime""
          },
          {
            ""var"": ""deletionTime""
          }
        ]
      }
    }
  ]
}";
    }

}
