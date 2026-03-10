using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shesha.ConfigurationStudio.Dtos
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
        [BindProperty(BinderType = typeof(ItemsToImportBinder))]
        public List<Guid> ItemsToImport { get; set; } = new();
    }
}