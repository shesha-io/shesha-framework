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
    public class ShaRoleExport : IShaRoleExport, ITransientDependency
    {
        private readonly IRepository<ShaRole, Guid> _roleRepo;
        private readonly IRepository<ShaRolePermission, Guid> _rolePermissionRepo;

        public string ItemType => ShaRole.ItemTypeName;

        public ShaRoleExport(
            IRepository<ShaRole, Guid> roleRepo,
            IRepository<ShaRolePermission, Guid> rolePermissionRepo
        )
        {
            _rolePermissionRepo = rolePermissionRepo;
            _roleRepo = roleRepo;
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id)
        {
            var item = await _roleRepo.GetAsync(id);
            return await ExportItemAsync(item);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item)
        {
            if (!(item is ShaRole itemConfig))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(ShaRole)}, actual: {item.GetType().FullName}");

            var result = new DistributedShaRole
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
                NameSpace = itemConfig.NameSpace,
                SortIndex = itemConfig.SortIndex,
                IsRegionSpecific = itemConfig.IsRegionSpecific,
                IsProcessConfigurationSpecific = itemConfig.IsProcessConfigurationSpecific,
                HardLinkToApplication = itemConfig.HardLinkToApplication,
                CanAssignToMultiple = itemConfig.CanAssignToMultiple,
                CanAssignToPerson = itemConfig.CanAssignToPerson,
                CanAssignToRole = itemConfig.CanAssignToRole,
                CanAssignToOrganisationRoleLevel = itemConfig.CanAssignToOrganisationRoleLevel,
                CanAssignToUnit = itemConfig.CanAssignToUnit,

                Permissions = new List<DistributedShaRolePermission>(),
            };

            foreach (var perm in itemConfig.Permissions)
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