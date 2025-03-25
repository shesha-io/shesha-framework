namespace Shesha.Tests.JsonLogic.TestExpressions
{
    public static class EntityExpressions
    {
        public const string FieldEqualToValue = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""address""
        },
        ""852c4011-4e94-463a-9e0d-b0054ab88f7d""
      ]
    }
  ]
}";
        public const string FieldWithIntIdEqualsToValue = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""User""
        },
        ""500""
      ]
    }
  ]
}";
        public const string FieldIsEmpty = @"{
  ""and"": [
    {
      ""!"": {
        ""var"": ""address""
      }
    }
  ]
}";
        public const string FieldIsNull = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""address""
        },
        null
      ]
    }
  ]
}";
        public const string FieldIsNotNull = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""address""
        },
        null
      ]
    }
  ]
}";
        public const string FieldInValues = @"{
  ""and"": [
    {
      ""in"": [
        {
          ""var"": ""Id""
        },
        [""24007BA5-697B-417C-91BA-ED92F3F31F3A"", ""D197A7B3-5505-430C-9D98-CD64F1A638FA""]
      ]
    }
  ]
}";
        //public const string FieldEqualToValue = @"";

        public const string Equal = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""address""
        },
        {
          ""var"": ""workAddress""
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
          ""var"": ""address""
        },
        {
          ""var"": ""workAddress""
        }
      ]
    }
  ]
}";
    }

}
