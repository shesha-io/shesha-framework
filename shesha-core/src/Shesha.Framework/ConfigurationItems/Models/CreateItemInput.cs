using System;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Models
{
    /// <summary>
    /// Create new item input
    /// </summary>
    public class CreateItemInput
    {
        public Module Module { get; set; }
        public ConfigurationItemFolder? Folder { get; set; }
        public double OrderIndex { get; set; }
        public string Name { get; set; }
        public string ItemType { get; set; }
        public string Label { get; set; }
        public string? Description { get; set; }
        public string? Markup { get; set; }
        public string? GenerationLogicExtensionJson { get; set; }
        public string? ModelType { get; set; }
        public Guid? TemplateId { get; set; }
    }
}
