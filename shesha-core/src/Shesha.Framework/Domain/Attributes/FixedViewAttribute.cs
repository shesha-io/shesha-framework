using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Specifies fixed view configuration for the destination entity
    /// </summary>
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
    public class FixedViewAttribute: Attribute
    {
        /// <summary>
        /// View type
        /// </summary>
        public string ViewType { get; set; }

        /// <summary>
        /// Identifier of form to use for current veiew
        /// </summary>
        public FormIdentifier FormId { get; set; }

        public FixedViewAttribute(string viewType, string formModule, string formName)
        {
            ViewType = viewType;
            FormId = new FormIdentifier(formModule, formName);
        }
    }
}
