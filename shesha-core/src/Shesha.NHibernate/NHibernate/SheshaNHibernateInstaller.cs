using Abp.EntityHistory;
using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using Castle.Windsor;
using NHibernate;
using NHibernate.Context;
using Shesha.NHibernate.EntityHistory;
using Shesha.NHibernate.Session;
using Shesha.Orm;

namespace Shesha.NHibernate
{
    internal class SheshaNHibernateInstaller : IWindsorInstaller
    {
        public SheshaNHibernateInstaller()
        {
        }

        public void Install(IWindsorContainer container, IConfigurationStore store)
        {
            container.Register(
                Component.For<IEntityPersistanceInformer>().ImplementedBy<NhEntityPersistanceInformer>().LifestyleSingleton(),
                Component.For<ICurrentSessionContext>().ImplementedBy(typeof(UnitOfWorkSessionContext)).LifestyleTransient(),
                Component.For<ISession>().UsingFactory<ISessionFactory, ISession>(f => f.OpenSession()).LifestyleScoped(),
                Component.For<NHibernateEntityHistoryStore>().ImplementedBy(typeof(NHibernateEntityHistoryStore)).LifestyleTransient(),
                Component.For<EntityHistoryHelperBase>().ImplementedBy(typeof(EntityHistoryHelper)).LifestyleTransient()
            );
        }
    }
}
