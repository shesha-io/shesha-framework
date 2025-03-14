﻿using System;
using System.Collections.Generic;

namespace Shesha.Metadata
{
    public class MetadataContext
    {
        public Type? MainType { get; private set; }
        public List<Type> ProcessedTypes { get; set; }

        public MetadataContext(Type mainType): this()
        {
            MainType = mainType;
            ProcessedTypes.Add(mainType);
        }

        public MetadataContext() 
        {
            ProcessedTypes = new();
        }
    }
}
