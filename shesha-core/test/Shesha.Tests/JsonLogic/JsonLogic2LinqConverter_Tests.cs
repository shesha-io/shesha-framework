using Abp;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Linq;
using Abp.Timing;
using FluentAssertions;
using Newtonsoft.Json.Linq;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.JsonLogic;
using Shesha.Services;
using Shesha.Tests.TestingUtils;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.JsonLogic
{
    /// <summary>
    /// JsonLogic2LinqConverter tests
    /// </summary>
    public class JsonLogic2LinqConverter_Tests: SheshaNhTestBase
    {
        private Expression<Func<T, bool>> ConvertToExpression<T>(string jsonLogicExpression)
        {
            var converter = Resolve<IJsonLogic2LinqConverter>();

            // Parse json into hierarchical structure
            var jsonLogic = JObject.Parse(jsonLogicExpression);

            var expression = converter.ParseExpressionOf<T>(jsonLogic);
            return expression;
        }

        private async Task<List<T>> TryFetchData<T, TId>(string jsonLogicExpression, Func<IQueryable<T>, IQueryable<T>> prepareQueryable = null, Action<List<T>> assertions = null) where T: class, IEntity<TId>
        {
            var expression = ConvertToExpression<T>(jsonLogicExpression);

            var repository = LocalIocManager.Resolve<IRepository<T, TId>>();
            var asyncExecuter = LocalIocManager.Resolve<IAsyncQueryableExecuter>();

            List<T> data = null;
            
            await WithUnitOfWorkAsync(async () => {
                var query = repository.GetAll().Where(expression);

                if (prepareQueryable != null)
                    query = prepareQueryable.Invoke(query);

                data = await asyncExecuter.ToListAsync(query);

                assertions?.Invoke(data);
            });

            return data;
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
            Assert.Equal(@"ent => (ent.FirstName == ""Bob"")", expression.ToString());
        }

        [Fact]
        public async Task StringField_Equals_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_stringField_Equals_expression);
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
            Assert.Equal(@"ent => Not((ent.FirstName == ""Bob""))", expression.ToString());
        }

        [Fact]
        public async Task StringField_NotEquals_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_stringField_NotEquals_expression);
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
            Assert.Equal(@"ent => ent.FirstName.Contains(""trick"")", expression.ToString());
        }

        [Fact]
        public async Task StringField_Like_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_stringField_Like_expression);
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
            Assert.Equal(@"ent => Not(ent.FirstName.Contains(""trick""))", expression.ToString());
        }

        [Fact]
        public async Task StringField_NotLike_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_stringField_NotLike_expression);
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
            Assert.Equal(@"ent => (ent.FirstName == null)", expression.ToString());
        }

        [Fact]
        public async Task StringField_IsEmpty_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_stringField_IsEmpty_expression);
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
            Assert.Equal(@"ent => (ent.FirstName != null)", expression.ToString());
        }

        [Fact]
        public async Task StringField_IsNotEmpty_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_stringField_IsNotEmpty_expression);
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
            Assert.Equal(@"ent => ent.FirstName.StartsWith(""bo"")", expression.ToString());
        }

        [Fact]
        public async Task StringField_StartsWith_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_stringField_StartsWith_expression);
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
            Assert.Equal(@"ent => ent.FirstName.EndsWith(""ck"")", expression.ToString());
        }

        [Fact]
        public async Task StringField_EndsWith_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_stringField_EndsWith_expression);
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
            Assert.Equal($@"ent => (ent.IntProp == 100)", expression.ToString());
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
            Assert.Equal($@"ent => (ent.NullableIntProp == Convert(100, Nullable`1))", expression.ToString());
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
            Assert.Equal($@"ent => (ent.{nameof(Person.CreatorUserId)} == Convert(100, Nullable`1))", expression.ToString());
        }

        [Fact]
        public async Task Int64Field_Equals_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_int64Field_Equals_expression);
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
            Assert.Equal($@"ent => (ent.{nameof(Person.CreatorUserId)} < Convert(100, Nullable`1))", expression.ToString());
        }

        [Fact]
        public async Task Int64Field_LessThan_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_int64Field_LessThan_expression);
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
            Assert.Equal($@"ent => (ent.{nameof(Person.CreatorUserId)} <= Convert(100, Nullable`1))", expression.ToString());
        }

        [Fact]
        public async Task Int64Field_LessThanOrEqual_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_int64Field_LessThanOrEqual_expression);
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
            Assert.Equal($@"ent => (ent.{nameof(Person.CreatorUserId)} > Convert(100, Nullable`1))", expression.ToString());
        }

        [Fact]
        public async Task Int64Field_GreaterThan_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_int64Field_GreaterThan_expression);
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
            Assert.Equal($@"ent => (ent.{nameof(Person.CreatorUserId)} >= Convert(100, Nullable`1))", expression.ToString());
        }

        [Fact]
        public async Task Int64Field_GreaterThanOrEqual_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_int64Field_GreaterThanOrEqual_expression);
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

            Assert.Equal($@"ent => (ent.{nameof(User.OtpEnabled)} == True)", expression.ToString());
        }

        [Fact]
        public async Task BooleanField_Equals_Fetch()
        {
            var data = await TryFetchData<User, Int64>(_booleanField_Equals_expression);
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

            Assert.Equal($@"ent => Not((ent.{nameof(User.OtpEnabled)} == True))", expression.ToString());
            
        }

        [Fact]
        public async Task BooleanField_NotEquals_Fetch()
        {
            var data = await TryFetchData<User, Int64>(_booleanField_NotEquals_expression);
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

        [Fact]
        public void NestedColumnResolver_Convert()
        {
            var expression = ConvertToExpression<Person>(_nestedColumnResolver_expression);

            Assert.Equal(@"ent => (ent.User.UserName == ""admin"")", expression.ToString());
        }

        [Fact]
        public async Task NestedColumnResolver_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_nestedColumnResolver_expression);
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

            Assert.Equal(@"ent => (ent.NullableDateTimeProp < Convert(25/04/2021 6:13:00 AM, Nullable`1))", expression.ToString());
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

            Assert.Equal(@"ent => (ent.NullableDateTimeProp <= Convert(25/04/2021 6:13:59 AM, Nullable`1))", expression.ToString());
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

            Assert.Equal(@"ent => (ent.NullableDateTimeProp > Convert(25/04/2021 6:13:59 AM, Nullable`1))", expression.ToString());
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

            Assert.Equal(@"ent => (ent.NullableDateTimeProp >= Convert(25/04/2021 6:13:00 AM, Nullable`1))", expression.ToString());
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

            Assert.Equal(@"ent => ((Convert(25/04/2021 6:13:00 AM, Nullable`1) <= ent.NullableDateTimeProp) AndAlso (ent.NullableDateTimeProp <= Convert(25/04/2021 6:13:59 AM, Nullable`1)))", expression.ToString());
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

            Assert.Equal(@"ent => Not(((Convert(25/04/2021 6:13:00 AM, Nullable`1) <= ent.NullableDateTimeProp) AndAlso (ent.NullableDateTimeProp <= Convert(25/04/2021 6:13:59 AM, Nullable`1))))", expression.ToString());
        }

        [Fact]
        public void NullableDateTimeField_Between_Convert()
        {
            var expression = ConvertToExpression<Person>(@"{""<="":[""2022-08-01T16:46:00Z"",{""var"":""CreationTime""},""2022-08-04T16:47:00Z""]}");

            Assert.Equal(@"ent => ((ent.CreationTime >= 01/08/2022 4:46:00 PM) AndAlso (ent.CreationTime <= 04/08/2022 4:47:59 PM))", expression.ToString());
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

            Assert.Equal(@"ent => (ent.DateProp < 25/04/2021 12:00:00 AM)", expression.ToString());
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

            Assert.Equal(@"ent => (ent.DateProp <= 25/04/2021 11:59:59 PM)", expression.ToString());
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

            Assert.Equal(@"ent => (ent.DateProp > 25/04/2021 11:59:59 PM)", expression.ToString());
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

            Assert.Equal(@"ent => (ent.DateProp >= 25/04/2021 12:00:00 AM)", expression.ToString());
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

            Assert.Equal(@"ent => ((25/04/2021 12:00:00 AM <= ent.DateProp) AndAlso (ent.DateProp <= 25/04/2021 11:59:59 PM))", expression.ToString());
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

            Assert.Equal(@"ent => Not(((25/04/2021 12:00:00 AM <= ent.DateProp) AndAlso (ent.DateProp <= 25/04/2021 11:59:59 PM)))", expression.ToString());
        }

        [Fact]
        public void DateField_Between_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{""<="":[""2022-08-01T16:46:00Z"",{""var"":""DateProp""},""2022-08-04T16:47:00Z""]}");

            Assert.Equal(@"ent => ((ent.DateProp >= 01/08/2022 12:00:00 AM) AndAlso (ent.DateProp <= 04/08/2022 11:59:59 PM))", expression.ToString());
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

            Assert.Equal(@"ent => (ent.TimeProp < 02:34:00)", expression.ToString());
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

            Assert.Equal(@"ent => (ent.TimeProp <= 02:34:59.9990000)", expression.ToString());
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

            Assert.Equal(@"ent => (ent.TimeProp > 02:34:59.9990000)", expression.ToString());
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

            Assert.Equal(@"ent => (ent.TimeProp >= 02:34:00)", expression.ToString());
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

            Assert.Equal(@"ent => ((02:34:00 <= ent.TimeProp) AndAlso (ent.TimeProp <= 02:34:59.9990000))", expression.ToString());
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

            Assert.Equal(@"ent => Not(((02:34:00 <= ent.TimeProp) AndAlso (ent.TimeProp <= 02:34:59.9990000)))", expression.ToString());
        }

        [Fact]
        public void TimeField_Between_Convert()
        {
            var expression = ConvertToExpression<EntityWithDateProps>(@"{""<="":[3600,{""var"":""TimeProp""},7200]}");

            Assert.Equal(@"ent => ((ent.TimeProp >= 01:00:00) AndAlso (ent.TimeProp <= 02:00:59.9990000))", expression.ToString());
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

            Assert.Equal($@"ent => (ent.{nameof(ShaRolePermission.ShaRole)}.Id == ""852c4011-4e94-463a-9e0d-b0054ab88f7d"".ToGuid())", expression.ToString());            
        }

        [Fact]
        public async Task EntityReference_Equals_Fetch()
        {
            var data = await TryFetchData<ShaRolePermission, Guid>(_entityReference_Equals_expression);
            Assert.NotNull(data);
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

            Assert.Equal(@"ent => (ent.ShaRole == null)", expression.ToString());
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

            Assert.Equal($@"ent => (ent.ShaRole == null)", expression.ToString());
        }

        [Fact]
        public async Task EntityReference_IsNull_Fetch()
        {
            var data = await TryFetchData<ShaRolePermission, Guid>(_entityReference_IsNull_expression);
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

            Assert.Equal($@"ent => Not((ent.ShaRole == null))", expression.ToString());
        }

        [Fact]
        public async Task EntityReference_IsNotNull_Fetch()
        {
            var data = await TryFetchData<ShaRolePermission, Guid>(_entityReference_IsNotNull_expression);
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

            Assert.Equal(@"ent => ((ent.ShaRole.Id == ""852c4011-4e94-463a-9e0d-b0054ab88f7d"".ToGuid()) OrElse ((ent.ShaRole.LastModificationTime > Convert(25/04/2021 8:13:59 AM, Nullable`1)) AndAlso (ent.IsGranted == False)))", expression.ToString());
        }

        [Fact]
        public async Task ComplexExpression_Fetch()
        {
            var data = await TryFetchData<ShaRolePermission, Guid>(_entityReference_Equals_expression);
            Assert.NotNull(data);
        }

        #endregion

        #region sorting

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_Asc()
        {
            var data = await TryFetchData<ShaRolePermission, Guid>(_entityReference_Equals_expression, queryable => 
                queryable.OrderBy(nameof(ShaRolePermission.Permission))
            );

            Assert.NotNull(data);

            data.Should().BeInAscendingOrder(e => e.Permission);
        }

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_Desc()
        {
            var data = await TryFetchData<ShaRolePermission, Guid>(_entityReference_Equals_expression, queryable =>
                queryable.OrderByDescending(nameof(ShaRolePermission.Permission))
            );

            Assert.NotNull(data);

            data.Should().BeInDescendingOrder(e => e.Permission);
        }

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_NestedEntity_Property_Asc()
        {
            await TryFetchData<ShaRolePermission, Guid>(_entityReference_Equals_expression, 
                queryable => queryable.OrderBy($"{nameof(ShaRolePermission.ShaRole)}.{nameof(ShaRolePermission.ShaRole.Name)}"),
                data => {
                    Assert.NotNull(data);
                    
                    var roleNames = data.Select(e => e.ShaRole?.Name).ToList();
                    roleNames.Should().BeInAscendingOrder(e => e);
                }
            );
        }

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_Title_Asc()
        {
            await TryFetchData<User, Int64>(_booleanField_NotEquals_expression,
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
            Assert.Equal(@"ent => (Convert(ent.Title, Int64) == 1)", expression.ToString());
        }

        [Fact]
        public void NullableReflistField_Equals_Convert()
        {
            var expression = ConvertToExpression<EntityWithRefListrops>(@"{""and"":[{""=="":[{""var"":""nullableTitle""},1]}]}");
            Assert.Equal(@"ent => (Convert(ent.NullableTitle, Nullable`1) == Convert(1, Nullable`1))", expression.ToString());
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
            Assert.Equal(@"ent => (((Convert(ent.Title, Nullable`1) == Convert(1, Nullable`1)) OrElse (Convert(ent.Title, Nullable`1) == Convert(2, Nullable`1))) OrElse (Convert(ent.Title, Nullable`1) == Convert(3, Nullable`1)))", expression.ToString());
        }

        [Fact]
        public async Task NullableReflistField_Contains_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_nullable_reflistField_Contains_expression);
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
        public void entityReference_In_Convert()
        {
            var expression = ConvertToExpression<Person>(_entityReference_In_Convert_expression);
            Assert.Equal(@"ent => ((ent.Id == ""24007BA5-697B-417C-91BA-ED92F3F31F3A"".ToGuid()) OrElse (ent.Id == ""D197A7B3-5505-430C-9D98-CD64F1A638FA"".ToGuid()))", expression.ToString());
        }

        [Fact]
        public async Task entityReference_In_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_entityReference_In_Convert_expression);
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
                Assert.Equal(expected, expression.ToString());
            }
        }

        [Fact]
        public async Task Custom_Date_Funcs_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_custom_date_funcs_Convert_expression);
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
            Assert.Equal(expected, expression.ToString());
        }

        [Fact]
        public async Task Custom_String_Funcs_Fetch()
        {
            var data = await TryFetchData<Person, Guid>(_custom_string_funcs_Convert_expression);
            Assert.NotNull(data);
        }

        #endregion

        public class EntityWithRefListrops : Entity<Guid> 
        { 
            public virtual RefListPersonTitle Title { get; set; }
            public virtual RefListPersonTitle? NullableTitle { get; set; }
        }

        public class EntityWithDateProps: Entity<Guid> 
        {
            public virtual DateTime? NullableDateTimeProp { get; set; }

            [DataType(DataType.Date)]
            public virtual DateTime? NullableDateProp { get; set; }

            public virtual TimeSpan? NullableTimeProp { get; set; }

            public virtual DateTime DateTimeProp { get; set; }

            [DataType(DataType.Date)]
            public virtual DateTime DateProp { get; set; }
            
            public virtual TimeSpan TimeProp { get; set; }
            public virtual int IntProp { get; set; }
            public virtual int? NullableIntProp { get; set; }
        }

        private IDisposable FreezeTime() 
        {
            // save current provider
            var prevProvider = Clock.Provider;

            // change current provider to static
            Clock.Provider = new StaticClockProvider();

            // return compensation logic
            return new DisposeAction(() => {
                Clock.Provider = prevProvider;
            });            
        }
    }
}