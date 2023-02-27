using Shesha.Domain;
using Shesha.JsonEntities;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class TestJsonEntity : JsonEntity
    {
        public virtual Organisation SomeOrganisation { get; set; }


        public virtual string SomeName { get; set; }
    }
}
