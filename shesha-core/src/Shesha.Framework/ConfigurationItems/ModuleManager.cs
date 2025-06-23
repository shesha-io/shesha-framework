using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Module = Shesha.Domain.Module;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configurable modules manager
    /// </summary>
    public class ModuleManager : IModuleManager, ITransientDependency
    {
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ModuleManager(IRepository<Module, Guid> moduleRepository, IUnitOfWorkManager unitOfWorkManager)
        {
            _moduleRepository = moduleRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }

        /// <summary>
        /// Get module by Id. Throws exception when module not found
        /// </summary>
        /// <param name="id">Module Id</param>
        /// <returns></returns>
        public async Task<Module> GetModuleAsync(Guid id) 
        {
            return await _moduleRepository.GetAsync(id);
        }

        public async Task<Module> GetModuleAsync(string moduleName)
        {
            return await GetModuleOrNullAsync(moduleName) ?? throw new ModuleNotFoundException(moduleName);
        }

        public async Task<Guid> GetModuleIdAsync(string moduleName)
        {
            // TODO: add cache with ID and name
            return (await GetModuleAsync(moduleName)).Id;
        }

        public async Task<Module?> GetModuleOrNullAsync(string moduleName)
        {
            if (string.IsNullOrWhiteSpace(moduleName))
                throw new ArgumentNullException(nameof(moduleName));

            return await _moduleRepository.GetAll().FirstOrDefaultAsync(m => m.Name == moduleName);
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
        public async Task<Module?> GetOrCreateModuleAsync(Assembly assembly) 
        {
            var moduleName = assembly.GetConfigurableModuleName();
            return !string.IsNullOrWhiteSpace(moduleName)
                ? await GetOrCreateModuleAsync(moduleName)
                : null;
        }
    }
}
