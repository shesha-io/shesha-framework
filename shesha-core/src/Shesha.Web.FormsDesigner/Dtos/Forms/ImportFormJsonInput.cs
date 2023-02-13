using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Import form JSON input
    /// </summary>
    public class ImportFormJsonInput
    {
        /// <summary>
        /// Form version Id
        /// </summary>
        public Guid ItemId { get; set; }

        /// <summary>
        /// File content
        /// </summary>
        [Required]
        [BindProperty(Name = "file")]
        public IFormFile File { get; set; }
    }
}
