using Abp.Dependency;
using Abp.Domain.Uow;
using NHibernate;
using NHibernate.Context;
using Shesha.NHibernate.UoW;
using Shesha.Services;

namespace Shesha.NHibernate.Session
{
    /// <summary>
    /// Unit of work session context
    /// </summary>
    public class UnitOfWorkSessionContext : ICurrentSessionContext
    {
        /// <summary>
        /// default constructor
        /// </summary>
        public UnitOfWorkSessionContext()
        {

        }

        /// <summary>
        /// Returns current session
        /// </summary>
        /// <returns></returns>
        public ISession CurrentSession()
        {
            var uowProvider = StaticContext.IocManager.Resolve<ICurrentUnitOfWorkProvider>();

            return uowProvider.Current is NhUnitOfWork nhUow
                ? nhUow.GetSession()
                : null;
        }
    }
}
