using Abp.Modules;
using Shesha.Domain;
using Shesha.Exceptions;
using Shesha.Modules;
using Shesha.Reflection;
using Shesha.Services;

namespace Shesha.Extensions
{
    /// <summary>
    /// Configurable module extensions
    /// </summary>
    public static class ModuleExtensions
    {
        /// <summary>
        /// Get startup module name or default (<see cref="SheshaFrameworkModule"/>)
        /// </summary>
        /// <param name="moduleManager">Module manager</param>
        public static string GetStartupModuleNameOrDefault(this IAbpModuleManager moduleManager) 
        {
            return moduleManager.GetStartupModuleNameOrNull() ?? SheshaFrameworkModule.ModuleName;
        }

        /// <summary>
        /// Get startup module name or null
        /// </summary>
        /// <param name="moduleManager">Module manager</param>
        public static string? GetStartupModuleNameOrNull(this IAbpModuleManager moduleManager)
        {
            if (moduleManager.StartupModule.Instance is SheshaModule shaModule)
                return shaModule.ModuleInfo.Name;

            if (moduleManager.StartupModule.Instance is ISheshaSubmodule subModule)
            {
                var module = StaticContext.IocManager.Resolve(subModule.ModuleType).ForceCastAs<SheshaModule>();
                return module.ModuleInfo.Name;
            }

            return null;
        }

        /// <summary>
        /// Ensure module is enabled. Throws <see cref="ModuleDisabledException"/> if disabled
        /// </summary>
        /// <param name="module"></param>
        /// <exception cref="ModuleDisabledException"></exception>
        public static void EnsureEnabled(this Module module)
        {
            if (!module.IsEnabled)
                throw new ModuleDisabledException(module.Name);
        }

        /// <summary>
        /// Ensure module is enabled and editable. Throws <see cref="ModuleIsNotEditableException"/> if not editable and <see cref="ModuleDisabledException"/> if not enabled
        /// </summary>
        /// <param name="module"></param>
        /// <exception cref="ModuleIsNotEditableException"></exception>
        public static void EnsureEditable(this Module module)
        {
            module.EnsureEnabled();
            if (!module.IsEditable)
                throw new ModuleIsNotEditableException(module.Name);
        }
    }
}