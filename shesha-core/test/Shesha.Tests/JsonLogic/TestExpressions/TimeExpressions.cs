namespace Shesha.Tests.JsonLogic.TestExpressions
{
    public static class TimeExpressions
    {
        public const string FieldLessThanValue = @"{
  ""and"": [
    {
      ""<"": [
        {
          ""var"": ""TimeProp""
        },
        9250
      ]
    }
  ]
}";
        public const string FieldLessThanOrEqualsToValue = @"{
  ""and"": [
    {
      ""<="": [
        {
          ""var"": ""TimeProp""
        },
        9250
      ]
    }
  ]
}";
        public const string FieldGreaterThanValue = @"{
  ""and"": [
    {
      "">"": [
        {
          ""var"": ""TimeProp""
        },
        9250
      ]
    }
  ]
}";
        public const string FieldGreaterThanOrEqualsToValue = @"{
  ""and"": [
    {
      "">="": [
        {
          ""var"": ""TimeProp""
        },
        9250
      ]
    }
  ]
}";
        public const string FieldEqualsToValue = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""TimeProp""
        },
        9250
      ]
    }
  ]
}";

        public const string FieldNotEqualsToValue = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""TimeProp""
        },
        9250
      ]
    }
  ]
}";
        public const string FieldBetweenValue = @"{""<="":[3600,{""var"":""TimeProp""},7200]}";
    }
}
