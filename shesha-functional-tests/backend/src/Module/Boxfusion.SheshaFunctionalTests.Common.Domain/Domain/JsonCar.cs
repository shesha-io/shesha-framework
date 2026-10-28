using Shesha.JsonEntities;
using System.Collections.Generic;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class JsonCar: JsonEntity
    {
        public virtual string Make { get; set; }

        public virtual string Model { get; set; }

        public virtual string VinNumber { get; set; }

        public virtual IList<JsonWheel> Wheels { get; set; }
    }
}
