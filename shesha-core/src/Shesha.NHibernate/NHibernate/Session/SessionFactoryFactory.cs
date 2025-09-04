using System;
using NHibernate;
using Shesha.NHibernate.Configuration;

namespace Shesha.NHibernate.Session
{
    public sealed class SessionFactoryFactory : ISessionFactoryFactory, IDisposable
    {
        private readonly ShaNHibernateInitializer _initializer;
        private ISessionFactory _prevprevSessionFactory;
        private ISessionFactory _prevSessionFactory;
        private ISessionFactory _sessionFactory;
        private bool _disposed;

        public SessionFactoryFactory(ShaNHibernateInitializer initializer)
        {
            _initializer = initializer;
        }

        public ISessionFactory GetSessionFactory()
        {
            if (_sessionFactory != null)
                return _sessionFactory;
            _sessionFactory?.Dispose();
            _sessionFactory = _initializer.Initialize();
            return _sessionFactory;
        }

        public void ResetConfiguration()
        {
            _prevprevSessionFactory?.Dispose();
            _prevprevSessionFactory = _prevSessionFactory;
            _prevSessionFactory = _sessionFactory;

#pragma warning disable IDISP003 // Dispose previous before re-assigning
            _sessionFactory = _initializer.Initialize();
#pragma warning restore IDISP003 // Dispose previous before re-assigning
        }

        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            _disposed = true;
            _sessionFactory?.Dispose();
            _prevSessionFactory?.Dispose();
            _prevprevSessionFactory?.Dispose();
        }
    }
}
