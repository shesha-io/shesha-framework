using Shesha.Utilities;

namespace Shesha.Domain.Conventions
{
    /// <summary>
    /// snake_case naming conventions
    /// </summary>
    public class SnakeCaseNamingConventions : INamingConventions
    {
        public SnakeCaseNamingConventions()
        {
                
        }

        public string GetColumnName(string prefix, string propertyName, string suffix)
        {
            return $"{ConvertPrefix(prefix)}{propertyName.ToSnakeCase()}{ConvertSuffix(suffix)}";
        }

        private string ConvertPrefix(string prefix) 
        {
            return string.IsNullOrWhiteSpace(prefix)
                ? prefix
                : prefix.ToSnakeCase().TrimEnd('_') + "_";
        }

        private string ConvertSuffix(string suffix)
        {
            return string.IsNullOrWhiteSpace(suffix)
                ? suffix
                : "_" + suffix.ToSnakeCase().TrimStart('_');
        }

        public string GetTableName(string className)
        {
            return className.ToSnakeCase();
        }
    }
}
