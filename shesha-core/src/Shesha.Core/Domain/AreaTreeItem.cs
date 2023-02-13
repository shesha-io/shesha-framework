using System;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Table("vw_Core_AreasTreeItem")]
    [ImMutable]
    public class AreaTreeItem: Entity<Guid>, IMayHaveTenant
    {
        public virtual string Name { get; set; }
        public virtual Guid? ParentId { get; set; }
        public virtual bool HasChilds { get; set; }
        public virtual int? TenantId { get; set; }
    }
}
