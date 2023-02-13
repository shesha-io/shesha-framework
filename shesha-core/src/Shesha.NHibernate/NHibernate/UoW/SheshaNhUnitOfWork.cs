using Abp.Dependency;
using Abp.Domain.Uow;
using NHibernate;

namespace Shesha.NHibernate.UoW
{
    public class SheshaNhUnitOfWork : NhUnitOfWork, ITransientDependency
    {
        /// <summary>
        /// Creates a new instance of <see cref="SheshaNhUnitOfWork"/>.
        /// </summary>
        public SheshaNhUnitOfWork(
            ISessionFactory sessionFactory,
            IConnectionStringResolver connectionStringResolver,
            IUnitOfWorkDefaultOptions defaultOptions,
            IUnitOfWorkFilterExecuter filterExecuter,

            SheshaNHibernateModule nhModule)
            : base(sessionFactory, connectionStringResolver, defaultOptions, filterExecuter, nhModule)
        {
        }
    }
}