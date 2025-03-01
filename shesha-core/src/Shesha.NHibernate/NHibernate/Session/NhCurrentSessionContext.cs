using Abp.Dependency;
using NHibernate;
using NHibernate.Context;
using System;

namespace Shesha.NHibernate.Session
{
    /// <summary>
    /// Replacement of <see cref="ICurrentSessionContext"/>, allows to write code that doesn't break nullability and disposable rules
    /// </summary>
    public sealed class NhCurrentSessionContext : INhCurrentSessionContext, ITransientDependency
    {
        private bool _disposed;

        private readonly IIocResolver _iocResolver;
        public NhCurrentSessionContext(IIocResolver iocResolver)
        {
            _iocResolver = iocResolver;
        }

        public ISession? SessionOrNull
        {
            get
            {
                var factory = _iocResolver.Resolve<ISessionFactory>();
                return factory?.GetCurrentSession();
            }
        }

        public ISession Session => SessionOrNull ?? throw new Exception("Session is not available");

        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            _disposed = true;
        }
    }
}