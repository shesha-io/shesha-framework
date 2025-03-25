namespace Shesha.Tests.JsonLogic.TestExpressions
{
    public static class ComplexExpressions
    {
        public const string NestedStringFieldEquals = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""User.UserName""
        },
        ""admin""
      ]
    }
  ]
}";


        public const string NestedEntityFieldEquals = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""PrimaryOrganisation.PrimaryAddress""
        },
        ""D80526AB-BB64-41FA-BFB8-F74A9332C0CA""
      ]
    }
  ]
}";

        public const string OrAndCombination = @"{
  ""or"": [
    {
      ""=="": [
        {
          ""var"": ""ShaRole""
        },
        ""852c4011-4e94-463a-9e0d-b0054ab88f7d""
      ]
    },
    {
      ""and"": [
        {
          "">"": [
            {
              ""var"": ""ShaRole.LastModificationTime""
            },
            ""2021-04-25T08:13:55.000Z""
          ]
        },
        {
          ""=="": [
            {
              ""var"": ""IsGranted""
            },
            false
          ]
        }
      ]
    }
  ]
}";
    }
}
