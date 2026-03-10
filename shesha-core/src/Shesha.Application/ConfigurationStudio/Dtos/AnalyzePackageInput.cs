using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Arguments of the package analyze
    /// </summary>
    public class AnalyzePackageInput
    {
        /// <summary>
        /// File content
        /// </summary>
        [Required]
        [BindProperty(Name = "file")]
        public IFormFile? File { get; set; }
    }
}
