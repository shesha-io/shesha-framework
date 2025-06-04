using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.Datatable
{
    public class DatatableContextProps: ConfigurableComponent
    {
        public string sourceType { get; set; }
        public int defaultPageSize { get; set; }
        public string dataFetchingMethod { get; set; }
        public string sortMode { get; set; }
        public string strictSortOrder { get; set; }
        public string allowReordering { get; set; }
        public string entityType { get; set; }
        public List<ConfigurableComponent> components { get; set; }
    }
}
