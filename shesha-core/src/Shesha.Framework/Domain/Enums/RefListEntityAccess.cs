using System;
using System.ComponentModel.DataAnnotations;
using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Filter expression type
    /// </summary>
    [Flags, ReferenceList("Shesha.Framework", "EntityAccess")]
    public enum RefListEntityAccess
    {
        /// <summary>
        /// No access
        /// </summary>
        [Display(Name = "No Access")]
        NoAccess = 0,

        /// <summary>
        /// Read access
        /// </summary>
        [Display(Name = "Read Access")]
        ReadAccess = 1,

        /// <summary>
        /// Write access
        /// </summary>
        [Display(Name = "Write Access")]
        WriteAccess = 2,

        /// <summary>
        /// Full access
        /// </summary>
        [Display(Name = "Full Access")]
        FullAccess = ReadAccess | WriteAccess
    }
}