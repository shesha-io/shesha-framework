using Abp.Domain.Entities;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Tests.Metadata
{
    /// <summary>
    /// Test entity used to verify that properties decorated with [JsonIgnore]
    /// (Newtonsoft or System.Text.Json) are excluded from generated metadata,
    /// preventing them from being usable in dynamic LINQ sorting / property
    /// projection on Dynamic CRUD and GraphQL endpoints (issue #4774).
    /// </summary>
    public class EntityWithJsonIgnoreProps : Entity<Guid>
    {
        public virtual string Name { get; set; }

        [NotMapped]
        public virtual string Visible { get; set; }

        [NotMapped]
        [Newtonsoft.Json.JsonIgnore]
        public virtual string SecretNewtonsoft { get; set; }

        [NotMapped]
        [System.Text.Json.Serialization.JsonIgnore]
        public virtual string SecretSystemTextJson { get; set; }
    }
}
