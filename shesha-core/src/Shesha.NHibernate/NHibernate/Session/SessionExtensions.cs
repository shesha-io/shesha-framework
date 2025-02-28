using Abp.Domain.Entities;
using Abp.Extensions;
using NHibernate;
using NHibernate.Engine;
using NHibernate.Proxy;
using Shesha.NHibernate.Interceptors;
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
            Object[] oldState = oldEntry.LoadedState;
            Object[] currentState = persister.GetPropertyValues(entity);
            Int32[] dirtyProps = persister.FindDirty(currentState, oldState, entity, sessionImpl);

            return dirtyProps != null
                ? dirtyProps.Select(i => new DirtyPropertyInfo()
                    {
                        Name = persister.PropertyNames[i],
                        OldValue = oldState[i],
                        NewValue = currentState[i]
                    })
                    .ToList()
                : new List<DirtyPropertyInfo>();
        }

        public static EntityEntry GetEntry(this ISession session, Object entity, bool assert = true)
        {
            var sessionImpl = session.GetSessionImplementation();
            var oldEntry = sessionImpl.PersistenceContext.GetEntry(entity);
            if (oldEntry == null)
            {
                if (entity is INHibernateProxy proxy)
                {
                    Object obj = sessionImpl.PersistenceContext.Unproxy(proxy);
                    oldEntry = sessionImpl.PersistenceContext.GetEntry(obj);
                }
                else
                {
                    if (assert)
                        System.Diagnostics.Debug.Assert(false, "Entity was likely retrieved using an NHibernate session which is no longer available.");
                    else return null;
                }
            }
            return oldEntry;
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

        public class DirtyPropertyInfo
        {
            public string Name { get; set; }
            public object? OldValue { get; set; }
            public object? NewValue { get; set; }
        }

        /// <summary>
        /// Get NH session interceptor
        /// </summary>
        /// <param name="session"></param>
        /// <returns></returns>
        public static SheshaNHibernateInterceptor LocalInterceptor(this ISession session)
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
