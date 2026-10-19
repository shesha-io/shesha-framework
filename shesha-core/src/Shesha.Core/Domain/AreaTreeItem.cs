using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Table("vw_Core_AreasTreeItem")]
    [ImMutable]
    [Obsolete]
    public class AreaTreeItem: Entity<Guid>, IMayHaveTenant
    {
        public virtual string Name { get; set; }
        public virtual Guid? ParentId { get; set; }
        public virtual bool HasChilds { get; set; }
        public virtual int? TenantId { get; set; }
    }
}
