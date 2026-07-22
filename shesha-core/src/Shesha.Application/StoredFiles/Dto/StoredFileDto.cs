using System;

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
    }
}
