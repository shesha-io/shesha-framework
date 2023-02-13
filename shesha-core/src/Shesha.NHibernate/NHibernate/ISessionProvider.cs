using NHibernate;

namespace Shesha.NHibernate
{
    public interface ISessionProvider
    {
        ISession Session { get; }
    }
}