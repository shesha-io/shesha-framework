using Microsoft.AspNetCore.Mvc;

namespace Shesha.StoredFiles.Dto
{
    public class FilesListInput : StoredFilesInputBase
    {
        /// <summary>
        /// Set to true to get files of all categories
        /// </summary>
        [BindProperty(Name = "allCategories")]
        public bool AllCategories { get; set; }
    }
}
