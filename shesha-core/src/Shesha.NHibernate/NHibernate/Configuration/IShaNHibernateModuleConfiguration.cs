namespace Shesha.NHibernate.Configuration
{
    /// <summary>
    /// Used to configure ABP NHibernate module.
    /// </summary>
    public interface IShaNHibernateModuleConfiguration
    {
        /// <summary>
        /// Used to get and modify NHibernate configuration.
        /// You can add mappings to this object.
        /// Do not call BuildSessionFactory on it.
        /// </summary>
        global::NHibernate.Cfg.Configuration NhConfiguration { get; }
    }
}