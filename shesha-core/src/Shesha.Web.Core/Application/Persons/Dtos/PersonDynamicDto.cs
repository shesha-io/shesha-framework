using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using System;

namespace Shesha.Application.Persons.Dtos
{
    public class PersonDynamicDto: DynamicDto<Person, Guid>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
