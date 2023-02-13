using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FluentMigrator.ReferenceLists
{
    public class ReferenceListItemDefinition
    {
        public string Item { get; set; }

        public Int64 ItemValue { get; set; }

        public string Description { get; set; }

        public Int64? OrderIndex { get; set; }
    }
}
