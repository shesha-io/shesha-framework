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
    public class PermissionDefinitionExport : IPermissionDefinitionExport, ITransientDependency
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
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item)
        {
            if (!(item is PermissionDefinition itemConfig))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(PermissionDefinition)}, actual: {item.GetType().FullName}");

            var result = new DistributedPermissionDefinition
            {
                Id = itemConfig.Id,
                Name = itemConfig.Name,
                ModuleName = itemConfig.Module?.Name,
                FrontEndApplication = itemConfig.Application?.AppKey,
                ItemType = itemConfig.ItemType,

                Label = itemConfig.Label,
                Description = itemConfig.Description,
                OriginId = itemConfig.Origin?.Id,
                BaseItem = itemConfig.BaseItem?.Id,
                VersionNo = itemConfig.VersionNo,
                VersionStatus = itemConfig.VersionStatus,
                ParentVersionId = itemConfig.ParentVersion?.Id,
                Suppress = itemConfig.Suppress,

                // specific properties
                Parent = itemConfig.Parent,
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