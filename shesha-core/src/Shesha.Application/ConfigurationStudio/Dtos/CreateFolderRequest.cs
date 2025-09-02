using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Input of the `Create Folder` operation
    /// </summary>
    public class CreateFolderRequest
    {
        /// <summary>
        /// Module Id
        /// </summary>
        public Guid ModuleId { get; set; }

        /// <summary>
        /// Folder Id
        /// </summary>
        public Guid? FolderId { get; set; }

        /// <summary>
        /// Folder Name
        /// </summary>
        public string Name { get; set; }

        public Guid? PrevItemId { get; set; }
    }
}
