using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Shesha.StoredFiles.Dto
{
    /// <summary>
    /// DTO of the stored file attached as entity property
    /// </summary>
    public class StoredFileAsPropertyDto: StoredFileOwnerDto
    {
        /// <summary>
        /// Property name of the owner entity. Is used for direct links only (when owner references file using foreign key)
        /// </summary>
        [BindProperty(Name = "propertyName")]
        public string PropertyName { get; set; }
    }
}
