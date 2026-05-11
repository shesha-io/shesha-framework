using Shesha.Extensions;
using System;
using Xunit;
using NewtonsoftJsonIgnore = Newtonsoft.Json.JsonIgnoreAttribute;
using StjJsonIgnore = System.Text.Json.Serialization.JsonIgnoreAttribute;
using StjJsonIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition;

namespace Shesha.Tests.Extensions
{
    public class SortingValidatorTests
    {
        private class Address
        {
            public string City { get; set; }

            [NewtonsoftJsonIgnore]
            public string SecretNote { get; set; }
        }

        private class TestEntity
        {
            public string Name { get; set; }

            public int Age { get; set; }

            public Address PrimaryAddress { get; set; }

            [NewtonsoftJsonIgnore]
            public string PasswordHash { get; set; }

            [StjJsonIgnore]
            public string ApiKey { get; set; }

            [StjJsonIgnore(Condition = StjJsonIgnoreCondition.Always)]
            public string AlwaysIgnored { get; set; }

            [StjJsonIgnore(Condition = StjJsonIgnoreCondition.Never)]
            public string NeverIgnored { get; set; }

            [StjJsonIgnore(Condition = StjJsonIgnoreCondition.WhenWritingNull)]
            public string SometimesIgnored { get; set; }

            [NewtonsoftJsonIgnore]
            public Address SensitiveAddress { get; set; }
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void EnsureSortingAllowed_NullOrWhitespace_DoesNotThrow(string sorting)
        {
            SortingValidator.EnsureSortingAllowed(typeof(TestEntity), sorting);
        }

        [Fact]
        public void EnsureSortingAllowed_NullEntityType_DoesNotThrow()
        {
            SortingValidator.EnsureSortingAllowed(null, "Name asc");
        }

        [Theory]
        [InlineData("Name")]
        [InlineData("Name asc")]
        [InlineData("Name desc")]
        [InlineData("name")]
        [InlineData("NAME ASC")]
        [InlineData("Age desc")]
        [InlineData("PrimaryAddress.City asc")]
        [InlineData("Name asc, Age desc")]
        [InlineData("Name, Age, PrimaryAddress.City desc")]
        public void EnsureSortingAllowed_AllowedProperties_DoesNotThrow(string sorting)
        {
            SortingValidator.EnsureSortingAllowed(typeof(TestEntity), sorting);
        }

        [Theory]
        [InlineData("PasswordHash")]
        [InlineData("PasswordHash asc")]
        [InlineData("passwordhash desc")]
        [InlineData("ApiKey")]
        [InlineData("AlwaysIgnored")]
        public void EnsureSortingAllowed_DirectIgnoredProperty_Throws(string sorting)
        {
            Assert.Throws<ArgumentException>(
                () => SortingValidator.EnsureSortingAllowed(typeof(TestEntity), sorting));
        }

        [Theory]
        [InlineData("SensitiveAddress.City")]
        [InlineData("SensitiveAddress.City asc")]
        [InlineData("PrimaryAddress.SecretNote")]
        [InlineData("PrimaryAddress.SecretNote desc")]
        public void EnsureSortingAllowed_DotPathTraversesIgnoredProperty_Throws(string sorting)
        {
            Assert.Throws<ArgumentException>(
                () => SortingValidator.EnsureSortingAllowed(typeof(TestEntity), sorting));
        }

        [Fact]
        public void EnsureSortingAllowed_MultiColumnWithOneIgnored_Throws()
        {
            Assert.Throws<ArgumentException>(
                () => SortingValidator.EnsureSortingAllowed(typeof(TestEntity), "Name asc, PasswordHash desc"));
        }

        [Theory]
        [InlineData("NeverIgnored")]
        [InlineData("NeverIgnored asc")]
        [InlineData("SometimesIgnored desc")]
        public void EnsureSortingAllowed_StjConditionalIgnore_DoesNotThrow(string sorting)
        {
            SortingValidator.EnsureSortingAllowed(typeof(TestEntity), sorting);
        }

        [Fact]
        public void EnsureSortingAllowed_UnknownProperty_DoesNotThrow()
        {
            SortingValidator.EnsureSortingAllowed(typeof(TestEntity), "DoesNotExist asc");
        }
    }
}
