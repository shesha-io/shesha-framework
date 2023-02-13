using Abp.Runtime.Security;
using Newtonsoft.Json;
using NHibernate.Engine;
using NHibernate.SqlTypes;
using NHibernate.UserTypes;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.NHibernate.UserTypes
{
    public class EncryptedStringUserType : IUserType
    {
        public SqlType[] SqlTypes => new SqlType[] { new StringSqlType() };

        public Type ReturnedType => typeof(string);

        public bool IsMutable => true;

        public object Assemble(object cached, object owner)
        {
            var str = cached as string;

            return !string.IsNullOrWhiteSpace(str) ? cached: null;
        }

        public object DeepCopy(object value)
        {
            return value;
        }

        public object Disassemble(object value)
        {
            return value;
        }

        public new bool Equals(object x, object y)
        {
            if (x == null && y == null)
                return true;

            if (x == null || y == null)
                return false;

            return object.Equals(x, y);
        }

        public int GetHashCode(object x)
        {
            return x.GetHashCode();
        }

        public object NullSafeGet(DbDataReader rs, string[] names, ISessionImplementor session, object owner)
        {
            var val = rs[names[0]] as string;

            if (val != null && !string.IsNullOrWhiteSpace(val))
            {
                return SimpleStringCipher.Instance.Decrypt(val);
            }

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
                parameter.Value = SimpleStringCipher.Instance.Encrypt((string) value);
            }
        }

        public object Replace(object original, object target, object owner)
        {
            return original;
        }
    }
}
