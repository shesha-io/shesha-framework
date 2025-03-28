using Abp.Domain.Entities;
using static Shesha.Tests.JsonLogic.JsonLogic2LinqConverterBaseTests;

namespace Shesha.Tests.JsonLogic.Models
{
    public class EntityWithIntId : Entity<int>
    {
        public virtual ChildEntityWithIntId Child { get; set; }
    }
}
