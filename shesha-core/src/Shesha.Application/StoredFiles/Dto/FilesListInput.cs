using System;
using System.Collections.Generic;

namespace Shesha.StoredFiles.Dto
{
    public class FilesListInput : StoredFilesInputBase
    {
        public List<Guid> FilesId { get; set; }
    }
}
