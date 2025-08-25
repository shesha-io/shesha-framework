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
        /// Item description
        /// </summary>
        public virtual string? Description { get; set; }

        /// <summary>
        /// Node type (module/folder/item)
        /// </summary>
        public virtual ConfigurationItemTreeNodeType NodeType { get; set; }
        /// <summary>
        /// Item type (form/reflist etc.)
        /// </summary>
        public virtual string? ItemType { get; set; }

        /// <summary>
        /// If true, indicates that configuration is code based or has a corresponding code based portion
        /// </summary>
        public virtual bool IsCodeBased { get; set; }

        /// <summary>
        /// If true, indicates that corresponding code based configuration has not been updated
        /// </summary>
        public virtual bool IsCodegenPending { get; set; }

        /// <summary>
        /// If true, indicates that current version has manual changes (i.e. is not a version that was imported via package)
        /// </summary>
        public virtual bool IsUpdated { get; set; }

        /// <summary>
        /// If true, indicates that configuration originally defined in a base module which has been exposed
        /// </summary>
        public virtual bool IsExposed { get; set; }
        
        /// <summary>
        /// Date and time of latest modification
        /// </summary>
        public virtual int? LastModifierUserId { get; set; }
        /// <summary>
        /// Username of the user who modified current item
        /// </summary>
        public virtual string? LastModifierUser { get; set; }
        
        /// <summary>
        /// Last modification date and time
        /// </summary>
        public virtual DateTime? LastModificationTime { get; set; }
        
        /// <summary>
        /// Base module current item exposed from
        /// </summary>
        public virtual string? BaseModule { get; set; }
    }
}
