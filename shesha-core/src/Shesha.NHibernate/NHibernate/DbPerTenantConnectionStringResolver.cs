﻿using Abp.Configuration.Startup;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.MultiTenancy;
using Abp.Runtime.Session;
using Shesha.FluentMigrator;
using Shesha.NHibernate.Configuration;
using System;
using System.Threading.Tasks;

namespace Shesha.NHibernate
{
    /// <summary>
    /// Implements <see cref="IDbPerTenantConnectionStringResolver"/> to dynamically resolve
    /// connection string for a multi tenant application.
    /// </summary>
    public class DbPerTenantConnectionStringResolver : DefaultConnectionStringResolver, IDbConnectionSettingsResolver
    {
        /// <summary>
        /// Reference to the session.
        /// </summary>
        public IAbpSession AbpSession { get; set; }

        private readonly ICurrentUnitOfWorkProvider _currentUnitOfWorkProvider;
        private readonly ITenantCache _tenantCache;
        private readonly IShaNHibernateModuleConfiguration _nhConfiguration;

        /// <summary>
        /// Initializes a new instance of the <see cref="DbPerTenantConnectionStringResolver"/> class.
        /// </summary>
        public DbPerTenantConnectionStringResolver(
            IAbpStartupConfiguration configuration,
            ICurrentUnitOfWorkProvider currentUnitOfWorkProvider,
            ITenantCache tenantCache)
            : base(configuration)
        {
            _currentUnitOfWorkProvider = currentUnitOfWorkProvider;
            _tenantCache = tenantCache;
            _nhConfiguration = configuration.Get<IShaNHibernateModuleConfiguration>();

            AbpSession = NullAbpSession.Instance;
        }

        public override string GetNameOrConnectionString(ConnectionStringResolveArgs args)
        {
            if (args.MultiTenancySide == MultiTenancySides.Host)
            {
                return GetNameOrConnectionString(new DbPerTenantConnectionStringResolveArgs(null, args));
            }

            return GetNameOrConnectionString(new DbPerTenantConnectionStringResolveArgs(GetCurrentTenantId(), args));
        }

        public virtual string GetNameOrConnectionString(DbPerTenantConnectionStringResolveArgs args)
        {
            if (args.TenantId == null)
            {
                //Requested for host
                return base.GetNameOrConnectionString(args);
            }

            var tenantCacheItem = _tenantCache.Get(args.TenantId.Value);
            if (string.IsNullOrWhiteSpace(tenantCacheItem.ConnectionString))
            {
                //Tenant has not dedicated database
                return base.GetNameOrConnectionString(args);
            }

            return tenantCacheItem.ConnectionString;
        }

        public async Task<string> GetNameOrConnectionStringAsync(DbPerTenantConnectionStringResolveArgs args)
        {
            return await Task.FromResult(GetNameOrConnectionString(args));
        }

        protected virtual int? GetCurrentTenantId()
        {
            return _currentUnitOfWorkProvider.Current != null
                ? _currentUnitOfWorkProvider.Current.GetTenantId()
                : AbpSession.TenantId;
        }

        public DbmsType GetDbmsType(DbPerTenantConnectionStringResolveArgs args)
        {
            // todo: review after ABP update, we need to store DBMS type per tenant in the TenantCacheItem
            if (args.TenantId != null)
                throw new NotSupportedException("Multitemancy is not supported");

            return _nhConfiguration.DatabaseType;
        }
    }
}
