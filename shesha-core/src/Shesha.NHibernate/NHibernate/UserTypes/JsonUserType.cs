using Abp.Json;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using NHibernate.Engine;
using NHibernate.SqlTypes;
using NHibernate.UserTypes;
using Shesha.JsonEntities.Proxy;
using System;
using System.Data.Common;

namespace Shesha.NHibernate.UserTypes
{
    [Serializable]
    public class JsonUserType<T> : IUserType
        where T : class
    {
        public SqlType[] SqlTypes => new SqlType[] { new StringClobSqlType() };

        public Type ReturnedType => typeof(T);

        public bool IsMutable => true;

        public object Assemble(object cached, object owner)
        {
            var str = cached as string;

            if (string.IsNullOrWhiteSpace(str))
                return null;

            return JsonConvert.DeserializeObject<T>(str);
        }

        public object DeepCopy(object value)
        {
            if (value == null)
                return null;

            if (value is IJsonEntityProxy proxy)
                return JsonEntityProxy.GetJson(proxy).ToObject<T>();

            var serialized = JsonConvert.SerializeObject(value, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });

            return JsonConvert.DeserializeObject<T>(serialized);
        }

        public object Disassemble(object value)
        {
            if (value == null)
                return null;

            return JsonConvert.SerializeObject(value, new JsonSerializerSettings
            {
                Formatting = Formatting.None,
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });
        }

        public new bool Equals(object x, object y)
        {
            if (x == null && y == null)
                return true;

            if (x == null && y != null || x != null && y == null)
                return false;

            if (x is IJsonEntityProxy xp && y is IJsonEntityProxy yp)
                return xp._json.ToString() == yp._json.ToString();

            var xdocX = JsonConvert.SerializeObject(x);
            var xdocY = JsonConvert.SerializeObject(y);

            return xdocY == xdocX;
        }

        public int GetHashCode(object x)
        {
            return x == null ? 0 : x.GetHashCode();
        }

        public object NullSafeGet(DbDataReader rs, string[] names, ISessionImplementor session, object owner)
        {
            if (names.Length != 1)
                throw new InvalidOperationException("Only expecting one column...");

            var val = rs[names[0]] as string;

            if (val != null && !string.IsNullOrWhiteSpace(val))
                return JsonConvert.DeserializeObject<T>(val);

            return null;
        }

        public void NullSafeSet(DbCommand cmd, object value, int index, ISessionImplementor session)
        {
            var parameter = (DbParameter)cmd.Parameters[index];

            if (value == null)
            {
                parameter.Value = DBNull.Value;
            }
            else
            {
                if (value is IJsonEntityProxy proxy)
                    parameter.Value = JsonEntityProxy.GetJson(proxy).ToString();
                else
                    parameter.Value = JsonConvert.SerializeObject(value, new JsonSerializerSettings
                    {
                        Formatting = Formatting.None,
                        ContractResolver = new CamelCasePropertyNamesContractResolver()
                    });
            }
        }

        public object Replace(object original, object target, object owner)
        {
            return original;
        }
    }
}
