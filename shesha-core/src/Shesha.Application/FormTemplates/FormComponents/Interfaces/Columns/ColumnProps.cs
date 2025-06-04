using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.Columns
{
    public class ColumnProps : ConfigurableComponent
    {
        public List<ColumnItemProps> columns { get; set; }
        public int gutterX { get; set; }
        public int gutterY { get; set; }

    }
}
