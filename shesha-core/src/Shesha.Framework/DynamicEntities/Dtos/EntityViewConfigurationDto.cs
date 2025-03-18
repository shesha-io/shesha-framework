using System.Diagnostics.CodeAnalysis;

namespace Shesha.DynamicEntities.Dtos
{
    public class EntityViewConfigurationDto
    {
        public bool IsStandard { get; set; }

        public string Type { get; set; }

        public FormIdFullNameDto? FormId { get; set; }
    }

    // TODO: replace with FormIdentifier
    public class FormIdFullNameDto
    {
        public string? Name { get; set; }
        public string? Module { get; set; }
    }

    public static class FormIdFullNameDtoExtensions
    {
        public static bool IsEmpty([NotNullWhen(false)]this FormIdFullNameDto? formId)
        {
            return formId == null || string.IsNullOrWhiteSpace(formId.Name);
        }
    }
}
