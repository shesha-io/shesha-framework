namespace Shesha.AutoMapper.Dto
{
    /// <summary>
    /// Generic Dto for an entity link
    /// </summary>
    public class EntityLinkDto
    {
        /// <summary>
        /// Id of the entity
        /// </summary>
        public virtual string EntityId { get; set; }

        /// <summary>
        /// Type short alias of the entity
        /// </summary>
        public virtual string EntityType { get; set; }
    }
}
