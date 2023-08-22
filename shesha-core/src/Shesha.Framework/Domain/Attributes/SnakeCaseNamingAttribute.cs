using Shesha.Domain.Conventions;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Forces application to use shake_case naming
    /// </summary>
    public class SnakeCaseNamingAttribute : NamingConventionsAttribute
    {
        public SnakeCaseNamingAttribute() : base(typeof(SnakeCaseNamingConventions))
        {
        }
    }
}
