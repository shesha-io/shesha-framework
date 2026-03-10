using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Configuration Studio tree node
    /// </summary>
    public abstract class TreeNode
    {
        public abstract TreeNodeType NoteType { get; }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Label { get; set; }
    }
}
