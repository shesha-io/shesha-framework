using NHibernate;
using NHibernate.Engine;
using NHibernate.Type;
using NHibernate.UserTypes;
using Shesha.Domain;
using System;
using System.Data.Common;

namespace Shesha.NHibernate.UserTypes
{
    internal class ConfigurationItemIdentifierUserType : ICompositeUserType
    {
        public string[] PropertyNames => new string[] { nameof(FormIdentifier.Module), nameof(FormIdentifier.Name) };

        public IType[] PropertyTypes => new IType[] { NHibernateUtil.String, NHibernateUtil.String };

        public Type ReturnedClass => typeof(FormIdentifier);

        public bool IsMutable => true;

        public object Assemble(object cached, ISessionImplementor session, object owner)
        {
            throw new NotImplementedException();
        }

        public object DeepCopy(object value)
        {
            if (value is FormIdentifier er)
                return new FormIdentifier(er.Module, er.Name);
            return null;
        }

        public object Disassemble(object value, ISessionImplementor session)
        {
            throw new NotImplementedException();
        }

        public new bool Equals(object x, object y)
        {
            if (x == null && y == null) return true;

            if (x is FormIdentifier erx && y is FormIdentifier ery)
                return erx == ery;
            return false;
        }

        public int GetHashCode(object x)
        {
            return x == null ? 0 : x.GetHashCode();
        }

        public object GetPropertyValue(object component, int property)
        {
            if (component is FormIdentifier formId)
            {
                switch (property)
                {
                    case 0: return formId.Module;
                    case 1: return formId.Name;
                };
            }
            return null;
        }

        public object NullSafeGet(DbDataReader dr, string[] names, ISessionImplementor session, object owner)
        {
            if (names.Length != 2)
                throw new InvalidOperationException("Only expecting two column...");

            var module = dr[names[0]] as string;
            var name = dr[names[1]] as string;

            if (string.IsNullOrWhiteSpace(module) || string.IsNullOrWhiteSpace(name))
            {
                return null;
            }

            return new FormIdentifier(module, name);
        }

        public void NullSafeSet(DbCommand cmd, object value, int index, bool[] settable, ISessionImplementor session)
        {
            var parameterId = (DbParameter)cmd.Parameters[index];
            var parameterType = (DbParameter)cmd.Parameters[index + 1];

            if (value is FormIdentifier formId)
            {
                parameterId.Value = formId.Module;
                parameterType.Value = formId.Name;
            }
            else
            {
                parameterId.Value = DBNull.Value;
                parameterType.Value = DBNull.Value;
            }
        }

        public object Replace(object original, object target, ISessionImplementor session, object owner)
        {
            return original;
        }

        public void SetPropertyValue(object component, int property, object value)
        {
            throw new NotImplementedException();
        }
    }
}
