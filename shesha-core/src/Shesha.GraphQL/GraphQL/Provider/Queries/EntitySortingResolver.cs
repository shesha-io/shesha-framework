using Shesha.Configuration.Runtime;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace Shesha.GraphQL.Provider.Queries
{
    /// <summary>
    /// Sort column resolved from a sorting string
    /// </summary>
    /// <param name="Column">Property path to sort by</param>
    /// <param name="Direction">Sort direction</param>
    public record ResolvedSortColumn(string Column, ListSortDirection Direction);

    /// <summary>
    /// Result of sorting resolution
    /// </summary>
    /// <param name="Columns">Columns to sort by, in order</param>
    /// <param name="SkippedColumns">Requested columns that were dropped because they are not mapped to the database</param>
    public record SortingResolution(List<ResolvedSortColumn> Columns, List<string> SkippedColumns);

    /// <summary>
    /// Resolves a sorting string (e.g. "Property1 asc, Property2 desc") into columns that can be applied to an entity query
    /// </summary>
    public static class EntitySortingResolver
    {
        /// <summary>
        /// Resolve <paramref name="sorting"/>: maps <see cref="EntityConstants.DisplayNameField"/> to the display name property
        /// (or to <paramref name="idPropertyName"/> when the entity has none) and drops columns that are not mapped to the database.
        /// When every requested column is dropped, the result falls back to <paramref name="idPropertyName"/> ascending so the order stays predictable.
        /// </summary>
        /// <param name="sorting">Sorting string</param>
        /// <param name="displayNamePropertyName">Name of the entity display name property, null if the entity has none</param>
        /// <param name="isMapped">Returns false for a column that is known not to be mapped to the database (computed/non-persisted)</param>
        /// <param name="idPropertyName">Name of the Id property</param>
        public static SortingResolution Resolve(string? sorting, string? displayNamePropertyName, Func<string, bool> isMapped, string idPropertyName)
        {
            var columns = new List<ResolvedSortColumn>();
            var skipped = new List<string>();

            if (string.IsNullOrWhiteSpace(sorting))
                return new SortingResolution(columns, skipped);

            var sortColumns = sorting.Split(',').Select(c => c.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));
            foreach (var sortColumn in sortColumns)
            {
                var column = sortColumn.LeftPart(' ', ProcessDirection.LeftToRight);
                if (string.IsNullOrWhiteSpace(column))
                    continue;

                // fall back to Id when the entity has no display name property
                if (column == EntityConstants.DisplayNameField)
                    column = displayNamePropertyName ?? idPropertyName;

                if (!isMapped(column))
                {
                    skipped.Add(column);
                    continue;
                }

                var direction = sortColumn.RightPart(' ', ProcessDirection.LeftToRight)?.Trim().Equals("desc", StringComparison.InvariantCultureIgnoreCase) == true
                    ? ListSortDirection.Descending
                    : ListSortDirection.Ascending;

                columns.Add(new ResolvedSortColumn(column, direction));
            }

            if (!columns.Any() && skipped.Any())
                columns.Add(new ResolvedSortColumn(idPropertyName, ListSortDirection.Ascending));

            return new SortingResolution(columns, skipped);
        }
    }
}
