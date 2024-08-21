namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Entity configuration DTO
    /// </summary>
    public class EntityConfigurationDto : EntityApiItemBase
    {
        public EntityApiItemBase Module { get; set; }
    }

    public class EntityApiItemBase
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Accessor { get; set; }
    }
}
