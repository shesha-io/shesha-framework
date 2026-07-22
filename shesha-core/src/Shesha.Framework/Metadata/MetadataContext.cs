using System;
using System.Collections.Generic;

namespace Shesha.Metadata
{
    public class MetadataContext
    {
        public Type MainType { get; private set; }
        public List<Type> ProcessedTypes { get; set; }

        public MetadataContext(Type mainType)
        {
            ProcessedTypes = new();
            MainType = mainType;
            ProcessedTypes.Add(mainType);
        }
    }
}
