using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
