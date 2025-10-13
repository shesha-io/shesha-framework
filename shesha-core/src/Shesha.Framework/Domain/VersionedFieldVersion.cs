﻿using System.ComponentModel.DataAnnotations;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    /// <summary>
    /// Version definition of a versioned field
    /// </summary>
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class VersionedFieldVersion : FullPowerEntity
    {
        /// <summary>
        /// Field link
        /// </summary>
        public virtual VersionedField Field { get; set; }

        /// <summary>
        /// Value content
        /// </summary>
        [MaxLength(int.MaxValue)]
        public virtual string Content { get; set; }

        /// <summary>
        /// Is true for last version
        /// Note: updated by triggers in sql server side
        /// </summary>
        public virtual bool IsLast { get; protected set; }

    }
}
