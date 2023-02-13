using Shesha.Attributes;
using Shesha.Modules;
using Shesha.Services;
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

            
            var moduleType = assembly.GetExportedTypes().Where(t => !t.IsAbstract && typeof(SheshaModule).IsAssignableFrom(t)).SingleOrDefault();
            var moduleInstance = StaticContext.IocManager.IsRegistered(moduleType)
                ? StaticContext.IocManager.Resolve(moduleType) as SheshaModule
                : null;
            return moduleInstance?.ModuleInfo?.Name;
        }
    }
}
