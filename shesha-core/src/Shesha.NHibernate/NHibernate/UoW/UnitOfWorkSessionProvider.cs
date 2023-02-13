using Abp.Dependency;
using Abp.Domain.Uow;
using NHibernate;
using NHibernate.Context;
using System;

namespace Shesha.NHibernate.Uow
{
    [Obsolete("Use `ICurrentSessionContext` instead")]
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