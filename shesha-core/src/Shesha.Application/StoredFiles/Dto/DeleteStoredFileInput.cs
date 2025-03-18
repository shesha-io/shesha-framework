﻿using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace Shesha.StoredFiles.Dto
{
    /// <summary>
    /// Delete Stored File input
    /// </summary>
    public class DeleteStoredFileInput
    {
        /// <summary>
        /// File Id
        /// </summary>
        [BindProperty(Name = "fileId")]
        public Guid? FileId { get; set; }

        /// <summary>
        /// Id of the owner entity
        /// </summary>
        [BindProperty(Name = "ownerId")]
        public string? OwnerId { get; set; }

        /// <summary>
        /// Type short alias of the owner entity
        /// </summary>
        [BindProperty(Name = "ownerType")]
        public string? OwnerType { get; set; }

        /// <summary>
        /// Property name of the owner entity. Is used for direct links only (when owner references file using foreign key)
        /// </summary>
        [BindProperty(Name = "propertyName")]
        public string? PropertyName { get; set; }

        /// <summary>
        /// File category for owner entity if property is not set
        /// </summary>
        [BindProperty(Name = "fileCategory")]
        public string? FileCategory { get; set; }
    }
}
