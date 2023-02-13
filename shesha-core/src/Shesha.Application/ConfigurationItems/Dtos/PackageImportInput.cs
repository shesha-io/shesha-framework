using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shesha.ConfigurationItems.Dtos
{
    /// <summary>
    /// Arguments of the configuration items import
    /// </summary>
    public class PackageImportInput
    {
        /// <summary>
        /// File content
        /// </summary>
        [Required]
        [BindProperty(Name = "file")]
        public IFormFile File { get; set; }

        /// <summary>
        /// List of items to import
        /// </summary>
        public List<Guid> ItemsToImport { get; set; } = new List<Guid>();
    }
}
