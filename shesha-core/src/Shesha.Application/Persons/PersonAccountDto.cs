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
        public string UserName { get; set; }
        
        [Required]
        [MinLength(1)]
        public string FirstName { get; set; }

        [Required]
        [MinLength(1)]
        public string LastName { get; set; }

        [ReadOnly(true)]
        public string FullName { get; set; }

        public string MobileNumber { get; set; }

        [EmailAddress]
        [Required]
        public string EmailAddress { get; set; }

        public bool isContractor { get; set; }

        public EntityReferenceDto<Guid?> PrimaryOrganisation { get; set; }

        public ReferenceListItemValueDto TypeOfAccount { get; set; }

        public string GoToUrlAfterRegistration { get; set; }
    }
}
