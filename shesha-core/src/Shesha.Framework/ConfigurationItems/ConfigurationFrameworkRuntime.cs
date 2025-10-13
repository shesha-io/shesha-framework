using Abp.Dependency;
using Abp.Modules;
using Abp.Runtime;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Extensions;
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
        private readonly IAbpModuleManager _moduleManager;
        private readonly string _topLevelModule;

        public ConfigurationFrameworkRuntime(IAmbientScopeProvider<ConfigurationFrameworkRuntimeState> scopeProvider, IAbpModuleManager moduleManager)
        {
            _scopeProvider = scopeProvider;
            _moduleManager = moduleManager;
            _topLevelModule = moduleManager.GetStartupModuleNameOrDefault();
        }

        private ConfigurationFrameworkRuntimeState _defaultState = new ConfigurationFrameworkRuntimeState {
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
        public string? FrontEndApplication => State.FrontEndApplication;

        /// inheritedDoc
        public string CurrentModule => CurrentModuleOrNull ?? throw new TopLevelModuleIsNotDefined();

        public string? CurrentModuleOrNull => !string.IsNullOrWhiteSpace(State.CurrentModule)
            ? State.CurrentModule
            : _topLevelModule;

        /// inheritedDoc
        public IDisposable BeginScope(Action<ConfigurationFrameworkRuntimeState> initAction)
        {
            var state = new ConfigurationFrameworkRuntimeState();
            initAction(state);
            return _scopeProvider.BeginScope(ScopeKey, state);
        }
    }
}
