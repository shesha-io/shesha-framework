using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces
{
    public interface IComponentBindingProps
    {
        public string componentName { get; set; }
        public string propertyName { get; set; }
    }
}
