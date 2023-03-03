using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using JetBrains.Annotations;
using Newtonsoft.Json;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Services.Settings.Dto;
using Shesha.Settings.Json;
using System;
using System.ComponentModel;
using System.Globalization;
using System.Threading.Tasks;
using Module = Shesha.Domain.ConfigurationItems.Module;

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

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;        

        public ShaSettingManager(ISettingDefinitionManager settingDefinitionManager, IConfigurationFrameworkRuntime cfRuntime, IRepository<SettingValue, Guid> settingValueRepository, Services.Settings.ISettingStore settingStore, 
            IRepository<FrontEndApp, Guid> appRepository,
            IRepository<Module, Guid> moduleRepository)
        {
            _settingDefinitionManager = settingDefinitionManager;
            _cfRuntime = cfRuntime;
            _settingValueRepository = settingValueRepository;
            _settingStore = settingStore;
            _appRepository = appRepository;
            _moduleRepository = moduleRepository;
        }

        public TValue GetOrNull<TValue>([NotNull] string module, [NotNull] string name, SettingManagementContext context = null)
        {
            // find definition
            // check 

            throw new System.NotImplementedException();
        }

        public async Task<object> GetOrNullAsync([NotNull] string module, [NotNull] string name, SettingManagementContext context = null) 
        {
            var setting = _settingDefinitionManager.Get(name);

            var settingValue = await _settingStore.GetSettingValueAsync(setting, context ?? GetCurrentContext());

            return settingValue != null
                ? Deserialize(settingValue.Value, setting.GetValueType())
                : setting.GetDefaultValue();
        }

        public async Task<TValue> GetOrNullAsync<TValue>([NotNull] string module, [NotNull] string name, SettingManagementContext context = null) 
        {
            var setting = _settingDefinitionManager.Get(name);

            var settingValue = await _settingStore.GetSettingValueAsync(setting, context ?? GetCurrentContext());

            return settingValue != null
                ? Deserialize<TValue>(settingValue.Value)
                : setting.GetDefaultValue() is TValue typedValue
                    ? typedValue
                    : default;
        }

        public async Task SetAsync<TValue>([NotNull] string module, [NotNull] string name, [CanBeNull] TValue value, SettingManagementContext context = null)
        {
            context = context ?? GetCurrentContext();
            var setting = _settingDefinitionManager.Get(name);

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
            }
            
            settingValue.Value = JsonConvert.SerializeObject(value, setting.GetValueType(), Formatting.Indented, new JsonSerializerSettings());
            await _settingValueRepository.InsertOrUpdateAsync(settingValue);
        }

        private async Task<SettingConfiguration> EnsureConfigurationAsync(SettingDefinition setting)
        {
            var definition = await _settingStore.GetSettingDefinitionAsync(new ConfigurationItemIdentifier { Name = setting.Name, Module = setting.ModuleName });
            if (definition != null)
                return definition;

            var module = !string.IsNullOrWhiteSpace(setting.ModuleName)
                ? await _moduleRepository.FirstOrDefaultAsync(m => m.Name == setting.ModuleName)
                : null;

            var dataType = setting.GetSettingDataType();

            return await _settingStore.CreateSettingDefinitionAsync(new CreateSettingDefinitionDto
            {
                Name = setting.Name,
                Label = setting.DisplayName,
                Description = setting.Description,
                Category = setting.Category,
                IsClientSpecific = setting.IsClientSpecific,
                DataType = dataType.DataType,
                EditorFormModule = setting.EditForm?.Module,
                EditorFormName = setting.EditForm?.Name,
                ModuleId = module?.Id,
            });
        }

        private SettingManagementContext GetCurrentContext()
        {
            return new SettingManagementContext {
                TenantId = AbpSession.TenantId,
                AppKey = _cfRuntime.FrontEndApplication,
            };
        }

        private TValue Deserialize<TValue>(string value) 
        {
            if (typeof(TValue).IsClass)
            {
                return JsonConvert.DeserializeObject<TValue>(value);
            }
            else
                return To<TValue>(value);
        }

        private object Deserialize(string value, Type targetType)
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

        private static T To<T>(object obj) 
        {
            if (typeof(T) == typeof(Guid) || typeof(T) == typeof(TimeSpan))
            {
                return (T)TypeDescriptor.GetConverter(typeof(T)).ConvertFromInvariantString(obj.ToString());
            }

            if (typeof(T).IsEnum)
            {
                if (Enum.IsDefined(typeof(T), obj))
                {
                    return (T)Enum.Parse(typeof(T), obj.ToString());
                }

                throw new ArgumentException($"Enum type undefined '{obj}'.");
            }

            return (T)Convert.ChangeType(obj, typeof(T), CultureInfo.InvariantCulture);
        }

        private static object To(object obj, Type targetType)
        {
            if (targetType == typeof(Guid) || targetType == typeof(TimeSpan))
            {
                return TypeDescriptor.GetConverter(targetType).ConvertFromInvariantString(obj.ToString());
            }

            if (targetType.IsEnum)
            {
                if (Enum.IsDefined(targetType, obj))
                {
                    return Enum.Parse(targetType, obj.ToString());
                }

                throw new ArgumentException($"Enum type undefined '{obj}'.");
            }

            return Convert.ChangeType(obj, targetType, CultureInfo.InvariantCulture);
        }
    }
}
