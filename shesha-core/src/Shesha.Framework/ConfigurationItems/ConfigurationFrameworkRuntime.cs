using Abp;
using Abp.Dependency;
using Abp.Domain.Uow;
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
        private readonly string _topLevelModule;
        private readonly IUnitOfWorkManager _uowManager;

        public ConfigurationFrameworkRuntime(IAmbientScopeProvider<ConfigurationFrameworkRuntimeState> scopeProvider, 
            IAbpModuleManager moduleManager,
            IUnitOfWorkManager uowManager)
        {
            _scopeProvider = scopeProvider;
            _topLevelModule = moduleManager.GetStartupModuleNameOrDefault();
            _uowManager = uowManager;
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

        /// <summary>
        /// If true, indicates that configuration changes tracking is enabled and any changes made on the configuration items are treated as manual and tracked automatically
        /// </summary>
        public bool IsConfigurationTrackingEnabled => State.IsConfigurationTrackingEnabled;

        /// inheritedDoc
        public IDisposable BeginScope(Action<ConfigurationFrameworkRuntimeState> initAction)
        {
            var prevState = State;
            var state = new ConfigurationFrameworkRuntimeState(prevState);
            initAction(state);
            return _scopeProvider.BeginScope(ScopeKey, state);
        }

        public IDisposable DisableConfigurationTracking()
        {
            // Note: if configuration tracking was enabled, we have to save changes before and after scope to ensure that we affect only entities modified in the current scope
            var forceSaveRequired = State.IsConfigurationTrackingEnabled;

            if (forceSaveRequired && _uowManager.Current != null)
                _uowManager.Current.SaveChanges();

            var scope = BeginScope(a => a.IsConfigurationTrackingEnabled = false);

            return new DisposeAction(() => {
                if (forceSaveRequired && _uowManager.Current != null)
                    _uowManager.Current.SaveChanges();
                scope.Dispose();
            });
        }
    }
}
