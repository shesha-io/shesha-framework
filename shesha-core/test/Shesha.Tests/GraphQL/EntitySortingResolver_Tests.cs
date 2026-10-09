#nullable enable
using Shesha.GraphQL.Provider.Queries;
using Shouldly;
using System.ComponentModel;
using System.Linq;
using Xunit;

namespace Shesha.Tests.GraphQL
{
    /// <summary>
    /// Tests for issue #5592: entity sorting must stay predictable when sorting by the display name of an entity
    /// without a display name property, and must not fail on properties that are not mapped to the database.
    /// </summary>
    public class EntitySortingResolver_Tests
    {
        private const string IdProp = "Id";

        private static bool AllMapped(string column) => true;

        [Fact]
        public void DisplayName_Maps_To_DisplayNameProperty()
        {
            var result = EntitySortingResolver.Resolve("_displayName asc", "FullName", AllMapped, IdProp);

            result.Columns.ShouldHaveSingleItem().ShouldBe(new ResolvedSortColumn("FullName", ListSortDirection.Ascending));
            result.SkippedColumns.ShouldBeEmpty();
        }

        [Theory]
        [InlineData("_displayName asc", ListSortDirection.Ascending)]
        [InlineData("_displayName desc", ListSortDirection.Descending)]
        [InlineData("_displayName", ListSortDirection.Ascending)]
        public void DisplayName_Without_DisplayNameProperty_Falls_Back_To_Id(string sorting, ListSortDirection expectedDirection)
        {
            var result = EntitySortingResolver.Resolve(sorting, null, AllMapped, IdProp);

            result.Columns.ShouldHaveSingleItem().ShouldBe(new ResolvedSortColumn(IdProp, expectedDirection));
        }

        [Fact]
        public void Not_Mapped_Column_Is_Skipped_And_Falls_Back_To_Id()
        {
            var result = EntitySortingResolver.Resolve("computedName asc", null, c => c != "computedName", IdProp);

            result.Columns.ShouldHaveSingleItem().ShouldBe(new ResolvedSortColumn(IdProp, ListSortDirection.Ascending));
            result.SkippedColumns.ShouldBe(new[] { "computedName" });
        }

        [Fact]
        public void Not_Mapped_Column_Is_Skipped_And_Other_Columns_Are_Kept()
        {
            var result = EntitySortingResolver.Resolve("gender asc, computedName desc, lastName desc", null, c => c != "computedName", IdProp);

            result.Columns.Select(c => c.Column).ShouldBe(new[] { "gender", "lastName" });
            result.Columns.Last().Direction.ShouldBe(ListSortDirection.Descending);
            result.SkippedColumns.ShouldBe(new[] { "computedName" });
        }

        [Fact]
        public void Not_Mapped_DisplayNameProperty_Falls_Back_To_Id()
        {
            var result = EntitySortingResolver.Resolve("_displayName asc", "FullName", c => c != "FullName", IdProp);

            result.Columns.ShouldHaveSingleItem().ShouldBe(new ResolvedSortColumn(IdProp, ListSortDirection.Ascending));
            result.SkippedColumns.ShouldBe(new[] { "FullName" });
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void Empty_Sorting_Returns_No_Columns(string? sorting)
        {
            var result = EntitySortingResolver.Resolve(sorting, "FullName", AllMapped, IdProp);

            result.Columns.ShouldBeEmpty();
            result.SkippedColumns.ShouldBeEmpty();
        }
    }
}
