using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using JetBrains.Annotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Entity property value (initially for Dynamic properties)
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.EntityPropertyValue", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class EntityPropertyValue : FullPowerChildEntity
    {
        /// <summary>
        /// Owner entity property
        /// </summary>
        public virtual EntityProperty EntityProperty { get; set; }

        /// <summary>
        /// Property value
        /// </summary>
        public virtual string Value { get; set; }

        public EntityPropertyValue()
        {
        }
    }
}
