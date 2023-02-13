using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Dtos
{
    public class MergeConfigurationDto
    {
        public string SourceId { get; set; }

        public string DestinationId { get; set; }

        public bool DeleteAfterMerge { get; set; }
    }
}
