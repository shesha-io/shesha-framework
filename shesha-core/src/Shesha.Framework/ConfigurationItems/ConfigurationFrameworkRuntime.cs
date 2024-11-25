using Abp.Dependency;
using Abp.Runtime;
using Shesha.ConfigurationItems.Models;
using System;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configuration framework runtime
    /// </summary>
    public class ConfigurationFrameworkRuntime : IConfigurationFrameworkRuntime, ITransientDependency
    {
        private const string ScopeKey = "sha-configuration-framework-runtime";
        private readonly IAmbientScopeProvider<ConfigurationFrameworkRuntimeState> _scopeProvider;

        public ConfigurationFrameworkRuntime(IAmbientScopeProvider<ConfigurationFrameworkRuntimeState> scopeProvider)
        {
            _scopeProvider = scopeProvider;
        }

        private ConfigurationFrameworkRuntimeState _defaultState = new ConfigurationFrameworkRuntimeState {
            ViewMode = ConfigurationItemViewMode.Live,
            FrontEndApplication = FrontEndAppKeyConsts.SheshaSwaggerFrontend,
        };

        private ConfigurationFrameworkRuntimeState State 
        {
            get 
            {
                return _scopeProvider.GetValue(ScopeKey) ?? _defaultState;
            }
        }

        /// inheritedDoc
        public ConfigurationItemViewMode ViewMode => State.ViewMode;

        /// inheritedDoc
        public string FrontEndApplication => State.FrontEndApplication;

        /// inheritedDoc
        public IDisposable BeginScope(Action<ConfigurationFrameworkRuntimeState> initAction)
        {
            var state = new ConfigurationFrameworkRuntimeState();
            initAction(state);
            return _scopeProvider.BeginScope(ScopeKey, state);
        }
    }
}
