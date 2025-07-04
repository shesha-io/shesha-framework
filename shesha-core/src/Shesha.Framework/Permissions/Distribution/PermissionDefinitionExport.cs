using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Permissions.Distribution.Dto;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class PermissionDefinitionExport : ConfigurableItemExportBase<PermissionDefinition, PermissionDefinitionRevision, DistributedPermissionDefinition>, IPermissionDefinitionExport, ITransientDependency
    {
        private readonly IRepository<PermissionDefinition, Guid> _permissionDefinitionRepo;

        public string ItemType => PermissionDefinition.ItemTypeName;

        public PermissionDefinitionExport(
            IRepository<PermissionDefinition, Guid> permissionDefinitionRepo
        )
        {
            _permissionDefinitionRepo = permissionDefinitionRepo;
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id)
        {
            var item = await _permissionDefinitionRepo.GetAsync(id);
            return await ExportItemAsync(item);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItem item)
        {
            if (!(item is PermissionDefinition itemConfig))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(PermissionDefinition)}, actual: {item.GetType().FullName}");

            var revision = itemConfig.Revision;

            var result = new DistributedPermissionDefinition
            {
                Id = itemConfig.Id,
                Name = itemConfig.Name,
                ModuleName = itemConfig.Module?.Name,
                FrontEndApplication = itemConfig.Application?.AppKey,
                ItemType = itemConfig.ItemType,
                OriginId = itemConfig.Origin?.Id,
                Suppress = itemConfig.Suppress,
                
                Label = revision.Label,
                Description = revision.Description,

                // specific properties
                Parent = revision.Parent,
            };

            return await Task.FromResult(result);
        }
        
        /// inheritedDoc
        public async Task WriteToJsonAsync(DistributedConfigurableItemBase item, Stream jsonStream)
        {
            var json = JsonConvert.SerializeObject(item, Formatting.Indented);
            using (var writer = new StreamWriter(jsonStream))
            {
                await writer.WriteAsync(json);
            }
        }
    }
}