using Microsoft.AspNetCore.Mvc;
using Shesha.DynamicEntities.Dtos;

namespace Shesha.StoredFiles.Dto
{
    public class StoredFilesInputBase
    {
        /// <summary>
        /// Id of the owner entity
        /// </summary>
        [BindProperty(Name = "ownerId")]
        public string? OwnerId { get; set; }

        /// <summary>
        /// Type short alias of the owner entity
        /// </summary>
        [BindProperty(Name = "ownerType")]
        public EntityTypeIdInput? OwnerType { get; set; }

        /// <summary>
        /// Category of the file. Is used to split attachments into groups
        /// </summary>
        [BindProperty(Name = "filesCategory")]
        public string? FilesCategory { get; set; }

        /// <summary>
        /// Property name of the owner entity. Is used for direct links only (when owner references file using foreign key)
        /// </summary>
        [BindProperty(Name = "propertyName")]
        public string? PropertyName { get; set; }

        /// <summary>
        /// Property name of the owner entity. Is used for assign file to the nested entities
        /// </summary>
        [BindProperty(Name = "ownerName")]
        public string? OwnerName { get; set; }
    }
}
