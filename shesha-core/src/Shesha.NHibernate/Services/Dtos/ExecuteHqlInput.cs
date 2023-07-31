using System.ComponentModel.DataAnnotations;

namespace Shesha.Services.Dtos
{
    /// <summary>
    /// Execute HQL input
    /// </summary>
    public class ExecuteHqlInput
    {
        [Required]
        [DataType(DataType.MultilineText)]
        public string Query { get; set; }
    }
}
