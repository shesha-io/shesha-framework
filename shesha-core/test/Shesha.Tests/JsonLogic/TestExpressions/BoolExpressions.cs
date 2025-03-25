namespace Shesha.Tests.JsonLogic.TestExpressions
{
    public static class BoolExpressions
    {
        public const string EqualsToValue = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""user.otpEnabled""
        },
        true
      ]
    }
  ]
}";

        public const string NotEqualsToValue = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""user.otpEnabled""
        },
        true
      ]
    }
  ]
}";

        public const string Equal = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""user.otpEnabled""
        },
        {
          ""var"": ""user.isActive""
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
          ""var"": ""user.otpEnabled""
        },
        {
          ""var"": ""user.isActive""
        }
      ]
    }
  ]
}";
    }

}
