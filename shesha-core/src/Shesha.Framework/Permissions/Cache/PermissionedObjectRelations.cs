using System.Collections.Generic;

namespace Shesha.Permissions.Cache
{
    public class PermissionedObjectRelations
    {
        public PermissionedObjectRelations()
        {
            Children = new List<string>();
        }

        public List<string> Children { get; set; }

        public void AddChildren(string key)
        {
            if (!Children.Contains(key))
                Children.Add(key);
        }

        /// <summary>
        /// Independent copy, for callers that need to modify the value without touching the
        /// instance held in the cache. The cache hands out shared references, so mutating a
        /// value read from it would publish the change to everything else holding it, and would
        /// do so without going through the cache's write path.
        /// </summary>
        public PermissionedObjectRelations Copy()
        {
            return new PermissionedObjectRelations
            {
                Children = new List<string>(Children),
            };
        }
    }
}
