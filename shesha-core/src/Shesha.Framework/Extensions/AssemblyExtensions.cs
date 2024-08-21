using Abp.Reflection;
using Shesha.Modules;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Shesha.Extensions
{
    /// <summary>
    /// Assembly extensions
    /// </summary>
    public static class AssemblyExtensions
    {
        private static List<ModuleCacheItem> _cacheItems;
        static AssemblyExtensions ()
        {
            var typeFinder = StaticContext.IocManager.Resolve<ITypeFinder>();

            var moduleTypes = typeFinder.Find(t => !t.IsAbstract && typeof(SheshaModule).IsAssignableFrom(t)).ToList();
            var moduleItems = moduleTypes.Select(mt => {
                    var instance = GetModuleInstance(mt);
                    return instance != null
                        ? new MainModuleCacheItem(instance)
                        : null;
                
                })
                .Where(item => item != null)
                .ToList();
            
            var subModuleTypes = typeFinder.Find(t => !t.IsAbstract && typeof(ISheshaSubmodule).IsAssignableFrom(t)).ToList();
            var subModuleItems = subModuleTypes.Select(sm => {
                var subModuleInstance = StaticContext.IocManager.IsRegistered(sm)
                    ? StaticContext.IocManager.Resolve(sm) as ISheshaSubmodule
                    : null;
                if (subModuleInstance != null)
                {
                    var mainModuleItem = moduleItems.FirstOrDefault(i => i.ModuleType == subModuleInstance.ModuleType);
                    if (mainModuleItem != null)
                        return new SubModuleCacheItem(subModuleInstance, mainModuleItem);
                }
                return null;
            })
                .Where(item => item != null)
                .ToList();

            _cacheItems = moduleItems.Cast<ModuleCacheItem>().ToList();
            _cacheItems.AddRange(subModuleItems);
        }

        private static SheshaModule GetModuleInstance(Type moduleType)
        {
            return StaticContext.IocManager.IsRegistered(moduleType)
                ? StaticContext.IocManager.Resolve(moduleType) as SheshaModule
                : null;
        }

        private static ModuleCacheItem GetCacheItem(Assembly assembly)
        {
            return _cacheItems.FirstOrDefault(i => i.Assembly == assembly);
        }

        /// <summary>
        /// Get type of the configurable module to which the specified assembly belongs to
        /// </summary>
        /// <returns></returns>
        public static Type GetConfigurableModuleType(this Assembly assembly)
        {
            return GetCacheItem(assembly)?.ModuleType;
        }

        /// <summary>
        /// Get info of the configurable module to which the specified assembly belongs to
        /// </summary>
        /// <returns></returns>
        public static SheshaModuleInfo GetConfigurableModuleInfo(this Assembly assembly)
        {
            return GetCacheItem(assembly)?.ModuleInfo;
        }

        /// <summary>
        /// Get name of the configurable module to which the specified assembly belongs to
        /// </summary>
        /// <returns></returns>
        public static string GetConfigurableModuleName(this Assembly assembly) 
        {
            return GetCacheItem(assembly)?.ModuleInfo.Name;
        }

        private class ModuleCacheItem 
        {
            public Assembly Assembly { get; protected set; }
            public Type ModuleType { get; protected set; }
            public SheshaModuleInfo ModuleInfo { get; protected set; }
        }

        private class MainModuleCacheItem: ModuleCacheItem
        {
            public MainModuleCacheItem(SheshaModule module)
            {
                var moduleType = module.GetType();
                Assembly = moduleType.Assembly;
                ModuleType = moduleType;
                ModuleInfo = module.ModuleInfo;
            }
        }

        private class SubModuleCacheItem : ModuleCacheItem
        {
            public SubModuleCacheItem(ISheshaSubmodule submodule, MainModuleCacheItem mainModuleItem) 
            {
                Assembly = submodule.GetType().Assembly;
                ModuleType = mainModuleItem.ModuleType;
                ModuleInfo = mainModuleItem.ModuleInfo;
            }
        }
    }
}
