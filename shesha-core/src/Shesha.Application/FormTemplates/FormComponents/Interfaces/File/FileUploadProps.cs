using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.File
{
    public class FileUploadProps: ConfigurableComponent
    {
        public string ownerId { get; set; }
        public string ownerType { get; set; }
    }
}
