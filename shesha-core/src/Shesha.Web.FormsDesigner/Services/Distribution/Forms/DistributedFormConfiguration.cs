using Shesha.ConfigurationItems.Distribution;
using System;

namespace Shesha.Web.FormsDesigner.Services.Distribution
{
    /// <summary>
    /// Distributed form
    /// </summary>
    public class DistributedFormConfiguration: DistributedConfigurableItemBase
    {
        /// <summary>
        /// Form markup
        /// </summary>
        public string Markup { get; set; }

        /// <summary>
        /// ModelType
        /// </summary>
        public string ModelType { get; set; }

        public Guid? TemplateId { get; set; }
    }
}
