using Abp.Domain.Repositories;
using Castle.Core;
using Castle.MicroKernel;
using Castle.MicroKernel.Context;
using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using Castle.Windsor;
using NHibernate;
using Shesha.NHibernate.Configuration;
using Shesha.NHibernate.Session;

namespace Shesha.NHibernate.Repositories
{
    internal class NhRepositoryInstaller : IWindsorInstaller
    {
        private sealed class SessionFactoryLifestyle : ILifestyleManager
        {
            private ISessionFactoryFactory? _factory;

            public void Init(IComponentActivator componentActivator, IKernel kernel, ComponentModel model)
            {
                _factory = kernel.Resolve<ISessionFactoryFactory>();
            }

            public object? Resolve(CreationContext context, IReleasePolicy releasePolicy) => _factory?.GetSessionFactory();
            public bool Release(object instance) => false;
            public void Dispose() => _factory?.GetSessionFactory()?.Dispose();
        }

        private readonly ShaNHibernateInitializer _initializer;

        public NhRepositoryInstaller( ShaNHibernateInitializer initializer)
        {
            _initializer = initializer;
        }

        public void Install(IWindsorContainer container, IConfigurationStore store)
        {
#pragma warning disable IDISP004 // Don't ignore created IDisposable
            container.Register(
                Component.For<ISessionFactoryFactory>().Instance(new SessionFactoryFactory(_initializer)).LifestyleSingleton(),
                Component.For<ISessionFactory>().LifestyleCustom<SessionFactoryLifestyle>(),
                Component.For(typeof(IRepository<>)).ImplementedBy(typeof(NhRepositoryBase<>)).LifestyleTransient(),
                Component.For(typeof(IRepository<,>)).ImplementedBy(typeof(NhRepositoryBase<,>)).LifestyleTransient()
            );
#pragma warning restore IDISP004 // Don't ignore created IDisposable
        }
    }
}
