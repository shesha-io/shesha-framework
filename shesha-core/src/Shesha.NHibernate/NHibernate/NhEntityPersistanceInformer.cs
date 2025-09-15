using Abp.Domain.Entities;
using Shesha.NHibernate.Session;
using Shesha.Orm;
using Shesha.Services;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.NHibernate
{
    /// <summary>
    /// NHibernate entity persistance informer
    /// </summary>
    public class NhEntityPersistanceInformer : IEntityPersistanceInformer
    {
        /// inheritedDoc
        public List<DirtyPropertyInfo> GetDirtyProperties<T>(IEntity<T> entity)
        {
            var sessionContext = StaticContext.IocManager.Resolve<ISessionProvider>();
            var session = sessionContext.Session;
            return session.GetDirtyProperties(entity);
        }

        /// inheritedDoc
        public bool IsDirty<T>(IEntity<T> entity)
        {
            return GetDirtyProperties(entity).Any();
        }
    }
}
