using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using JsonLogic.Net;
using Newtonsoft.Json.Linq;
using Shesha.Configuration.Runtime;
using Shesha.Domain.Attributes;
using Shesha.Metadata;
using Shesha.Utilities;

namespace Shesha.JsonLogic
{
    /// <summary>
    /// JsonLogic operators
    /// </summary>
    public class HqlOperators
    {
        private Dictionary<string, Func<IJsonLogic2HqlConverter, JToken[], JsonLogic2HqlConverterContext, string>> registry;

        public static HqlOperators Default { get; } = new HqlOperators();

        public HqlOperators()
        {
            registry = new Dictionary<string, Func<IJsonLogic2HqlConverter, JToken[], JsonLogic2HqlConverterContext, string>>();
            AddDefaultOperations();
        }

        public void AddOperator(string name, Func<IJsonLogic2HqlConverter, JToken[], JsonLogic2HqlConverterContext, string> operation)
        {
            registry[name] = operation;
        }

        public void DeleteOperator(string name)
        {
            registry.Remove(name);
        }

        public Func<IJsonLogic2HqlConverter, JToken[], JsonLogic2HqlConverterContext, string> GetOperator(string name)
        {
            return registry[name];
        }

        public static bool IsAny<T>(params object[] subjects)
        {
            return subjects.Any(x => x != null && x is T);
        }

