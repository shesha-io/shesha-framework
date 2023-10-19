using Shesha.Utilities;

namespace Shesha.Domain.Conventions
{
    /// <summary>
    /// Default naming conventions
    /// </summary>
    public class DefaultNamingConventions : INamingConventions
    {
        public string GetColumnName(string prefix, string propertyName, string suffix)
        {
            return $"{prefix}{propertyName}{suffix}";
        }

        public string GetTableName(string className)
        {
            return className.ToSnakeCase();
        }
    }
}
