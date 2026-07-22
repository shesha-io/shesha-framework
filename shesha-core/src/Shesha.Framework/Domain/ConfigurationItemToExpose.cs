using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    [Table("vw_configuration_items_to_expose", Schema = "frwk")]
    [ImMutable]
    public class ConfigurationItemToExpose : Entity<Guid>
    {
        public virtual string Name { get; set; }
        public virtual string ItemType { get; set; }
        
        [Display(Name = "Origin Module")]
        public virtual string OriginModuleName { get; set; }
        
        [Display(Name = "Override Module")]
        public virtual string OverrideModuleName { get; set; }
        public virtual DateTime? DateUpdated { get; set; }
    }
}
