using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Modules;
using Abp.Reflection;
using Abp.Timing;
using Castle.Core.Logging;
using Shesha.Bootstrappers;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Modules;
using Shesha.Reflection;
using Shesha.Startup;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configurable modules bootstrapper
    /// </summary>
    public class ConfigurableModuleBootstrapper : BootstrapperBase, ITransientDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Module, Guid> _moduleRepo;
        private readonly IRepository<ModuleRelation, Guid> _moduleRelationRepo;
        private readonly IModuleHierarchyProvider _moduleHierarchyProvider;        
        private readonly IIocManager _iocManager;
        private readonly IApplicationStartupSession _startupSession;
        private readonly IAbpModuleManager _abpModuleManager;
        private readonly IModuleManager _moduleManager;

        public ConfigurableModuleBootstrapper
        (
            ITypeFinder typeFinder,
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<Module, Guid> moduleRepo,
            IRepository<ModuleRelation, Guid> moduleRelationRepo,
            IModuleHierarchyProvider moduleHierarchyProvider,
            IIocManager iocManager,
            IApplicationStartupSession startupSession,
            IAbpModuleManager abpModuleManager,
            IModuleManager moduleManager,
            IBootstrapperStartupService bootstrapperStartupService,
            ILogger logger
        ) : base(unitOfWorkManager, startupSession, bootstrapperStartupService, logger)
        {
            _typeFinder = typeFinder;
            _unitOfWorkManager = unitOfWorkManager;
            _moduleRepo = moduleRepo;
            _moduleRelationRepo = moduleRelationRepo;
            _moduleHierarchyProvider = moduleHierarchyProvider;
            _iocManager = iocManager;
            _startupSession = startupSession;
            _abpModuleManager = abpModuleManager;
            _moduleManager = moduleManager;
        }

        [UnitOfWork(IsDisabled = true)]
        protected override async Task ProcessInternalAsync()
        {
            await DoProcessAsync();
        }

        private async Task<List<ModuleItem>> GetCodeModulesAsync() 
        {
            var startupModuleName = _abpModuleManager.GetStartupModuleNameOrDefault();
            var result = new List<ModuleItem>();
            using (var unitOfWork = _unitOfWorkManager.Begin())
            {
                using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                {
                    var dbModules = await _moduleRepo.GetAll().ToListAsync();
                    var moduleTypes = _moduleManager.GetModuleTypes();
                    foreach (var type in moduleTypes) 
                    {
                        var instance = _iocManager.Resolve(type).ForceCastAs<SheshaModule>();

                        var moduleInfo = instance.ModuleInfo;
                        var version = moduleInfo.UseAssemblyVersion
                            ? FileVersionInfo.GetVersionInfo(type.Assembly.Location).FileVersion
                            : moduleInfo.VersionNo;
                        var accessor = moduleInfo.GetModuleAccessor();

                        var dbModule = dbModules.FirstOrDefault(m => m.Name.ToLower() == moduleInfo.Name.ToLower());
                        var isNew = dbModule == null;
                        if (dbModule == null)
                        {
                            dbModule = new Module
                            {
                                Name = moduleInfo.Name,
                                FriendlyName = moduleInfo.FriendlyName,
                                Accessor = accessor,
                                Description = moduleInfo.Description,
                                Publisher = moduleInfo.Publisher,
                                IsEditable = moduleInfo.IsEditable,
                                IsRootModule = moduleInfo.Name == startupModuleName,
                                IsEnabled = true,

                                CurrentVersionNo = version,
                                FirstInitializedDate = Clock.Now,
                            };
                            await _moduleRepo.InsertAsync(dbModule);
                        }
                        else {
                            if (dbModule.IsDeleted) 
                            {
                                dbModule.IsDeleted = false;
                                await _moduleRepo.UpdateAsync(dbModule);
                            }
                        }

                        result.Add(new ModuleItem
                        {
                            ModuleType = type,
                            Instance = instance,
                            ModuleInfo = moduleInfo,
                            Version = version,
                            Accessor = accessor,
                            Id = dbModule.Id,
                            IsNewModule = isNew,
                        });                        
                    }

                    // Update startup modules assuming that we have only one startup module per DB
                    // If we'll need to run multiple back-ends on the same DB we'll have to pass current module in each session
                    var toUpdateStartupFlag = dbModules.Where(m => m.IsRootModule != (m.Name == startupModuleName)).ToList();
                    foreach (var module in toUpdateStartupFlag) 
                    {
                        module.IsRootModule = module.Name == startupModuleName;
                        await _moduleRepo.UpdateAsync(module);
                    }

                    // delete missing modules
                    var toDelete = dbModules.Where(e => !result.Any(m => m.Id == e.Id)).ToList();
                    foreach (var module in toDelete) 
                    {
                        await _moduleRepo.DeleteAsync(module);                        
                    }
                }
                await unitOfWork.CompleteAsync();
            }
            return result;
        }

        private async Task DoProcessAsync()
        {
            var codeModules = await GetCodeModulesAsync();
            var allSubModules = _typeFinder
                .Find(t => t != null && t.IsPublic && !t.IsGenericType && !t.IsAbstract && typeof(ISheshaSubmodule).IsAssignableFrom(t))
                .Where(x => ForceUpdate || !_startupSession.AssemblyStaysUnchanged(x.Assembly))
                .Select(t => {
                    return _iocManager.Resolve(t).ForceCastAs<ISheshaSubmodule>();
                })
                .ToList();

            var startupModuleName = _abpModuleManager.GetStartupModuleNameOrDefault();

            foreach (var codeModule in codeModules)
            {
                using (var unitOfWork = _unitOfWorkManager.Begin()) 
                {
                    var dbModule = await _moduleRepo.GetAsync(codeModule.Id);

                    if (!codeModule.IsNewModule) 
                    {
                        dbModule.Name = codeModule.ModuleInfo.Name; // update name to ensure that the case is correct
                        dbModule.Accessor = codeModule.Accessor;
                        dbModule.FriendlyName = codeModule.ModuleInfo.FriendlyName;
                        dbModule.Description = codeModule.ModuleInfo.Description;
                        dbModule.Publisher = codeModule.ModuleInfo.Publisher;
                        dbModule.IsEditable = codeModule.ModuleInfo.IsEditable;
                        dbModule.IsRootModule = codeModule.ModuleInfo.Name == startupModuleName;
                        dbModule.CurrentVersionNo = codeModule.Version;
                        dbModule.FirstInitializedDate = dbModule.FirstInitializedDate ?? Clock.Now;
                        await _moduleRepo.UpdateAsync(dbModule);
                    }

                    // initialize main module
                    var mainModuleInitialized = await codeModule.Instance.InitializeConfigurationAsync();

                    // initialize submodules
                    var submodules = allSubModules.Where(m => m.ModuleType == codeModule.ModuleType).OfType<IHasDataDrivenConfiguration>().ToList();
                    var submodulesInitialized = false;
                    foreach (var submodule in submodules)
                    {
                        submodulesInitialized = submodulesInitialized || await submodule.InitializeConfigurationAsync();
                    }

                    if (mainModuleInitialized || submodulesInitialized)
                    {
                        if (codeModule.IsNewModule)
                            dbModule.FirstInitializedDate = Clock.Now;
                        else
                            dbModule.LastInitializedDate = Clock.Now;

                        await _moduleRepo.UpdateAsync(dbModule);
                    }

                    // Fill module hierarchy
                    await FillModuleHierarchyAsync(dbModule);

                    await unitOfWork.CompleteAsync();
                }
            }
        }

        private async Task FillModuleHierarchyAsync(Module module) 
        {
            var dbRelations = await _moduleRelationRepo.GetAll().Where(e => e.Module == module).ToListAsync();

            var level = 0;
            var baseModulesOld = _moduleHierarchyProvider.GetBaseModules(module.Name)
                .Select(m => new BaseModuleWithLevel(m, level++))
                .ToList();

            level = 1;
            var baseModules = _moduleHierarchyProvider.GetFullHierarchy(module.Name)
                .Select(m => new BaseModuleWithLevel(m, level++))
                .ToList();
            // add module to it's hierarchy to simplify hierarchical queries
            baseModules.Insert(0, new BaseModuleWithLevel(module.Name, 0));

            foreach (var baseModule in baseModules)
            {
                var existingRelation = dbRelations.FirstOrDefault(e => e.BaseModule.Name == baseModule.BaseModule);
                if (existingRelation != null)
                {
                    dbRelations.Remove(existingRelation);
                    if (existingRelation.Level != baseModule.Level)
                    {
                        existingRelation.Level = baseModule.Level;
                        await _moduleRelationRepo.UpdateAsync(existingRelation);
                    }
                }
                else
                {
                    var dbBaseModule = await _moduleRepo.FirstOrDefaultAsync(e => e.Name == baseModule.BaseModule);
                    if (dbBaseModule == null)
                        throw new ModuleNotFoundException(baseModule.BaseModule);

                    var relation = new ModuleRelation
                    {
                        Module = module,
                        BaseModule = dbBaseModule,
                        Level = baseModule.Level,
                    };
                    await _moduleRelationRepo.InsertAsync(relation);
                }
            }

            // delete outstanding relations
            foreach (var toDelete in dbRelations) 
            {
                await _moduleRelationRepo.DeleteAsync(toDelete);
            }
        }

        private class BaseModuleWithLevel
        {
            public string BaseModule { get; set; }
            public int Level { get; set; }
            public BaseModuleWithLevel(string baseModule, int level) 
            { 
                BaseModule = baseModule;
                Level = level;
            }
            public override string ToString()
            {
                return $"{Level} - {BaseModule}";
            }
        }

        private class ModuleItem
        {
            public Guid Id { get; set; }
            public required Type ModuleType { get; set; }
            public required SheshaModule Instance { get;set; }
            public required SheshaModuleInfo ModuleInfo { get; set; }
            public string? Version { get; set; }
            public string? Accessor { get; set; }
            public bool IsNewModule { get; set; }            
        }
    }
}