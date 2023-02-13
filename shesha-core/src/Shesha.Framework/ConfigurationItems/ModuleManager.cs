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

            var module = _moduleRepository.GetAll().FirstOrDefault(m => m.Name == moduleName);
            if (module == null) 
            {
                module = new Module
                {
                    Name = moduleName,
                    IsEnabled = true,
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
