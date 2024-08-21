namespace Shesha.FluentMigrator.ReferenceLists
{
    public class ReferenceListItemDefinition
    {
        public string Item { get; set; }

        public Int64 ItemValue { get; set; }

        public string? Description { get; set; }

        public Int64? OrderIndex { get; set; }

        public ReferenceListItemDefinition(Int64 itemValue, string item)
        {
            ItemValue = itemValue;
            Item = item;
        }
    }
}
