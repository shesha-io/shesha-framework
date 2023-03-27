using Shesha.Attributes;
using Shesha.Modules;
using Shesha.Services;
using System;
using System.Linq;
using System.Reflection;

namespace Shesha.Extensions
{
    /// <summary>
    /// Assembly extensions
    /// </summary>
    public static class AssemblyExtensions
    {
        /// <summary>
        /// Get name of the configurable module to which the specified assembly belongs to
        /// </summary>
        /// <returns></returns>
        public static string GetConfigurableModuleName(this Assembly assembly) 
        {
            var attribute = assembly.GetCustomAttribute<BelongsToConfigurableModuleAttribute>();
            if (attribute != null)
                return attribute.ModuleName;

            var moduleType = assembly.GetSheshaModuleType();
            var moduleInstance = StaticContext.IocManager.IsRegistered(moduleType)
                ? StaticContext.IocManager.Resolve(moduleType) as SheshaModule
                : null;
            return moduleInstance?.ModuleInfo?.Name;
        }

        /// <summary>
        /// Get type of the Shesha module declared in the specified assembly
        /// </summary>
        public static Type GetSheshaModuleType(this Assembly assembly) 
        {
            var moduleType = assembly.GetExportedTypes().Where(t => !t.IsAbstract && typeof(SheshaModule).IsAssignableFrom(t)).SingleOrDefault();
            if (moduleType != null)
                return moduleType;

            var submoduleType = assembly.GetExportedTypes().Where(t => !t.IsAbstract && typeof(ISheshaSubmodule).IsAssignableFrom(t)).SingleOrDefault();
            if (submoduleType != null) 
            {
                var subModuleInstance = StaticContext.IocManager.IsRegistered(submoduleType)
                    ? StaticContext.IocManager.Resolve(submoduleType) as ISheshaSubmodule
                    : null;
                return subModuleInstance?.ModuleType;
            }

            return null;
        }
    }
}
