using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces
{
    public interface IComponentLabelProps
    {
        string? label { get; set; }
        bool hideLabel { get; set; }
        string labelAlign { get; set; }
    }
}
