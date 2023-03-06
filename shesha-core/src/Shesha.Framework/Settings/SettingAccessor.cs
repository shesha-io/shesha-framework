using Abp.Dependency;
using Shesha.Reflection;
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

            Module = property.DeclaringType.GetConfigurableModuleName();
        }

        /// inheritedDoc
        public async Task<TValue> GetValueAsync()
        {
            return await _settingManager.GetOrNullAsync<TValue>(Module, Name);
        }

        /// inheritedDoc
        public TValue GetValue()
        {
            return _settingManager.GetOrNull<TValue>(Module, Name);
        }

        /// inheritedDoc
        public async Task SetValueAsync(TValue value)
        {
            await _settingManager.SetAsync<TValue>(Module, Name, value);
        }

        /// inheritedDoc
        public void WithDefaultValue(TValue value)
        {
            DefaultValue = value;
        }

        /// inheritedDoc
        public object GetDefaultValue() => DefaultValue;
    }
}
