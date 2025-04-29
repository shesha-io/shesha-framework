using Abp.Timing;
using FluentAssertions;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.JsonLogic;
using Shesha.Services;
using Shesha.Tests.Fixtures;
using Shesha.Tests.JsonLogic.Models;
using Shesha.Utilities;
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.JsonLogic
{
    /// <summary>
    /// JsonLogic2LinqConverter tests
    /// </summary>
    [Collection(SqlServerCollection.Name)]
    public class JsonLogic2LinqConverter_ValueTests : JsonLogic2LinqConverterBaseTests
    {
        public JsonLogic2LinqConverter_ValueTests(SqlServerFixture fixture) : base(fixture)
        {
        }

        #region string operations

        private readonly string _stringField_Equals_expression = @"{
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

        [Fact]
        public void StringField_Equals_Convert()
        {
            var expression = ConvertToExpression<Person>(_stringField_Equals_expression);
            Assert.Equal(@"ent => (ent.FirstName == ""Bob"")", expression?.ToInvariantString());
        }

        [Fact]
        public async Task StringField_Equals_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_stringField_Equals_expression);
            Assert.NotNull(data);
        }


        private readonly string _stringField_NotEquals_expression = @"{
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
        [Fact]
        public void StringField_NotEquals_Convert()
        {
            var expression = ConvertToExpression<Person>(_stringField_NotEquals_expression);
            Assert.Equal(@"ent => Not((ent.FirstName == ""Bob""))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task StringField_NotEquals_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_stringField_NotEquals_expression);
            Assert.NotNull(data);
        }

        private readonly string _stringField_Like_expression = @"{
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
        [Fact]
        public void StringField_Like_Convert()
        {
            var expression = ConvertToExpression<Person>(_stringField_Like_expression);
            Assert.Equal(@"ent => ent.FirstName.Contains(""trick"")", expression?.ToInvariantString());
        }

        [Fact]
        public async Task StringField_Like_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_stringField_Like_expression);
            Assert.NotNull(data);
        }

        private readonly string _stringField_NotLike_expression = @"{
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

        [Fact]
        public void StringField_NotLike_Convert()
        {
            var expression = ConvertToExpression<Person>(_stringField_NotLike_expression);
            Assert.Equal(@"ent => Not(ent.FirstName.Contains(""trick""))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task StringField_NotLike_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_stringField_NotLike_expression);
            Assert.NotNull(data);
        }

        private readonly string _stringField_IsEmpty_expression = @"{
  ""and"": [
    {
      ""!"": {
        ""var"": ""FirstName""
      }
    }
  ]
}";
        [Fact]
        public void StringField_IsEmpty_Convert()
        {
            var expression = ConvertToExpression<Person>(_stringField_IsEmpty_expression);
            Assert.Equal(@"ent => (ent.FirstName == null)", expression?.ToInvariantString());
        }

        [Fact]
        public async Task StringField_IsEmpty_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_stringField_IsEmpty_expression);
            Assert.NotNull(data);
        }

        private readonly string _stringField_IsNotEmpty_expression = @"{
  ""and"": [
    {
      ""!!"": {
        ""var"": ""FirstName""
      }
    }
  ]
}";

        [Fact]
        public void StringField_IsNotEmpty_Test()
        {
            var expression = ConvertToExpression<Person>(_stringField_IsNotEmpty_expression);
            Assert.Equal(@"ent => ((ent.FirstName != null) AndAlso (ent.FirstName.Trim() != """"))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task StringField_IsNotEmpty_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_stringField_IsNotEmpty_expression);
            Assert.NotNull(data);
        }

        private readonly string _stringField_StartsWith_expression = @"{
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

        [Fact]
        public void StringField_StartsWith_Convert()
        {
            var expression = ConvertToExpression<Person>(_stringField_StartsWith_expression);
            Assert.Equal(@"ent => ent.FirstName.StartsWith(""bo"")", expression?.ToInvariantString());
        }

        [Fact]
        public async Task StringField_StartsWith_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_stringField_StartsWith_expression);
            Assert.NotNull(data);
        }

        private readonly string _stringField_EndsWith_expression = @"{
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

        [Fact]
        public void StringField_EndsWith_Convert()
        {
            var expression = ConvertToExpression<Person>(_stringField_EndsWith_expression);
            Assert.Equal(@"ent => ent.FirstName.EndsWith(""ck"")", expression?.ToInvariantString());
        }

        [Fact]
        public async Task StringField_EndsWith_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_stringField_EndsWith_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region int operators

        [Fact]
        public void Int32Field_EqualsInt64_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");
            Assert.Equal($@"ent => (ent.IntProp == 100)", expression?.ToInvariantString());
        }

        [Fact]
        public void NullableInt32Field_EqualsInt64_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");
            Assert.Equal($@"ent => (ent.NullableIntProp == Convert(100, Nullable`1))", expression?.ToInvariantString());
        }

        #endregion

        #region int64 operators

        #region Equals
        private readonly string _int64Field_Equals_expression = @"{
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

        [Fact]
        public void Int64Field_Equals_Convert()
        {
            var expression = ConvertToExpression<Person>(_int64Field_Equals_expression);
            Assert.Equal($@"ent => (ent.{nameof(Person.CreatorUserId)} == Convert(100, Nullable`1))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task Int64Field_Equals_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_int64Field_Equals_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region Less Than
        private readonly string _int64Field_LessThan_expression = @"{
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

        [Fact]
        public void Int64Field_LessThan_Convert()
        {
            var expression = ConvertToExpression<Person>(_int64Field_LessThan_expression);
            Assert.Equal($@"ent => (ent.{nameof(Person.CreatorUserId)} < Convert(100, Nullable`1))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task Int64Field_LessThan_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_int64Field_LessThan_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region Less than or equal

        private readonly string _int64Field_LessThanOrEqual_expression = @"{
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

        [Fact]
        public void Int64Field_LessThanOrEqual_Convert()
        {
            var expression = ConvertToExpression<Person>(_int64Field_LessThanOrEqual_expression);
            Assert.Equal($@"ent => (ent.{nameof(Person.CreatorUserId)} <= Convert(100, Nullable`1))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task Int64Field_LessThanOrEqual_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_int64Field_LessThanOrEqual_expression);
            Assert.NotNull(data);
        }


        #endregion

        #region Greater than

        private readonly string _int64Field_GreaterThan_expression = @"{
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

        [Fact]
        public void Int64Field_GreaterThan_Convert()
        {
            var expression = ConvertToExpression<Person>(_int64Field_GreaterThan_expression);
            Assert.Equal($@"ent => (ent.{nameof(Person.CreatorUserId)} > Convert(100, Nullable`1))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task Int64Field_GreaterThan_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_int64Field_GreaterThan_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region Greater than or equal

        private readonly string _int64Field_GreaterThanOrEqual_expression = @"{
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

        [Fact]
        public void Int64Field_GreaterThanOrEqual_Convert()
        {
            var expression = ConvertToExpression<Person>(_int64Field_GreaterThanOrEqual_expression);
            Assert.Equal($@"ent => (ent.{nameof(Person.CreatorUserId)} >= Convert(100, Nullable`1))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task Int64Field_GreaterThanOrEqual_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_int64Field_GreaterThanOrEqual_expression);
            Assert.NotNull(data);
        }

        #endregion

        #endregion

        #region bool operations

        private readonly string _booleanField_Equals_expression = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""OtpEnabled""
        },
        true
      ]
    }
  ]
}";
        [Fact]
        public void BooleanField_Equals_Convert()
        {
            var expression = ConvertToExpression<User>(_booleanField_Equals_expression);

            Assert.Equal($@"ent => (ent.{nameof(User.OtpEnabled)} == True)", expression?.ToInvariantString());
        }

        [Fact]
        public async Task BooleanField_Equals_FetchAsync()
        {
            var data = await TryFetchDataAsync<User, Int64>(_booleanField_Equals_expression);
            Assert.NotNull(data);
        }

        private readonly string _booleanField_NotEquals_expression = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""OtpEnabled""
        },
        true
      ]
    }
  ]
}";
        [Fact]
        public void BooleanField_NotEquals_Convert()
        {
            var expression = ConvertToExpression<User>(_booleanField_NotEquals_expression);

            Assert.Equal($@"ent => Not((ent.{nameof(User.OtpEnabled)} == True))", expression?.ToInvariantString());
            
        }

        [Fact]
        public async Task BooleanField_NotEquals_FetchAsync()
        {
            var data = await TryFetchDataAsync<User, Int64>(_booleanField_NotEquals_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region nested columns resolving

        private readonly string _nestedColumnResolver_expression = @"{
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

        private readonly string _nestedColumnResolver_expression2 = @"{
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

        [Fact]
        public void NestedColumnResolver_Convert()
        {
            var expression = ConvertToExpression<Person>(_nestedColumnResolver_expression);
            Assert.Equal(@"ent => (ent.User.UserName == ""admin"")", expression?.ToInvariantString());

            var expression2 = ConvertToExpression<Person>(_nestedColumnResolver_expression2);
            Assert.Equal(@"ent => (ent.PrimaryOrganisation.PrimaryAddress.Id == ""D80526AB-BB64-41FA-BFB8-F74A9332C0CA"".ToGuid())", expression2?.ToString());
        }

        [Fact]
        public async Task NestedColumnResolver_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_nestedColumnResolver_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region datetime

        [Fact]
        public void NullableDatetimeField_LessThan_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal("ent => (ent.NullableDateTimeProp < Convert(04/25/2021 06:13:00, Nullable`1))", expression?.ToInvariantString());
        }

        [Fact]
        public void NullableDatetimeField_LessThanOrEquals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal("ent => (ent.NullableDateTimeProp <= Convert(04/25/2021 06:13:59, Nullable`1))", expression?.ToInvariantString());
        }

        [Fact]
        public void NullableDatetimeField_GreaterThan_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal("ent => (ent.NullableDateTimeProp > Convert(04/25/2021 06:13:59, Nullable`1))", expression?.ToInvariantString());
        }

        [Fact]
        public void NullableDatetimeField_GreaterThanOrEquals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal("ent => (ent.NullableDateTimeProp >= Convert(04/25/2021 06:13:00, Nullable`1))", expression?.ToInvariantString());
        }

        [Fact]
        public void NullableDateTimeField_Equals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal("ent => ((Convert(04/25/2021 06:13:00, Nullable`1) <= ent.NullableDateTimeProp) AndAlso (ent.NullableDateTimeProp <= Convert(04/25/2021 06:13:59, Nullable`1)))", expression?.ToInvariantString());
        }

        [Fact]
        public void NullableDateTimeField_NotEquals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal("ent => Not(((Convert(04/25/2021 06:13:00, Nullable`1) <= ent.NullableDateTimeProp) AndAlso (ent.NullableDateTimeProp <= Convert(04/25/2021 06:13:59, Nullable`1))))", expression?.ToInvariantString());
        }

        [Fact]
        public void NullableDateTimeField_Between_Convert()
        {
            var expression = ConvertToExpression<Person>(@"{""<="":[""2022-08-01T16:46:00Z"",{""var"":""CreationTime""},""2022-08-04T16:47:00Z""]}");

            Assert.Equal("ent => ((ent.CreationTime >= 08/01/2022 16:46:00) AndAlso (ent.CreationTime <= 08/04/2022 16:47:59))", expression?.ToInvariantString());
        }

        #endregion

        #region date

        [Fact]
        public void DateField_LessThan_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => (ent.DateProp < 04/25/2021 00:00:00)", expression?.ToInvariantString());
        }

        [Fact]
        public void DateField_LessThanOrEquals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => (ent.DateProp <= 04/25/2021 23:59:59)", expression?.ToInvariantString());
        }

        [Fact]
        public void DateField_GreaterThan_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => (ent.DateProp > 04/25/2021 23:59:59)", expression?.ToInvariantString());
        }

        [Fact]
        public void DateField_GreaterThanOrEquals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => (ent.DateProp >= 04/25/2021 00:00:00)", expression?.ToInvariantString());
        }

        [Fact]
        public void DateField_Equals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => ((04/25/2021 00:00:00 <= ent.DateProp) AndAlso (ent.DateProp <= 04/25/2021 23:59:59))", expression?.ToInvariantString());
        }

        [Fact]
        public void DateField_NotEquals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => Not(((04/25/2021 00:00:00 <= ent.DateProp) AndAlso (ent.DateProp <= 04/25/2021 23:59:59)))", expression?.ToInvariantString());
        }

        [Fact]
        public void DateField_Between_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{""<="":[""2022-08-01T16:46:00Z"",{""var"":""DateProp""},""2022-08-04T16:47:00Z""]}");

            Assert.Equal(@"ent => ((ent.DateProp >= 08/01/2022 00:00:00) AndAlso (ent.DateProp <= 08/04/2022 23:59:59))", expression?.ToInvariantString());
        }

        #endregion

        #region time

        [Fact]
        public void TimeField_LessThan_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => (ent.TimeProp < 02:34:00)", expression?.ToInvariantString());
        }

        [Fact]
        public void TimeField_LessThanOrEquals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => (ent.TimeProp <= 02:34:59.9990000)", expression?.ToInvariantString());
        }

        [Fact]
        public void TimeField_GreaterThan_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => (ent.TimeProp > 02:34:59.9990000)", expression?.ToInvariantString());
        }

        [Fact]
        public void TimeField_GreaterThanOrEquals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => (ent.TimeProp >= 02:34:00)", expression?.ToInvariantString());
        }

        [Fact]
        public void TimeField_Equals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => ((02:34:00 <= ent.TimeProp) AndAlso (ent.TimeProp <= 02:34:59.9990000))", expression?.ToInvariantString());
        }

        [Fact]
        public void TimeField_NotEquals_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{
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
}");

            Assert.Equal(@"ent => Not(((02:34:00 <= ent.TimeProp) AndAlso (ent.TimeProp <= 02:34:59.9990000)))", expression?.ToInvariantString());
        }

        [Fact]
        public void TimeField_Between_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{""<="":[3600,{""var"":""TimeProp""},7200]}");

            Assert.Equal(@"ent => ((ent.TimeProp >= 01:00:00) AndAlso (ent.TimeProp <= 02:00:59.9990000))", expression?.ToInvariantString());
        }

        #endregion

        #region entity reference

        private readonly string _entityReference_Equals_expression = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""ShaRole""
        },
        ""852c4011-4e94-463a-9e0d-b0054ab88f7d""
      ]
    }
  ]
}";

        [Fact]
        public void EntityReference_Equals_Convert()
        {
            var expression = ConvertToExpression<ShaRolePermission>(_entityReference_Equals_expression);

            Assert.Equal($@"ent => (ent.{nameof(ShaRolePermission.ShaRole)}.Id == ""852c4011-4e94-463a-9e0d-b0054ab88f7d"".ToGuid())", expression?.ToInvariantString());            
        }

        [Fact]
        public async Task EntityReference_Equals_FetchAsync()
        {
            var data = await TryFetchDataAsync<ShaRolePermission, Guid>(_entityReference_Equals_expression);
            Assert.NotNull(data);
        }

        
        [Fact]
        public void EntityReference_Int_Id_Equals_Convert()
        {
            var gqlExpression = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""Child""
        },
        ""500""
      ]
    }
  ]
}";

            var expression = ConvertToExpression<EntityWithIntId>(gqlExpression);

            Assert.Equal($@"ent => (ent.{nameof(EntityWithIntId.Child)}.Id == 500)", expression?.ToInvariantString());
        }

        [Fact]
        public void EntityReference_IsEmpty_Convert_Test()
        {
            var expression = ConvertToExpression<ShaRolePermission>(@"{
  ""and"": [
    {
      ""!"": {
        ""var"": ""shaRole""
      }
    }
  ]
}");

            Assert.Equal(@"ent => (ent.ShaRole == null)", expression?.ToInvariantString());
        }


        private readonly string _entityReference_IsNull_expression = @"{
  ""and"": [
    {
      ""=="": [
        {
          ""var"": ""shaRole""
        },
        null
      ]
    }
  ]
}";
        [Fact]
        public void EntityReference_IsNull_Convert()
        {
            var expression = ConvertToExpression<ShaRolePermission>(_entityReference_IsNull_expression);

            Assert.Equal($@"ent => (ent.ShaRole == null)", expression?.ToInvariantString());
        }

        [Fact]
        public async Task EntityReference_IsNull_FetchAsync()
        {
            var data = await TryFetchDataAsync<ShaRolePermission, Guid>(_entityReference_IsNull_expression);
            Assert.NotNull(data);
        }

        private readonly string _entityReference_IsNotNull_expression = @"{
  ""and"": [
    {
      ""!="": [
        {
          ""var"": ""shaRole""
        },
        null
      ]
    }
  ]
}";

        [Fact]
        public void EntityReference_IsNotNull_Convert()
        {
            var expression = ConvertToExpression<ShaRolePermission>(_entityReference_IsNotNull_expression);

            Assert.Equal($@"ent => Not((ent.ShaRole == null))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task EntityReference_IsNotNull_FetchAsync()
        {
            var data = await TryFetchDataAsync<ShaRolePermission, Guid>(_entityReference_IsNotNull_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region complex expression (with `or` and `and`)

        private readonly string _complex_expression = @"{
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

        [Fact]
        public void ComplexExpression_Convert()
        {
            var expression = ConvertToExpression<ShaRolePermission>(_complex_expression);

            Assert.Equal("ent => ((ent.ShaRole.Id == \"852c4011-4e94-463a-9e0d-b0054ab88f7d\".ToGuid()) OrElse ((ent.ShaRole.LastModificationTime > Convert(04/25/2021 08:13:59, Nullable`1)) AndAlso (ent.IsGranted == False)))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task ComplexExpression_FetchAsync()
        {
            var data = await TryFetchDataAsync<ShaRolePermission, Guid>(_entityReference_Equals_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region sorting

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_AscAsync()
        {
            var data = await TryFetchDataAsync<ShaRolePermission, Guid>(_entityReference_Equals_expression, queryable => 
                queryable.OrderBy(nameof(ShaRolePermission.Permission))
            );

            Assert.NotNull(data);

            data.Should().BeInAscendingOrder(e => e.Permission);
        }

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_DescAsync()
        {
            var data = await TryFetchDataAsync<ShaRolePermission, Guid>(_entityReference_Equals_expression, queryable =>
                queryable.OrderByDescending(nameof(ShaRolePermission.Permission))
            );

            Assert.NotNull(data);

            data.Should().BeInDescendingOrder(e => e.Permission);
        }

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_NestedEntity_Property_AscAsync()
        {
            await TryFetchDataAsync<ShaRolePermission, Guid>(_entityReference_Equals_expression, 
                queryable => queryable.OrderBy($"{nameof(ShaRolePermission.ShaRole)}.{nameof(ShaRolePermission.ShaRole.Name)}"),
                data => {
                    Assert.NotNull(data);
                    
                    var roleNames = data.Select(e => e.ShaRole?.Name).ToList();
                    roleNames.Should().BeInAscendingOrder(e => e);
                }
            );
        }

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_Title_AscAsync()
        {
            await TryFetchDataAsync<User, Int64>(_booleanField_NotEquals_expression,
                queryable => queryable.OrderBy($"{nameof(User.TypeOfAccount)}"),
                data => {
                    Assert.NotNull(data);

                    var refListHelper = Resolve<IReferenceListHelper>();
                    
                    var titlesWithDisplayText = data.Select(e =>
                        {
                            var displayText = e.TypeOfAccount.HasValue
                                ? refListHelper.GetItemDisplayText(new ReferenceListIdentifier("Shesha", "Shesha.Framework.TypeOfAccount"), (Int64)e.TypeOfAccount.Value)
                                : null;

                            return new { 
                                ItemValue = (Int64?)e.TypeOfAccount,
                                ItemText = displayText
                            };
                        })
                        .ToList();

                    titlesWithDisplayText.Should().BeInAscendingOrder(e => e.ItemText);
                }
            );
        }

        #endregion

        #region reference list

        #region 

        [Fact]
        public void ReflistField_Equals_Convert()
        {
            var expression = ConvertToExpression<EntityWithRefListrops>(@"{""and"":[{""=="":[{""var"":""title""},1]}]}");
            Assert.Equal(@"ent => (Convert(ent.Title, Int64) == 1)", expression?.ToInvariantString());
        }

        [Fact]
        public void NullableReflistField_Equals_Convert()
        {
            var expression = ConvertToExpression<EntityWithRefListrops>(@"{""and"":[{""=="":[{""var"":""nullableTitle""},1]}]}");
            Assert.Equal(@"ent => (Convert(ent.NullableTitle, Nullable`1) == Convert(1, Nullable`1))", expression?.ToInvariantString());
        }

        #endregion

        #region Contains (in)
        private readonly string _nullable_reflistField_Contains_expression = @"{
  ""and"": [
    {
      ""in"": [
        {
          ""var"": ""Title""
        },
        [1,2,3]
      ]
    }
  ]
}";

        [Fact]
        public void NullableReflistField_Contains_Convert()
        {
            var expression = ConvertToExpression<Person>(_nullable_reflistField_Contains_expression);
            Assert.Equal(@"ent => (((Convert(ent.Title, Nullable`1) == Convert(1, Nullable`1)) OrElse (Convert(ent.Title, Nullable`1) == Convert(2, Nullable`1))) OrElse (Convert(ent.Title, Nullable`1) == Convert(3, Nullable`1)))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task NullableReflistField_Contains_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_nullable_reflistField_Contains_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region Entity reference `in`

        private readonly string _entityReference_In_Convert_expression = @"{
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

        [Fact]
        public void EntityReference_In_Convert()
        {
            var expression = ConvertToExpression<Person>(_entityReference_In_Convert_expression);
            Assert.Equal(@"ent => ((ent.Id == ""24007BA5-697B-417C-91BA-ED92F3F31F3A"".ToGuid()) OrElse (ent.Id == ""D197A7B3-5505-430C-9D98-CD64F1A638FA"".ToGuid()))", expression?.ToInvariantString());
        }

        [Fact]
        public async Task EntityReference_In_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_entityReference_In_Convert_expression);
            Assert.NotNull(data);
        }

        #endregion

        #endregion

        #region Custom date functions

        private readonly string _custom_date_funcs_Convert_expression = @"{""and"":[{""<="":[{""date_add"":[{""now"":[]},-5,""day""]},{""var"":""user.lastLoginDate""},{""now"":[]}]}]}         ";

        [Fact]
        public void Custom_Date_Funcs_Convert()
        {
            using (FreezeTime()) 
            {
                var expression = ConvertToExpression<Person>(_custom_date_funcs_Convert_expression);

                // todo: find a way to use start of the minute here
                var now = Expression.Constant(Clock.Now).ToString();
                // note: use end of minute because we skip seconds for datetime values
                var nowEom = Expression.Constant(Clock.Now.EndOfTheMinute()).ToString();
                
                var expected = $@"ent => ((Convert({now}.Add(-5.00:00:00), Nullable`1) <= ent.User.LastLoginDate) AndAlso (ent.User.LastLoginDate <= Convert({nowEom}, Nullable`1)))";
                Assert.Equal(expected, expression?.ToInvariantString());
            }
        }

        [Fact]
        public async Task Custom_Date_Funcs_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_custom_date_funcs_Convert_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region Custom string functions

        private readonly string _custom_string_funcs_Convert_expression = @"{
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

        [Fact]
        public void Custom_String_Funcs_Convert()
        {
            var expression = ConvertToExpression<Person>(_custom_string_funcs_Convert_expression);

            var expected = $@"ent => (((ent.FirstName == ""TeSt"".ToLower()) AndAlso (ent.LastName == ""VaLuE"".ToUpper())) AndAlso (ent.EmailAddress1 == ent.EmailAddress2.ToLower()))";
            Assert.Equal(expected, expression?.ToInvariantString());
        }

        [Fact]
        public async Task Custom_String_Funcs_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(_custom_string_funcs_Convert_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region decimal

        private static class NumberExpressions
        {
            public const string Equal = @"{
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
            public const string Equal_linq = @"ent => (ent.NotNullableNumeric == 100)";

            public const string NotEqual = @"{
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

            public const string NotEqual_linq = @"ent => Not((ent.NotNullableNumeric == 100))";

            public const string Greater = @"{
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
            public const string Greater_linq = @"ent => (ent.NotNullableNumeric > 100)";

            public const string GreaterOrEqual = @"{
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
            public const string GreaterOrEqual_linq = @"ent => (ent.NotNullableNumeric >= 100)";

            public const string Less = @"{
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
            public const string Less_linq = @"ent => (ent.NotNullableNumeric < 100)";

            public const string LessOrEqual = @"{
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

            public const string LessOrEqual_linq = @"ent => (ent.NotNullableNumeric <= 100)";

            public const string Between = @"{
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
            public const string Between_linq = @"ent => ((0 <= ent.NotNullableNumeric) AndAlso (ent.NotNullableNumeric <= 100))";

            public const string NotBetween = @"{
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
            public const string NotBetween_linq = @"ent => Not(((0 <= ent.NotNullableNumeric) AndAlso (ent.NotNullableNumeric <= 100)))";
        }




        [Theory]
        [InlineData("Equal", NumberExpressions.Equal, NumberExpressions.Equal_linq)]
        [InlineData("NotEqual", NumberExpressions.NotEqual, NumberExpressions.NotEqual_linq)]
        [InlineData("Greater", NumberExpressions.Greater, NumberExpressions.Greater_linq)]
        [InlineData("GreaterOrEqual", NumberExpressions.GreaterOrEqual, NumberExpressions.GreaterOrEqual_linq)]
        [InlineData("Less", NumberExpressions.Less, NumberExpressions.Less_linq)]
        [InlineData("LessOrEqual", NumberExpressions.LessOrEqual, NumberExpressions.LessOrEqual_linq)]
        [InlineData("Between", NumberExpressions.Between, NumberExpressions.Between_linq)]
        [InlineData("NotBetween", NumberExpressions.NotBetween, NumberExpressions.NotBetween_linq)]
        public void DecimalField_Convert(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<EntityWithNumericProp<decimal>>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", NumberExpressions.Equal, NumberExpressions.Equal_linq)]
        [InlineData("NotEqual", NumberExpressions.NotEqual, NumberExpressions.NotEqual_linq)]
        [InlineData("Greater", NumberExpressions.Greater, NumberExpressions.Greater_linq)]
        [InlineData("GreaterOrEqual", NumberExpressions.GreaterOrEqual, NumberExpressions.GreaterOrEqual_linq)]
        [InlineData("Less", NumberExpressions.Less, NumberExpressions.Less_linq)]
        [InlineData("LessOrEqual", NumberExpressions.LessOrEqual, NumberExpressions.LessOrEqual_linq)]
        [InlineData("Between", NumberExpressions.Between, NumberExpressions.Between_linq)]
        [InlineData("NotBetween", NumberExpressions.NotBetween, NumberExpressions.NotBetween_linq)]
        public void FloatField_Convert(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<EntityWithNumericProp<float>>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", NumberExpressions.Equal, NumberExpressions.Equal_linq)]
        [InlineData("NotEqual", NumberExpressions.NotEqual, NumberExpressions.NotEqual_linq)]
        [InlineData("Greater", NumberExpressions.Greater, NumberExpressions.Greater_linq)]
        [InlineData("GreaterOrEqual", NumberExpressions.GreaterOrEqual, NumberExpressions.GreaterOrEqual_linq)]
        [InlineData("Less", NumberExpressions.Less, NumberExpressions.Less_linq)]
        [InlineData("LessOrEqual", NumberExpressions.LessOrEqual, NumberExpressions.LessOrEqual_linq)]
        [InlineData("Between", NumberExpressions.Between, NumberExpressions.Between_linq)]
        [InlineData("NotBetween", NumberExpressions.NotBetween, NumberExpressions.NotBetween_linq)]
        public void DoubleField_Convert(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<EntityWithNumericProp<double>>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        [Theory]
        [InlineData("Equal", NumberExpressions.Equal, NumberExpressions.Equal_linq)]
        [InlineData("NotEqual", NumberExpressions.NotEqual, NumberExpressions.NotEqual_linq)]
        [InlineData("Greater", NumberExpressions.Greater, NumberExpressions.Greater_linq)]
        [InlineData("GreaterOrEqual", NumberExpressions.GreaterOrEqual, NumberExpressions.GreaterOrEqual_linq)]
        [InlineData("Less", NumberExpressions.Less, NumberExpressions.Less_linq)]
        [InlineData("LessOrEqual", NumberExpressions.LessOrEqual, NumberExpressions.LessOrEqual_linq)]
        [InlineData("Between", NumberExpressions.Between, NumberExpressions.Between_linq)]
        [InlineData("NotBetween", NumberExpressions.NotBetween, NumberExpressions.NotBetween_linq)]
        public void ByteField_Convert(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<EntityWithNumericProp<byte>>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        #endregion
    }
}