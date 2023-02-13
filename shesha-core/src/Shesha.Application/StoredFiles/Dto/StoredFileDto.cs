using System;

namespace Shesha.StoredFiles.Dto
{
    public class StoredFileDto
    {
        public string Error { get; set; }
        public Guid? Id { get; set; }
        public string Name { get; set; }
        public Int64? FileCategory { get; set; }
        public string Url { get; set; }
        public Int64 Size { get; set; }
        public string Type { get; set; }
    }
}
