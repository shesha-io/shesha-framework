using Abp.Dependency;
using Shesha.Reflection;
using Shesha.Settings.Exceptions;
using Shesha.Utilities;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Settings
{
    /// <summary>
    /// Implementation of the generic setting accessor
    /// </summary>
    /// <typeparam name="TValue"></typeparam>
    public class SettingAccessor<TValue> : ISettingAccessor<TValue>, ITransientDependency
    {
        private readonly PropertyInfo _property;
        private readonly IShaSettingManager _settingManager;

        public string Name { get; private set; }
        public string Module { get; private set; }
        public TValue DefaultValue { get; private set; }

        public SettingAccessor(PropertyInfo property, IShaSettingManager settingManager)
        {
            _settingManager = settingManager;

            _property = property;
            Init(property);
        }

        private void Init(PropertyInfo property)
        {
            var settingAttribute = property.GetCustomAttribute<SettingAttribute>();
            Name = settingAttribute != null
                ? settingAttribute.Name
                : property.Name;

            Module = property.DeclaringType.NotNull().GetConfigurableModuleName().NotNull();
        }

        /// inheritedDoc
        public async Task<TValue?> GetValueOrNullAsync(SettingManagementContext? context = null)
        {
            return await _settingManager.GetOrNullAsync<TValue>(Module, Name, context);
        }

        /// inheritedDoc
        public async Task<TValue> GetValueAsync(SettingManagementContext? context = null)
        {
            var value = await GetValueOrNullAsync(context);
            return value ?? throw new UnexpectedNullSettingValueException(Module, Name);
        }

        /// inheritedDoc
        public TValue? GetValueOrNull(SettingManagementContext? context = null)
        {
            return AsyncHelper.RunSync<TValue?>(() => GetValueOrNullAsync(context));
        }

        /// inheritedDoc
        public TValue GetValue(SettingManagementContext? context = null)
        {
            return GetValueOrNull(context) ?? throw new UnexpectedNullSettingValueException(Module, Name);
        }

        /// inheritedDoc
        public async Task SetValueAsync(TValue? value)
        {
            await _settingManager.SetAsync<TValue>(Module, Name, value);
        }

        /// inheritedDoc
        public void WithDefaultValue(TValue value)
        {
            DefaultValue = value;
        }

        /// inheritedDoc
        public object? GetDefaultValue() => DefaultValue;        
    }
}