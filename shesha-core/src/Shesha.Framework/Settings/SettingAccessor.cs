﻿using Abp.Dependency;
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
        public async Task<TValue?> GetValueOrNullAsync()
        {
            return await _settingManager.GetOrNullAsync<TValue>(Module, Name);
        }

        /// inheritedDoc
        public async Task<TValue> GetValueAsync()
        {
            var value = await GetValueOrNullAsync();
            return value ?? throw new UnexpectedNullSettingValueException(Module, Name);
        }

        /// inheritedDoc
        public TValue? GetValueOrNull()
        {
            return AsyncHelper.RunSync<TValue?>(() => GetValueOrNullAsync());
        }

        /// inheritedDoc
        public TValue GetValue()
        {
            return GetValueOrNull() ?? throw new UnexpectedNullSettingValueException(Module, Name);
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