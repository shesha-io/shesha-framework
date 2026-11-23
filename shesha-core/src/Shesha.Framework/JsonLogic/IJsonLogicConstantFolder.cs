using Newtonsoft.Json.Linq;

namespace Shesha.JsonLogic
{
    public interface IJsonLogicConstantFolder
    {
        JToken Fold(JToken logic);
    }
}
