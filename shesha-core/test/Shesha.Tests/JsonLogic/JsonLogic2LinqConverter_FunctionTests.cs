using FluentAssertions;
using Newtonsoft.Json.Linq;
using Shesha.Domain;
using Shesha.JsonLogic;
using Shesha.Testing.Fixtures;
using Shesha.Tests.JsonLogic.Models;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.JsonLogic
{
    /// <summary>
    /// Functions over the row: string, arithmetic and date-part operators the query builder emits when an expression only reads columns and literals
    /// </summary>
    [Collection(PostgreSqlCollection.Name)]
    public class JsonLogic2LinqConverter_FunctionTests : JsonLogic2LinqConverterBaseTests
    {
        public JsonLogic2LinqConverter_FunctionTests(PostgreSqlFixture fixture) : base(fixture)
        {
        }

        #region string functions

        [Fact]
        public void Cat_Convert()
        {
            var expression = ConvertToExpression<Person>(@"{""=="":[{""cat"":[{""var"":""FirstName""},"" "",{""var"":""LastName""}]},""Bob Smith""]}");
            Assert.Equal(@"ent => (((ent.FirstName + "" "") + ent.LastName) == ""Bob Smith"")", expression?.ToInvariantString());
        }

        [Fact]
        public async Task Cat_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(@"{""in"":[""o"",{""cat"":[{""var"":""FirstName""},"" "",{""var"":""LastName""}]}]}");
            data.Should().NotBeEmpty();
            data.Should().OnlyContain(p => (p.FirstName + " " + p.LastName).Contains("o", StringComparison.OrdinalIgnoreCase));
        }

        [Fact]
        public void Substr_Convert()
        {
            var expression = ConvertToExpression<Person>(@"{""=="":[{""substr"":[{""var"":""FirstName""},0,3]},""Bob""]}");
            Assert.Equal(@"ent => (ent.FirstName.Substring(0, 3) == ""Bob"")", expression?.ToInvariantString());
        }

        [Fact]
        public void Substr_NegativeStart_IsRejected()
        {
            Assert.Throws<NotSupportedException>(() => ConvertToExpression<Person>(@"{""=="":[{""substr"":[{""var"":""FirstName""},-2]},""ob""]}"));
        }

        [Fact]
        public void Length_Convert()
        {
            var expression = ConvertToExpression<Person>(@"{"">"":[{""length"":[{""var"":""FirstName""}]},3]}");
            Assert.Equal(@"ent => (ent.FirstName.Length > 3)", expression?.ToInvariantString());
        }

        [Fact]
        public async Task Length_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(@"{"">"":[{""length"":[{""var"":""FirstName""}]},3]}");
            data.Should().NotBeEmpty();
            data.Should().OnlyContain(p => p.FirstName != null && p.FirstName.Length > 3);
        }

        [Fact]
        public void TrimAndUpper_Convert()
        {
            var expression = ConvertToExpression<Person>(@"{""=="":[{""toUpperCase"":[{""trim"":[{""var"":""FirstName""}]}]},""BOB""]}");
            Assert.Equal(@"ent => (ent.FirstName.Trim().ToUpper() == ""BOB"")", expression?.ToInvariantString());
        }

        #endregion

        #region arithmetic

        [Fact]
        public void Add_Convert()
        {
            var expression = ConvertToExpression<EntityWithNumericProp<int>>(@"{"">"":[{""+"":[{""var"":""NotNullableNumeric""},1]},5]}");
            Assert.Equal(@"ent => ((ent.NotNullableNumeric + 1) > 5)", expression?.ToInvariantString());
        }

        [Fact]
        public void Divide_PromotesIntegralsToDecimal_Convert()
        {
            var expression = ConvertToExpression<EntityWithNumericProp<int>>(@"{"">"":[{""/"":[{""var"":""NotNullableNumeric""},1000]},2.5]}");
            Assert.Equal(@"ent => ((Convert(ent.NotNullableNumeric, Decimal) / 1000) > 2.5)", expression?.ToInvariantString());
        }

        [Fact]
        public void Floor_Convert()
        {
            var expression = ConvertToExpression<EntityWithNumericProp<int>>(@"{""=="":[{""floor"":[{""/"":[{""var"":""NotNullableNumeric""},1000]}]},59]}");
            Assert.Equal(@"ent => (Floor((Convert(ent.NotNullableNumeric, Decimal) / 1000)) == 59)", expression?.ToInvariantString());
        }

        [Fact]
        public void Floor_OfIntegral_IsIdentity_Convert()
        {
            var expression = ConvertToExpression<EntityWithNumericProp<int>>(@"{""=="":[{""floor"":[{""var"":""NotNullableNumeric""}]},59]}");
            Assert.Equal(@"ent => (ent.NotNullableNumeric == 59)", expression?.ToInvariantString());
        }

        [Fact]
        public void Abs_Convert()
        {
            var expression = ConvertToExpression<EntityWithNumericProp<decimal>>(@"{""<"":[{""abs"":[{""-"":[{""var"":""NotNullableNumeric""},10]}]},2]}");
            Assert.Equal(@"ent => (Abs((ent.NotNullableNumeric - 10)) < 2)", expression?.ToInvariantString());
        }

        [Fact]
        public void Modulo_Convert()
        {
            var expression = ConvertToExpression<EntityWithNumericProp<int>>(@"{""=="":[{""%"":[{""var"":""NotNullableNumeric""},2]},0]}");
            Assert.Equal(@"ent => ((ent.NotNullableNumeric % 2) == 0)", expression?.ToInvariantString());
        }

        [Fact]
        public void Round_WithDigits_Convert()
        {
            var expression = ConvertToExpression<EntityWithNumericProp<double>>(@"{""=="":[{""round"":[{""var"":""NotNullableNumeric""},1]},2.5]}");
            Assert.Equal(@"ent => (Round(ent.NotNullableNumeric, 1) == 2.5)", expression?.ToInvariantString());
        }

        [Fact]
        public void Arithmetic_OnStrings_IsRejected()
        {
            Assert.Throws<NotSupportedException>(() => ConvertToExpression<Person>(@"{""=="":[{""+"":[{""var"":""FirstName""},1]},5]}"));
        }

        #endregion

        #region date parts

        [Fact]
        public void Year_OfNullableDate_Convert()
        {
            var expression = ConvertToExpression<Person>(@"{""=="":[{""year"":[{""var"":""DateOfBirth""}]},1990]}");
            Assert.Equal(@"ent => (Convert(ent.DateOfBirth, DateTime).Year == 1990)", expression?.ToInvariantString());
        }

        [Fact]
        public void Month_Convert()
        {
            var expression = ConvertToExpression<Person>(@"{""=="":[{""month"":[{""var"":""CreationTime""}]},9]}");
            Assert.Equal(@"ent => (ent.CreationTime.Month == 9)", expression?.ToInvariantString());
        }

        [Fact]
        public async Task Year_FetchAsync()
        {
            var year = DateTime.Now.Year;
            var data = await TryFetchDataAsync<Person, Guid>($@"{{""=="":[{{""year"":[{{""var"":""CreationTime""}}]}},{year}]}}");
            data.Should().OnlyContain(p => p.CreationTime.Year == year);
        }

        [Fact]
        public void DatePart_OfString_IsRejected()
        {
            Assert.Throws<NotSupportedException>(() => ConvertToExpression<Person>(@"{""=="":[{""day"":[{""var"":""FirstName""}]},1]}"));
        }

        [Fact]
        public void DateAdd_Years_Convert()
        {
            var expression = ConvertToExpression<Person>(@"{"">="":[{""var"":""CreationTime""},{""date_add"":[{""now"":[]},-10,""year""]}]}");
            Assert.NotNull(expression);
            expression.Compile();
        }

        [Fact]
        public void DateAdd_Months_Convert()
        {
            var expression = ConvertToExpression<Person>(@"{"">="":[{""var"":""CreationTime""},{""date_add"":[{""now"":[]},-3,""month""]}]}");
            Assert.NotNull(expression);
            expression.Compile();
        }

        [Fact]
        public async Task DateAdd_Years_FetchAsync()
        {
            var data = await TryFetchDataAsync<Person, Guid>(@"{"">="":[{""var"":""CreationTime""},{""date_add"":[{""now"":[]},-100,""year""]}]}");
            data.Should().NotBeEmpty();
        }

        [Fact]
        public void Fold_ResolvesVarFreeFunctionNodes_AndKeepsTheRest()
        {
            var folder = Resolve<IJsonLogicConstantFolder>();
            var logic = JToken.Parse(@"{""and"":[{"">="":[{""var"":""CreationTime""},{""datetime_add"":[{""now"":[]},-2,""year""]}]}]}");

            var folded = folder.Fold(logic);

            var rule = folded["and"]!.First![">="]!;
            Assert.Equal("CreationTime", rule[0]!["var"]!.ToObject<string>());
            var constant = rule[1]!.ToObject<DateTime>();
            constant.Should().BeCloseTo(DateTime.Now.AddYears(-2), TimeSpan.FromMinutes(5));
        }

        [Fact]
        public void Fold_LeavesVarBasedFunctionsAndExpressionsUntouched()
        {
            var folder = Resolve<IJsonLogicConstantFolder>();
            var source = @"{""and"":[{""=="":[{""toUpperCase"":[{""var"":""FirstName""}]},""BOB""]},{"">="":[{""var"":""CreationTime""},{""evaluate"":[{""expression"":""{{NOW()}}"",""type"":""mustache""}]}]}]}";
            var logic = JToken.Parse(source);

            var folded = folder.Fold(logic);

            Assert.True(JToken.DeepEquals(logic, folded));
        }

        [Fact]
        public void Fold_ResolvesStringAndArithmeticConstants()
        {
            var folder = Resolve<IJsonLogicConstantFolder>();
            var logic = JToken.Parse(@"{""=="":[{""var"":""FirstName""},{""toUpperCase"":[{""cat"":[""bo"",""b""]}]}]}");

            var folded = folder.Fold(logic);

            Assert.Equal("BOB", folded["=="]![1]!.ToObject<string>());
        }

        [Fact]
        public void DateTimeAdd_IsAliasOfDateAdd_Convert()
        {
            var viaDateAdd = ConvertToExpression<Person>(@"{"">="":[{""var"":""CreationTime""},{""date_add"":[{""now"":[]},-2,""year""]}]}");
            var viaDateTimeAdd = ConvertToExpression<Person>(@"{"">="":[{""var"":""CreationTime""},{""datetime_add"":[{""now"":[]},-2,""year""]}]}");
            Assert.Equal(viaDateAdd?.ToInvariantString(), viaDateTimeAdd?.ToInvariantString());
        }

        #endregion
    }
}
