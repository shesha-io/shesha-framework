using Abp.Domain.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Junction table that tracks file replacement relationships.
    /// Records which files have been replaced by newer versions.
    /// </summary>
    [Table("Frwk_StoredFileReplacements")]
    public class StoredFileReplacement : Entity<Guid>
    {
        /// <summary>
        /// The ID of the new file that replaces the old file(s)
        /// </summary>
        [Required]
        public virtual Guid NewFileId { get; set; }

        /// <summary>
        /// Navigation property to the new file
        /// </summary>
        public virtual StoredFile NewFile { get; set; }

        /// <summary>
        /// The ID of the old file that was replaced
        /// </summary>
        [Required]
        public virtual Guid ReplacedFileId { get; set; }

        /// <summary>
        /// Navigation property to the replaced (old) file
        /// </summary>
        public virtual StoredFile ReplacedFile { get; set; }

        /// <summary>
        /// Timestamp when the replacement occurred
        /// </summary>
        public virtual DateTime ReplacementDate { get; set; }
    }
}
