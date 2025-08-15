using Abp.Dependency;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Permissions.Distribution.Dto;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class PermissionDefinitionExport : ConfigurableItemExportBase<PermissionDefinition, PermissionDefinitionRevision, DistributedPermissionDefinition>, IPermissionDefinitionExport, ITransientDependency
    {
        public string ItemType => PermissionDefinition.ItemTypeName;

        public PermissionDefinitionExport()
        {
        }

        protected override Task MapCustomPropsAsync(PermissionDefinition item, PermissionDefinitionRevision revision, DistributedPermissionDefinition result)
        {
            result.Parent = revision.Parent;

            return Task.CompletedTask;
        }
    }
}