using Abp.Dependency;
using Abp.Reflection;
using Shesha.AutoMapper;
using Shesha.Extensions;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.DynamicEntities.Mapper
{
    /// <summary>
    /// Entity mapping profile
    /// </summary>
    public class ReferenceListMapProfile : ShaProfile, ITransientDependency
    {
        private static List<ConverterDefinition> Converters;

        static ReferenceListMapProfile() 
        {
            Converters = new List<ConverterDefinition>();

            var typeFinder = StaticContext.IocManager.Resolve<ITypeFinder>();

            var reflistTypes = typeFinder.Find(t => t.IsReferenceListType()).ToList();
            foreach (var reflistType in reflistTypes)
            {
                //var numericType = Enum.GetUnderlyingType(reflistType);
                var numericType = typeof(Int64);

                Converters.Add(new ConverterDefinition(reflistType, numericType, typeof(EnumToNumericTypeConverter<,>).MakeGenericType(reflistType, numericType)));
                Converters.Add(new ConverterDefinition(numericType, reflistType, typeof(NumericToEnumTypeConverter<,>).MakeGenericType(numericType, reflistType)));

                /*
                var listType = typeof(List<Int64?>);
                Converters.Add(new ConverterDefinition(listType, reflistType, typeof(NumericToEnumTypeConverter<,>).MakeGenericType(numericType, reflistType)));
                */
            }
        }

        public ReferenceListMapProfile()
        {
            foreach (var converter in Converters)
            {
                CreateMap(converter.SrcType, converter.DstType).ConvertUsing(converter.ConverterType);
            }
        }
    }
}
