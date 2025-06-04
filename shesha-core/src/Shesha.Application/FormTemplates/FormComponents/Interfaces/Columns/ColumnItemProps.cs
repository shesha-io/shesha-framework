using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.Columns
{
    public class ColumnItemProps
    {
        public string id { get; set; }
        public int flex { get; set; }
        public int offset { get; set; }
        public int push { get; set; }
        public int pull { get; set; }
        public List<ConfigurableComponent> components { get; set; }
    }
}
