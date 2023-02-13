using System;
using Abp.Domain.Uow;
using NHibernate;
using Shesha.NHibernate.Session;
using Shesha.NHibernate.UoW;

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

        /// <summary>
        /// Add an action that should be executed after successful completion of the current transaction
        /// </summary>
        public static void DoAfterTransaction(this IActiveUnitOfWork unitOfWork, Action action)
        {
            var nhUow = GetNhUnitOfWork(unitOfWork);

            nhUow.GetSession().DoAfterTransaction(action);
        }

        private static NhUnitOfWork GetNhUnitOfWork(IActiveUnitOfWork unitOfWork)
        {
            if (unitOfWork == null)
            {
                throw new ArgumentNullException(nameof(unitOfWork));
            }

            if (!(unitOfWork is NhUnitOfWork))
            {
                throw new ArgumentException("unitOfWork is not type of " + typeof(NhUnitOfWork).FullName, "unitOfWork");
            }

            return unitOfWork as NhUnitOfWork;
        }
    }
}
