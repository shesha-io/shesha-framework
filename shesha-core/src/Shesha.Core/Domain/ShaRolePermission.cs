using AutoMapper;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.ShaRolePermission")]
    public class ShaRolePermission : FullPowerEntity
    {
        public virtual ShaRole ShaRole { get; set; }
        public virtual string Permission { get; set; }
        public virtual bool IsGranted { get; set; }
    }
}