namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// Stores information about mapping of entity to the database
    /// </summary>
    public class EntityMappingMetadata
    {
        public string TableName { get; set; }
        public string SubclassTableName { get; set; }
        public string DiscriminatorValue { get; set; }
        public bool IsMultiTable { get; set; }
    }
}
