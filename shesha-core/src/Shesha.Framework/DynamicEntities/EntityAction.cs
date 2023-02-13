using System;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Entity action (CRUD or specific one)
    /// </summary>
    public class EntityAction
    {
        /// <summary>
        /// Type of entity
        /// </summary>
        public Type EntityType { get; set; }

        /// <summary>
        /// Action name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Endpoint Url
        /// </summary>
        public string Url { get; set; }

        /// <summary>
        /// Http verb
        /// </summary>
        public string HttpVerb { get; set; }
    }
}
