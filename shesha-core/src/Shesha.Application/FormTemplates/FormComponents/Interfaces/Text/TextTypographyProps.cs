using Shesha.FormTemplates.FormComponents.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.Text
{
    public class TextTypographyProps: ConfigurableComponent
    {
        public string textType { get; set; }
        public string content { get; set; }
    }
}
