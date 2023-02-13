using NHibernate;
using NHibernate.Engine;
using NHibernate.Type;
using NHibernate.UserTypes;
using Shesha.EntityReferences;
using System;
using System.Data.Common;

namespace Shesha.NHibernate.UserTypes
{
    internal class EntityReferenceUserType : ICompositeUserType
    {
        public string[] PropertyNames => new string[] { "Id", "_className" };

        public IType[] PropertyTypes => new IType[] { NHibernateUtil.String, NHibernateUtil.String };

        public Type ReturnedClass => typeof(GenericEntityReference);

        public bool IsMutable => true;

        public object Assemble(object cached, ISessionImplementor session, object owner)
        {
            throw new NotImplementedException();
        }

        public object DeepCopy(object value)
        {
            if (value is GenericEntityReference er)
                return new GenericEntityReference(er.Id, er._className, er._displayName);
            return null;
        }

        public object Disassemble(object value, ISessionImplementor session)
        {
            throw new NotImplementedException();
        }

        public new bool Equals(object x, object y)
        {
            if (x is GenericEntityReference erx && y is GenericEntityReference ery)
                return erx.Id == ery.Id && erx._className == ery._className;
            return false;
        }

        public int GetHashCode(object x)
        {
            return x == null ? 0 : x.GetHashCode();
        }

        public object GetPropertyValue(object component, int property)
        {
            if (component is GenericEntityReference entityRef)
            {
                switch (property)
                {
                    case 0: return entityRef.Id;
                    case 1: return entityRef._className;
                };
            }
            return null;
        }

        public object NullSafeGet(DbDataReader dr, string[] names, ISessionImplementor session, object owner)
        {
            if (names.Length != 2)
                throw new InvalidOperationException("Only expecting two column...");

            var id = dr[names[0]] as string;
            var objType = dr[names[1]] as string;

            if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(objType))
            {
                return null;
            }

            return new GenericEntityReference(id, objType);
        }

        public void NullSafeSet(DbCommand cmd, object value, int index, bool[] settable, ISessionImplementor session)
        {
            var parameterId = (DbParameter)cmd.Parameters[index];
            var parameterType = (DbParameter)cmd.Parameters[index + 1];

            if (value is GenericEntityReference reference)
            {
                parameterId.Value = reference.Id;
                parameterType.Value = reference._className;
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
