using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces
{
    public interface IFormComponentContainer
    {
        string id { get; set; }
        string parentId { get; set; }
    }
}
