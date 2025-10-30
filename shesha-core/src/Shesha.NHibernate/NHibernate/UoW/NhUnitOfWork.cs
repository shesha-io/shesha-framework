using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.EntityHistory;
using Abp.Runtime.Session;
using Abp.Transactions.Extensions;
using NHibernate;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.NHibernate.Session;
using System;
using System.Data.Common;
using System.Diagnostics;
using System.Threading.Tasks;

namespace Shesha.NHibernate.UoW
{
    /// <summary>
    /// Implements Unit of work for NHibernate.
    /// </summary>
    public class NhUnitOfWork : UnitOfWorkBase, IUnitOfWorkHasAfterTransactionHandler, ITransientDependency
    {
        /// <summary>
        /// NHibernate session factory
        /// </summary>
        private readonly ISessionFactory _sessionFactory;

        /// <summary>
        /// NH session
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("IDisposableAnalyzers.Correctness", "IDISP006:Implement IDisposable", Justification = $"Disposed in {nameof(DisposeUow)}")]
        private ISession? _session;

        /// <summary>
        /// Active transaction
        /// </summary>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("IDisposableAnalyzers.Correctness", "IDISP006:Implement IDisposable", Justification = $"Disposed in {nameof(DisposeUow)}")]
        private ITransaction? _transaction;

        /// <summary>
        /// Returns current session or starts a new one is missing and <paramref name="startNewIfMissing"/> is true
        /// </summary>
        /// <param name="startNewIfMissing"></param>
        /// <returns></returns>
        public ISession? GetSessionOrNull(bool startNewIfMissing = true)
        {
            if (_session == null && startNewIfMissing)
            {
                _session = BeginSession();

                // apply all filter settings
                ApplySessionOptions(_session);
            }

            return _session;
        }

        public ISession GetSession()
        {
            return GetSessionOrNull() ?? throw new SessionException("Session is not available");
        }

        /// <summary>
        /// <see cref="NhUnitOfWork"/> uses this DbConnection if it's set.
        /// This is usually set in tests.
        /// </summary>
        public DbConnection? DbConnection { get; set; }

        /// <summary>
        /// Entity history helper
        /// </summary>
        public EntityHistoryHelperBase EntityHistoryHelper { get; set; } = default!;

        private readonly IConfigurationFrameworkRuntime _cfRuntime;

        /// <summary>
        /// Creates a new instance of <see cref="NhUnitOfWork"/>.
        /// </summary>
        [DebuggerStepThrough]
        public NhUnitOfWork(
            ISessionFactory sessionFactory,
            IConnectionStringResolver connectionStringResolver,
            IUnitOfWorkDefaultOptions defaultOptions,
            IUnitOfWorkFilterExecuter filterExecuter,
            IConfigurationFrameworkRuntime cfRuntime)
            : base(
                  connectionStringResolver,
                  defaultOptions,
                  filterExecuter)
        {
            _sessionFactory = sessionFactory;
            _cfRuntime = cfRuntime;
        }

        /// <summary>
        /// Begin NH session
        /// </summary>
        protected ISession BeginSession()
        {
            var session = DbConnection != null
                ? _sessionFactory.WithOptions().Connection(DbConnection).OpenSession()
                : _sessionFactory.OpenSession();
            _transaction?.Dispose();

            session.FlushMode = FlushMode.Commit;

            if (Options.IsTransactional == true)
            {
                _transaction = Options.IsolationLevel.HasValue
                    ? session.BeginTransaction(Options.IsolationLevel.Value.ToSystemDataIsolationLevel())
                    : session.BeginTransaction();
            }

            if (!string.IsNullOrWhiteSpace(_cfRuntime.CurrentModuleOrNull)) 
            {
                //session.CreateSQLQuery("DBCC traceon (1222, -1)").ExecuteUpdate();
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
            //ApplyFilterParameterValue(AbpDataFilters.SoftDelete, AbpDataFilters.Parameters.IsDeleted, false);

#pragma warning disable IDISP004 // Don't ignore created IDisposable
            SetFilterParameter(AbpDataFilters.SoftDelete, AbpDataFilters.Parameters.IsDeleted, false);
#pragma warning restore IDISP004 // Don't ignore created IDisposable

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

            if (_session != null) 
            {
                _session.Dispose();
                _session = null;
            }            
        }

        /// <summary>
        /// Adds action to be executed after transaction is committed
        /// </summary>
        /// <param name="action"></param>
        public void AddAfterTransactionAction(Action action)
        {
            GetSession().DoAfterTransaction(action);
        }
    }
}