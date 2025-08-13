namespace Shesha.Domain.Conventions
{
    /// <summary>
    /// Default naming conventions
    /// </summary>
    public class DefaultNamingConventions : INamingConventions
    {
        /// inheritedDoc
        public string? DbNamesExpression => null;

        /// inheritedDoc
        public string GetColumnName(string prefix, string propertyName, string? suffix)
        {
            return $"{prefix}{propertyName}{suffix}";
        }

        /// inheritedDoc
        public string GetTableName(string prefix, string className)
        {
            return $"{prefix}{className}";
        }
    }
}
