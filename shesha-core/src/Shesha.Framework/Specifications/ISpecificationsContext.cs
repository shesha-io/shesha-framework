using System;

namespace Shesha.Specifications
{
    /// <summary>
    /// Specifications context
    /// </summary>
    public interface ISpecificationsContext : IDisposable
    {
        /// <summary>
        /// Unique id of this context
        /// </summary>
        string Id { get; }

        /// <summary>
        /// Specification info
        /// </summary>
        SpecificationInfo SpecificationInfo { get; }

        /// <summary>
        /// This event is raised when this context is disposed.
        /// </summary>
        event EventHandler Disposed;
    }
}
