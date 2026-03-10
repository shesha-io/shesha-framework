using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    [Table("vw_configuration_items_inheritance", Schema = "frwk")]
    [ImMutable]
    public class ConfigurationItemInheritance : Entity<string>
    {
        public virtual Guid ItemId { get; set; }
        public virtual string Name { get; set; }
        public virtual string ItemType { get; set; }
        public virtual Guid ModuleId { get; set; }
        public virtual string ModuleName { get; set; }

        public virtual Guid ExposedInModuleId { get; set; }
        public virtual string ExposedInModuleName { get; set; }

        public virtual int ModuleLevel { get; set; }
    }
}
