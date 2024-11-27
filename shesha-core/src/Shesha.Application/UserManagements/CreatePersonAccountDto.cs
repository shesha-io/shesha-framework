using Abp.AutoMapper;
using Shesha.Authorization.Users;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Persons
{
    [AutoMapTo(typeof(User), typeof(Person))]
    public class CreatePersonAccountDto
    {
        public virtual string UserName { get; set; }
        [Required]
        public virtual string Password { get; set; }
        [Required]
        public virtual string PasswordConfirmation { get; set; }

        [Required(AllowEmptyStrings = false)]
        [MinLength(1)]
        public virtual string FirstName { get; set; }

        [Required(AllowEmptyStrings = false)]
        [MinLength(1)]
        public virtual string LastName { get; set; }

        public virtual string MobileNumber { get; set; }

        [EmailAddress]
        [Required(AllowEmptyStrings = false)]
        public virtual string EmailAddress { get; set; }
        public virtual ReferenceListItemValueDto TypeOfAccount { get; set; }
    }
}