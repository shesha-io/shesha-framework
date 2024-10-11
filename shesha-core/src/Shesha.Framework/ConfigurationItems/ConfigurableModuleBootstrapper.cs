using Abp.Collections.Extensions;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Abp.Timing;
using Shesha.Bootstrappers;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Modules;
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
    public class ConfigurableModuleBootstrapper : IBootstrapper, ITransientDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Module, Guid> _moduleRepo;
        private readonly IIocManager _iocManager;
        private readonly IApplicationStartupSession _startupSession;

        public ConfigurableModuleBootstrapper
        (
            ITypeFinder typeFinder,
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<Module, Guid> moduleRepo,
            IIocManager iocManager,
            IApplicationStartupSession startupSession
        )
        {
            _typeFinder = typeFinder;
            _unitOfWorkManager = unitOfWorkManager;
            _moduleRepo = moduleRepo;
            _iocManager = iocManager;
            _startupSession = startupSession;
        }

        [UnitOfWork(IsDisabled = true)]
        public async Task ProcessAsync()
        {
            await DoProcessAsync();
        }

        private async Task<List<ModuleItem>> GetCodeModulesAsync() 
        {
            var result = new List<ModuleItem>();
            using (var unitOfWork = _unitOfWorkManager.Begin())
            {
                using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                {
                    var dbModules = await _moduleRepo.GetAll().ToListAsync();
                    var moduleTypes = _typeFinder
                        .Find(type => type != null && type.IsPublic && !type.IsGenericType && !type.IsAbstract && type != typeof(SheshaModule) && typeof(SheshaModule).IsAssignableFrom(type))
                        .Where(x => !_startupSession.AssemblyStaysUnchanged(x.Assembly))
                        .ToList();
                    foreach (var type in moduleTypes) 
                    {
                        var instance = _iocManager.Resolve(type) as SheshaModule;

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
                                IsRootModule = moduleInfo.IsRootModule,
                                IsEnabled = true,

                                CurrentVersionNo = version,
                                FirstInitializedDate = Clock.Now,
                            };
                            await _moduleRepo.InsertAsync(dbModule);
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
                .Where(x => !_startupSession.AssemblyStaysUnchanged(x.Assembly))
                .Select(t => {
                    return _iocManager.Resolve(t) as ISheshaSubmodule;
                })
                .ToList();

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
                        dbModule.IsRootModule = codeModule.ModuleInfo.IsRootModule;
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

                    await unitOfWork.CompleteAsync();
                }
            }
        }
        private class ModuleItem
        {
            public Guid Id { get; set; }
            public Type ModuleType { get; set; }
            public SheshaModule Instance { get;set; }
            public SheshaModuleInfo ModuleInfo { get; set; }
            public string Version { get; set; }
            public string Accessor { get; set; }
            public bool IsNewModule { get; set; }            
        }
    }
}