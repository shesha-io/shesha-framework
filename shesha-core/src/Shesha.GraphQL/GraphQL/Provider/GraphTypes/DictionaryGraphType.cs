using GraphQL.Types;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.GraphQL.Provider.GraphTypes
{
    public class DictionaryGraphType<TKey, TValue> : ScalarGraphType where TKey : notnull
    {
        public DictionaryGraphType()
        {
            Name = MakeName();
        }

        public override object? ParseValue(object? value)
        {
            if (value == null)
            {
                return new Dictionary<TKey, TValue>();
            }

            return ((IEnumerable<KeyValuePair<TKey, TValue>>)value).ToDictionary(x => x.Key, x => x.Value);
        }

        public override bool IsValidDefault(object value)
        {
            if (value == null)
            {
                return false;
            }

            if (value.GetType().IsAssignableToGenericType(typeof(IDictionary<,>)))
            {
                return true;
            }

            return false;
        }

        private static string MakeName()
        {
            return $"Dictionary_{GraphTypeMapper.GetTypeName<TKey>()}_{GraphTypeMapper.GetTypeName<TValue>()}";
        }
    }
}
