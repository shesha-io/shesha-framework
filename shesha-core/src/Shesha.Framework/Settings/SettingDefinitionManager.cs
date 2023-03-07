using Abp;
using Abp.Collections.Extensions;
using Abp.Configuration;
using Abp.Dependency;
using Abp.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting definition manager
    /// </summary>
    public class SettingDefinitionManager : ISettingDefinitionManager, ISingletonDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IIocManager _iocManager;

        protected Lazy<IDictionary<string, SettingDefinition>> SettingDefinitions { get; }

        public SettingDefinitionManager(ITypeFinder typeFinder, IIocManager iocManager)
        {
            _typeFinder = typeFinder;
            _iocManager = iocManager;

            SettingDefinitions = new Lazy<IDictionary<string, SettingDefinition>>(CreateSettingDefinitions, true);
        }

        protected virtual IDictionary<string, SettingDefinition> CreateSettingDefinitions()
        {
            var definitionProvidersTypes = _typeFinder.Find(t => t.IsPublic && 
                    !t.IsAbstract && 
                    !t.IsGenericType && 
                    typeof(ISettingDefinitionProvider).IsAssignableFrom(t) &&
                    _iocManager.IsRegistered(t)
                ).ToList();

            var definitionProviders = definitionProvidersTypes.Select(t => _iocManager.Resolve(t) as ISettingDefinitionProvider).ToList();

            var settings = new Dictionary<string, SettingDefinition>();
            foreach (var definitionProvider in definitionProviders)
            {
                definitionProvider.Define(new SettingDefinitionContext(settings, definitionProvider));
            }
            return settings;
        }

        public virtual SettingDefinition Get(string name)
        {
            Check.NotNull(name, nameof(name));

            var setting = GetOrNull(name);

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

        public virtual SettingDefinition GetOrNull(string name)
        {
            return SettingDefinitions.Value.GetOrDefault(name);
        }
    }
}
