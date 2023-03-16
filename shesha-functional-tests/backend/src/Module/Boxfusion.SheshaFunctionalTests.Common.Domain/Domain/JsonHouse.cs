using Shesha.Domain;
using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class JsonHouse: JsonEntity
    {
        public Address Address { get; set; }
        public string Name { get; set; }
        public Person Person { get; set; }
    }
}
