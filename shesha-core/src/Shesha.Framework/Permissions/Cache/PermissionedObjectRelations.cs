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
    }
}
