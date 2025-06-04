using NHibernate;

namespace Shesha.NHibernate.Session
{
    public interface ISessionFactoryFactory
    {
        ISessionFactory GetSessionFactory();
        void ResetConfiguration();
    }
}