using Shesha.Domain;
using Shesha.JsonLogic;
using Shesha.Tests.Fixtures;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.JsonLogic
{
    [Collection(SqlServerCollection.Name)]
    public class JsonLogic2LinqConverter_FieldTests : JsonLogic2LinqConverterBaseTests
    {
        public JsonLogic2LinqConverter_FieldTests(SqlServerFixture fixture) : base(fixture)
        {
        }
        #region string

        private static class StringExpressions
        {
            public const string Equal = @"{
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
            public const string Equal_Nested = @"{
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
            public const string NotEqual = @"{
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
        }

        [Theory]
        [InlineData("Equal", StringExpressions.Equal, @"ent => (ent.FirstName == ent.LastName)")]
        [InlineData("Equal Nested", StringExpressions.Equal_Nested, @"ent => (ent.HomeNumber == ent.Address.AddressLine3)")]
        [InlineData("NotEqual", StringExpressions.NotEqual, @"ent => Not((ent.FirstName == ent.LastName))")]
        public void StringField_Convert(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<Person>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", StringExpressions.Equal)]
        [InlineData("Equal Nested", StringExpressions.Equal_Nested)]
        [InlineData("NotEqual", StringExpressions.NotEqual)]
        public async Task StringField_FetchAsync(string name, string jsonLogicExpression)
        {
            Console.WriteLine($"Test: '{name}'");

            var data = await TryFetchDataAsync<Person, Guid>(jsonLogicExpression);
            Assert.NotNull(data);
        }

        #endregion

        #region number

        private static class NumberExpressions { 
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

        [Theory]
        [InlineData("Equal", NumberExpressions.Equal, @"ent => (ent.CreatorUserId == ent.LastModifierUserId)")]
        [InlineData("NotEqual", NumberExpressions.NotEqual, @"ent => Not((ent.CreatorUserId == ent.LastModifierUserId))")]
        [InlineData("Greater", NumberExpressions.Greater, @"ent => (ent.CreatorUserId > ent.LastModifierUserId)")]
        [InlineData("GreaterOrEqual", NumberExpressions.GreaterOrEqual, @"ent => (ent.CreatorUserId >= ent.LastModifierUserId)")]
        [InlineData("Less", NumberExpressions.Less, @"ent => (ent.CreatorUserId < ent.LastModifierUserId)")]
        [InlineData("LessOrEqual", NumberExpressions.LessOrEqual, @"ent => (ent.CreatorUserId <= ent.LastModifierUserId)")]
        [InlineData("Between", NumberExpressions.Between, @"ent => ((ent.LastModifierUserId <= ent.CreatorUserId) AndAlso (ent.CreatorUserId <= ent.DeleterUserId))")]
        [InlineData("NotBetween", NumberExpressions.NotBetween, @"ent => Not(((ent.LastModifierUserId <= ent.CreatorUserId) AndAlso (ent.CreatorUserId <= ent.DeleterUserId)))")]
        public void NumberField_Convert(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<Person>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", NumberExpressions.Equal)]
        [InlineData("NotEqual", NumberExpressions.NotEqual)]
        [InlineData("Greater", NumberExpressions.Greater)]
        [InlineData("GreaterOrEqual", NumberExpressions.GreaterOrEqual)]
        [InlineData("Less", NumberExpressions.Less)]
        [InlineData("LessOrEqual", NumberExpressions.LessOrEqual)]
        [InlineData("Between", NumberExpressions.Between)]
        [InlineData("NotBetween", NumberExpressions.NotBetween)]
        public async Task NumberField_FetchAsync(string name, string jsonLogicExpression)
        {
            Console.WriteLine($"Test: '{name}'");

            var data = await TryFetchDataAsync<Person, Guid>(jsonLogicExpression);
            Assert.NotNull(data);
        }

        #endregion

        #region datetime

        private static class DateTimeExpressions
        {
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

        [Theory]
        [InlineData("Equal", DateTimeExpressions.Equal, "ent => (ent.LastModificationTime == Convert(ent.CreationTime, Nullable`1))")]
        [InlineData("NotEqual", DateTimeExpressions.NotEqual, "ent => Not((ent.LastModificationTime == Convert(ent.CreationTime, Nullable`1)))")]
        [InlineData("Greater", DateTimeExpressions.Greater, "ent => (ent.LastModificationTime > Convert(ent.CreationTime, Nullable`1))")]
        [InlineData("GreaterOrEqual", DateTimeExpressions.GreaterOrEqual, "ent => (ent.LastModificationTime >= Convert(ent.CreationTime, Nullable`1))")]
        [InlineData("Less", DateTimeExpressions.Less, "ent => (ent.LastModificationTime < Convert(ent.CreationTime, Nullable`1))")]
        [InlineData("LessOrEqual", DateTimeExpressions.LessOrEqual, "ent => (ent.LastModificationTime <= Convert(ent.CreationTime, Nullable`1))")]
        [InlineData("Between", DateTimeExpressions.Between, "ent => ((Convert(ent.CreationTime, Nullable`1) <= ent.LastModificationTime) AndAlso (ent.LastModificationTime <= ent.DeletionTime))")]
        [InlineData("NotBetween", DateTimeExpressions.NotBetween, "ent => Not(((Convert(ent.CreationTime, Nullable`1) <= ent.LastModificationTime) AndAlso (ent.LastModificationTime <= ent.DeletionTime)))")]
        public void DateField_Convert(string name, string jsonLogicExpression, string expectation) 
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<Person>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", DateTimeExpressions.Equal)]
        [InlineData("NotEqual", DateTimeExpressions.NotEqual)]
        [InlineData("Greater", DateTimeExpressions.Greater)]
        [InlineData("GreaterOrEqual", DateTimeExpressions.GreaterOrEqual)]
        [InlineData("Less", DateTimeExpressions.Less)]
        [InlineData("LessOrEqual", DateTimeExpressions.LessOrEqual)]
        [InlineData("Between", DateTimeExpressions.Between)]
        [InlineData("NotBetween", DateTimeExpressions.NotBetween)]
        public async Task DateField_FetchAsync(string name, string jsonLogicExpression)
        {
            Console.WriteLine($"Test: '{name}'");

            var data = await TryFetchDataAsync<Person, Guid>(jsonLogicExpression);
            Assert.NotNull(data);
        }

        #endregion

        #region bool

        private static class BoolExpressions
        {
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

        [Theory]
        [InlineData("Equal", BoolExpressions.Equal, @"ent => (ent.User.OtpEnabled == ent.User.IsActive)")]
        [InlineData("NotEqual", BoolExpressions.NotEqual, @"ent => Not((ent.User.OtpEnabled == ent.User.IsActive))")]
        public void BoolField_Convert(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<Person>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", BoolExpressions.Equal)]
        [InlineData("NotEqual", BoolExpressions.NotEqual)]
        public async Task BoolField_FetchAsync(string name, string jsonLogicExpression)
        {
            Console.WriteLine($"Test: '{name}'");

            var data = await TryFetchDataAsync<Person, Guid>(jsonLogicExpression);
            Assert.NotNull(data);
        }

        #endregion

        #region entity
        private static class EntityExpressions
        {
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

        [Theory]
        [InlineData("Equal", EntityExpressions.Equal, @"ent => (ent.Address == ent.WorkAddress)")]
        [InlineData("NotEqual", EntityExpressions.NotEqual, @"ent => Not((ent.Address == ent.WorkAddress))")]
        public void EntityField_Convert(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<Person>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", EntityExpressions.Equal)]
        [InlineData("NotEqual", EntityExpressions.NotEqual)]
        public async Task EntityField_FetchAsync(string name, string jsonLogicExpression)
        {
            Console.WriteLine($"Test: '{name}'");

            var data = await TryFetchDataAsync<Person, Guid>(jsonLogicExpression);
            Assert.NotNull(data);
        }

        #endregion

        #region reflist

        private static class RefListExpressions
        {
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

        [Theory]
        [InlineData("Equal", RefListExpressions.Equal, @"ent => (Convert(ent.Gender, Nullable`1) == Convert(ent.Title, Nullable`1))")]
        [InlineData("NotEqual", RefListExpressions.NotEqual, @"ent => Not((Convert(ent.Gender, Nullable`1) == Convert(ent.Title, Nullable`1)))")]
        public void RefListField_Convert(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<Person>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", RefListExpressions.Equal)]
        [InlineData("NotEqual", RefListExpressions.NotEqual)]
        public async Task RefListField_FetchAsync(string name, string jsonLogicExpression)
        {
            Console.WriteLine($"Test: '{name}'");

            var data = await TryFetchDataAsync<Person, Guid>(jsonLogicExpression);
            Assert.NotNull(data);
        }

        #endregion
    }
}
