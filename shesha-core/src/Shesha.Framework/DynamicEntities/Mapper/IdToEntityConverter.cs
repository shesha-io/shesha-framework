using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using AutoMapper;
using Shesha.Services;
using System;

namespace Shesha.DynamicEntities.Mapper
{
    /// <summary>
    /// Id to Entity converter
    /// </summary>
    public class IdToEntityConverter<TEntity, TId> : ITypeConverter<TId, TEntity> where TEntity: class, IEntity<TId>
    {
        public TEntity Convert(TId source, TEntity destination, ResolutionContext context)
        {
            if (source == null || (source is Guid guid) && guid == Guid.Empty)
                return null;

            var repository = StaticContext.IocManager.Resolve<IRepository<TEntity, TId>>();

            return repository.FirstOrDefault(source);
        }
    }
}
