using System;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Move item to module input
    /// </summary>
    public class MoveToModuleInput
    {
        /// <summary>
        /// Item id
        /// </summary>
        public Guid ItemId { get; set; }

        /// <summary>
        /// Module Id
        /// </summary>
        public Guid ModuleId { get; set; }
    }
}
