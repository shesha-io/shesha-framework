using System;
using System.Collections.Generic;

namespace Shesha.StoredFiles.Dto
{
    public class StoredFileDto
    {
        public string? Error { get; set; }
        public Guid? Id { get; set; }
        public string? Name { get; set; }
        public string? FileCategory { get; set; }
        public string? Url { get; set; }
        public Int64 Size { get; set; }
        public string? Type { get; set; }
        public bool Temporary { get; set; }
        public bool UserHasDownloaded {  get; set; }
        public bool IsReplaced { get; set; }

        /// <summary>
        /// List of files that this file has replaced (history of replacements)
        /// </summary>
        public List<StoredFileReplacementDto>? ReplacementHistory { get; set; }
    }
}
