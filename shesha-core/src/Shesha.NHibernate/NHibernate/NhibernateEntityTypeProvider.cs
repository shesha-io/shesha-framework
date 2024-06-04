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
        public Type GetEntityType<TId>(IEntity<TId> entity)
        {
            return NHibernateUtil.GetClass(entity);
        }
    }
}
