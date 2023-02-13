using System.Linq.Expressions;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// Expression visitor that replaces expression parameter
    /// </summary>
    public class ExpressionParameterReplaceVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _from;
        private readonly Expression _to;

        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="from">Parameter to be replaced</param>
        /// <param name="to">New parmeter</param>
        public ExpressionParameterReplaceVisitor(ParameterExpression from, Expression to)
        {
            _from = from;
            _to = to;
        }
        protected override Expression VisitParameter(ParameterExpression node)
        {
            return node == _from ? _to : node;
        }
    }
}
