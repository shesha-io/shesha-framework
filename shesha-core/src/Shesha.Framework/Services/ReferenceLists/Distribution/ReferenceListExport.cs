using Abp.Dependency;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using System.Threading.Tasks;

namespace Shesha.Services.ReferenceLists.Distribution
{
    /// <summary>
    /// Reference list export
    /// </summary>
    public class ReferenceListExport : ConfigurableItemExportBase<ReferenceList, DistributedReferenceList>, IReferenceListExport, ITransientDependency
    {
        private readonly IReferenceListDistributionHelper _distributionHelper;

        public ReferenceListExport(IReferenceListDistributionHelper distributionHelper)
        {
            _distributionHelper = distributionHelper;
        }

        public string ItemType => ReferenceList.ItemTypeName;

        protected override async Task MapCustomPropsAsync(ReferenceList item, DistributedReferenceList result)
        {
            result.Items = await _distributionHelper.ExportRefListItemsAsync(item);
        }
    }
}