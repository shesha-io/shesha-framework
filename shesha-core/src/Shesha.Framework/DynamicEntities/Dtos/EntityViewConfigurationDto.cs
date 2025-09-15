using Shesha.Domain;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// View configuration DTO
    /// </summary>
    public class EntityViewConfigurationDto
    {
        /// <summary>
        /// If true, indicates that view is a standard one
        /// </summary>
        public bool IsStandard { get; set; }

        /// <summary>
        /// View type
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Identifier of form to use for current veiew
        /// </summary>
        public FormIdentifier? FormId { get; set; }

        public EntityViewConfigurationDto Clone()
        {
            return new EntityViewConfigurationDto
            {
                IsStandard = IsStandard,
                Type = Type,
                FormId = FormId,
            };
        }
    }
}
