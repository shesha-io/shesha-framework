using Abp.Domain.Entities;
using Abp.Extensions;
using NHibernate;
using NHibernate.Engine;
using NHibernate.Proxy;
using Shesha.NHibernate.Interceptors;
using Shesha.Orm;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.NHibernate.Session
{

    /// <summary>
    /// Provides extension methods to easily find dirty properties for NHibernate.
    /// </summary>
    public static class SessionExtensions
    {
        public static List<DirtyPropertyInfo> GetDirtyProperties(this ISession session, Object entity)
        {
            var className = NHibernateProxyHelper.GuessClass(entity).FullName;
            var sessionImpl = session.GetSessionImplementation();
            var persister = sessionImpl.Factory.GetEntityPersister(className);

            var oldEntry = session.GetEntry(entity);
            object[]? oldState = oldEntry.LoadedState;
            if (oldState == null)
                return new();

            object[] currentState = persister.GetPropertyValues(entity);
            int[] dirtyProps = persister.FindDirty(currentState, oldState, entity, sessionImpl);

            return dirtyProps != null
                ? dirtyProps.Select(i => new DirtyPropertyInfo()
                    {
                        Name = persister.PropertyNames[i],
                        OldValue = oldState[i],
                        NewValue = currentState[i]
                    })
                    .ToList()
                : new ();
        }
        
        public static EntityEntry? GetEntryOrNull(this ISession session, Object entity) 
        {
            var sessionImpl = session.GetSessionImplementation();
            var oldEntry = sessionImpl.PersistenceContext.GetEntry(entity);
            if (entity is INHibernateProxy proxy)
            {
                Object obj = sessionImpl.PersistenceContext.Unproxy(proxy);
                oldEntry = sessionImpl.PersistenceContext.GetEntry(obj);
            }
            return oldEntry;
        }

        public static EntityEntry GetEntry(this ISession session, Object entity) 
        {
            return session.GetEntryOrNull(entity) ?? throw new Exception("Entity was likely retrieved using an NHibernate session which is no longer available.");
        }        

        public static bool IsEntityDeleted(this ISession session, Object entity)
        {
            var entityEntry = session.GetEntry(entity);
            if (entityEntry.Status == Status.Deleted || entityEntry.Status == Status.Gone)
            {
                return true;
            }
            return entity is ISoftDelete && entity.As<ISoftDelete>().IsDeleted;
        }

        /// <summary>
        /// Get NH session interceptor
        /// </summary>
        /// <param name="session"></param>
        /// <returns></returns>
        public static SheshaNHibernateInterceptor? LocalInterceptor(this ISession session)
        {
            return session.GetSessionImplementation().Interceptor as SheshaNHibernateInterceptor;
        }

        /// <summary>
        /// Add an action that should be executed after successful completion of the current transaction
        /// </summary>
        /// <param name="session"></param>
        /// <param name="action"></param>
        public static void DoAfterTransaction(this ISession session, Action action)
        {
            var interceptor = session.LocalInterceptor();
            if (interceptor == null)
                throw new Exception("Session's interceptor should be specified");

            interceptor.AddAfterTransactionAction(action);
        }
    }
}
