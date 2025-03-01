using AutoMapper;
using System;

namespace Shesha.DynamicEntities.Mapper
{
    /// <summary>
    /// Numeric to enum converter
    /// </summary>
    public class NumericToEnumTypeConverter<TSource, TDestination> : ITypeConverter<TSource, TDestination> where TDestination : Enum
    {
        public TDestination Convert(TSource source, TDestination destination, ResolutionContext context)
        {
            var enumUnderlayingType = typeof(TDestination).GetEnumUnderlyingType();
            var numericValue = System.Convert.ChangeType(source, enumUnderlayingType);

            return numericValue != null ? (TDestination)numericValue : throw new Exception($"Failed to convert value '{numericValue}' of type '{typeof(TSource).FullName}' to type '{typeof(TDestination).FullName}'");
        }
    }
}
