using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Table("vw_configuration_items_nodes", Schema = "frwk")]
    [ImMutable]
    [SnakeCaseNaming]
    public class ConfigurationItemNode : Entity<Guid>
    {
        /// <summary>
        /// Parent Id (module or folder)
        /// </summary>
        public virtual Guid? FolderId { get; set; }
        /// <summary>
        /// Module Id
        /// </summary>
        public virtual Guid ModuleId { get; set; }
        /// <summary>
        /// Item type (form/reflist etc.)
        /// </summary>
        public virtual int NodeType { get; set; }
    }
}
