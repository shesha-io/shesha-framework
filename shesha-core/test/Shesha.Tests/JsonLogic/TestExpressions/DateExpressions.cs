namespace Shesha.Tests.JsonLogic.TestExpressions
{
    public static class DateExpressions
    {
        public const string FieldLessThanValue = @"{
  ""and"": [
    {
      ""<"": [
        {
          ""var"": ""DateProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";


        public const string FieldLessThanOrEqualsToValue = @"{
  ""and"": [
    {
      ""<="": [
        {
          ""var"": ""DateProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";
        public const string FieldGreaterThanValue = @"{
  ""and"": [
    {
      "">"": [
        {
          ""var"": ""DateProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";
        public const string FieldGreaterThanOrEqualsToValue = @"{
  ""and"": [
    {
      "">="": [
        {
          ""var"": ""DateProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";
        public const string FieldEqualsToValue = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""DateProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";

        public const string FieldNotEqualsToValue = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""DateProp""
        },
        ""2021-04-25T06:13:50.000Z""
      ]
    }
  ]
}";
        public const string FieldBetweenValues = @"{""<="":[""2022-08-01T16:46:00Z"",{""var"":""DateProp""},""2022-08-04T16:47:00Z""]}";

        public const string CustomDateAddFunction = @"{""and"":[{""<="":[{""date_add"":[{""now"":[]},-5,""day""]},{""var"":""user.lastLoginDate""},{""now"":[]}]}]}";
    }
}
