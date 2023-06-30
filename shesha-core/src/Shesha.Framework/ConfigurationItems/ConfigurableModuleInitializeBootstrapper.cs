using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Abp.Timing;
using Shesha.Bootstrappers;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Modules;
using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configurable modules bootstrapper
    /// </summary>
    [DependsOnBootstrapper(typeof(ConfigurableModuleBootstrapper))]
    public class ConfigurableModuleInitializeBootstrapper : IBootstrapper, ITransientDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Module, Guid> _moduleRepo;
        private readonly IIocManager _iocManager;

        public ConfigurableModuleInitializeBootstrapper(ITypeFinder typeFinder, IUnitOfWorkManager unitOfWorkManager, IRepository<Module, Guid> moduleRepo, IIocManager iocManager)
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

                    return new
                    {
                        ModuleType = type,
                        Instance = instance,
                        ModuleInfo = moduleInfo,
                        Version = version,
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
                    dbModule.LastInitializedDate = Clock.Now;
                    await _moduleRepo.UpdateAsync(dbModule);
                }
            }
        }
    }
}