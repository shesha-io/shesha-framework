using Abp.Dependency;
using NHibernate;

namespace Shesha.NHibernate.Session
{
    public class DefaultSessionFactoryBuilder : ISessionFactoryBuilder, ITransientDependency
    {
        public ISessionFactory BuildSessionFactory(global::NHibernate.Cfg.Configuration configuration)
        {
            return configuration.BuildSessionFactory();
        }
    }
}
