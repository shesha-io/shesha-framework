using Abp.Domain.Entities;
using JetBrains.Annotations;
using Shesha.ConfigurationItems;
using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration item base
    /// </summary>
    public abstract class ConfigurationItemBase: Entity<Guid>, IConfigurationItem
    {
        /// <summary>
        /// Configuration item base info
        /// </summary>
        [ForeignKey("Id")]
        [OneToOne]
        [NotNull]
        public virtual ConfigurationItem Configuration { get; set; }

        public abstract string ItemType { get; }

        public ConfigurationItemBase()
        {
            Configuration = new ConfigurationItem() { 
                ItemType = ItemType
            };
        }

        public abstract Task<IList<ConfigurationItemBase>> GetDependenciesAsync();

        public virtual void Normalize() 
        {
            if (Id == Guid.Empty)
            { 
                Id = Guid.NewGuid();
                if (Configuration == null)
                    throw new NotSupportedException("Configuration must exists");
                if (Configuration.Id != Guid.Empty && Configuration.Id != Id)
                    throw new NotSupportedException($"Change Id of the `{nameof(Configuration)}` is not supported");

                Configuration.Id = Id;
            }

            // If Origin is not specified - add self reference
            if (Configuration.Origin == null)
                Configuration.Origin = Configuration;
        }
    }
}
