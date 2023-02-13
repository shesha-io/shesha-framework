using Abp.Domain.Repositories;
using Shesha.Domain;
using System;
using System.Linq;
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

    /*
    //[GlobalSpecification]
    public class MyUnitPersonsSpecification : ShaSpecification<Person>
    {
        public override Expression<Func<Person, bool>> BuildExpression()
        {
            if (AbpSession.UserId == null)
                return p => true;

            // Fetch current person. Note: all specifications are disabled here
            var personService = IocManager.Resolve<IRepository<Person, Guid>>();
            var currentPerson = personService.GetAll().FirstOrDefault(p => p.User != null && p.User.Id == AbpSession.UserId);

            // Return only persons from the same area
            return p => currentPerson == null || p.AreaLevel1 == currentPerson.AreaLevel1;
        }
    }
    */
}
