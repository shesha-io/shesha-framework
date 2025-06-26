using Abp.Domain.Entities;
using AutoMapper;

namespace Shesha.DynamicEntities.Mapper
{
    /// <summary>
    /// Id to Entity converter
    /// </summary>
    public class EntityToIdConverter<TEntity, TId> : ITypeConverter<TEntity?, TId?> where TEntity: class, IEntity<TId>
    {
        public TId? Convert(TEntity? source, TId? destination, ResolutionContext context)
        {
            return source == null
                ? default(TId)
                : source.Id;
        }
    }
}
