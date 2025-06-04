using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.Datatable
{
    public class DatatableColumnProps
    {
        public string id { get; set; }
        public string itemType { get; set; }
        public int sortOrder { get; set; }
        public string caption { get; set; }
        public int minWidth { get; set; }
        public string columnType { get; set; }
        public bool isVisible { get; set; }
        public string propertyName { get; set; }
        public string description { get; set; }
    }
}
