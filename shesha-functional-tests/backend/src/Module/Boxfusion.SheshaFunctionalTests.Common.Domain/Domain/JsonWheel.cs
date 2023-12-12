using Shesha.Domain.Attributes;
using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class JsonWheel: JsonEntity
    {
        public virtual string Type { get; set; }    

        public virtual long Size { get; set; }

        [SaveAsJson]
        public virtual IList<JsonSpoke> Spoke { get; set; }
    }
}
