using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Module = Shesha.Domain.ConfigurationItems.Module;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configurable modules manager
    /// </summary>
    public class ModuleManager: IModuleManager, ITransientDependency
    {
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ModuleManager(IRepository<Module, Guid> moduleRepository, IUnitOfWorkManager unitOfWorkManager)
        {
            _moduleRepository = moduleRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }

        /// inheritedDoc
        public async Task<Module> GetOrCreateModuleAsync(string moduleName)
        {
            if (string.IsNullOrWhiteSpace(moduleName))
                throw new ArgumentNullException(nameof(moduleName));

            // Return the most recently released version for this module name
            var module = await _moduleRepository.GetAll()
                .Where(m => m.Name == moduleName)
                .OrderByDescending(m => m.ReleaseDate)
                .FirstOrDefaultAsync();

            if (module == null)
            {
                module = new Module
                {
                    Name = moduleName,
                    IsEnabled = true,
                    ReleaseDate = Abp.Timing.Clock.Now,
                };
                await _moduleRepository.InsertAsync(module);
                await _unitOfWorkManager.Current.SaveChangesAsync();
            }

            return module;
        }

        /// inheritedDoc
        public async Task<Module> GetOrCreateModuleAsync(Assembly assembly) 
        {
            var moduleName = assembly.GetConfigurableModuleName();
            return !string.IsNullOrWhiteSpace(moduleName)
                ? await GetOrCreateModuleAsync(moduleName)
                : null;
        }
    }
}
