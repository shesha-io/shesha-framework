using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;
using NHibernate.Mapping;
using Shesha.Domain.Attributes;
using Shesha.JsonEntities;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.Organisation")]
    public class Organisation : OrganisationBase<Organisation, Address, Person>
    {
        [SaveAsJson]
        public List<JPerson> TestList => new List<JPerson>()
        {
            new JPerson() { id = 1, fullName = "Shurik 1", _className = "Shesha.Domain.Person" },
            new JPerson() { id = 2, firstName = "Test Json Shurik 11", fullName = "Test Json Full Name", _className = "Shesha.Test.JsonPerson" },
            new JPerson() { id = 3, fullName = "Shurik 22", _className = "Shesha.Domain.Person" },
            new JPerson() { id = 4, fullName = "Shurik 33", _className = "Shesha.Domain.Person" },
            new JPerson() { id = 5, firstName = "Test Json Shurik 22", fullName = "Test Json Full Name", _className = "Shesha.Test.JsonPerson" },
            new JPerson() { id = 6, fullName = "Shurik 44", _className = "Shesha.Domain.Person" },
            new JPerson() { id = 7, fullName = "Shurik 55", _className = "Shesha.Domain.Person" },
            new JPerson() { id = 8, firstName = "Test Json Shurik 33", fullName = "Test Json Full Name", _className = "Shesha.Test.JsonPerson" },
            new JPerson() { id = 9, fullName = "Shurik 66", _className = "Shesha.Domain.Person" },
            new JPerson() { id = 10, fullName = "Shurik 77", _className = "Shesha.Domain.Person" },
            new JPerson() { id = 11, firstName = "Test Json Shurik 44", fullName = "Test Json Full Name", _className = "Shesha.Test.JsonPerson" },
            new JPerson() { id = 12, fullName = "Shurik 881", _className = "Shesha.Domain.Person" }
        };
    }

    public class JPerson
    {
        public int id { get; set; }
        public string fullName { get; set; }
        public string _className { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
    }
}