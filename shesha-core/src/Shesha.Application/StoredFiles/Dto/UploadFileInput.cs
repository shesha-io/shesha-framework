using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Shesha.StoredFiles.Dto
{
    /// <summary>
    /// Upload stored file input
    /// </summary>
    public class UploadFileInput: StoredFilesInputBase
    {
        /// <summary>
        /// File content
        /// </summary>
        [Required]
        [BindProperty(Name = "file")]
        public IFormFile? File { get; set; }

        [MemberNotNull(nameof(File))]
        public void EnsureFile() 
        {
            if (File == null)
                throw new Exception($"{nameof(File)} must not be null");
        }
    }
}
