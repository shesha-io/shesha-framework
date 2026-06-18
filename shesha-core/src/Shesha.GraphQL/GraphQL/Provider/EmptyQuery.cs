using GraphQL.Types;

namespace Shesha.GraphQL.Provider
{
    public class EmptyQuery : ObjectGraphType
    {
        public EmptyQuery()
        {
            Name = nameof(EmptyQuery);

            Field<StringGraphType>("ping").Resolve(_ => "pong");
        }
    }
}
