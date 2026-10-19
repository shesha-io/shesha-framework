using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Table("vw_Core_AreasHierarchyItems")]
    [ImMutable]
    [Obsolete]
    public class AreaHierarchyItem: Entity<string>
    {
        public virtual Area Area { get; set; }
        public virtual Guid AncestorId { get; set; }
        public virtual string Name { get; set; }
        public virtual int Level { get; set; }
        public virtual RefListAreaType? AreaType { get; set; }
    }
}
