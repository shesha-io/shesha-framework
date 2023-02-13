using System;

namespace Shesha.DynamicEntities.Mapper
{
    /// <summary>
    /// Automapper converter definition
    /// </summary>
    public class ConverterDefinition
    {
        public Type SrcType { get; set; }
        public Type DstType { get; set; }
        public Type ConverterType { get; set; }

        public ConverterDefinition(Type srcType, Type dstType, Type converterType)
        {
            SrcType = srcType;
            DstType = dstType;
            ConverterType = converterType;
        }
    }
}
