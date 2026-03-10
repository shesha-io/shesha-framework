using Abp.Domain.Entities;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [ImMutable]
    [SnakeCaseNaming]
    [Table("vw_configuration_item_history_items", Schema = "frwk")]
    public class ConfigurationItemHistoryItem: Entity<Guid>
    {
		public virtual string ModuleName { get; set; }
        public virtual bool IsEditable { get; set; }
        public virtual string ConfigurationItemName { get; set; }
        public virtual Guid ConfigurationItemId { get; set; }
        public virtual int VersionNo { get; set; }
        public virtual string VersionName { get; set; }
        public virtual string Comments { get; set; }
        public virtual string ConfigHash { get; set; }
        public virtual bool IsCompressed { get; set; }
        public virtual ConfigurationItemRevisionCreationMethod CreationMethod { get; set; }
        public virtual string DllVersionNo { get; set; }
        public virtual DateTime CreationTime { get; set; }
        public virtual Int64? CreatorUserId { get; set; }
        public virtual User? CreatorUser { get; set; }
    }
}
