using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.Container
{
    public class ContainerProps: ConfigurableComponent
    {
        public string display { get; set; }
        public string direction { get; set; }
        public string justifyContent { get; set; }
        public List<ConfigurableComponent> components { get; set; }
    }
}
