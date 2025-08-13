using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Roles.Distribution.Dto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class ShaRoleExport : ConfigurableItemExportBase<ShaRole, ShaRoleRevision, DistributedShaRole>, IShaRoleExport, ITransientDependency
    {
        private readonly IRepository<ShaRole, Guid> _roleRepo;

        public string ItemType => ShaRole.ItemTypeName;

        public ShaRoleExport(IRepository<ShaRole, Guid> roleRepo)
        {
            _roleRepo = roleRepo;
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id)
        {
            var item = await _roleRepo.GetAsync(id);
            return await ExportItemAsync(item);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItem item)
        {
            if (!(item is ShaRole itemConfig))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(ShaRole)}, actual: {item.GetType().FullName}");

            var revision = itemConfig.Revision;

            var result = new DistributedShaRole
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
                NameSpace = revision.NameSpace,
                HardLinkToApplication = revision.HardLinkToApplication,

                Permissions = new List<DistributedShaRolePermission>(),
            };

            foreach (var perm in revision.Permissions)
            {
                result.Permissions.Add(new DistributedShaRolePermission()
                {
                    IsGranted = perm.IsGranted,
                    Permission = perm.Permission,
                });
            }

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