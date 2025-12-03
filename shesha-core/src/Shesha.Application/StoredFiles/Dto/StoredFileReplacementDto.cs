using System;

namespace Shesha.StoredFiles.Dto
{
    /// <summary>
    /// DTO for file replacement information
    /// </summary>
    public class StoredFileReplacementDto
    {
        /// <summary>
        /// The ID of the replacement record
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The ID of the new file that replaces the old file
        /// </summary>
        public Guid NewFileId { get; set; }

        /// <summary>
        /// The ID of the old file that was replaced
        /// </summary>
        public Guid ReplacedFileId { get; set; }

        /// <summary>
        /// Information about the replaced file
        /// </summary>
        public string ReplacedFileName { get; set; }

        /// <summary>
        /// Size of the replaced file
        /// </summary>
        public long ReplacedFileSize { get; set; }

        /// <summary>
        /// Type of the replaced file
        /// </summary>
        public string ReplacedFileType { get; set; }

        /// <summary>
        /// URL to download the replaced file
        /// </summary>
        public string ReplacedFileUrl { get; set; }

        /// <summary>
        /// When the replacement occurred
        /// </summary>
        public DateTime ReplacementDate { get; set; }
    }
}
