using Shesha.ConfigurationItems.Distribution;

namespace Shesha.Web.FormsDesigner.Services.Distribution
{
    /// <summary>
    /// Distributed form
    /// </summary>
    public class DistributedConfigurableComponent: DistributedConfigurableItemBase
    {
        /// <summary>
        /// Settings
        /// </summary>
        public virtual string Settings { get; set; }
    }
}
