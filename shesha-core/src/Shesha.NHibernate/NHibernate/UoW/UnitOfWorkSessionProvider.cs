using Abp.Dependency;
using NHibernate;
using NHibernate.Context;

namespace Shesha.NHibernate.Uow
{
    /// <summary>
    /// UnitOfWork session provider
    /// </summary>
    public class UnitOfWorkSessionProvider : ISessionProvider, ITransientDependency
    {
        public ISession Session => _sessionContext.CurrentSession();

        private ICurrentSessionContext _sessionContext;

        public UnitOfWorkSessionProvider(ICurrentSessionContext sessionContext)
        {
            _sessionContext = sessionContext;
        }
    }
}