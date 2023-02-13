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

        // ToDo: AS - swap displayName and className
        public EntityReferenceDto(TPrimaryKey id, string displayName, string className)
        {
            Id = id;
            _displayName = displayName;
            _className = className;
        }

        public EntityReferenceDto(IEntity<TPrimaryKey> entity)
        {
            if (entity != null)
            {
                Id = entity.GetId<TPrimaryKey>();
                _displayName = entity.GetDisplayName();
                _className = entity.GetType().FullName;
            }
        }

        /// <summary>
        /// Entity display name
        /// </summary>
        public string _displayName { get; internal set; }

        /// <summary>
        /// Entity class name
        /// </summary>
        public string _className { get; internal set; }
    }
}
