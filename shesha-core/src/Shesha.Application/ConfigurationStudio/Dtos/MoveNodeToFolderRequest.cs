using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Request of the <see cref="ConfigurationStudioAppService.MoveNodeToFolderAsync(MoveNodeToFolderRequest)"/> operation
    /// </summary>
    public class MoveNodeToFolderRequest
    {
        public TreeNodeType NodeType { get; set; }
        public Guid NodeId { get; set; }
        public Guid? FolderId { get; set; }
    }
}
