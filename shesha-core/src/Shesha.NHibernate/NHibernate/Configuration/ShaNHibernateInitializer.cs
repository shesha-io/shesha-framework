using Abp.Authorization.Users;
using Abp.Reflection;
using Castle.Core.Logging;

using NHibernate;
using Shesha.Attributes;
using Shesha.Domain;
using Shesha.DynamicEntities.TypeFinder;
using Shesha.Generators;
using Shesha.NHibernate.Filters;
using Shesha.NHibernate.Linq;
using Shesha.NHibernate.Maps;
using Shesha.NHibernate.MsSql;
using Shesha.NHibernate.PostgreSql;
using Shesha.NHibernate.Session;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using NhEnvironment = global::NHibernate.Cfg.Environment;

namespace Shesha.NHibernate.Configuration
{
    public class ShaNHibernateInitializer
    {
        private readonly IShaNHibernateModuleConfiguration _configuration;
        private readonly IAssemblyFinder _assembleFinder;
        private readonly INameGenerator _nameGenerator;
        private readonly IInterceptor? _interceptor;
        private readonly IShaTypeFinder _shaTypeFinder;

        private ILogger Logger { get; set; } = NullLogger.Instance;

        public ShaNHibernateInitializer(
            IShaNHibernateModuleConfiguration configuration,
            IAssemblyFinder assembleFinder,
            INameGenerator nameGenerator,
            IInterceptor? interceptor,
            IShaTypeFinder shaTypeFinder
        )
        {
            _configuration = configuration;
            _assembleFinder = assembleFinder;
            _nameGenerator = nameGenerator;
            _interceptor = interceptor;
            _shaTypeFinder = shaTypeFinder;
        }

        public ISessionFactory Initialize()
        {
            Logger.Debug("NH Initialization - started");

            var configProvider = GetConfigProvider(_configuration.DatabaseType);

            var nhConfig = new global::NHibernate.Cfg.Configuration();
            configProvider.Configure(nhConfig, _configuration.ConnectionString)
            .SetProperty("hbm2ddl.keywords", "auto-quote")
                .CurrentSessionContext<UnitOfWorkSessionContext>();

            if (_configuration.CustomDriver != null)
                nhConfig.Properties[NhEnvironment.ConnectionDriver] = _configuration.CustomDriver.AssemblyQualifiedName;

            if (_configuration.CustomDialect != null)
                nhConfig.Properties[NhEnvironment.Dialect] = _configuration.CustomDialect.AssemblyQualifiedName;

            // register linq extensions
            nhConfig.LinqToHqlGeneratorsRegistry<SheshaLinqToHqlGeneratorsRegistry>();

            // register filters
            nhConfig.AddFilterDefinition(SoftDeleteFilter.GetDefinition());
            nhConfig.AddFilterDefinition(MayHaveTenantFilter.GetDefinition());
            nhConfig.AddFilterDefinition(MustHaveTenantFilter.GetDefinition());

            Logger.Debug("NH Initialization - add assemblies to conventions");

            var conventions = new Conventions(_nameGenerator);
            var mappingAssemblies = new Dictionary<Assembly, string>
            {
                    { typeof(UserToken).Assembly, "Abp" },
                    { typeof(UserLogin).Assembly, "Abp" }
                };
            foreach (var item in mappingAssemblies)
            {
                conventions.AddAssembly(item.Key, item.Value);
            }

            var assembliesWithEntities = _assembleFinder.GetAllAssemblies()
                .Distinct(new AssemblyFullNameComparer())
                .Where(a => a.GetCustomAttribute<TablePrefixAttribute>() != null || a.GetTypes().Any(t => !MappingHelper.IsProxy(t) && MappingHelper.IsEntity(t)))
                .ToList();
            assembliesWithEntities.AddRange(_shaTypeFinder.GetDynamicEntityAssemblies());
            foreach (var assembly in assembliesWithEntities)
            {
                if (!conventions.AssemblyAdded(assembly))
                    conventions.AddAssembly(assembly, assembly.GetCustomAttribute<TablePrefixAttribute>()?.Prefix);
            }

            Logger.Debug("NH Initialization - compile conventions");

            conventions.Compile(nhConfig);

            Logger.Debug("NH Initialization - Set Interceptor");

            if (_interceptor != null)
                nhConfig.SetInterceptor(_interceptor);

            Logger.Debug("NH Initialization - Generate Statistics");

            nhConfig.SessionFactory().GenerateStatistics();

            // ToDo: ABP662, some ABP entities (WebhookEvent, DynamicProperty) contain not virtual properties
            nhConfig.Properties.Add("use_proxy_validator", "false");

            Logger.Debug("NH Initialization - Build Session Factory");

            var _sessionFactory = _configuration.SessionFactoryBuilder != null
                ? _configuration.SessionFactoryBuilder.Invoke(nhConfig)
                : nhConfig.BuildSessionFactory();

            Logger.Debug("NH Initialization - finish");

            return _sessionFactory;
        }

        private IDbmsSpecificConfigurationProvider GetConfigProvider(DbmsType dbmsType)
        {
            switch (dbmsType)
            {
                case DbmsType.SQLServer:
                    return new MsSqlConfigurationProvider();
                case DbmsType.PostgreSQL:
                    return new PostgreSqlConfigurationProvider();
                default:
                    throw new NotSupportedException($"DBMS Type '{dbmsType}' not supported");
            }
        }

    }
}
