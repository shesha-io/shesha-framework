using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Extensions;
using Shesha.Modules;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
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
        private readonly ITypeFinder _typeFinder;
        private readonly IIocResolver _iocResolver;

        public ModuleManager(IRepository<Module, Guid> moduleRepository, IUnitOfWorkManager unitOfWorkManager, ITypeFinder typeFinder, IIocResolver iocResolver)
        {
            _moduleRepository = moduleRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _typeFinder = typeFinder;
            _iocResolver = iocResolver;
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

        /// inheritedDoc
        public async Task<Module> GetModuleAsync(string moduleName)
        {
            return await GetModuleOrNullAsync(moduleName) ?? throw new ModuleNotFoundException(moduleName);
        }

        /// inheritedDoc
        public async Task<Guid> GetModuleIdAsync(string moduleName)
        {
            // TODO: add cache with ID and name
            return (await GetModuleAsync(moduleName)).Id;
        }

        /// inheritedDoc
        public async Task<Module?> GetModuleOrNullAsync(string moduleName)
        {
            if (string.IsNullOrWhiteSpace(moduleName))
                throw new ArgumentNullException(nameof(moduleName));

            return await _moduleRepository.GetAll().FirstOrDefaultAsync(m => m.Name == moduleName);
        }

        /// inheritedDoc
        public List<Type> GetModuleTypes()
        {
            return _typeFinder
                .Find(type => type != null && type.IsPublic && !type.IsGenericType && !type.IsAbstract && type != typeof(SheshaModule) && typeof(SheshaModule).IsAssignableFrom(type))
                .ToList();
        }

        /// inheritedDoc
        public List<SheshaModuleInfo> GetModuleInfos()
        {
            var types = GetModuleTypes();

            var infos = types.Select(t => _iocResolver.Resolve(t).ForceCastAs<SheshaModule>().ModuleInfo).ToList();

            return infos;
        }

        /// inheritedDoc
        public async Task<Module?> GetOrCreateModuleAsync(string moduleName) 
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

        /*
        /// inheritedDoc
        public async Task<Module?> GetModuleByAliasOrNullAsync(string moduleAlias)
        {
            return _moduleRepository.GetAll().FirstOrDefaultAsync(m => m.Name == moduleName);
        }
        */
    }
}
