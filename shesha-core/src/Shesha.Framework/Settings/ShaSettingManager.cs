using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using Abp.UI;
using JetBrains.Annotations;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Shesha.Authorization.Users;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Services.Settings.Dto;
using Shesha.Settings.Json;
using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.Threading.Tasks;
using Module = Shesha.Domain.Module;

namespace Shesha.Settings
{
    /// inheritedDoc
    public class ShaSettingManager : IShaSettingManager, ITransientDependency
    {
        private readonly ISettingDefinitionManager _settingDefinitionManager;
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly IRepository<SettingValue, Guid> _settingValueRepository;
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly IRepository<FrontEndApp, Guid> _appRepository;
        private readonly Services.Settings.ISettingStore _settingStore;
        private readonly IRepository<User, long> _userRepository;

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;        

        public ShaSettingManager(ISettingDefinitionManager settingDefinitionManager, 
            IConfigurationFrameworkRuntime cfRuntime, 
            IRepository<SettingValue, Guid> settingValueRepository, 
            Services.Settings.ISettingStore settingStore, 
            IRepository<FrontEndApp, Guid> appRepository,
            IRepository<Module, Guid> moduleRepository,
            IRepository<User, long> userRepository)
        {
            _settingDefinitionManager = settingDefinitionManager;
            _cfRuntime = cfRuntime;
            _settingValueRepository = settingValueRepository;
            _settingStore = settingStore;
            _appRepository = appRepository;
            _moduleRepository = moduleRepository;
            _userRepository = userRepository;
        }

        public async Task<JObject> GetJObjectOrNullAsync([NotNull] string module, [NotNull] string name, SettingManagementContext? context = null)
        {
            var setting = _settingDefinitionManager.Get(module, name);

            var settingValue = await _settingStore.GetValueAsync(setting, context ?? GetCurrentContext());

            return settingValue != null
                ? JObject.Parse(settingValue)
                : JObject.FromObject(JsonConvert.SerializeObject(setting.GetDefaultValue()));
        }

        public async Task<object?> GetOrNullAsync([NotNull] string module, [NotNull] string name, SettingManagementContext? context = null) 
        {
            var setting = _settingDefinitionManager.Get(module, name);

            var settingValue = await _settingStore.GetValueAsync(setting, context ?? GetCurrentContext());

            return settingValue != null
                ? Deserialize(settingValue, setting.GetValueType())
                : setting.GetDefaultValue();
        }


        public async Task<object?> UserSpecificGetOrNullAsync<TValue>([NotNull] string module, [NotNull] string name, string? dataType, TValue? defaultValue, SettingManagementContext? context = null)
        {
            var setting = _settingDefinitionManager.GetOrNull(module, name);

            if (setting == null && dataType != null)
            {
                setting = _settingDefinitionManager.CreateUserSettingDefinition(module, name, dataType, defaultValue);
                _settingDefinitionManager.AddDefinition(setting);
                await EnsureConfigurationAsync(setting);

                var value = await _settingStore.GetSettingValueAsync(setting, context ?? GetCurrentContext());
                return value != null && value.Value != null
                    ? Deserialize(value.Value, setting.GetValueType())
                    : setting.GetDefaultValue();
            }

            return null;
        }

        public async Task UpdateUserSettingAsync<TValue>([NotNull] string module, [NotNull] string name, string dataType,[CanBeNull] TValue? value, SettingManagementContext? context = null)
        {
            context = context ?? GetCurrentContext();

            var setting = _settingDefinitionManager.GetOrNull(module, name);

            if (setting == null)
            {
                setting = _settingDefinitionManager.CreateUserSettingDefinition(module, name, dataType, value);
                _settingDefinitionManager.AddDefinition(setting);
            }

            var configuration = await EnsureConfigurationAsync(setting);

            var settingValue = await _settingStore.GetSettingValueAsync(setting, context);
            if (settingValue == null)
            {
                settingValue = new SettingValue()
                {
                    SettingConfiguration = configuration,
                };

                if (setting.IsClientSpecific)
                {
                    settingValue.Application = !string.IsNullOrWhiteSpace(context.AppKey)
                        ? await _appRepository.FirstOrDefaultAsync(a => a.AppKey == context.AppKey)
                        : null;
                }
                if (setting.IsUserSpecific)
                {
                    settingValue.User = context.UserId.HasValue
                        ? await _userRepository.GetAsync(context.UserId.Value)
                        : null;
                }
            }

            settingValue.Value = JsonConvert.SerializeObject(value, setting.GetValueType(), Formatting.Indented, new JsonSerializerSettings());

            if (Deserialize(settingValue.Value, setting.GetValueType()) == null) throw new UserFriendlyException("Value does not match the type expected by the setting.");

            await _settingValueRepository.InsertOrUpdateAsync(settingValue);
        }

