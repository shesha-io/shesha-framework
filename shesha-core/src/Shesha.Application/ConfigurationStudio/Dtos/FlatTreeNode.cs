using Shesha.Domain.Enums;
using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Flat Configuraion Studio tree node
    /// </summary>
    public class FlatTreeNode
    {
        /// <summary>
        /// Tree node Id
        /// </summary>
        public Guid Id { get; set; }
        
        /// <summary>
        /// Id of parent node
        /// </summary>
        public Guid? ParentId { get; set; }

        /// <summary>
        /// Configuration module Id current node belongs to
        /// </summary>
        public Guid ModuleId { get; set; }

        /// <summary>
        /// Node name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Node label
        /// </summary>
        public string Label { get; set; }
        
        /// <summary>
        /// Item description
        /// </summary>
        public string? Description { get; set; }

        public ConfigurationItemTreeNodeType NodeType { get; set; }

        public string? ItemType { get; set; }
        public string? Discriminator { get; set; }

        public bool IsCodeBased { get; set; }
        public bool IsCodegenPending { get; set; }
        public bool IsUpdated { get; set; }
        public bool IsExposed { get; set; }
        public bool IsUpdatedByMe { get; set; }
        public virtual string? LastModifierUser { get; set; }
        public virtual DateTime? LastModificationTime { get; set; }
        public virtual string? BaseModule { get; set; }
    }
}
