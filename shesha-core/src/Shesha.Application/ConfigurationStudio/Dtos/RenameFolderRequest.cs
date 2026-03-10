using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Input of the `Rename Folder` operation
    /// </summary>
    public class RenameFolderRequest
    {
        /// <summary>
        /// Folder Id
        /// </summary>
        public Guid FolderId { get; set; }
        
        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }
    }
}
