namespace Shesha.DynamicEntities.Dtos
{
    public class MergeConfigurationDto
    {
        public string SourceId { get; set; }

        public string DestinationId { get; set; }

        public bool DeleteAfterMerge { get; set; }
    }
}
