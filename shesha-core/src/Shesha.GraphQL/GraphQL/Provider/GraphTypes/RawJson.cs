namespace Shesha.GraphQL.Provider.GraphTypes
{
    /// <summary>
    /// Raw Json
    /// </summary>
    public class RawJson
    {
        private object _value;
        

        public RawJson(object value)
        {
            _value = value;
        }

        public object Value => _value;

        public override string ToString()
        {
            return _value.ToString();
        }
    }
}
