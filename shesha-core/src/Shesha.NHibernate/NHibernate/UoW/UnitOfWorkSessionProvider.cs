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
        [System.Diagnostics.CodeAnalysis.SuppressMessage("IDisposableAnalyzers.Correctness", "IDISP012:Property should not return created disposable", Justification = "`_sessionContext.CurrentSession()` call doesn't create new IDisposable")]
        public ISession Session => _sessionContext.CurrentSession();

        private ICurrentSessionContext _sessionContext;

        public UnitOfWorkSessionProvider(ICurrentSessionContext sessionContext)
        {
            _sessionContext = sessionContext;
        }
    }
}