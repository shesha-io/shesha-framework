using Shesha.FluentMigrator;

namespace Shesha.Domain.Conventions
{
    /// <summary>
    /// DB objects naming conventions
    /// </summary>
    public interface INamingConventions
    {
        /// <summary>
        /// Get DB column name
        /// </summary>
        /// <param name="prefix">Column prefix</param>
        /// <param name="propertyName">Property name</param>
        /// <param name="suffix">Suffix</param>
        /// <returns></returns>
        string GetColumnName(string prefix, string propertyName, string? suffix);

        /// <summary>
        /// Get DB table name
        /// </summary>
        /// <param name="prefix">Table prefix</param>
        /// <param name="className">Class name or plural</param>
        /// <returns></returns>
        string GetTableName(string prefix, string className);

        /// <summary>
        /// Get DBNames expresison (expresison that return instance of <see cref="IDbObjectNames"/>), is used in Fluent Migrator helpers
        /// </summary>
        string? DbNamesExpression { get; }
    }
}
