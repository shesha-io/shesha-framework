using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Shesha.StoredFiles.Dto
{
    /// <summary>
    /// Upload file version input
    /// </summary>
    public class UploadFileVersionInput
    {
        /// <summary>
        /// Id of the file
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// File content
        /// </summary>
        [Required]
        [BindProperty(Name = "file")]
        public IFormFile File { get; set; }
    }
}
