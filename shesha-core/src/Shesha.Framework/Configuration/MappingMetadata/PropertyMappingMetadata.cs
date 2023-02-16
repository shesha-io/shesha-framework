using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Configuration.MappingMetadata
{
    public class PropertyMappingMetadata
    {
        public string TableName { get; set; }
        public string[] ColumnNames { get; set; }
    }
}
