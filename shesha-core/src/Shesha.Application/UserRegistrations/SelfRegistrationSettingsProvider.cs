using Abp.Dependency;
using Abp.Runtime.Session;
using Newtonsoft.Json;
using Shesha.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.Reflection;
using Shesha.Settings;
using Shesha.Settings.Json;
using Shesha.UserManagements.Configurations;
using System.Collections.Generic;
using System.Threading.Tasks;
using ISettingStore = Shesha.Services.Settings.ISettingStore;

namespace Shesha.UserRegistrations
{
    /// <inheritdoc />
    public class SelfRegistrationSettingsProvider : ISelfRegistrationSettingsProvider, ITransientDependency
    {
        private readonly ISettingDefinitionManager _definitionManager;
        private readonly ISettingStore _settingStore;
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly IUserManagementSettings _userManagementSettings;

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public SelfRegistrationSettingsProvider(
            ISettingDefinitionManager definitionManager,
            ISettingStore settingStore,
            IConfigurationFrameworkRuntime cfRuntime,
            IUserManagementSettings userManagementSettings)
        {
            _definitionManager = definitionManager;
            _settingStore = settingStore;
            _cfRuntime = cfRuntime;
            _userManagementSettings = userManagementSettings;
        }

        public async Task<EffectiveUserManagementSettings> GetSettingsAsync(string appKey = null)
        {
            var definition = _definitionManager.Get(
                typeof(IUserManagementSettings).GetConfigurableModuleName().NotNull(),
                UserManagementSettingNames.UserManagement);

            appKey ??= _cfRuntime.FrontEndApplication;

            string storedJson = null;
            if (!string.IsNullOrWhiteSpace(appKey))
                storedJson = await _settingStore.GetValueAsync(definition, new SettingManagementContext { AppKey = appKey, TenantId = AbpSession.TenantId });

            // empty AppKey selects the value saved without a front-end application
            storedJson ??= await _settingStore.GetValueAsync(definition, new SettingManagementContext { AppKey = string.Empty, TenantId = AbpSession.TenantId });

            var settings = storedJson != null
                ? JsonConvert.DeserializeObject<UserManagementSettings>(storedJson, new NullToDefaultConverter())
                : null;

            var isStored = settings != null;
            settings ??= CloneDefault();
            settings.DefaultRoles ??= new List<string>();

            return new EffectiveUserManagementSettings(settings, IsSelfRegistrationEnabled(settings, isStored));
        }

        /// <summary>
        /// Values saved before <see cref="UserManagementSettings.AllowSelfRegistration"/> existed keep working when they had a registration method;
        /// the built-in default (never saved) does not enable anonymous registration.
        /// </summary>
        public static bool IsSelfRegistrationEnabled(UserManagementSettings settings, bool isStored)
        {
            if (settings.SupportedRegistrationMethods == SupportedRegistrationMethods.None)
                return false;

            return settings.AllowSelfRegistration ?? isStored;
        }

        private UserManagementSettings CloneDefault()
        {
            // default value is registered in SheshaApplicationModule; clone it so callers can't mutate the shared instance
            var defaultValue = _userManagementSettings.UserManagementSettings.GetDefaultValue() as UserManagementSettings;
            return defaultValue != null
                ? JsonConvert.DeserializeObject<UserManagementSettings>(JsonConvert.SerializeObject(defaultValue))
                : new UserManagementSettings();
        }
    }
}
