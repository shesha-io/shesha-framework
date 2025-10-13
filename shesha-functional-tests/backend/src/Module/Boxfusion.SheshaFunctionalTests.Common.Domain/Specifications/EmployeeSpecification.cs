using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Shesha.Specifications;
using System;
using System.Linq.Expressions;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Specifications
{
    /// <summary>
    /// Returns employees that have a valid order index, non-empty first and last names, and a non-null company.
    /// </summary>
    public class EmployeeSpecification : ShaSpecification<Employee>
    {
        public override Expression<Func<Employee, bool>> BuildExpression()
        {
            return employee => employee.OrderIndex > 0 && 
                             !string.IsNullOrEmpty(employee.FirstName) && 
                             !string.IsNullOrEmpty(employee.LastName) &&
                             employee.Company != null;
        }
    }
}
