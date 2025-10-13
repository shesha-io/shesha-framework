using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    [Table("vw_configuration_items_overrides", Schema = "frwk")]
    [ImMutable]
    public class ConfigurationItemOverride: Entity<Guid>
    {
        public virtual string Name { get; set; }
        public virtual string ItemType { get; set; }
        public virtual Guid ModuleId { get; set; }
        public virtual string ModuleName { get; set; }

        public virtual Guid BaseModuleId { get; set; }
        public virtual string BaseModuleName { get; set; }

        public virtual Guid LatestRevisionId { get; set; }
    }
}
