﻿﻿﻿﻿using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Specifies that this Entity can be Exposed
    /// </summary>
    [AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
    public sealed class ExposableAttribute : Attribute
    {
        public string ItemType { get; private set; }
        public bool Exposable { get; set; }

        public ExposableAttribute(string itemType)
        {
            if (string.IsNullOrWhiteSpace(itemType))
                throw new ArgumentException("Item type cannot be null or empty.", nameof(itemType));

            ItemType = itemType;
            Exposable = true;
        }
    }
}
