using Abp.Extensions;
using Shesha.Specifications.Exceptions;
using System;
using System.Linq;

namespace Shesha.Specifications
{
    /// <summary>
    /// Specifications context
    /// </summary>
    public class SpecificationsContext : ISpecificationsContext
    {
        /// inheritedDoc
        public string Id { get; set; }

        /// inheritedDoc
        public SpecificationInfo SpecificationInfo { get; private set; }

        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="specificationsType">Specification type</param>
        /// <param name="entityType">Entity type</param>
        public SpecificationsContext(Type specificationsType, Type entityType)
        {
            Id = Guid.NewGuid().ToString();

            var specs = SpecificationsHelper.GetSpecificationsInfo(specificationsType).Where(i => i.EntityType == entityType).ToList();
            if (!specs.Any())
                throw new SpecificationNotImplementedException(specificationsType, entityType);

            if (specs.Count() > 1)
                throw new AmbiguousSpecificationImplementedException(specificationsType, entityType);

            SpecificationInfo = specs.First();
        }

        /// inheritedDoc
        public event EventHandler Disposed;

        /// <summary>
        /// Called to trigger <see cref="Disposed"/> event.
        /// </summary>
        protected virtual void OnDisposed()
        {
            Disposed.InvokeSafely(this);
        }

        /// <summary>
        /// Gets a value indicates that this unit of work is disposed or not.
        /// </summary>
        public bool IsDisposed { get; private set; }

        /// inheritedDoc
        public void Dispose()
        {
            if (IsDisposed)
                return;

            IsDisposed = true;

            OnDisposed();
        }
    }
}
