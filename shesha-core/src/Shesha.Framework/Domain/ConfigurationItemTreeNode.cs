using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Table("vw_configuration_items_tree_nodes", Schema = "frwk")]
    [ImMutable]
    [SnakeCaseNaming]
    public class ConfigurationItemTreeNode: Entity<Guid>
    {
        /// <summary>
        /// Parent Id (module or folder)
        /// </summary>
        public virtual Guid? ParentId { get; set; }
        /// <summary>
        /// Module Id
        /// </summary>
        public virtual Guid ModuleId { get; set; }
        /// <summary>
        /// Item name
        /// </summary>
        public virtual string Name { get; set; }
        /// <summary>
        /// Item label (friendly name)
        /// </summary>
        public virtual string Label { get; set; }
        /// <summary>
        /// Node type (module/folder/item)
        /// </summary>
        public virtual ConfigurationItemTreeNodeType NodeType { get; set; }
        /// <summary>
        /// Item type (form/reflist etc.)
        /// </summary>
        public virtual string? ItemType { get; set; }

        public virtual bool IsCodeBased { get; set; }
        public virtual bool IsCodegenPending { get; set; }
        public virtual bool IsUpdated { get; set; }
        public virtual bool IsExposed { get; set; }
        public virtual int? LastModifierUserId { get; set; }
    }
}
