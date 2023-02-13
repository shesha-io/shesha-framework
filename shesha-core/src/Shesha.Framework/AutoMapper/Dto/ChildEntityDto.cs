using Abp.Application.Services.Dto;

namespace Shesha.AutoMapper.Dto
{
    /// <summary>
    /// Generic Dto for an entity that has an link to other entity as owner
    /// </summary>
    public class ChildEntityDto<TId> : EntityDto<TId>
    {
        /// <summary>
        /// Id of the owning entity
        /// </summary>
        public virtual string OwnerId { get; set; }

        /// <summary>
        /// Type short alias of the owning entity
        /// </summary>
        public virtual string OwnerType { get; set; }
    }
}
