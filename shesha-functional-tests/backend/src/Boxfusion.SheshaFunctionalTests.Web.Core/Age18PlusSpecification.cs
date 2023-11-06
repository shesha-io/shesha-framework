using Shesha.Domain;
using Shesha.Specifications;
using System;
using System.Linq.Expressions;

namespace Boxfusion.SheshaFunctionalTests
{
    public class Age18PlusSpecification : ShaSpecification<Person>
    {
        public override Expression<Func<Person, bool>> BuildExpression()
        {
            return p => p.DateOfBirth != null && p.DateOfBirth <= DateTime.Now.AddYears(-18);
        }
    }
}
