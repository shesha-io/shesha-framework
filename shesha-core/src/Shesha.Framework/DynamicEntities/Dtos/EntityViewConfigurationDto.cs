using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Dtos
{
    public class EntityViewConfigurationDto
    {
        public bool IsStandard { get; set; }

        public string Type { get; set; }

        public FormIdFullNameDto FormId { get; set; }
    }

    public class FormIdFullNameDto
    {
        public string Name { get; set; }
        public string Module { get; set; }
    }

    public static class FormIdFullNameDtoExtensions
    {
        public static bool IsEmpty(this FormIdFullNameDto formId)
        {
            return formId == null || string.IsNullOrWhiteSpace(formId.Name);
        }
    }
}
