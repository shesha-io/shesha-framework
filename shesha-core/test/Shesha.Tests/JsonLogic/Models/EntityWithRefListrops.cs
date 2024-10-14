using Abp.Domain.Entities;
using Shesha.Domain.Enums;
using System;

namespace Shesha.Tests.JsonLogic.Models
{
    public class EntityWithRefListrops : Entity<Guid>
    {
        public virtual RefListPersonTitle Title { get; set; }
        public virtual RefListPersonTitle? NullableTitle { get; set; }
    }
}
