using Shesha.Domain.Attributes;
using Shesha.JsonEntities;
using System.Collections.Generic;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class JsonWheel : JsonEntity
    {
        public virtual string Type { get; set; }

        public virtual long Size { get; set; }

        [SaveAsJson]
        public virtual IList<JsonSpoke> Spoke { get; set; }
    }
}
