using System.ComponentModel.DataAnnotations;

namespace Shesha.Users.Dto
{
    public class ChangeUserLanguageDto
    {
        [Required]
        public string LanguageName { get; set; }
    }
}