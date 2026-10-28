using Shesha.Domain;
using Shesha.JsonEntities;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class JsonHouse: JsonEntity
    {
        public Address Address { get; set; }
        public string Name { get; set; }
        public Person Person { get; set; }
    }
}
