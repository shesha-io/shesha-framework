using Shesha.Domain.Enums;
using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Flat Configuraion Studio tree node
    /// </summary>
    public class FlatTreeNode
    {
        public Guid Id { get; set; }
        public Guid? ParentId { get; set; }
        public Guid ModuleId { get; set; }
        public string Name { get; set; }
        public string Label { get; set; }
        public ConfigurationItemTreeNodeType NodeType { get; set; }
        public string? ItemType { get; set; }

        public bool IsCodeBased { get; set; }
        public bool IsCodegenPending { get; set; }
        public bool IsUpdated { get; set; }
        public bool IsExposed { get; set; }
        public bool IsUpdatedByMe { get; set; }
    }
}
