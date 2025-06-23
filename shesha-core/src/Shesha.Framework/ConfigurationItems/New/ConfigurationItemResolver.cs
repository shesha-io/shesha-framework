using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.New
{
    /// <summary>
    /// Configuration Items resolver. Searches for configuration items taking modules hierarchy into account
    /// </summary>
    public class ConfigurationItemResolver: IConfigurationItemResolver
    {
        private readonly IModuleHierarchyProvider _hierarchyProvider;
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly IRepository<ConfigurationItem, Guid> _repository;
        private readonly IRepository<Module, Guid> _moduleRepository;

        public ConfigurationItemResolver(
            IModuleHierarchyProvider hierarchyProvider, 
            IConfigurationFrameworkRuntime cfRuntime, 
            IRepository<ConfigurationItem, Guid> repository,
            IRepository<Module, Guid> moduleRepository)
        {
            _hierarchyProvider = hierarchyProvider;
            _cfRuntime = cfRuntime;
            _repository = repository;
            _moduleRepository = moduleRepository;
        }

        public async Task<TItem> GetItemAsync<TItem>(string module, string name) where TItem : IConfigurationItem
        {
            var currentModule = _cfRuntime.CurrentModule;
            var hierarchy = _hierarchyProvider.GetBaseModules(currentModule);

            // var query = Repository.GetAll().Where(f => f.Module == moduleEntity && f.Name == input.Name);
            var moduleEntity = await GetModuleAsync(module);

            //_repository.GetAll().Where(f => f.Module == moduleEntity && f.Name == name || f.ExposedFromRevision != null && );
            throw new NotImplementedException();
        }

        private async Task<Module?> GetModuleAsync(string? moduleName)
        {
            return !string.IsNullOrWhiteSpace(moduleName)
                ? await _moduleRepository.GetAll().Where(m => m.Name == moduleName).FirstOrDefaultAsync()
                : null;
        }
    }
}