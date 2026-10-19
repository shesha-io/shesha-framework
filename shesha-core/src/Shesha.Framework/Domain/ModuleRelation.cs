using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Module Relation
    /// </summary>
    [Entity(CrudActions = CrudActions.Read, IsConfigurable = false)]
    [Table("module_relations", Schema = "frwk")]
    [SnakeCaseNaming]
    public class ModuleRelation: Entity<Guid>
    {
        public required virtual Module Module { get; set; }
        public required virtual Module BaseModule { get; set; }
        public required virtual int Level { get; set; }
    }
}
