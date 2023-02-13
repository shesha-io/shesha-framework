using Abp.Reflection;
using EasyNetQ;
using Shesha.RabbitMQ.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Shesha.RabbitMQ
{
    public class TypeAliasTypeNameSerializer : ITypeNameSerializer
    {
        private readonly DefaultTypeNameSerializer _defaultTypeNameSerializer = new DefaultTypeNameSerializer();
        private readonly Dictionary<string, Type> _nameToType = new Dictionary<string, Type>();
        private readonly Dictionary<Type, string> _typeToName = new Dictionary<Type, string>();

        public TypeAliasTypeNameSerializer(params Assembly[] assemblies)
        {

            foreach (var type in assemblies.SelectMany(x => x.GetTypes()))
            {
                foreach (var attribute in type.GetCustomAttributes<TypeAliasAttribute>())
                {
                    _nameToType.TryAdd(attribute.Name, type);
                    if (attribute.IsDefault)
                    {
                        _typeToName.TryAdd(type, attribute.Name);
                    }
                }
            }
        }

        public string Serialize(Type type)
        {
            if (_typeToName.TryGetValue(type, out var alias))
            {
                return alias;
            }

            return _defaultTypeNameSerializer.Serialize(type);
        }

        public Type DeSerialize(string typeName)
        {

            if (typeName.Split('.').Length > 1)
            {
                typeName = typeName.Split('.')[1].Trim().Split(',').FirstOrDefault();
            }

            if (_nameToType.TryGetValue(typeName, out var type))
            {
                return type;
            }

            return _defaultTypeNameSerializer.DeSerialize(typeName);
        }
    }
}

