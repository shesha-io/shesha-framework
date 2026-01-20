using Shesha.Domain;
using Shesha.Dto.Interfaces;

namespace Shesha.Dto
{
    /// <summary>
    /// Base class of ConfigurationItem DTO
    /// </summary>
    public class ConfigurationItemTypeDto : IConfigurationItemTypeDto
    {
        public string ItemType { get; init; }

        public string FriendlyName { get; init; }

        public string? Description { get; init; }

        public string EntityClassName { get; init; }

        public string Icon { get; init; }

        public FormIdentifier? CreateFormId { get; init; }

        public FormIdentifier? RenameFormId { get; init; }

        public string? ParentType { get; init; }
        public string Discriminator { get; init; }
    }
}