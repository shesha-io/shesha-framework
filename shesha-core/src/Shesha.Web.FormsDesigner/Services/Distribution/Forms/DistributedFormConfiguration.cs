using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;

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
        public string? Markup { get; set; }

        /// <summary>
        /// ModelType
        /// </summary>
        public string? ModelType { get; set; }

        public Guid? TemplateId { get; set; }

        public bool IsTemplate { get; set; }

        public RefListPermissionedAccess? Access { get; set; }

        public List<string>? Permissions { get; set; }

        public FormIdentifier? ConfigurationForm { get; set; }

        public string? GenerationLogicTypeName { get; set; }

        public string? GenerationLogicExtensionJson { get; set; }

        public string? PlaceholderIcon { get; set; }
    }
}