        private void AddDefaultOperations()
        {
            AddOperator("==", (p, args, data) =>
            {
                return ConvertArguments(p, args, data).Delimited(" = ");
            });

            AddOperator("===", GetOperator("=="));

            AddOperator("!=", (p, args, data) =>
            {
                return ConvertArguments(p, args, data).Delimited(" <> ");
            });

            AddOperator("!==", GetOperator("!="));

            AddOperator("<", (p, args, data) =>
            {
                return ConvertArguments(p, args, data).Delimited(" < ");
            });

            AddOperator("<=", (p, args, data) =>
            {
                return SequenceConditions(ConvertArguments(p, args, data), " <= "); // ConvertArguments(p, args, data).Delimited(" <= ");
            }); 

            AddOperator(">", (p, args, data) =>
            {
                return ConvertArguments(p, args, data).Delimited(" > ");
            }); 

            AddOperator(">=", (p, args, data) =>
            {
                return ConvertArguments(p, args, data).Delimited(" >= ");
            }); 

            AddOperator("var", (p, args, data) =>
            {
                const string prefix = "ent";
                
                if (!args.Any()) return
                    prefix;

                var name = GetStringValue(args.First());
                name = p.ResolveVariable(name, data);
                
                if (name == null) 
                    return prefix;

                // handle entity references
                // todo: implement support of nested entities
                var dataType = data.FieldsMetadata.TryGetValue(name, out var meta) ? meta.DataType : null;
                if (dataType == DataTypes.EntityReference)                
                {
                    name = $"{name}.Id";
                }

                return $"{prefix}.{name}";

                /*
                try
                {
                    var result = GetValueByName(data, names.ToString());
                    // This will return JValue or null if missing. Actual value of null will be wrapped in JToken with value null
                    if (result is JValue)
                    {
                        // permit correct type wrangling to occur (AdjustType) without duplicating code
                        result = p.Apply((JValue)result, null);

                    }
                    else if (result == null && args.Count() == 2)
                    {
                        object defaultValue = p.Apply(args.Last(), data);
                        result = defaultValue;
                    }

                    return result;
                }
                catch
                {
                    object defaultValue = (args.Count() == 2) ? p.Apply(args.Last(), data) : null;
                    return defaultValue;
                }
                */
            });

            AddOperator("and", (p, args, data) => {
                return ConvertArguments(p, args, data, true).Delimited(" and ");
            });

            AddOperator("or", (p, args, data) =>
            {
                return ConvertArguments(p, args, data, true).Delimited(" or ");
            });

            AddOperator("!!", (p, args, data) =>
            {
                return $"{p.Convert(args.First(), data)} is not null";
            });

            AddOperator("!", (p, args, data) =>
            {
                // special handling of single string argument
                var argument = args.First();
                var convertedArgument = p.Convert(argument, data);

                var nestedOperation = p.GetOperation(argument);
                if (nestedOperation.Operation == "var")
                {
                    // check datatype of the argument and add " or trim({convertedArgument}) = ''" for strings
                    return $"{convertedArgument} is null";
                }

                return $"not ({convertedArgument})";
            });

            AddOperator("not", GetOperator("!"));

            AddOperator("in", (p, args, data) => {
                var first = p.Convert(args[0], data);
                var second = p.Convert(args[1], data);

                var isArray = args[1] is JArray;
                if (isArray)
                {
                    return $"{first} in ({second})";
                }
                else
                {
                    // process as string
                    return $"{second} like '%' + {first.Trim('\'')} + '%'";
                }
            });

            AddOperator("startsWith", (p, args, data) => {
                var first = p.Convert(args[0], data);
                var second = p.Convert(args[1], data);

                return $"{first} like {second.Trim('\'')} + '%'";
            });

            AddOperator("endsWith", (p, args, data) => {
                var first = p.Convert(args[0], data);
                var second = p.Convert(args[1], data);

                return $"{first} like '%' + {second.Trim('\'')}";
            });

            /* not supported standard operators
            AddOperator("+", (p, args, data) => Min2From(args.Select(a => p.Apply(a, data))).Aggregate((prev, next) =>
            {
                try
                {
                    return Convert.ToDouble(prev ?? 0d) + Convert.ToDouble(next);
                }
                catch
                {
                    return (prev ?? string.Empty).ToString() + next.ToString();
                }
            }));

            AddOperator("-", ReduceDoubleArgs(0d, (prev, next) => prev - next));

            AddOperator("/", ReduceDoubleArgs(1, (prev, next) => prev / next));

            AddOperator("*", ReduceDoubleArgs(1, (prev, next) => prev * next));

            AddOperator("%", ReduceDoubleArgs(1, (prev, next) => prev % next));

            AddOperator("max", (p, args, data) => args.Select(a => Convert.ToDouble(p.Apply(a, data)))
                .Aggregate((prev, next) => prev > next ? prev : next));

            AddOperator("min", (p, args, data) => args.Select(a => Convert.ToDouble(p.Apply(a, data)))
                .Aggregate((prev, next) => (prev < next) ? prev : next));
             
            AddOperator("if", (p, args, data) => {
                for (var i = 0; i < args.Length - 1; i += 2)
                {
                    if (p.Apply(args[i], data).IsTruthy()) return p.Apply(args[i + 1], data);
                }
                if (args.Length % 2 == 0) return null;
                return p.Apply(args[args.Length - 1], data);
            });

            AddOperator("?:", GetOperator("if"));

            AddOperator("missing", (p, args, data) => {
                var names = args.Select(a => p.Apply(a, data));
                if (names.Count() == 1 && names.First().IsEnumerable()) names = names.First().MakeEnumerable();
                if (data == null) return names.ToArray();
                return names.Select(n => n.ToString()).Where(n => {
                    try
                    {
                        GetValueByName(data, n);
                        return false;
                    }
                    catch
                    {
                        return true;
                    }
                }).ToArray();
            });
            AddOperator("cat", (p, args, data) => args.Select(a => p.Apply(a, data)).Aggregate("", (acc, current) => acc + current.ToString()));

            AddOperator("substr", (p, args, data) => {
                string value = p.Apply(args[0], data).ToString();
                int start = Convert.ToInt32(p.Apply(args[1], data));
                while (start < 0) start += value.Length;
                if (args.Count() == 2) return value.Substring(start);

                int length = Convert.ToInt32(p.Apply(args[2], data));
                if (length >= 0) return value.Substring(start, length);

                int end = length;
                while (end < 0) end += value.Length;
                return value.Substring(start, end - start);
            });

            AddOperator("log", (p, args, data) => {
                object value = p.Apply(args[0], data);
                System.Diagnostics.Debug.WriteLine(value);
                return value;
            });

            AddOperator("within", (p, args, data) => {
                double first = Convert.ToDouble(p.Apply(args[0], data));
                double second = Convert.ToDouble(p.Apply(args[1], data));
                double precision = Convert.ToDouble(p.Apply(args[2], data));
                return Math.Abs(first - second) <= precision;
            });

            // Local processing operator changes scope of evaluations of its 
            // second argument to result of the first argument
            // i.e. "local": [ "sourceDataOrLogicAppliedToFullData", "logicToApplyToSourceOnly"]
            AddOperator("local", (p, args, data) =>
            {
                // if blank arguments, return null, since nothing matches conditions
                if (args.Length < 1) return null;
                var local = p.Apply(args.First(), data);
                if (args.Length >= 2) return p.Apply(args[1], local);
                else return local; // return result of source evaluation
            });
            AddOperator("missing_some", (p, args, data) => {
                var minRequired = Convert.ToDouble(p.Apply(args[0], data));
                var keys = (args[1] as JArray).ToArray();
                var missingKeys = GetOperator("missing").Invoke(p, keys, data) as IEnumerable<object>;
                var validKeyCount = keys.Length - missingKeys.Count();
                return (validKeyCount >= minRequired) ? new object[0] : missingKeys;
            });

            AddOperator("map", (p, args, data) => {
                object arr = p.Apply(args[0], data);
                if (arr == null) return new object[0];

                return arr.MakeEnumerable().Select(item => p.Apply(args[1], item)).ToArray();
            });

            AddOperator("filter", (p, args, data) => {
                // if first part fails to retrieve data, make enumerable will fail
                IEnumerable<object> arr = p.Apply(args[0], data)?.MakeEnumerable();
                return arr?.Where(item => p.Apply(args[1], item).IsTruthy()).ToArray();
            });

            AddOperator("reduce", (p, args, data) => {
                var initialValue = p.Apply(args[2], data);
                object arr = p.Apply(args[0], data);
                if (!arr.IsEnumerable()) return initialValue;

                return arr.MakeEnumerable().Aggregate(initialValue, (acc, current) => {
                    object result = p.Apply(args[1], new { current = current, accumulator = acc });
                    return result;
                });
            });

            AddOperator("all", (p, args, data) => {
                IEnumerable<object> arr = p.Apply(args[0], data).MakeEnumerable();
                if (arr.Count() == 0) return false;
                return arr.All(item => Convert.ToBoolean(p.Apply(args[1], item)));
            });

            AddOperator("none", (p, args, data) => {
                IEnumerable<object> arr = p.Apply(args[0], data).MakeEnumerable();
                return !arr.Any(item => Convert.ToBoolean(p.Apply(args[1], item)));
            });

            AddOperator("some", (p, args, data) => {
                IEnumerable<object> arr = p.Apply(args[0], data).MakeEnumerable();
                return arr.Any(item => Convert.ToBoolean(p.Apply(args[1], item)));
            });

            AddOperator("merge", (p, args, data) => args.Select(a => p.Apply(a, data)).Aggregate(new object[0], (acc, current) => {
                try
                {
                    return acc.Concat(current.MakeEnumerable()).ToArray();
                }
                catch
                {
                    return acc.Concat(new object[] { current }).ToArray();
                }
            }));
             */
        }

