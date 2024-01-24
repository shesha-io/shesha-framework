using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Timing;
using Castle.Core;
using Newtonsoft.Json.Linq;
using NUglify;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.JsonLogic.Exceptions;
using Shesha.Reflection;
using Shesha.Specifications;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// Json Logic to Linq converter
    /// </summary>
    public class JsonLogic2LinqConverter : IJsonLogic2LinqConverter, ITransientDependency
    {
        private readonly ISpecificationsFinder _specificationsFinder;
        private readonly ISpecificationManager _specificationsManager;

        public JsonLogic2LinqConverter(ISpecificationsFinder specificationsFinder, ISpecificationManager specificationsManager)
        {
            _specificationsFinder = specificationsFinder;
            _specificationsManager = specificationsManager;
        }

        private const string StringStr = "string";

        private readonly string BooleanStr = nameof(Boolean).ToLower();
        private readonly string Number = nameof(Number).ToLower();
        private readonly string In = nameof(In).ToLower();
        private readonly string And = nameof(And).ToLower();

        private readonly MethodInfo MethodContains = typeof(Enumerable).GetMethods(
                        BindingFlags.Static | BindingFlags.Public)
                        .Single(m => m.Name == nameof(Enumerable.Contains)
                            && m.GetParameters().Length == 2);

        private delegate Expression Binder(Expression left, Expression right);

        private Expression CombineExpressions<T>(JToken[] tokens, Binder binder, ParameterExpression param) 
        {
            Expression acc = null;

            Expression bind(Expression acc, Expression right) => acc == null ? right : binder(acc, right);

            foreach (var argument in tokens)
            {
                var parsedArgument = ParseTree<T>(argument, param);
                acc = bind(acc, parsedArgument);
            }

            return acc;
        }

        private Expression CombineExpressions<T>(Expression[] expressions, Binder binder, ParameterExpression param)
        {
            Expression acc = null;

            Expression bind(Expression acc, Expression right) => acc == null ? right : binder(acc, right);

            foreach (var expression in expressions)
            {
                acc = bind(acc, expression);
            }

            return acc;
        }

        private Expression ParseTree<T>(
            JToken rule,
            ParameterExpression param)
        {
            if (rule is JValue value)
                return Expression.Constant(value.Value);

            if (rule is JArray array) 
                throw new NotImplementedException();

            if (rule is JObject ruleObj)
            {
                if (!ruleObj.HasValues)
                    return Expression.Empty();

                if (!TryGetOperator(rule, out var @operator))
                    throw new JsonLogicParsingFailedException("Failed to parse expression", rule);

                switch (@operator.Name) 
                {
                    case JsOperators.And:
                        return CombineExpressions<T>(@operator.Arguments, Expression.AndAlso, param);

                    case JsOperators.Or:
                        return CombineExpressions<T>(@operator.Arguments, Expression.OrElse, param);

                    case JsOperators.Equal:
                    case JsOperators.StrictEqual:
                        {
                            return ParseEqualExpression<T>(param, @operator);
                        }

                    case JsOperators.NotEqual:
                    case JsOperators.StrictNotEqual:
                        {
                            var equalExpression= ParseEqualExpression<T>(param, @operator);
                            return Expression.Not(equalExpression);
                        }

                    case JsOperators.Greater:
                        {
                            return Compare<T>(param, @operator.Arguments, pair => pair, 
                                pair => 
                                {
                                    Expression expr = null;

                                    #region datetime
                                    // try to compare var and datetime const (normal order)
                                    if (TryCompareMemberAndDateTime(pair.Left, pair.Right,
                                        dt => dt.EndOfTheMinute(), // compare with end of the minute to exclude current value
                                        Expression.GreaterThan,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare datetime const and var (reverse order)
                                    if (TryCompareMemberAndDateTime(pair.Right, pair.Left,
                                        dt => dt.StartOfTheMinute(),
                                        Expression.LessThan,
                                        out expr
                                    ))
                                        return expr;
                                    #endregion

                                    #region date

                                    // try to compare var and datetime const (normal order)
                                    if (TryCompareMemberAndDate(pair.Left, pair.Right,
                                        dt => dt.EndOfTheDay(), // compare with end of the day to exclude current value
                                        Expression.GreaterThan,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare datetime const and var (reverse order)
                                    if (TryCompareMemberAndDate(pair.Right, pair.Left,
                                        dt => dt.StartOfTheDay(),
                                        Expression.LessThan,
                                        out expr
                                    ))
                                        return expr;

                                    #endregion

                                    #region time

                                    // try to compare var and time const (normal order)
                                    if (TryCompareMemberAndTime(pair.Left, pair.Right,
                                        t => t.EndOfTheMinute(), // compare with end of the minute
                                        Expression.GreaterThan,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare time const and var (reverse order)
                                    if (TryCompareMemberAndTime(pair.Right, pair.Left,
                                        t => t.StartOfTheMinute(),
                                        Expression.LessThan,
                                        out expr
                                    ))
                                        return expr;

                                    #endregion

                                    var convertedPair = PrepareExpressionPair(pair);
                                    return Expression.GreaterThan(convertedPair.Left, convertedPair.Right);
                                });
                        }

                    case JsOperators.GreaterOrEqual:
                        {
                            return Compare<T>(param, @operator.Arguments, pair => pair, 
                                pair => 
                                {
                                    Expression expr = null;

                                    #region datetime
                                    // try to compare var and datetime const (normal order)
                                    if (TryCompareMemberAndDateTime(pair.Left, pair.Right,
                                        dt => dt.StartOfTheMinute(), // compare with start of the minute to include current value
                                        Expression.GreaterThanOrEqual,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare datetime const and var (reverse order)
                                    if (TryCompareMemberAndDateTime(pair.Right, pair.Left,
                                        dt => dt.EndOfTheMinute(),
                                        Expression.LessThanOrEqual,
                                        out expr
                                    ))
                                        return expr;
                                    #endregion

                                    #region date

                                    // try to compare var and datetime const (normal order)
                                    if (TryCompareMemberAndDate(pair.Left, pair.Right,
                                        dt => dt.StartOfTheDay(), // compare with start of the day to include current value
                                        Expression.GreaterThanOrEqual,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare datetime const and var (reverse order)
                                    if (TryCompareMemberAndDate(pair.Right, pair.Left,
                                        dt => dt.EndOfTheDay(),
                                        Expression.LessThanOrEqual,
                                        out expr
                                    ))
                                        return expr;

                                    #endregion

                                    #region time

                                    // try to compare var and time const (normal order)
                                    if (TryCompareMemberAndTime(pair.Left, pair.Right,
                                        t => t.StartOfTheMinute(), // compare with start of the minute
                                        Expression.GreaterThanOrEqual,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare time const and var (reverse order)
                                    if (TryCompareMemberAndTime(pair.Right, pair.Left,
                                        t => t.EndOfTheMinute(),
                                        Expression.LessThanOrEqual,
                                        out expr
                                    ))
                                        return expr;

                                    #endregion

                                    var convertedPair = PrepareExpressionPair(pair);
                                    return Expression.GreaterThanOrEqual(convertedPair.Left, convertedPair.Right);
                                });
                        }

                    case JsOperators.Less:
                        {
                            return Compare<T>(param, @operator.Arguments, pair => pair,
                                pair =>
                                {
                                    Expression expr = null;

                                    #region datetime
                                    // try to compare var and datetime const (normal order)
                                    if (TryCompareMemberAndDateTime(pair.Left, pair.Right,
                                        dt => dt.StartOfTheMinute(), // compare with start of the minute to exclude current value
                                        Expression.LessThan,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare datetime const and var (reverse order)
                                    if (TryCompareMemberAndDateTime(pair.Right, pair.Left,
                                        dt => dt.EndOfTheMinute(),
                                        Expression.GreaterThan,
                                        out expr
                                    ))
                                        return expr;
                                    #endregion

                                    #region date

                                    // try to compare var and datetime const (normal order)
                                    if (TryCompareMemberAndDate(pair.Left, pair.Right,
                                        dt => dt.StartOfTheDay(), // compare with start of the day to exclude current value
                                        Expression.LessThan,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare datetime const and var (reverse order)
                                    if (TryCompareMemberAndDate(pair.Right, pair.Left,
                                        dt => dt.EndOfTheDay(),
                                        Expression.GreaterThan,
                                        out expr
                                    ))
                                        return expr;

                                    #endregion

                                    #region time

                                    // try to compare var and time const (normal order)
                                    if (TryCompareMemberAndTime(pair.Left, pair.Right,
                                        t => t.StartOfTheMinute(), // compare with start of the minute to exclude current value
                                        Expression.LessThan,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare time const and var (reverse order)
                                    if (TryCompareMemberAndTime(pair.Right, pair.Left,
                                        t => t.EndOfTheMinute(),
                                        Expression.GreaterThan,
                                        out expr
                                    ))
                                        return expr;

                                    #endregion

                                    var convertedPair = PrepareExpressionPair(pair);
                                    return Expression.LessThan(convertedPair.Left, convertedPair.Right);
                                });
                        }

                    case JsOperators.LessOrEqual:
                        {
                            return Compare<T>(param, @operator.Arguments, pair => pair,
                                pair =>
                                {
                                    Expression expr = null;

                                    #region datetime
                                    // try to compare var and datetime const (normal order)
                                    if (TryCompareMemberAndDateTime(pair.Left, pair.Right,
                                        dt => dt.EndOfTheMinute(), // compare with end of the minute to include current value
                                        Expression.LessThanOrEqual,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare datetime const and var (reverse order)
                                    if (TryCompareMemberAndDateTime(pair.Right, pair.Left,
                                        dt => dt.StartOfTheMinute(),
                                        Expression.GreaterThanOrEqual,
                                        out expr
                                    ))
                                        return expr;
                                    #endregion
                                    
                                    #region date
                                    
                                    // try to compare var and datetime const (normal order)
                                    if (TryCompareMemberAndDate(pair.Left, pair.Right,
                                        dt => dt.EndOfTheDay(), // compare with end of the day to include current value
                                        Expression.LessThanOrEqual,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare datetime const and var (reverse order)
                                    if (TryCompareMemberAndDate(pair.Right, pair.Left,
                                        dt => dt.StartOfTheDay(),
                                        Expression.GreaterThanOrEqual,
                                        out expr
                                    ))
                                        return expr;

                                    #endregion

                                    #region time

                                    // try to compare var and time const (normal order)
                                    if (TryCompareMemberAndTime(pair.Left, pair.Right,
                                        t => t.EndOfTheMinute(), // compare with end of the minute to include current value
                                        Expression.LessThanOrEqual,
                                        out expr
                                    ))
                                        return expr;

                                    // try to compare time const and var (reverse order)
                                    if (TryCompareMemberAndTime(pair.Right, pair.Left,
                                        t => t.StartOfTheMinute(),
                                        Expression.GreaterThanOrEqual,
                                        out expr
                                    ))
                                        return expr;

                                    #endregion

                                    var convertedPair = PrepareExpressionPair(pair);
                                    return Expression.LessThanOrEqual(convertedPair.Left, convertedPair.Right);
                                });
                        }

                    case JsOperators.Negotiation:
                    case JsOperators.Not:
                        {
                            if (@operator.Arguments.Count() != 1)
                                throw new Exception($"{JsOperators.Not} operator must contain exactly one argument");

                            var arg = ParseTree<T>(@operator.Arguments[0], param);

                            if (arg is MemberExpression memberExpr)
                                return Expression.Equal(memberExpr, Expression.Constant(null));

                            return Expression.Not(arg);
                        }
                    case JsOperators.DoubleNegotiation:
                        {
                            if (@operator.Arguments.Count() != 1)
                                throw new Exception($"{JsOperators.Not} operator must contain exactly one argument");

                            var arg = ParseTree<T>(@operator.Arguments[0], param);

                            if (arg is MemberExpression memberExpr) 
                            {
                                return memberExpr.Type == typeof(string)
                                    ? Expression.AndAlso(
                                        Expression.NotEqual(memberExpr, Expression.Constant(null)),
                                        Expression.NotEqual(TrimStringMember(memberExpr), Expression.Constant(string.Empty))
                                    )
                                    : Expression.NotEqual(memberExpr, Expression.Constant(null));
                            }

                            return Expression.Not(Expression.Not(arg));
                        }

                    case JsOperators.Var:
                        {
                            if (@operator.Arguments.Count() != 1)
                                throw new Exception($"{JsOperators.Var} operator must contain exactly one argument");

                            var name = GetStringValue(@operator.Arguments.First());

                            return ExpressionExtensions.GetMemberExpression(param, name);
                        }

                    case JsOperators.In:
                        {
                            if (@operator.Arguments.Count() != 2)
                                throw new Exception($"{JsOperators.In} operator require two arguments");


                            if (@operator.Arguments[1] is JArray arrayArg)
                            {
                                var parsedArray = arrayArg.Select(i => ParseTree<T>(i, param)).ToArray();
                                var arg = ParseTree<T>(@operator.Arguments[0], param);
                                if (arg is MemberExpression memberExpr && memberExpr.Member.IsReferenceListProperty()) 
                                {
                                    arg = Expression.Convert(arg, typeof(Int64?));
                                }

                                var arrExpressions = parsedArray.Select(item => {
                                    ConvertGuids(arg, ref item);
                                    ConvertNumericConsts(arg, ref item);
                                    ConvertNullable(arg, ref item);

                                    return Expression.Equal(arg, item/*Expression.Convert(item, typeof(Int64?))*/);
                                }).ToArray();
                                return CombineExpressions<T>(arrExpressions, Expression.OrElse, param);
                            }
                            else {
                                var containsMethod = typeof(string).GetMethod(nameof(string.Contains), new Type[] { typeof(string) });

                                var arg1 = ParseTree<T>(@operator.Arguments[0], param);
                                var arg2 = ParseTree<T>(@operator.Arguments[1], param);

                                // note: `in` arguments are reversed
                                return Expression.Call(
                                        arg2,
                                        containsMethod,
                                        arg1);
                            }
                        }

                    case JsOperators.EndsWith:
                        {
                            var endsWithMethod = typeof(string).GetMethod(nameof(string.EndsWith), new Type[] { typeof(string) });

                            if (@operator.Arguments.Count() != 2)
                                throw new Exception($"{JsOperators.EndsWith} operator require two arguments");

                            var arg1 = ParseTree<T>(@operator.Arguments[0], param);
                            var arg2 = ParseTree<T>(@operator.Arguments[1], param);

                            return Expression.Call(
                                    arg1,
                                    endsWithMethod,
                                    arg2);
                        }
                    
                    case JsOperators.StartsWith:
                        {
                            // note: now it supports only strings
                            // todo: add check
                            var startsWithMethod = typeof(string).GetMethod(nameof(string.StartsWith), new Type[] { typeof(string) });

                            if (@operator.Arguments.Count() != 2)
                                throw new Exception($"{JsOperators.StartsWith} operator require two arguments");

                            var arg1 = ParseTree<T>(@operator.Arguments[0], param);
                            var arg2 = ParseTree<T>(@operator.Arguments[1], param);

                            return Expression.Call(
                                    arg1,
                                    startsWithMethod,
                                    arg2);
                        }
                    case JsOperators.IsSatisfied:
                        {
                            var argsCount = @operator.Arguments.Count();
                            if (argsCount != 1 && argsCount != 2)
                                throw new Exception($"{JsOperators.IsSatisfied} operator must contain one or two arguments, number of arguments passed: {argsCount}");

                            var specNameArgument = @operator.Arguments[0];
                            var specConditionArgument = argsCount == 2 ? @operator.Arguments[1] : null;

                            // Check second argument if passed:
                            // 1. check a type of the value, it must be a boolean value
                            // 2. if the value is false - return truly expression, we needn't to check the specification in this case
                            if (specConditionArgument != null) 
                            {
                                if (!(specConditionArgument is JValue specConditionValue))
                                    throw new JsonLogicParsingFailedException($"Second argument of `{JsOperators.IsSatisfied}` must be a json value", specConditionArgument);

                                if (specConditionValue.Type != JTokenType.Boolean)
                                    throw new JsonLogicParsingFailedException($"Second argument of `{JsOperators.IsSatisfied}` must be a boolean value", specConditionArgument);

                                var specConditionBool = (bool?)specConditionValue.Value == true;
                                if (!specConditionBool) 
                                {
                                    // return truly expression
                                    return Expression.IsTrue(Expression.Constant(true));
                                }
                            }

                            if (!(specNameArgument is JObject jObject))
                                throw new ArgumentException($"Argument of `{JsOperators.IsSatisfied}` operator must be an object");

                            if (!TryGetOperator(jObject, out var parsedArgument))
                                throw new JsonLogicParsingFailedException($"Failed to parse argument of `{JsOperators.IsSatisfied}` operator", jObject);

                            if (parsedArgument.Arguments.Count() != 1)
                                throw new Exception($"{JsOperators.Var} operator must contain exactly one argument");

                            var specNameToken = parsedArgument.Arguments[0] as JValue;
                            var specName = specNameToken?.Value?.ToString();
                            if (string.IsNullOrWhiteSpace(specName))
                                throw new Exception($"Failed to extract specification name from arguments of `{JsOperators.IsSatisfied}` operator");

                            // Find specification by name. Note: specifications can be applied on top level only, so we pass T to the specifications manager
                            var specificationInfo = _specificationsFinder.FindSpecification(typeof(T), specName);

                            var specInstance = _specificationsManager.GetSpecificationInstance<T>(specificationInfo);

                            var specExpression = specInstance.ToExpression();

                            var lambda = specExpression.Body.ReplaceParameter(specExpression.Parameters.Single(), param);

                            return lambda;
                        }
                    case JsOperators.Now:
                        {
                            if (@operator.Arguments.Any())
                                throw new Exception($"{JsOperators.Now} operator doesn't support any arguments");

                            return Expression.Constant(Clock.Now);
                        }
                    case JsOperators.DateAdd:
                        {
                            if (@operator.Arguments.Count() != 3)
                                throw new Exception($"{JsOperators.DateAdd} operator require 3 arguments: date, number and datepart");

                            var date = ParseTree<T>(@operator.Arguments[0], param);
                            var number = GetAsInt64(@operator.Arguments[1]);
                            if (number == null)
                                throw new ArgumentException($"{JsOperators.DateAdd}: the `number` argument must not be null");

                            var datepart = GetAsString(@operator.Arguments[2]);

                            switch (datepart)
                            {
                                case "day": 
                                    {
                                        var addMethod = typeof(DateTime).GetMethod(nameof(DateTime.Add), new Type[] { typeof(TimeSpan) });
                                        var timeSpan = TimeSpan.FromDays(number.Value);
                                        return Expression.Call(
                                            date,
                                            addMethod,
                                            Expression.Constant(timeSpan)
                                        );
                                    }
                                case "week": 
                                    {
                                        var addMethod = typeof(DateTime).GetMethod(nameof(DateTime.Add), new Type[] { typeof(TimeSpan) });
                                        var timeSpan = TimeSpan.FromDays(number.Value * 7);
                                        return Expression.Call(
                                            date,
                                            addMethod,
                                            Expression.Constant(timeSpan)
                                        );
                                    }
                                case "month": 
                                    {
                                        var addMonthsMethod = typeof(DateTime).GetMethod(nameof(DateTime.AddMonths), new Type[] { typeof(int) });
                                        return Expression.Call(
                                            date,
                                            addMonthsMethod,
                                            Expression.Constant(number.Value)
                                        );
                                    }
                                case "year":
                                    {
                                        var addYearsMethod = typeof(DateTime).GetMethod(nameof(DateTime.AddYears), new Type[] { typeof(int) });
                                        return Expression.Call(
                                            date,
                                            addYearsMethod,
                                            Expression.Constant(number.Value)
                                        );
                                    }
                                default:
                                    throw new ArgumentException($"{JsOperators.DateAdd}: the `datepart` = `{datepart}` is not supported");
                            }
                        }
                    case JsOperators.Upper:
                        {
                            if (@operator.Arguments.Count() != 1)
                                throw new Exception($"{JsOperators.Upper} operator require 1 argument");

                            var arg = ParseTree<T>(@operator.Arguments[0], param);
                            var toUpperMethod = typeof(string).GetMethod(nameof(string.ToUpper), new Type[] { });
                            return Expression.Call(arg, toUpperMethod);
                        }
                    case JsOperators.Lower:
                        {
                            if (@operator.Arguments.Count() != 1)
                                throw new Exception($"{JsOperators.Lower} operator require 1 argument");

                            var arg = ParseTree<T>(@operator.Arguments[0], param);
                            var toLowerMethod = typeof(string).GetMethod(nameof(string.ToLower), new Type[] { });
                            return Expression.Call(arg, toLowerMethod);
                        }
                    default:
                        throw new NotSupportedException($"Operator `{@operator.Name}` is not supported");
                }
            }
            
            return null;
        }

        private string GetAsString(JToken token) 
        {
            if (token is JValue value)
            {
                return value.Value.ToString();
            }
            else
                throw new NotSupportedException();
        }

        private Int64? GetAsInt64(JToken token)
        {
            if (token is JValue value)
            {
                return value.Value != null
                    ? (Int64)value.Value
                    : null;
            }
            else
                throw new NotSupportedException();
        }

        private bool TryCompareMemberAndDateTime(Expression left, Expression right, Func<DateTime, DateTime> dateConverter, Binder binder, out Expression expression)
        {
            expression = null;
            if (IsDateTimeMember(left) &&
                right is ConstantExpression constExpr && constExpr.Type == typeof(DateTime))
            {
                var dateExpr = Expression.Constant(dateConverter.Invoke((DateTime)constExpr.Value));
                expression = SafeNullable(left, dateExpr, binder);
                return true;
            }

            return false;
        }

        private bool TryCompareMemberAndDate(Expression left, Expression right, Func<DateTime, DateTime> dateConverter, Binder binder, out Expression expression)
        {
            expression = null;
            if (IsDateMember(left) &&
                right is ConstantExpression constExpr && constExpr.Type == typeof(DateTime))
            {
                var dateExpr = Expression.Constant(dateConverter.Invoke((DateTime)constExpr.Value));
                expression = SafeNullable(left, dateExpr, binder);
                return true;
            }

            return false;
        }

        private bool TryCompareMemberAndTime(Expression left, Expression right, Func<TimeSpan, TimeSpan> timeConverter, Binder binder, out Expression expression)
        {
            expression = null;
            if (IsTimeMember(left) && right.NodeType == ExpressionType.Constant)
            {
                right = ConvertTimeSpanConst(right, timeConverter);
                expression = SafeNullable(left, right, binder);
                return true;
            }
            
            return false;
        }

        private Expression ParseEqualExpression<T>(ParameterExpression param, OperationProps @operator)
        {
            return Compare<T>(param, @operator.Arguments, pair => pair, 
                pair =>
            {
                if (IsDateTimeMember(pair.Left) && pair.Right.NodeType == ExpressionType.Constant)
                {
                    // for datetime we strip seconds and compare as a date range: HH:mm:00 <= member <= HH:mm:59
                    var from = ConvertDateTimeConst(pair.Right, d => d.StartOfTheMinute());
                    var to = ConvertDateTimeConst(pair.Right, d => d.EndOfTheMinute());

                    return CombineExpressions<T>(new Expression[]
                        {
                                            SafeNullable(from, pair.Left, Expression.LessThanOrEqual),
                                            SafeNullable(pair.Left, to, Expression.LessThanOrEqual),
                        },
                        Expression.AndAlso,
                        param);
                }
                if (IsDateMember(pair.Left) && pair.Right.NodeType == ExpressionType.Constant)
                {
                    // date member should be compared as range: StartOfTheDay <= member <= EndOfTheDay
                    var from = ConvertDateTimeConst(pair.Right, d => d.StartOfTheDay());
                    var to = ConvertDateTimeConst(pair.Right, d => d.EndOfTheDay());

                    return CombineExpressions<T>(new Expression[]
                        {
                                            SafeNullable(from, pair.Left, Expression.LessThanOrEqual),
                                            SafeNullable(pair.Left, to, Expression.LessThanOrEqual),
                        },
                        Expression.AndAlso,
                        param);
                }
                if (IsTimeMember(pair.Left) && pair.Right.NodeType == ExpressionType.Constant)
                {
                    // time member should be compared as range (from member:00 to member:59 seconds)
                    var from = ConvertTimeSpanConst(pair.Right, t => t.StartOfTheMinute());
                    var to = ConvertTimeSpanConst(pair.Right, d => d.EndOfTheMinute());

                    return CombineExpressions<T>(new Expression[]
                        {
                            SafeNullable(from, pair.Left, Expression.LessThanOrEqual),
                            SafeNullable(pair.Left, to, Expression.LessThanOrEqual),
                        },
                        Expression.AndAlso,
                        param);
                }

                ConvertEntityReferenceForEquality(param, pair);

                var convertedPair = PrepareExpressionPair(pair);
                return Expression.Equal(convertedPair.Left, convertedPair.Right);
            });
        }

        private Expression SafeNullable(Expression left, Expression right, Binder binder) 
        {
            ConvertNullable(left, ref right);
            ConvertNullable(right, ref left);

            return binder(left, right);
        }

        private bool IsDateMember(Expression expression)
        {
            if (!(expression is MemberExpression memberExpr) || expression.Type.GetUnderlyingTypeIfNullable() != typeof(DateTime))
                return false;

            var dataTypeAttribute = memberExpr.Member.GetAttribute<DataTypeAttribute>();
            return dataTypeAttribute?.DataType == DataType.Date;
        }

        private Expression ConvertDateTimeConst(Expression expression, Func<DateTime, DateTime> convertor)
        {
            if (expression is ConstantExpression constExpr && constExpr.Type == typeof(DateTime))
            {
                return Expression.Constant(convertor.Invoke((DateTime)constExpr.Value));
            }
            return expression;
        }

        private Expression ConvertTimeSpanConst(Expression expression, Func<TimeSpan, TimeSpan> convertor)
        {
            if (!(expression is ConstantExpression constExpr))
                return expression;

            TimeSpan? value = constExpr.Type == typeof(TimeSpan)
                ? (TimeSpan)constExpr.Value
                : constExpr.Type == typeof(Int64)
                    ? TimeSpan.FromSeconds((Int64)constExpr.Value)
                    : null;
            
            return value.HasValue
                ? Expression.Constant(convertor.Invoke(value.Value))
                : expression;
        }

        private bool IsDateTimeMember(Expression expression)
        {
            if (!(expression is MemberExpression memberExpr) || expression.Type.GetUnderlyingTypeIfNullable() != typeof(DateTime))
                return false;

            var dataTypeAttribute = memberExpr.Member.GetAttribute<DataTypeAttribute>();
            return dataTypeAttribute == null || dataTypeAttribute?.DataType == DataType.DateTime;
        }

        private bool IsTimeMember(Expression expression)
        {
            return expression is MemberExpression && expression.Type.GetUnderlyingTypeIfNullable() == typeof(TimeSpan);
        }
        
        private void ConvertGuids(Expression a, ref Expression b)
        {
            if (a.Type.GetUnderlyingTypeIfNullable() == typeof(Guid) && b.Type == typeof(string))
            {
                var toGuidMethod = typeof(StringHelper).GetMethod(nameof(StringHelper.ToGuid), new Type[] { typeof(string) });

                b = Expression.Call(
                    null,
                    toGuidMethod,
                    b);
            }
        }

        private void ConvertNumericConsts(Expression memberExpressionToCompare, ref Expression numericConstToConvert)
        {
            if (!(memberExpressionToCompare is MemberExpression memberExpr && numericConstToConvert is ConstantExpression constExpr))
                return;

            if (memberExpr.Type.GetUnderlyingTypeIfNullable() == typeof(int)) 
            {
                if (constExpr.Type == typeof(Int64))
                {
                    var constValue = (Int64)constExpr.Value;
                    if (constValue <= int.MaxValue)
                        numericConstToConvert = Expression.Constant(Convert.ToInt32(constValue));
                    else
                        throw new OverflowException($"Constant value must be not grester than {int.MaxValue} (max int size) to compare with {memberExpr.Member.Name}, currtent value is {constValue}");
                }
                else
                    if (constExpr.Type == typeof(string) && int.TryParse((string)constExpr.Value, out var intValue)) 
                        numericConstToConvert = Expression.Constant(intValue);
            }
            if (memberExpr.Type.GetUnderlyingTypeIfNullable() == typeof(Int64))
            {
                if (constExpr.Type == typeof(int))
                    numericConstToConvert = Expression.Constant((Int64)constExpr.Value);
                else if (constExpr.Type == typeof(string) && Int64.TryParse((string)constExpr.Value, out var int64Value))
                    numericConstToConvert = Expression.Constant(int64Value);
            }
            if (memberExpr.Type.GetUnderlyingTypeIfNullable() == typeof(Double))
            {
                if (constExpr.Type == typeof(string)) 
                {
                    if (double.TryParse((string)constExpr.Value, out var doubleValue))
                        numericConstToConvert = Expression.Constant(doubleValue);
                } else
                    numericConstToConvert = Expression.Constant(Convert.ToDouble(constExpr.Value));
            }
        }

        private void ConvertTicksTimeSpan(Expression a, ref Expression b)
        {
            if (a.Type == typeof(TimeSpan) && b.Type == typeof(Int64))
            {
                var fromSecondsMethod = typeof(TimeSpan).GetMethod(nameof(TimeSpan.FromSeconds), new Type[] { typeof(double) });
                
                b = Expression.Call(
                    null,
                    fromSecondsMethod,
                    Expression.Convert(b, typeof(double)));
            }
        }

        private void ConvertNullable(Expression a, ref Expression b) 
        {
            if (ExpressionExtensions.IsNullableExpression(a) && !ExpressionExtensions.IsNullableExpression(b))
                b = Expression.Convert(b, a.Type);
        }

        private void ConvertEntityReferenceForEquality(ParameterExpression param, Expression potentialIdExpr, ref Expression potentialEntityRefExpr) 
        {
            if (potentialEntityRefExpr is MemberExpression memberExpression &&
                memberExpression.Expression != null &&
                (memberExpression.Type.IsEntityType() || memberExpression.Type == typeof(GenericEntityReference)) &&
                potentialIdExpr is ConstantExpression idExpr && 
                idExpr.Value != null /* null values should be processed as references not as Id value*/)
            {
                var idName = $"{memberExpression.Member.Name}.{nameof(IEntity.Id)}";
                var expr = ExpressionExtensions.GetMemberExpression(memberExpression.Expression, idName);
                potentialEntityRefExpr = expr;
            }
        }        

        private void ConvertEntityReferenceForEquality(ParameterExpression param, ExpressionPair pair)
        {
            var left = pair.Left;
            var right = pair.Right;

            ConvertEntityReferenceForEquality(param, left, ref right);
            ConvertEntityReferenceForEquality(param, right, ref left);

            pair.Left = left;
            pair.Right = right;
        }

        private Expression Compare<T>(ParameterExpression param, JToken[] tokens, Func<ExpressionPair, ExpressionPair> preparePair, Func<ExpressionPair, Expression> comparator) 
        {
            var expressions = tokens.Select(t => ParseTree<T>(t, param)).ToArray();

            var pairs = SplitArgumentsIntoPair(expressions).Select(pair => preparePair(pair));

            var pairExpressions = pairs.Select(pair => comparator.Invoke(pair)).ToArray();

            return CombineExpressions<T>(pairExpressions, Expression.AndAlso, param);
        }

        private Expression ConvertRefListValue(Expression expression)
        {
            // return nullable and not nullable respectively
            return expression is MemberExpression memberExpr && memberExpr.Member.IsReferenceListProperty()
                ? memberExpr.Type.IsNullableType()
                    ? Expression.Convert(expression, typeof(Int64?))
                    : Expression.Convert(expression, typeof(Int64))
                : expression;
        }

        private ExpressionPair PrepareExpressionPair(ExpressionPair pair) 
        {
            var left = pair.Left;
            var right = pair.Right;

            // convert reflist properties to Int64/Int64?
            left = ConvertRefListValue(left);
            right = ConvertRefListValue(right);

            // if one of arguments is a Guid and another one is a string - convert string to Guid
            ConvertGuids(left, ref right);
            ConvertGuids(right, ref left);

            ConvertNumericConsts(left, ref right);
            ConvertNumericConsts(right, ref left);

            // check nullability in pairs and convert not nullable argument to nullable if required
            ConvertNullable(left, ref right);
            ConvertNullable(right, ref left);

            return new ExpressionPair(left, right);
        }

        private Expression Compare<T>(ParameterExpression param, JToken[] tokens, Func<ExpressionPair, Expression> comparator) 
        {
            return Compare<T>(param, tokens, pair => PrepareExpressionPair(pair), comparator);
        }

        private IEnumerable<ExpressionPair> SplitArgumentsIntoPair(Expression[] arguments) 
        {
            if (arguments.Count() < 2)
                throw new NotSupportedException("Number of arguments must be 2 or greater");

            var pairs = new List<ExpressionPair>();
            for (int i = 0; i < arguments.Count() - 1; i++)
            {
                pairs.Add(new ExpressionPair(arguments[i], arguments[i + 1]));
            }

            return pairs;
        }

        private string GetStringValue(JToken arg)
        {
            if (arg == null)
                return null;

            if (arg is JValue value && value.Value is string stringValue)
                return stringValue;

            throw new NotSupportedException("Not supported value type");
        }

        /// <summary>
        /// Get operation props
        /// </summary>
        /// <param name="rule"></param>
        /// <returns></returns>
        public OperationProps GetOperation(JToken rule)
        {
            if (rule is JObject ruleObj)
            {
                var p = ruleObj.Properties().First();
                var operationName = p.Name;
                var operationArguments = (p.Value is JArray jArrayArgs)
                    ? jArrayArgs.ToArray()
                    : new JToken[] { p.Value };
                return new OperationProps
                {
                    Name = operationName,
                    Arguments = operationArguments,
                };
            }

            return null;
        }

        public bool IsOperator(JToken rule) 
        {
            return TryGetOperator(rule, out var _);
        }

        public bool TryGetOperator(JToken rule, out OperationProps @operator) 
        {
            if (!(rule is JObject ruleObj) || ruleObj.Properties().Count() != 1) 
            {
                @operator = null;
                return false;
            }

            var p = ruleObj.Properties().First();
            var operationName = p.Name;
            var operationArguments = (p.Value is JArray jArrayArgs)
                ? jArrayArgs.ToArray()
                : new JToken[] { p.Value };

            @operator = new OperationProps { 
                Name = operationName,
                Arguments = operationArguments
            };
            return true;
        }

        /// inheritedDoc
        public Expression<Func<T, bool>> ParseExpressionOf<T>(string rule) 
        {
            if (string.IsNullOrWhiteSpace(rule))
                return null;

            // Parse json into hierarchical structure
            var jsonLogic = JObject.Parse(rule);

            return ParseExpressionOf<T>(jsonLogic);
        }
        
        /// inheritedDoc
        public Expression<Func<T, bool>> ParseExpressionOf<T>(JObject rule)
        {
            if (rule.IsNullOrEmpty())
                return null;

            var itemExpression = Expression.Parameter(typeof(T), "ent");
            var conditions = ParseTree<T>(rule, itemExpression);
            if (conditions.CanReduce)
            {
                conditions = conditions.ReduceAndCheck();
            }

            var query = Expression.Lambda<Func<T, bool>>(conditions, itemExpression);
            return query;
        }

        public Func<T, bool> ParsePredicateOf<T>(string rule) 
        {
            if (string.IsNullOrWhiteSpace(rule))
                return null;

            // Parse json into hierarchical structure
            var jsonLogic = JObject.Parse(rule);

            return ParsePredicateOf<T>(jsonLogic);
        }

        public Func<T, bool> ParsePredicateOf<T>(JObject rule)
        {
            if (rule.IsNullOrEmpty())
                return null;

            var query = ParseExpressionOf<T>(rule);
            return query.Compile();
        }

        private Expression TrimStringMember(MemberExpression member) 
        {
            var trimMethod = typeof(string).GetMethod(nameof(string.Trim), new Type[] { });

            return Expression.Call(member, trimMethod);
        }

        public bool EvaluatePredicateInternal<T>(T model, string predicate)
        {
            var expression = ParsePredicateOf<T>(predicate);
            return expression.Invoke(model);
        }

        public bool EvaluatePredicate(object model, string predicate)
        {
            var method = this.GetType().GetMethod(nameof(EvaluatePredicateInternal));
            var modelType = model.GetType();
            var genericMethod = method.MakeGenericMethod(modelType);
            return (bool)genericMethod.Invoke(this, new object[] { model, predicate });
        }
    }

    public static class JsOperators
    {
        public const string Equal = "==";
        public const string StrictEqual = "===";
        public const string NotEqual = "!=";
        public const string StrictNotEqual = "!==";
        public const string Less = "<";
        public const string LessOrEqual = "<=";
        public const string Greater = ">";
        public const string GreaterOrEqual = ">=";
        public const string Var = "var";
        public const string And = "and";
        public const string Or = "or";
        public const string DoubleNegotiation = "!!";
        public const string Negotiation = "!";
        public const string Not = "not";
        public const string In = "in";
        public const string StartsWith = "startsWith";
        public const string EndsWith = "endsWith";
        public const string IsSatisfied = "is_satisfied";
        public const string DateAdd = "date_add";
        public const string Now = "now";
        public const string Upper = "toUpperCase";
        public const string Lower = "toLowerCase";
    }

    public class ExpressionPair 
    {
        public Expression Left { get; set; }
        public Expression Right { get; set; }

        public ExpressionPair(Expression left, Expression right)
        {
            Left = left;
            Right = right;
        }
    }
}
