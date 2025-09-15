using DocumentFormat.OpenXml.Office2010.ExcelAc;
using System.Collections.Generic;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Configuration Studio folder tree node
    /// </summary>
    public class FolderTreeNode: TreeNode, ITreeNodeWithChildNodes
    {
        public override TreeNodeType NoteType => TreeNodeType.Folder;
        public List<TreeNode> ChildNodes { get; set; } = new();
    }
}
