using Shesha.Domain;

namespace Shesha.Dto.Interfaces
{
    /// <summary>
    /// Configuration item type DTO
    /// </summary>
    public interface IConfigurationItemTypeDto
    {
        string ItemType { get; }
        string FriendlyName { get; }
        string? Description { get; }
        string EntityClassName { get; }
        string Icon { get; }

        FormIdentifier? CreateFormId { get; }
        FormIdentifier? RenameFormId { get; }
    }
}
