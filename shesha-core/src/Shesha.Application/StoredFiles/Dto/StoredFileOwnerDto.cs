using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Shesha.StoredFiles.Dto
{
    /// <summary>
    /// DTO of the stored file owner
    /// </summary>
    public class StoredFileOwnerDto
    {
        /// <summary>
        /// Id of the owner entity
        /// </summary>
        [Required]
        [BindProperty(Name = "ownerId")]
        public string OwnerId { get; set; }

        /// <summary>
        /// Type short alias of the owner entity
        /// </summary>
        [Required]
        [BindProperty(Name = "ownerType")]
        public string OwnerType { get; set; }
    }
}
