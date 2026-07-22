using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Shesha.DynamicEntities;
using Shesha.Extensions;

namespace Shesha.AutoMapper.Dto
{
    /// <summary>
    /// Generic entity reference Dto
    /// </summary>
    /// <typeparam name="TPrimaryKey"></typeparam>
    public class EntityReferenceDto<TPrimaryKey> : EntityDto<TPrimaryKey>, IHasClassNameField, IHasDisplayNameField
    {
        public EntityReferenceDto()
        {

        }

        public EntityReferenceDto(TPrimaryKey id, string className, string? displayName = null)
        {
            Id = id;
            _displayName = displayName;
            _className = className;
        }

        public EntityReferenceDto(IEntity<TPrimaryKey> entity)
        {
            if (entity != null)
            {
                Id = entity.GetId();
                _displayName = entity.GetDisplayName();
                _className = entity.GetType().GetRequiredFullName();
            }
        }

        /// <summary>
        /// Entity display name
        /// </summary>
        public string? _displayName { get; init; }

        /// <summary>
        /// Entity class name
        /// </summary>
        public string? _className { get; internal set; }
    }
}
