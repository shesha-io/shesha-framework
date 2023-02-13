using Abp.Specifications;
using Shesha.Domain;
using System;
using System.Linq.Expressions;

namespace Shesha.Tests.Specifications
{
    public class Age18PlusSpecification : Specification<Person>
    {
        public override Expression<Func<Person, bool>> ToExpression()
        {
            return p => p.DateOfBirth != null && p.DateOfBirth <= DateTime.Now.AddYears(-18); 
        }
    }

    public class HasNoAccountSpecification : Specification<Person>
    {
        public override Expression<Func<Person, bool>> ToExpression()
        {
            return p => p.User == null;
        }
    }
}
