using Newtonsoft.Json.Linq;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// JsonLogic operation
    /// </summary>
    public class OperationProps
    {
        public string Name { get; set; }
        public JToken[] Arguments { get; set; }
    }
}
