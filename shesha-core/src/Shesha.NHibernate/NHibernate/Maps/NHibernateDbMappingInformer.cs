using Abp.Dependency;
using NHibernate;
using NHibernate.Persister.Entity;
using Shesha.Services;
using System;
using System.Linq;
using System.Reflection;

namespace Shesha.NHibernate.Maps
{
    /// <summary>
    /// NHibernate database mapping informer
    /// </summary>
    public class NHibernateDbMappingInformer : IDbMappingInformer, ITransientDependency
    {
        private static object _isMappedLock = new object();
        private readonly ISessionFactory _sessionFactory;

        public NHibernateDbMappingInformer(ISessionFactory sessionFactory)
        {
            _sessionFactory = sessionFactory;
        }

        public bool IsMappedEntity(Type entityType, PropertyInfo property)
        {
            var metadata = _sessionFactory.GetClassMetadata(entityType) as SingleTableEntityPersister;

            var isMapped = metadata != null
                ? metadata.PropertyNames.Contains(property.Name)
                : false;
            return isMapped;
        }
    }
}
