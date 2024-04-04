using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Abp.Timing;
using Shesha.Bootstrappers;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Modules;
using Shesha.Utilities;
using System;
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

        public ConfigurableModuleBootstrapper(ITypeFinder typeFinder, IUnitOfWorkManager unitOfWorkManager, IRepository<Module, Guid> moduleRepo, IIocManager iocManager)
        {
            _typeFinder = typeFinder;
            _unitOfWorkManager = unitOfWorkManager;
            _moduleRepo = moduleRepo;
            _iocManager = iocManager;
        }

        public async Task ProcessAsync()
        {
            using (var unitOfWork = _unitOfWorkManager.Begin())
            {
                using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                {
                    await DoProcess();
                }
                await unitOfWork.CompleteAsync();
            }
        }

        private async Task DoProcess()
        {
            var codeModules = _typeFinder
                .Find(type => type != null && type.IsPublic && !type.IsGenericType && !type.IsAbstract && type != typeof(SheshaModule) && typeof(SheshaModule).IsAssignableFrom(type))
                .Select(type => {

                    var instance = _iocManager.Resolve(type) as SheshaModule;

                    var moduleInfo = instance.ModuleInfo;
                    var version = moduleInfo.UseAssemblyVersion
                        ? FileVersionInfo.GetVersionInfo(type.Assembly.Location).FileVersion
                        : moduleInfo.VersionNo;
                    var accessor = moduleInfo.GetModuleAccessor();

                    return new
                    {
                        ModuleType = type,
                        Instance = instance,
                        ModuleInfo = moduleInfo,
                        Version = version,
                        Accessor = accessor
                    };
                })
                .ToList();
            var allSubModules = _typeFinder.Find(t => t != null && t.IsPublic && !t.IsGenericType && !t.IsAbstract && typeof(ISheshaSubmodule).IsAssignableFrom(t))
                .Select(t => {
                    return _iocManager.Resolve(t) as ISheshaSubmodule;
                })
                .ToList();

            var dbModules = await _moduleRepo.GetAll().ToListAsync();

            foreach (var codeModule in codeModules)
            {
                var dbModule = dbModules.FirstOrDefault(m => m.Name.ToLower() == codeModule.ModuleInfo.Name.ToLower());

                
                var isNewModule = dbModule == null;

                if (isNewModule)
                {
                    // Add module if missing
                    dbModule = new Module
                    {
                        Name = codeModule.ModuleInfo.Name,
                        FriendlyName = codeModule.ModuleInfo.FriendlyName,
                        Accessor = codeModule.Accessor,
                        Description = codeModule.ModuleInfo.Description,
                        Publisher = codeModule.ModuleInfo.Publisher,
                        IsEditable = codeModule.ModuleInfo.IsEditable,
                        IsRootModule = codeModule.ModuleInfo.IsRootModule,
                        IsEnabled = true,

                        CurrentVersionNo = codeModule.Version,
                        FirstInitializedDate = Clock.Now,
                    };
                    await _moduleRepo.InsertAsync(dbModule);
                }
                else {
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

                await _unitOfWorkManager.Current.SaveChangesAsync();

                using (_unitOfWorkManager.Current.EnableFilter(AbpDataFilters.SoftDelete)) 
                {
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
                        if (isNewModule)
                            dbModule.FirstInitializedDate = Clock.Now;
                        else
                            dbModule.LastInitializedDate = Clock.Now;

                        await _moduleRepo.UpdateAsync(dbModule);
                    }
                }
            }
        }
    }
}