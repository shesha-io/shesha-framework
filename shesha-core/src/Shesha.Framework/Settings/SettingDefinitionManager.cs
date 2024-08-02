using Abp;
using Abp.Collections.Extensions;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Reflection;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting definition manager
    /// </summary>
    public class SettingDefinitionManager : ISettingDefinitionManager, ISingletonDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IIocManager _iocManager;
        private readonly IRepository<SettingConfiguration, Guid> _settingConfigurationRepository;

        protected Lazy<IDictionary<SettingIdentifier, SettingDefinition>> SettingDefinitions { get; }

        public SettingDefinitionManager(ITypeFinder typeFinder, IIocManager iocManager, IRepository<SettingConfiguration, Guid> settingConfigurationRepository)
        {
            _typeFinder = typeFinder;
            _iocManager = iocManager;
            _settingConfigurationRepository = settingConfigurationRepository;

            SettingDefinitions = new Lazy<IDictionary<SettingIdentifier, SettingDefinition>>(CreateSettingDefinitions, true);
        }

        protected virtual IDictionary<SettingIdentifier, SettingDefinition> CreateSettingDefinitions()
        {
            var definitionProvidersTypes = _typeFinder.Find(t => t.IsPublic && 
                    !t.IsAbstract && 
                    !t.IsGenericType && 
                    typeof(ISettingDefinitionProvider).IsAssignableFrom(t) &&
                    _iocManager.IsRegistered(t)
                ).ToList();

            var definitionProviders = definitionProvidersTypes.Select(t => _iocManager.Resolve(t) as ISettingDefinitionProvider).ToList();

            var settings = new Dictionary<SettingIdentifier, SettingDefinition>();


            foreach (var definitionProvider in definitionProviders)
            {
                definitionProvider.Define(new SettingDefinitionContext(settings, definitionProvider));

            }

            return settings;
        }

        public virtual SettingDefinition Get(string moduleName, string name)
        {
            Check.NotNull(moduleName, nameof(moduleName));
            Check.NotNull(name, nameof(name));

            var setting = GetOrNull(moduleName, name);

            if (setting == null)
            {
                throw new AbpException("Undefined setting: " + name);
            }

            return setting;
        }

        public virtual IReadOnlyList<SettingDefinition> GetAll()
        {
            return SettingDefinitions.Value.Values.ToImmutableList();
        }

        public virtual void AddDefinition(SettingDefinition definition)
        {
            SettingDefinitions.Value.Add(new SettingIdentifier(definition.ModuleName, definition.Name), definition);
        }

        public virtual SettingDefinition GetOrNull(string moduleName, string name)
        {
            return SettingDefinitions.Value.GetOrDefault(new SettingIdentifier(moduleName, name));
        }

        // Generic method to create a SettingDefinition
        public virtual SettingDefinition<T> CreateUserSettingDefinition<T>(string name, T defaultValue, string module)
        {
            var setting = new SettingDefinition<T>(name, defaultValue, name)
            {
                Accessor = name,
                Category = "User Settings",
                IsUserSpecific = true,
                ModuleName = module,
            };
            return setting;
        }
    }
}
