﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Shesha.StoredFiles.Dto
{
    /// <summary>
    /// 
    /// </summary>
    public class StaticFileInput
    {
        /// <summary>
        /// Id of the stored file
        /// </summary>
        [BindProperty(Name = "id")]
        public Guid? Id { get; set; }

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
