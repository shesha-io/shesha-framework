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

        /// inheritedDoc
        public override async Task<DistributedPermissionDefinition> ExportAsync(PermissionDefinition item)
        {
            var revision = item.Revision;

            var result = new DistributedPermissionDefinition
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
                Parent = revision.Parent,
            };

            return await Task.FromResult(result);
        }
    }
}