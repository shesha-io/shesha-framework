using Shesha.FluentMigrator;
using Shesha.Utilities;

namespace Shesha.Domain.Conventions
{
    /// <summary>
    /// snake_case naming conventions
    /// </summary>
    public class SnakeCaseNamingConventions : INamingConventions
    {
        /// inheritedDoc
        public string? DbNamesExpression => $"{nameof(SnakeCaseDbObjectNames)}.{nameof(SnakeCaseDbObjectNames.Instance)}";

        /// inheritedDoc
        public string GetColumnName(string prefix, string propertyName, string? suffix)
        {
            return $"{ConvertPrefix(prefix)}{propertyName.ToSnakeCase()}{ConvertSuffix(suffix)}";
        }

        private string ConvertPrefix(string prefix) 
        {
            return string.IsNullOrWhiteSpace(prefix)
                ? prefix
                : prefix.ToSnakeCase().TrimEnd('_') + "_";
        }

        private string? ConvertSuffix(string? suffix)
        {
            return string.IsNullOrWhiteSpace(suffix)
                ? suffix
                : "_" + suffix.ToSnakeCase().TrimStart('_');
        }

        /// inheritedDoc
        public string GetTableName(string prefix, string className)
        {
            return $"{prefix}{className}".ToSnakeCase();
        }
    }
}
