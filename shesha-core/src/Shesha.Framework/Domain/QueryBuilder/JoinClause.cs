namespace Shesha.Domain.QueryBuilder
{
    /// <summary>
    /// Join class
    /// </summary>
    public class JoinClause
    {
        public string Reference { get; set; }
        public string Alias { get; set; }
        public JoinType JoinType { get; set; }
        public string Condition { get; set; }
    }
}