        public async Task<TValue?> GetOrNullAsync<TValue>([NotNull] string module, [NotNull] string name, SettingManagementContext? context = null) 
        {
            var setting = _settingDefinitionManager.Get(module, name);

            var settingValue = await _settingStore.GetValueAsync(setting, context ?? GetCurrentContext());

            return settingValue != null
                ? Deserialize<TValue>(settingValue)
                : setting.GetDefaultValue() is TValue typedValue
                    ? typedValue
                    : default;
        }

        public async Task SetAsync<TValue>([NotNull] string module, [NotNull] string name, [CanBeNull] TValue? value, SettingManagementContext? context = null)
        {
            context = context ?? GetCurrentContext();
            var setting = _settingDefinitionManager.Get(module, name);

            var settingValue = await _settingStore.GetSettingValueAsync(setting, context);
            if (settingValue == null) 
            {
                var configuration = await EnsureConfigurationAsync(setting);
                settingValue = new SettingValue() 
                { 
                    SettingConfiguration = configuration,
                };
                if (setting.IsClientSpecific) 
                {
                    settingValue.Application = !string.IsNullOrWhiteSpace(context.AppKey)
                        ? await _appRepository.FirstOrDefaultAsync(a => a.AppKey == context.AppKey)
                        : null;
                }
                if (setting.IsUserSpecific)
                {
                    settingValue.User = context.UserId.HasValue
                        ? await _userRepository.GetAsync(context.UserId.Value)
                        : null;
                }
            }
            
            settingValue.Value = JsonConvert.SerializeObject(value, setting.GetValueType(), Formatting.Indented, new JsonSerializerSettings());
            await _settingValueRepository.InsertOrUpdateAsync(settingValue);
        }

        private async Task<SettingConfiguration> EnsureConfigurationAsync(SettingDefinition setting)
        {
            var definition = await _settingStore.GetSettingConfigurationAsync(new SettingConfigurationIdentifier(setting.ModuleName, setting.Name));
            if (definition != null)
                return definition;

            var module = !string.IsNullOrWhiteSpace(setting.ModuleName)
                ? await _moduleRepository.FirstOrDefaultAsync(m => m.Name == setting.ModuleName)
                : null;

            var dataType = setting.GetSettingDataType();

            return await _settingStore.CreateSettingConfigurationAsync(new CreateSettingDefinitionDto
            {
                Name = setting.Name,
                Label = setting.DisplayName,
                Description = setting.Description,
                Category = setting.Category,
                IsClientSpecific = setting.IsClientSpecific,
                DataType = dataType.DataType,
                EditorFormModule = setting.EditForm?.Module,
                EditorFormName = setting.EditForm?.Name,
                IsUserSpecific = setting.IsUserSpecific,
                ModuleId = module?.Id,
            });
        }

        [DebuggerStepThrough]
        private SettingManagementContext GetCurrentContext()
        {
            return new SettingManagementContext {
                TenantId = AbpSession.TenantId,
                AppKey = _cfRuntime.FrontEndApplication,
                UserId = AbpSession.UserId
            };
        }

        private TValue? Deserialize<TValue>(string value) 
        {
            if (typeof(TValue).IsClass)
            {
                return JsonConvert.DeserializeObject<TValue>(value);
            }
            else
                return To<TValue>(value);
        }

        private object? Deserialize(string value, Type targetType)
        {
            if (targetType.IsClass)
            {
                try 
                {
                    // note: NullToDefaultConverter is used to convert null values to defaults for non nullable types
                    return JsonConvert.DeserializeObject(value, targetType, new NullToDefaultConverter());
                }
                catch (Exception) 
                {
                    return null;
                }
            }
            else
                return To(value, targetType);
        }

        private static T? To<T>(object obj) 
        {
            if (typeof(T) == typeof(Guid) || typeof(T) == typeof(TimeSpan))
            {
                var converter = TypeDescriptor.GetConverter(typeof(T));
                var value = converter.ConvertFromInvariantString(obj.ToString() ?? string.Empty);
                return (T?)value;
            }

            if (typeof(T).IsEnum)
            {
                if (Enum.IsDefined(typeof(T), obj))
                {
                    return (T)Enum.Parse(typeof(T), obj.ToString() ?? string.Empty);
                }

                throw new ArgumentException($"Enum type undefined '{obj}'.");
            }

            return (T)Convert.ChangeType(obj, typeof(T), CultureInfo.InvariantCulture);
        }

        private static object? To(object obj, Type targetType)
        {
            if (targetType == typeof(Guid) || targetType == typeof(TimeSpan))
            {
                return TypeDescriptor.GetConverter(targetType).ConvertFromInvariantString(obj.ToString() ?? string.Empty);
            }

            if (targetType.IsEnum)
            {
                if (Enum.IsDefined(targetType, obj))
                {
                    return Enum.Parse(targetType, obj.ToString() ?? string.Empty);
                }

                throw new ArgumentException($"Enum type undefined '{obj}'.");
            }

            return Convert.ChangeType(obj, targetType, CultureInfo.InvariantCulture);
        }
    }
}
