namespace Shesha.Domain.EntityPropertyConfiguration
{
    public class EntityPropertyListConfiguration
    {
        public static readonly string ManyToMany = "many-to-many";
        public static readonly string ManyToOne = "many-to-one";

        public string? MappingType { get; set; }

        public string? ForeignProperty { get; set; }

        public EntityPropertyListDbMapping? DbMapping { get; set; }
    }

    public class EntityPropertyListDbMapping
    {
        public string? ManyToManyTableName { get; set; }

        public string? ManyToManyKeyColumnName { get; set; }

        public string? ManyToManyChildColumnName { get; set; }

        public string? ManyToManyInversePropertyName { get; set; }
    }
}
