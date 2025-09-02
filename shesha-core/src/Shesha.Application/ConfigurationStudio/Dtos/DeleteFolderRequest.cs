using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Input of the `Delete Folder` operation
    /// </summary>
    public class DeleteFolderRequest
    {
        /// <summary>
        /// Folder Id
        /// </summary>
        public Guid FolderId { get; set; }
    }
}
