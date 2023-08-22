namespace Shesha.Domain.Conventions
{
    /// <summary>
    /// DB objects naming conventions
    /// </summary>
    public interface INamingConventions
    {
        string GetColumnName(string prefix, string propertyName, string suffix);
        string GetTableName(string className);
    }
}
