using Abp.Dependency;
using Abp.Reflection;
using Shesha.Extensions;
using Shesha.Modules;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Modules hierarchy provider
    /// </summary>
    public class ModuleHierarchyProvider : IModuleHierarchyProvider, ISingletonDependency
    {
        private readonly IIocResolver _iocResolver;
        private readonly ITypeFinder _typeFinder;
        
        private readonly Dictionary<string, ModuleExtendedInfo> _modules;

        public ModuleHierarchyProvider(IIocResolver iocResolver, ITypeFinder typeFinder)
        {
            _iocResolver = iocResolver;
            _typeFinder = typeFinder;

            _modules = FillModules();
        }

        private void AddMissingBaseModules(List<ModuleExtendedInfo> fullList, ModuleExtendedInfo module)
        { 
            if (!fullList.Contains(module))
                fullList.Add(module);
            foreach (var baseModule in module.BaseModules) 
            {
                AddMissingBaseModules(fullList, baseModule);
            }
        }

        private Dictionary<string, ModuleExtendedInfo> FillModules() 
        {
            var moduleTypes = _typeFinder.FindModuleTypes().ToList();

            var modules = moduleTypes.Select(t => {
                var instance = _iocResolver.Resolve(t).ForceCastAs<SheshaModule>();
                return new ModuleExtendedInfo { 
                    Name = instance.ModuleInfo.Name,
                    ModuleInfo = instance.ModuleInfo,
                    ModuleType = t,
                };
            }).ToList();

            // fill hierarchy
            foreach (var module in modules) 
            {
                module.BaseModules = module.ModuleInfo.Hierarchy
                    .Select(t => modules.First(m => m.ModuleType == t))
                    .Where(m => m.ModuleType != module.ModuleType)
                    .ToList();
            }

            foreach (var module in modules) 
            {
                var fullHierarchy = module.BaseModules.ToList();
                foreach (var baseModule in module.BaseModules)
                {
                    AddMissingBaseModules(fullHierarchy, baseModule);
                }                
                module.FullHierarchy = fullHierarchy;
            }

            return modules.ToDictionary(e => e.Name);
        }

        public IEnumerable<string> GetBaseModules(string moduleName)
        {
            return _modules.TryGetValue(moduleName, out var moduleInfo)
                ? moduleInfo.BaseModules.Select(m => m.Name)
                : new List<string>();
        }

        public IEnumerable<string> GetFullHierarchy(string moduleName)
        {
            return _modules.TryGetValue(moduleName, out var moduleInfo)
                ? moduleInfo.FullHierarchy.Select(m => m.Name)
                : new List<string>();
        }

        public class ModuleExtendedInfo 
        {
            public required string Name { get; set; }
            public required Type ModuleType { get; set; }
            public required SheshaModuleInfo ModuleInfo { get; set; }

            
            public List<ModuleExtendedInfo> BaseModules { get; set; } = new();
            public List<ModuleExtendedInfo> FullHierarchy { get; set; } = new();
        }        
    }
}
