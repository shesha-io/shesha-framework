namespace Shesha.Configuration.MappingMetadata
{
    /// <summary>
    /// Property mapping metadata
    /// </summary>
    public class PropertyMappingMetadata
    {
        public required string TableName { get; init; }
        public required string[] ColumnNames { get; init; }
    }
}
