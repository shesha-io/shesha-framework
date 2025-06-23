using System;

namespace Shesha.ConfigurationStudio.Dtos
{
    /// <summary>
    /// Flat Configuraion Studio tree node
    /// </summary>
    public class FlatTreeNode
    {
        public virtual Guid Id { get; set; }
        public virtual Guid? ParentId { get; set; }
        public virtual Guid ModuleId { get; set; }
        public virtual string Name { get; set; }
        public virtual string Label { get; set; }
        public virtual int NodeType { get; set; }
        public virtual string? ItemType { get; set; }
    }
}
