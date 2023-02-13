using Newtonsoft.Json.Linq;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// JsonLogic operation
    /// </summary>
    public class OperationProps
    {
        public string Operation { get; set; }
        public JToken[] Arguments { get; set; }
    }
}
