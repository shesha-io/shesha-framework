using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Request of the <see cref="ConfigurationStudioAppService.MergePackagesAsync(MergePackagesInput)"/>
    /// </summary>
    public class MergePackagesInput
    {
        /// <summary>
        /// Packages to merge
        /// </summary>
        [Required]
        [BindProperty(Name = "files")]
        public IFormFile[] Packages { get; set; }
    }
}