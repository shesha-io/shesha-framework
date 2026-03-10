namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Configuration Studio tree node: configuration item
    /// </summary>
    public class ConfigItemTreeNode : TreeNode
    {
        public virtual string ItemType { get; set; }
        public override TreeNodeType NoteType => TreeNodeType.ConfigurationItem;
    }
}
