using JetBrains.Annotations;
using Shesha.ConfigurationItems;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities;
using System;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration Item with typed revisions
    /// </summary>
    /// <typeparam name="TRevision"></typeparam>
    public class ConfigurationItem<TRevision> : ConfigurationItem, IConfigurationItem<TRevision> where TRevision : ConfigurationItemRevision, new()
    {
        /// <summary>
        /// Active (published) revision. Is used when drafts mode is enabled
        /// </summary>
        [CascadeUpdateRules(false, false)]
        public virtual TRevision? ActiveRevision { get; set; }

        /// <summary>
        /// Most recent revision. Is used for performance boosting
        /// </summary>
        [CascadeUpdateRules(false, false)]
        public virtual TRevision LatestRevision { get; set; }

        /// <summary>
        /// Effective revision (active or latest). Note: active revision may be missing
        /// </summary>
        [CascadeUpdateRules(false, false)]
        [ReadonlyProperty]
        public virtual TRevision Revision { get; protected set; }

        [MemberNotNullWhen(true, nameof(Revision))]
        public virtual bool IsRevisionAvailable => Revision != null;

        public virtual Task EditRevisionAsync(Func<TRevision, Task> asyncUpdater) 
        {
            EnsureLatestRevision();

            return asyncUpdater.Invoke(LatestRevision);
        }

        [MemberNotNull(nameof(LatestRevision))]
        public virtual TRevision EnsureLatestRevision() 
        {
            return LatestRevision ??= MakeNewRevision();
        }

        [MemberNotNull(nameof(LatestRevision))]
        public virtual TRevision MakeNewRevision()
        {
            var prevRevision = LatestRevision;
            var newVersionNo = prevRevision != null
                ? prevRevision.VersionNo + 1
                : 1;
            LatestRevision = new TRevision() { 
                ConfigurationItem = this,
                VersionNo = newVersionNo,
                ParentRevision = prevRevision,
            };
            return LatestRevision;
        }

        public bool HasRevision => Revision != null;
        public ConfigurationItemRevision? GetLatestRevision()
        {
            return LatestRevision;
        }

        /// <summary>
        /// Default constructor
        /// </summary>
        [UsedImplicitly]
        public ConfigurationItem()
        {
            
        }
    }

    public interface IConfigurationItemFactory
    {
    }

    public interface IConfigurationItemFactory<TSelf, TRevision> : IConfigurationItemFactory where TSelf : IConfigurationItemFactory<TSelf, TRevision>
    {
        static abstract TSelf New(Action<TRevision> revisionInit);
    }
}
