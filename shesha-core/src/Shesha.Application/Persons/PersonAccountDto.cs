using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;

namespace Shesha.Persons
{
    [AutoMapTo(typeof(Person))]
    [AutoMapFrom(typeof(Person))]
    public class PersonAccountDto: EntityDto<Guid>
    {
        [Required]
        [MinLength(5)]
        public virtual string UserName { get; set; }
        
        [Required]
        [MinLength(1)]
        public virtual string FirstName { get; set; }

        [Required]
        [MinLength(1)]
        public virtual string LastName { get; set; }

        [ReadOnly(true)]
        public virtual string FullName { get; set; }

        public virtual string MobileNumber { get; set; }

        [EmailAddress]
        [Required]
        public virtual string EmailAddress { get; set; }

        public virtual bool isContractor { get; set; }

        public virtual EntityReferenceDto<Guid?> PrimaryOrganisation { get; set; }

        public virtual ReferenceListItemValueDto TypeOfAccount { get; set; }
    }
}
