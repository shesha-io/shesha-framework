using Abp.Dependency;
using Abp.Domain.Entities;
using NHibernate;
using Shesha.Services;
using System;

namespace Shesha.NHibernate
{
    /// <summary>
    /// NHibernate entity type provider
    /// </summary>
    public class NhibernateEntityTypeProvider : IEntityTypeProvider, ITransientDependency
    {
        public Type GetEntityType<TEntity, TId>(TEntity entity) where TEntity : IEntity<TId>
        {
            return NHibernateUtil.GetClass(entity);
        }
    }
}
