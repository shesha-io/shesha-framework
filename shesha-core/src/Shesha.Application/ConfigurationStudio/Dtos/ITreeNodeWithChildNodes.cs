using System.Collections.Generic;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Configuration Studio tree node
    /// </summary>
    public interface ITreeNodeWithChildNodes
    {
        /// <summary>
        /// Child nodes
        /// </summary>
        List<TreeNode> ChildNodes { get; }
    }
}
