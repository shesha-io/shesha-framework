using Abp.Domain.Entities;
using AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Extensions;

namespace Shesha.DynamicEntities.Mapper
{
    /// <summary>
    /// Entity to EntityToEntityReferenceDto converter
    /// </summary>
    public class EntityToEntityReferenceDtoConverter<TEntity, TId> : ITypeConverter<TEntity?, EntityReferenceDto<TId>?> where TEntity : class, IEntity<TId>
    {
        public EntityReferenceDto<TId>? Convert(TEntity? source, EntityReferenceDto<TId>? destination, ResolutionContext context)
        {
            return source == null
                ? null
                : new EntityReferenceDto<TId> 
                    { 
                        Id = source.Id, 
                        _displayName = source.GetDisplayName(),
                        _className = source.GetClassName()
                    };
        }
    }
}
