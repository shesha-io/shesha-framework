using Shesha.Domain;
using System;
using System.Linq.Expressions;

namespace Shesha.Specifications
{
    public class Age18PlusSpecification : ShaSpecification<Person>
    {
        public override Expression<Func<Person, bool>> BuildExpression()
        {
            return p => p.DateOfBirth != null && p.DateOfBirth <= DateTime.Now.AddYears(-18);
        }
    }

    public class HasNoAccountSpecification : ShaSpecification<Person>
    {
        public override Expression<Func<Person, bool>> BuildExpression()
        {
            return p => p.User == null;
        }
    }
}
