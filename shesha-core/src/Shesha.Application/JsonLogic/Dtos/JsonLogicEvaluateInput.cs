using System.ComponentModel.DataAnnotations;

namespace Shesha.JsonLogic.Dtos
{
    public class JsonLogicEvaluateInput
    {
        [Required]
        public string Expression { get; set; } = string.Empty;
    }
}