        private string SequenceConditions(List<string> arguments, string @operator)
        {
            if (arguments.Count() < 2)
                throw new Exception("Number of arguments should be 2 or more");

            var result = "";
            for (int i = 0; i < arguments.Count() - 1; i++)
            {
                if (!string.IsNullOrWhiteSpace(result))
                    result += " and ";
                result += $"({arguments[i]} {@operator} {arguments[i + 1]})";
            }
            
            return result;
        }

        private object GetValueByName(object data, string namePath)
        {
            if (string.IsNullOrEmpty(namePath)) return data;

            if (data == null) throw new ArgumentNullException(nameof(data));

            string[] names = namePath.Split('.');
            object d = data;
            foreach (string name in names)
            {
                if (d == null) return null;
                if (d.GetType().IsArray)
                {
                    d = (d as Array).GetValue(int.Parse(name));
                }
                else if (DictionaryType(d) != null)
                {
                    var type = DictionaryType(d);
                    var prop = type.GetTypeInfo().DeclaredProperties.FirstOrDefault(p => p.Name == "Item");
                    d = prop.GetValue(d, new object[] { name });
                }
                else if (d is IEnumerable<object>)
                {
                    d = (d as IEnumerable<object>).Skip(int.Parse(name)).First();
                }
                else
                {
                    var property = d.GetType().GetTypeInfo().GetDeclaredProperty(name);
                    if (property == null) throw new Exception();
                    d = property.GetValue(d);
                }
            }
            return d;
        }

        private Type DictionaryType(object d)
        {
            return d.GetType().GetTypeInfo().ImplementedInterfaces.FirstOrDefault(t => t.GetTypeInfo().IsGenericType && t.GetGenericTypeDefinition() == typeof(IDictionary<,>));
        }

        /*
        private Func<IJsonLogic2HqlConverter, JToken[], object, object> DoubleArgsSatisfy(Func<double, double, bool> criteria)
        {
            return (p, args, data) => {
                var values = args.Select(a => p.Apply(a, data))
                    .Select(a => a == null ? 0d : double.Parse(a.ToString()))
                    .ToArray();

                for (int i = 1; i < values.Length; i++)
                {
                    if (!criteria(values[i - 1], values[i])) return false;
                }
                return true;
            };
        }
        */
        /*
        private static Func<IJsonLogic2HqlConverter, JToken[], object, object> ReduceDoubleArgs(double defaultValue, Func<double, double, double> reducer)
        {
            return (p, args, data) => Min2From(args.Select(a => p.Apply(a, data))).Select(a => a == null ? defaultValue : Convert.ToDouble(a)).Aggregate(reducer);
        }
        
        private static IEnumerable<object> Min2From(IEnumerable<object> source)
        {
            var count = source.Count();
            if (count >= 2) return source;

            return new object[] { null, count == 0 ? null : source.First() };
        }
        */

        private string GetStringValue(JToken arg)
        {
            if (arg == null)
                return null;

            if (arg is JValue value && value.Value is string stringValue)
                return stringValue;
            
            throw new NotSupportedException("Not supported value type");
        }

        private List<string> ConvertArguments(IJsonLogic2HqlConverter converter, JToken[] args, JsonLogic2HqlConverterContext context, bool wrap = false)
        {
            return args.Select(a =>
                {
                    var arg = converter.Convert(a, context);
                    return wrap
                        ? $"({arg})"
                        : arg;
                })
                .ToList();
        }
    }
}
