using Newtonsoft.Json.Linq;
using System;
using System.Linq.Expressions;
using System.Text.Json;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// Json Logic to Linq converter
    /// </summary>
    public interface IJsonLogic2LinqConverter
    {
        /// <summary>
        /// Parse JsonLogic expression
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="rule"></param>
        /// <returns></returns>
        Expression<Func<T, bool>> ParseExpressionOf<T>(JObject rule);

        /// <summary>
        /// Parse JsonLogic expression
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="rule"></param>
        /// <returns></returns>
        Expression<Func<T, bool>> ParseExpressionOf<T>(string rule);

        /// <summary>
        /// Parse predicate
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="rule"></param>
        /// <returns></returns>
        Func<T, bool> ParsePredicateOf<T>(JObject rule);

        /// <summary>
        /// Parse predicate
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="rule"></param>
        /// <returns></returns>
        Func<T, bool> ParsePredicateOf<T>(string rule);
    }
}
