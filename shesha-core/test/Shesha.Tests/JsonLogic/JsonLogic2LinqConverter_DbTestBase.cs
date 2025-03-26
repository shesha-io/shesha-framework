using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Linq;
using FluentAssertions;
using Shesha.Domain;
using Shesha.Enterprise.Tests.Fixtures;
using Shesha.Extensions;
using Shesha.JsonLogic;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Tests.JsonLogic.Models;
using Shesha.Tests.JsonLogic.TestExpressions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.JsonLogic
{
    public abstract class JsonLogic2LinqConverter_DbTestBase : JsonLogic2LinqConverter_TestsBase
    {
        protected JsonLogic2LinqConverter_DbTestBase(IDatabaseFixture fixture) : base(fixture)
        {
        }

        protected async Task<List<T>> TryFetchDataAsync<T, TId>(string jsonLogicExpression, Func<IQueryable<T>, IQueryable<T>>? prepareQueryable = null, Action<List<T>>? assertions = null) where T : class, IEntity<TId>
        {
            var expression = ConvertToExpression<T>(jsonLogicExpression).NotNull();

            var repository = LocalIocManager.Resolve<IRepository<T, TId>>();
            var asyncExecuter = LocalIocManager.Resolve<IAsyncQueryableExecuter>();

            return await WithUnitOfWorkAsync(async () => {
                var query = repository.GetAll().Where(expression);

                if (prepareQueryable != null)
                    query = prepareQueryable.Invoke(query);

                var data = await asyncExecuter.ToListAsync(query);

                assertions?.Invoke(data);

                return data;
            });
        }

        #region string operations

        [Fact]
        public async Task Custom_String_Funcs_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(StringExpressions.CustomFunctions);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task StringField_Equals_ToValue_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(StringExpressions.EqualToValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task StringField_NotEquals_ToValue_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(StringExpressions.NotEqualToValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task StringField_Like_Value_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(StringExpressions.LikeValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task StringField_NotLike_Value_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(StringExpressions.NotLikeValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task StringField_IsEmpty_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(StringExpressions.FieldIsEmpty);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task StringField_IsNotEmpty_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(StringExpressions.FieldIsNotEmpty);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task StringField_StartsWith_Value_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(StringExpressions.FieldStartsWithValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task StringField_EndsWith_Value_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(StringExpressions.FieldEndsWithValue);
            Assert.NotNull(data);
        }

        [Theory]
        [InlineData("Equal", StringExpressions.EqualToField)]
        [InlineData("Equal Nested", StringExpressions.EqualToNestedField)]
        [InlineData("NotEqual", StringExpressions.NotEqualToField)]
        public async Task StringField_FetchAsync(string name, string jsonLogicExpression)
        {
            Console.WriteLine($"Test: '{name}'");

            var data = await TryFetchDataAsync<Person, Guid>(jsonLogicExpression);
            Assert.NotNull(data);
        }

        #endregion

        #region number


        [Fact]
        public async Task Int64Field_Equals_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(NumberExpressions.Int64FieldEqualsToValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task Int64Field_LessThan_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(NumberExpressions.Int64FieldLessThanValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task Int64Field_LessThanOrEqual_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(NumberExpressions.Int64FieldLessThanOrEqualToValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task Int64Field_GreaterThan_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(NumberExpressions.Int64FieldGreaterThanValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task Int64Field_GreaterThanOrEqual_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(NumberExpressions.Int64FieldGreaterThanOrEqualToValue);
            Assert.NotNull(data);
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

        [Fact]
        public async Task Custom_Date_Funcs_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(DateExpressions.CustomDateAddFunction);
            Assert.NotNull(data);
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

        [Fact]
        public async Task BooleanField_Equals_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(BoolExpressions.EqualsToValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task BooleanField_NotEquals_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(BoolExpressions.NotEqualsToValue);
            Assert.NotNull(data);
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

        [Fact]
        public async Task EntityReference_In_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(EntityExpressions.FieldInValues);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task NestedColumnResolver_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(ComplexExpressions.NestedStringFieldEquals);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task EntityReference_Equals_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(EntityExpressions.FieldEqualToValue);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task EntityReference_IsNull_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(EntityExpressions.FieldIsNull);
            Assert.NotNull(data);
        }

        [Fact]
        public async Task EntityReference_IsNotNull_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(EntityExpressions.FieldIsNotNull);
            Assert.NotNull(data);
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

        [Fact]
        public async Task NullableReflistField_Contains_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(RefListExpressions.NullableFieldContainsValue);
            Assert.NotNull(data);
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

        #region complex expressions

        [Fact]
        public async Task ComplexExpression_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(EntityExpressions.FieldEqualToValue);
            Assert.NotNull(data);
        }

        #endregion

        #region sorting

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_AscAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(EntityExpressions.FieldEqualToValue, queryable =>
                queryable.OrderBy(nameof(Person.FirstName))
            );

            Assert.NotNull(data);

            data.Should().BeInAscendingOrder(e => e.FirstName);
        }

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_DescAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(EntityExpressions.FieldEqualToValue, queryable =>
                queryable.OrderByDescending(nameof(Person.FirstName))
            );

            Assert.NotNull(data);

            data.Should().BeInDescendingOrder(e => e.FirstName);
        }

        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_NestedEntity_Property_AscAsync()
        {
            await TryFetchDataAsync<Person, Guid>(EntityExpressions.FieldEqualToValue,
                queryable => queryable.OrderBy($"{nameof(Person.User)}.{nameof(Person.User.UserName)}"),
                data => {
                    Assert.NotNull(data);

                    var userNames = data.Select(e => e.User?.UserName).ToList();
                    userNames.Should().BeInAscendingOrder(e => e);
                }
            );
        }
        /*
        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_TypeOfAccount_AscAsync()
        {
            await TryFetchDataAsync<Person, Guid>(BoolExpressions.NotEqualsToValue,
                queryable => queryable.OrderBy($"{nameof(Person.User)}.{nameof(Person.User.TypeOfAccount)}"),
                data => {
                    Assert.NotNull(data);

                    var refListHelper = Resolve<IReferenceListHelper>();

                    var titlesWithDisplayText = data.Select(e =>
                    {
                        var displayText = e.User?.TypeOfAccount != null
                            ? refListHelper.GetItemDisplayText(new ReferenceListIdentifier("Shesha", "Shesha.Framework.TypeOfAccount"), (Int64)e.User.TypeOfAccount.Value)
                            : null;

                        return new
                        {
                            ItemValue = (Int64?)e.User?.TypeOfAccount,
                            ItemText = displayText
                        };
                    })
                        .ToList();

                    titlesWithDisplayText.Should().BeInAscendingOrder(e => e.ItemText);
                }
            );
        }
        */
        [Fact]
        public async Task ComplexExpression_Fetch_SortBy_Title_AscAsync()
        {
            await TryFetchDataAsync<Person, Guid>(BoolExpressions.NotEqualsToValue,
                queryable => queryable.OrderBy($"{nameof(Person.Title)}"),
                data => {
                    Assert.NotNull(data);

                    var refListHelper = Resolve<IReferenceListHelper>();

                    var titlesWithDisplayText = data.Select(e =>
                    {
                        var displayText = e.Title != null
                            ? refListHelper.GetItemDisplayText(new ReferenceListIdentifier("Shesha.Core", "PersonTitles"), (Int64)e.Title.Value)
                            : null;

                        return new
                        {
                            ItemValue = (Int64?)e.Title,
                            ItemText = displayText
                        };
                    })
                        .ToList();

                    titlesWithDisplayText.Should().BeInAscendingOrder(e => e.ItemText);
                }
            );
        }

        #endregion

        #region reflist (to be moved to No DB)

        [Theory]
        [InlineData("Equal", RefListExpressions.Equal, @"ent => (Convert(ent.Gender, Nullable`1) == Convert(ent.Title, Nullable`1))")]
        [InlineData("NotEqual", RefListExpressions.NotEqual, @"ent => Not((Convert(ent.Gender, Nullable`1) == Convert(ent.Title, Nullable`1)))")]
        [InlineData("NullableFieldEqualsToValue", RefListExpressions.NullableFieldEqualsToValue, @"ent => (Convert(ent.Title, Nullable`1) == Convert(1, Nullable`1))")]
        [InlineData("FieldEqualsToValue", RefListExpressions.FieldEqualsToValue, @"ent => (Convert(ent.CustomTitle, Int64) == 1)")]
        [InlineData("NullableFieldContainsValue", RefListExpressions.NullableFieldContainsValue, @"ent => (((Convert(ent.Title, Nullable`1) == Convert(1, Nullable`1)) OrElse (Convert(ent.Title, Nullable`1) == Convert(2, Nullable`1))) OrElse (Convert(ent.Title, Nullable`1) == Convert(3, Nullable`1)))")]
        public void RefList_Conversion(string name, string jsonLogicExpression, string expectation)
        {
            Console.WriteLine($"Test: '{name}'");

            var linqExpression = ConvertToExpression<PersonWithCustomProps>(jsonLogicExpression);
            Assert.Equal(expectation, linqExpression?.ToInvariantString());
        }

        #endregion
    }
}
