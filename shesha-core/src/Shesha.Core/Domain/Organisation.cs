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
    }
}