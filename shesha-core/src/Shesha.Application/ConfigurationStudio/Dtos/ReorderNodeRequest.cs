using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Input of the <see cref="ConfigurationStudioAppService.ReorderNodeAsync(ReorderNodeRequest)"/> operation
    /// </summary>
    public class ReorderNodeRequest
    {
        public TreeNodeType NodeType { get; set; }
        public Guid DragNodeId { get; set; }
        public Guid DropNodeId { get; set; }
        public DropPositionType DropPosition { get; set; }

        public enum DropPositionType
        { 
            Before = -1,
            After = 1
        }
    }
}
