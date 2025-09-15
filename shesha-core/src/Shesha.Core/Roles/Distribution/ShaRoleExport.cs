using Abp.Dependency;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Roles.Distribution.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class ShaRoleExport : ConfigurableItemExportBase<ShaRole, DistributedShaRole>, IShaRoleExport, ITransientDependency
    {
        public string ItemType => ShaRole.ItemTypeName;

        public ShaRoleExport()
        {
        }

        protected override Task MapCustomPropsAsync(ShaRole item, DistributedShaRole result)
        {
            // specific properties
            result.NameSpace = item.NameSpace;
            result.HardLinkToApplication = item.HardLinkToApplication;
            result.Permissions = new List<DistributedShaRolePermission>();

            foreach (var perm in item.Permissions)
            {
                result.Permissions.Add(new DistributedShaRolePermission()
                {
                    IsGranted = perm.IsGranted,
                    Permission = perm.Permission,
                });
            }

            return Task.CompletedTask;
        }
    }
}