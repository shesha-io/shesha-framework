using Shesha.Modules;
using Shesha.Services;
using System;

namespace Shesha.Attributes
{
    /// <summary>
    /// Is used to link assembly to a configurable module. All configurable items defined in the code will be treated as part of the specified module
    /// </summary>
    [AttributeUsage(AttributeTargets.Assembly)]
    public class BelongsToConfigurableModuleAttribute : Attribute
    {
        protected Type ModuleType { get; set; }
        public string ModuleName { get; set; }

        public BelongsToConfigurableModuleAttribute(string moduleName)
        {
            ModuleName = moduleName;
        }

        public BelongsToConfigurableModuleAttribute(Type moduleType) 
        {
            ModuleType = moduleType;
            if (!typeof(SheshaModule).IsAssignableFrom(moduleType))
                throw new ArgumentException($"Value of the `{nameof(moduleType)}` must be a subclass of {nameof(SheshaModule)}");

            var instance = StaticContext.IocManager.Resolve(moduleType) as SheshaModule;
            ModuleName = instance.ModuleInfo.Name;
        }
    }
}
