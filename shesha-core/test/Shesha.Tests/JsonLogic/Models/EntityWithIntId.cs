using Abp.Domain.Entities;

namespace Shesha.Tests.JsonLogic.Models
{
    public class EntityWithIntId : Entity<int>
    {
        public virtual ChildEntityWithIntId Child { get; set; }
    }
}
