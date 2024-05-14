using Abp.Dependency;
using Shesha.Attributes;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Modules;
using Shesha.Reflection;
using Shesha.Settings.Ioc;
using Shesha.Utilities;
using System;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

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

                var moduleInfo = interfaceType.GetConfigurableModuleInfo();
                if (moduleInfo == null)
                    continue; // note: we automatically define only settings in the Shesha modules

                var properties = accessorType.GetProperties().Where(t => typeof(ISettingAccessor).IsAssignableFrom(t.PropertyType)).ToList();

                foreach (var property in properties) 
                {
                    var propertyInstance = property.GetValue(accessor) as ISettingAccessor;
                    if (propertyInstance == null)
                        continue;

                    var definition = GetSettingDefinition(propertyInstance, property, moduleInfo);
                    
                    if (definition != null)
                        context.Add(definition);
                }
            }
        }

        private SettingDefinition GetSettingDefinition(ISettingAccessor propertyInstance, PropertyInfo property, SheshaModuleInfo moduleInfo)
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

            definition.Accessor = property.GetPropertyAccessor();

            definition.Description = ReflectionHelper.GetDescription(property);
            definition.IsClientSpecific = settingAttribute?.IsClientSpecific ?? false;

            definition.ModuleName = moduleInfo.Name;
            definition.ModuleAccessor = moduleInfo.GetModuleAccessor();

            definition.EditForm = !string.IsNullOrWhiteSpace(settingAttribute?.EditorFormName)
                ? new SettingConfigurationIdentifier(definition.ModuleName, settingAttribute.EditorFormName)
                : null;            

            definition.Category = property.GetCategory() ?? property.DeclaringType.GetCategory();
            definition.CategoryAccessor = CodeNamingHelper.GetAccessor(UnwrapSettingAccessorName(property.DeclaringType.Name), property.DeclaringType.GetAttribute<AliasAttribute>()?.Alias);

            return definition;
        }

        private string UnwrapSettingAccessorName(string name) 
        {
            return name.RemovePostfix("SettingsDefault").RemovePostfix("SettingDefault");
        }
    }
}
