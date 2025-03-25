namespace Shesha.Tests.JsonLogic.TestExpressions
{
    public static class RefListExpressions
    {
        public const string NullableFieldContainsValue = @"{
  ""and"": [
    {
      ""in"": [
        {
          ""var"": ""title""
        },
        [1,2,3]
      ]
    }
  ]
}";
        public const string FieldEqualsToValue = @"{""and"":[{""=="":[{""var"":""customTitle""},1]}]}";
        public const string NullableFieldEqualsToValue = @"{""and"":[{""=="":[{""var"":""title""},1]}]}";

        public const string Equal = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""gender""
        },
        {
          ""var"": ""title""
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
          ""var"": ""gender""
        },
        {
          ""var"": ""title""
        }
      ]
    }
  ]
}";
    }

}
