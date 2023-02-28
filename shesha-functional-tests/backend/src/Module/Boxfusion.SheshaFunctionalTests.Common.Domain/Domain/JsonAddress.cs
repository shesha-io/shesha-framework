using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class JsonAddress: JsonEntity
    {
        public virtual long PostalCode { get; set; }

        public virtual string StreetName { get; set; }

        public virtual string City { get; set; }

        public virtual string Region { get; set; }

        public virtual long UnitNo { get; set; }
    }
}
