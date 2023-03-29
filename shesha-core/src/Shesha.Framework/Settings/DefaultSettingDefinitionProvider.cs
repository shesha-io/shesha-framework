using Abp.Dependency;
using Shesha.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Settings.Ioc;
using System;
using System.Linq;
using System.Reflection;

namespace Shesha.Settings
{
    /// <summary>
    /// Default settings definition provider. Defines all settings registered using <see cref="IocManagerExtensions.RegisterSettingAccessor"/>
    /// </summary>
    public class DefaultSettingDefinitionProvider : ISettingDefinitionProvider, ITransientDependency
    {
        private readonly IIocManager _iocManager;

        public DefaultSettingDefinitionProvider(IIocManager iocManager)
        {
            _iocManager = iocManager;
        }

        public void Define(ISettingDefinitionContext context)
        {
            var accessors = _iocManager.ResolveAll<ISettingAccessors>();

            foreach (var accessor in accessors)
            {
                var accessorType = accessor.GetType();

                var interfaceType = accessorType.GetInterfaces().Where(t => t != typeof(ISettingAccessors) && typeof(ISettingAccessors).IsAssignableFrom(t)).FirstOrDefault();
                var moduleName = interfaceType.GetConfigurableModuleName();

                if (string.IsNullOrWhiteSpace(moduleName))
                    continue; // note: we automatically define only settings in the Shesha modules

                var properties = accessorType.GetProperties().Where(t => typeof(ISettingAccessor).IsAssignableFrom(t.PropertyType)).ToList();

                foreach (var property in properties) 
                {
                    var propertyInstance = property.GetValue(accessor) as ISettingAccessor;
                    if (propertyInstance == null)
                        continue;

                    var definition = GetSettingDefinition(propertyInstance, property, moduleName);
                    
                    if (definition != null)
                        context.Add(definition);
                }
            }
        }

        private SettingDefinition GetSettingDefinition(ISettingAccessor propertyInstance, PropertyInfo property, string moduleName)
        {
            var valueType = property.PropertyType.IsGenericType
                ? property.PropertyType.GenericTypeArguments[0]
                : null;
            if (valueType == null)
                return null;

            var definitionType = typeof(SettingDefinition<>).MakeGenericType(valueType);

            var settingAttribute = property.GetAttribute<SettingAttribute>();
            if (settingAttribute == null)
                return null;

            var name = settingAttribute != null
                ? settingAttribute.Name
                : property.Name;
            var displayName = ReflectionHelper.GetDisplayName(property);

            var defaultValue = propertyInstance.GetDefaultValue();

            var definition = Activator.CreateInstance(definitionType, name, defaultValue, displayName) as SettingDefinition;
            definition.Description = ReflectionHelper.GetDescription(property);
            definition.IsClientSpecific = settingAttribute?.IsClientSpecific ?? false;

            definition.ModuleName = moduleName;
            definition.EditForm = !string.IsNullOrWhiteSpace(settingAttribute?.EditorFormName)
                ? new ConfigurationItemIdentifier() { Name = settingAttribute.EditorFormName, Module = definition.ModuleName }
                : null;            

            definition.Category = property.GetCategory() ?? property.DeclaringType.GetCategory();

            return definition;
        }
    }
}
