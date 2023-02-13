using System;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Copy for input
    /// </summary>
    public class CopyInput
    {
        /// <summary>
        /// Item id
        /// </summary>
        public Guid ItemId { get; set; }

        /// <summary>
        /// Module Id
        /// </summary>
        public Guid ModuleId { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Label
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }
    }
}
