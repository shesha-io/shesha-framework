using System.Collections.Generic;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Configuration Studio tree node
    /// </summary>
    public class ModuleTreeNode: TreeNode, ITreeNodeWithChildNodes
    {
        public override TreeNodeType NoteType => TreeNodeType.Module;
        public List<TreeNode> ChildNodes { get; set; } = new();
    }
}
