using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.Datatable
{
    public class DatatableProps: ConfigurableComponent
    {
        public bool canEditInline { get; set; }
        public bool canAddInline { get; set; }
        public bool canDeleteInline { get; set; }
        public string inlineEditMode { get; set; }
        public string inlineSaveMode { get; set; }
        public List<DatatableColumnProps> items { get; set; }
    }
}
