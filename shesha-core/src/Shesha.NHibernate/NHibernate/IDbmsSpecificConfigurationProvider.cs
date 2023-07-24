using NhConfiguration = global::NHibernate.Cfg.Configuration;
namespace Shesha.NHibernate
{
    /// <summary>
    /// DBMS specific configuration provider
    /// </summary>
    public interface IDbmsSpecificConfigurationProvider
    {
        NhConfiguration Configure(NhConfiguration nhConfig, string connectionString);
    }
}
