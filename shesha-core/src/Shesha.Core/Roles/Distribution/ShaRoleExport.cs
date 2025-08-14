using Abp.Dependency;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Roles.Distribution.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class ShaRoleExport : ConfigurableItemExportBase<ShaRole, ShaRoleRevision, DistributedShaRole>, IShaRoleExport, ITransientDependency
    {
        public string ItemType => ShaRole.ItemTypeName;

        public ShaRoleExport()
        {
        }

        /// inheritedDoc
        public override async Task<DistributedShaRole> ExportAsync(ShaRole item)
        {
            var revision = item.Revision;

            var result = new DistributedShaRole
            {
                Id = item.Id,
                Name = item.Name,
                ModuleName = item.Module?.Name,
                FrontEndApplication = item.Application?.AppKey,
                ItemType = item.ItemType,

                
                OriginId = item.Origin?.Id,
                Suppress = item.Suppress,

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
    }
}