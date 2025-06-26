using Abp.Dependency;
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
        private static ModuleCacheItem? GetCacheItem(Assembly assembly)
        {
            try
            {
                var store = StaticContext.IocManager.Resolve<IModuleList>();
                return store.Modules.FirstOrDefault(i => i.Assembly == assembly);
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Get type of the configurable module to which the specified assembly belongs to
        /// </summary>
        /// <returns></returns>
        public static Type? GetConfigurableModuleType(this Assembly assembly)
        {
            return GetCacheItem(assembly)?.ModuleType;
        }

        /// <summary>
        /// Get info of the configurable module to which the specified assembly belongs to
        /// </summary>
        /// <returns></returns>
        public static SheshaModuleInfo? GetConfigurableModuleInfo(this Assembly assembly)
        {
            return GetCacheItem(assembly)?.ModuleInfo;
        }

        /// <summary>
        /// Get name of the configurable module to which the specified assembly belongs to
        /// </summary>
        /// <returns></returns>
        public static string? GetConfigurableModuleName(this Assembly assembly) 
        {
            return GetCacheItem(assembly)?.ModuleInfo.Name;
        }
    }

    public class ModuleCacheItem
    {
        public Assembly Assembly { get; protected set; }
        public Type ModuleType { get; protected set; }
        public SheshaModuleInfo ModuleInfo { get; protected set; }

        protected ModuleCacheItem(Assembly assembly, Type moduleType, SheshaModuleInfo moduleInfo)
        {
            Assembly = assembly;
            ModuleType = moduleType;
            ModuleInfo = moduleInfo;
        }
    }

    public class MainModuleCacheItem : ModuleCacheItem
    {
        public MainModuleCacheItem(SheshaModule module) : base(module.GetType().Assembly, module.GetType(), module.ModuleInfo)
        {
        }
    }

    public class SubModuleCacheItem : ModuleCacheItem
    {
        public SubModuleCacheItem(ISheshaSubmodule submodule, MainModuleCacheItem mainModuleItem) : base(submodule.GetType().Assembly, mainModuleItem.ModuleType, mainModuleItem.ModuleInfo)
        {
        }
    }

    public interface IModuleList
    {
        public List<ModuleCacheItem> Modules { get; }
    }
    public class ModuleList : IModuleList, ISingletonDependency
    {
        public List<ModuleCacheItem> Modules { get; private set; }
        private readonly IIocResolver _iocResolver;

        public ModuleList(IIocResolver iocResolver, ITypeFinder typeFinder)
        {
            _iocResolver = iocResolver;

            var moduleTypes = typeFinder.Find(t => !t.IsAbstract && typeof(SheshaModule).IsAssignableFrom(t)).ToList();
            var moduleItems = moduleTypes.Select(mt => {
                var instance = GetModuleInstance(mt);
                return instance != null
                    ? new MainModuleCacheItem(instance)
                    : null;

            })
                .WhereNotNull()
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
                .WhereNotNull()
                .ToList();

            Modules = moduleItems.Cast<ModuleCacheItem>().ToList();
            Modules.AddRange(subModuleItems);
        }

        private SheshaModule? GetModuleInstance(Type moduleType)
        {
            return _iocResolver.IsRegistered(moduleType)
                ? _iocResolver.Resolve(moduleType) as SheshaModule
                : null;
        }
    }
}