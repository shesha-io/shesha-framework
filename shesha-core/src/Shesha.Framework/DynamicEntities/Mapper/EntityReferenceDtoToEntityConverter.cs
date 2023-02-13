using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Services;
using System;
using System.Linq;

namespace Shesha.DynamicEntities.Mapper
{
    /// <summary>
    /// EntityReferenceDto to Entity converter
    /// </summary>
    public class EntityReferenceDtoToEntityConverter<TEntity, TId> : ITypeConverter<EntityReferenceDto<TId>, TEntity> where TEntity: class, IEntity<TId>
    {
        public TEntity Convert(EntityReferenceDto<TId> source, TEntity destination, ResolutionContext context)
        {
            if (source == null || (source.Id is Guid guid) && guid == Guid.Empty)
                return null;

            var repository = StaticContext.IocManager.Resolve<IRepository<TEntity, TId>>();

            return repository.FirstOrDefault(source.Id);
        }
    }
}
