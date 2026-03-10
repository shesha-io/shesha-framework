using Abp.Domain.Uow;
using NHibernate;
using Shesha.NHibernate.UoW;
using System;

namespace Shesha.NHibernate
{
    /// <summary>
    /// Unit of work extensions
    /// </summary>
    public static class UnitOfWorkExtensions
    {
        public static void DoWithoutFlush(this IActiveUnitOfWork uow, Action action)
        {
            if (!(uow is NhUnitOfWork nhUow))
                return;

            var session = nhUow.GetSession();

            var previousFlushMode = session.FlushMode;

            // We do NOT want this to flush pending changes as checking for a duplicate should 
            // only compare the object against data that's already in the database
            session.FlushMode = FlushMode.Manual;

            action.Invoke();

            session.FlushMode = previousFlushMode;
        }
    }
}
