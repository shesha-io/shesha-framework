using Shesha.Extensions;
using System;
using Xunit;

namespace Shesha.Tests.Security
{
    /// <summary>
    /// Issue #4774: dynamic LINQ sorting must not allow ordering by properties
    /// marked with [JsonIgnore], otherwise an authenticated user can observe
    /// the ordering of sensitive fields (e.g. password hashes) reachable via
    /// navigation properties — the JsonIgnore filter on metadata/GraphQL types
    /// alone does not cover the sort path.
    /// </summary>
    public class SortingValidator_Tests
    {
        public class SampleNested
        {
            public virtual string Visible { get; set; }

            [Newtonsoft.Json.JsonIgnore]
            public virtual string SecretNewtonsoft { get; set; }

            [System.Text.Json.Serialization.JsonIgnore]
            public virtual string SecretSystemTextJson { get; set; }
        }

        public class SampleEntity
        {
            public virtual string Name { get; set; }
            public virtual SampleNested Child { get; set; }

            [Newtonsoft.Json.JsonIgnore]
            public virtual SampleNested Hidden { get; set; }
        }

        [Theory]
        [InlineData("Name")]
        [InlineData("Name asc")]
        [InlineData("Name desc")]
        [InlineData("Name asc, Child.Visible desc")]
        [InlineData("")]
        [InlineData(null)]
        public void EnsureSortingAllowed_AllowsVisibleProperties(string sorting)
        {
            SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), sorting);
        }

        [Theory]
        [InlineData("Hidden")]
        [InlineData("Hidden desc")]
        [InlineData("Hidden.Visible")]
        [InlineData("Name asc, Hidden desc")]
        public void EnsureSortingAllowed_RejectsJsonIgnoreNavigation(string sorting)
        {
            Assert.Throws<ArgumentException>(() =>
                SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), sorting));
        }

        [Theory]
        [InlineData("Child.SecretNewtonsoft")]
        [InlineData("Child.SecretSystemTextJson")]
        [InlineData("Child.SecretNewtonsoft desc")]
        public void EnsureSortingAllowed_RejectsJsonIgnoreLeaf(string sorting)
        {
            Assert.Throws<ArgumentException>(() =>
                SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), sorting));
        }

        [Fact]
        public void EnsureSortingAllowed_IsCaseInsensitive()
        {
            Assert.Throws<ArgumentException>(() =>
                SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), "hidden"));
        }

        [Fact]
        public void EnsureSortingAllowed_IgnoresUnknownProperties()
        {
            // Unknown segments are left for the actual OrderBy call to surface
            // a clearer error — the validator only blocks known-but-hidden fields.
            SortingValidator.EnsureSortingAllowed(typeof(SampleEntity), "DoesNotExist");
        }
    }
}
