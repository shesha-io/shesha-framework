namespace Shesha.NHibernate.Configuration
{
    internal class ShaNHibernateModuleConfiguration : IShaNHibernateModuleConfiguration
    {

        public ShaNHibernateModuleConfiguration()
        {
            NhConfiguration = new global::NHibernate.Cfg.Configuration();
        }

        public global::NHibernate.Cfg.Configuration NhConfiguration { get; }
    }
}