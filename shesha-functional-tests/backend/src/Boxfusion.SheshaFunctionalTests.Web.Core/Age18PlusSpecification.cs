using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha.Domain;
using Shesha.Specifications;
using System;
using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;

namespace Boxfusion.SheshaFunctionalTests
{
    [Display(Name = "Person: Age > 18 years")]
    public class PersonAge18PlusSpecification : ShaSpecification<Person>
    {
        public override Expression<Func<Person, bool>> BuildExpression()
        {
            return p => p.DateOfBirth != null && p.DateOfBirth <= DateTime.Now.AddYears(-18);
        }
    }

    [Display(Name = "Member: Age > 18 years")]
    public class MemberAge18PlusSpecification : ShaSpecification<Member>
    {
        public override Expression<Func<Member, bool>> BuildExpression()
        {
            return p => p.DateOfBirth != null && p.DateOfBirth <= DateTime.Now.AddYears(-18);
        }
    }
}
