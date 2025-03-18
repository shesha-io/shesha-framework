﻿using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Generic configurable component. Is used mostly to store configuration of the independent front-end components (e.g. sidebar menu, theme)
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.ConfigurableComponent")]
    [JoinedProperty("Frwk_ConfigurableComponents")]
    [DiscriminatorValue(ItemTypeName)]
    public class ConfigurableComponent : ConfigurationItemBase
    {
        public const string ItemTypeName = "configurable-component";

        /// inheritedDoc
        public override string ItemType => ItemTypeName;

        /// <summary>
        /// Form markup
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string? Settings { get; set; }
    }
}
