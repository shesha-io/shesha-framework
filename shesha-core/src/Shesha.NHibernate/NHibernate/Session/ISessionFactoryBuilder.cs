using NHibernate;

namespace Shesha.NHibernate.Session
{
    /// <summary>
    /// Session factory builder
    /// </summary>
    public interface ISessionFactoryBuilder
    {
        /// <summary>
        /// Build session factory accordig to the provided configuration
        /// </summary>
        /// <param name="configuration"></param>
        /// <returns></returns>
        ISessionFactory BuildSessionFactory(global::NHibernate.Cfg.Configuration configuration);        
    }
}
