using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Diagnostics;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.EntityHistory;
using Abp.Runtime.Session;
using Abp.Transactions.Extensions;
using NHibernate;

namespace Shesha.NHibernate.UoW
{
    /// <summary>
    /// Implements Unit of work for NHibernate.
    /// </summary>
    public class NhUnitOfWork : UnitOfWorkBase, ITransientDependency
    {
        /// <summary>
        /// NH session
        /// </summary>
        private ISession _session;

        /// <summary>
        /// Returns current session or starts a new one is missing and <paramref name="startNewIfMissing"/> is true
        /// </summary>
        /// <param name="startNewIfMissing"></param>
        /// <returns></returns>
        public ISession GetSession(bool startNewIfMissing = true)
        {
            if (_session == null && startNewIfMissing)
            {
                _session = BeginSession();

                // apply all filter settings
                ApplySessionOptions(_session);
            }

            return _session;
        }


        /// <summary>
        /// <see cref="NhUnitOfWork"/> uses this DbConnection if it's set.
        /// This is usually set in tests.
        /// </summary>
        public DbConnection DbConnection { get; set; }

        /// <summary>
        /// Entity history helper
        /// </summary>
        public EntityHistoryHelperBase EntityHistoryHelper { get; set; }

        private readonly ISessionFactory _sessionFactory;
        private ITransaction _transaction;

        private readonly SheshaNHibernateModule _nhModule;

        /// <summary>
        /// Creates a new instance of <see cref="NhUnitOfWork"/>.
        /// </summary>
        [DebuggerStepThrough]
        public NhUnitOfWork(
            ISessionFactory sessionFactory,
            IConnectionStringResolver connectionStringResolver,
            IUnitOfWorkDefaultOptions defaultOptions,
            IUnitOfWorkFilterExecuter filterExecuter,

            SheshaNHibernateModule nhModule)
            : base(
                  connectionStringResolver,
                  defaultOptions,
                  filterExecuter)
        {
            _sessionFactory = sessionFactory;

            _nhModule = nhModule;
        }

        /// <summary>
        /// Begin NH session
        /// </summary>
        protected ISession BeginSession()
        {
            var session = DbConnection != null
                ? _sessionFactory.WithOptions().Connection(DbConnection).OpenSession()
                : _sessionFactory.OpenSession();

            session.FlushMode = FlushMode.Commit;

            if (Options.IsTransactional == true)
            {
                _transaction = Options.IsolationLevel.HasValue
                    ? session.BeginTransaction(Options.IsolationLevel.Value.ToSystemDataIsolationLevel())
                    : session.BeginTransaction();
            }

            return session;
        }

        private void ApplySessionOptions(ISession session)
        {
            foreach (var filter in Filters)
            {
                if (filter.IsEnabled)
                {
                    foreach (var filterParam in filter.FilterParameters)
                    {
                        ApplyFilterParameterValue(filter.FilterName, filterParam.Key, filterParam.Value);
                    }
                    ApplyEnableFilter(filter.FilterName);
                }
                else
                {
                    ApplyDisableFilter(filter.FilterName);
                }
            }
        }

        /// inheritedDoc
        protected override void BeginUow()
        {
            // Note: configuration of filters is still required irrespectively of the laziness of the session

            // set default value for IsDeleted parameter
            SetFilterParameter(AbpDataFilters.SoftDelete, AbpDataFilters.Parameters.IsDeleted, false);

            CheckAndSetSoftDelete();
            CheckAndSetMayHaveTenant();
            CheckAndSetMustHaveTenant();
        }

        /// <summary>
        /// Check and set `SoftDelete` filter
        /// </summary>
        protected virtual void CheckAndSetSoftDelete()
        {
            if (IsFilterEnabled(AbpDataFilters.SoftDelete))
            {
                ApplyEnableFilter(AbpDataFilters.SoftDelete); //Enable Filters
                ApplyFilterParameterValue(AbpDataFilters.SoftDelete, AbpDataFilters.Parameters.IsDeleted, false); //ApplyFilter
            }
            else
            {
                ApplyDisableFilter(AbpDataFilters.SoftDelete); //Disable filters
            }
        }

        /// <summary>
        /// Check and set `MustHaveTenant` filter
        /// </summary>
        protected virtual void CheckAndSetMustHaveTenant()
        {
            if (IsFilterEnabled(AbpDataFilters.MustHaveTenant))
            {
                ApplyEnableFilter(AbpDataFilters.MustHaveTenant); //Enable Filters
                ApplyFilterParameterValue(AbpDataFilters.MustHaveTenant, AbpDataFilters.Parameters.TenantId, AbpSession.GetTenantId()); //ApplyFilter
            }
            else
            {
                ApplyDisableFilter(AbpDataFilters.MustHaveTenant); //Disable Filters
            }
        }

        /// <summary>
        /// Check and set `MayHaveTenant` filter
        /// </summary>
        protected virtual void CheckAndSetMayHaveTenant()
        {
            if (IsFilterEnabled(AbpDataFilters.MayHaveTenant))
            {
                ApplyEnableFilter(AbpDataFilters.MayHaveTenant); //Enable Filters
                ApplyFilterParameterValue(AbpDataFilters.MayHaveTenant, AbpDataFilters.Parameters.TenantId, AbpSession.TenantId); //ApplyFilter
            }
            else
            {
                ApplyDisableFilter(AbpDataFilters.MayHaveTenant); //Disable Filters
            }

        }

        /// inheritedDoc
        public override void SaveChanges()
        {
            _session?.Flush();
        }

        /// inheritedDoc
        public override Task SaveChangesAsync()
        {
            return _session?.FlushAsync() ?? Task.CompletedTask;
        }

        /// <summary>
        /// Commits transaction and closes database connection.
        /// </summary>
        protected override void CompleteUow()
        {
            SaveChanges();
            if (_transaction != null && _transaction.IsActive)
            {
                _transaction.Commit();
            }
        }

        /// inheritedDoc
        protected override async Task CompleteUowAsync()
        {
            await SaveChangesAsync();
            if (_transaction != null && _transaction.IsActive)
            {
                try
                {
                    await _transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }
            }
        }

        /// <summary>
        /// Rollbacks transaction and closes database connection.
        /// </summary>
        protected override void DisposeUow()
        {
            if (_transaction != null)
            {
                _transaction.Dispose();
                _transaction = null;
            }

            _session?.Dispose();
        }
    }
}