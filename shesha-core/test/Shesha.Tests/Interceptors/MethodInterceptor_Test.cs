using Abp.Dependency;
using Abp.TestBase;
using Castle.DynamicProxy;
using Castle.MicroKernel;
using Shesha.Services;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Interceptors
{
    public class MethodInterceptor_Test : AbpIntegratedTestBase<SheshaTestModule>
    {
        public class MyTest
        {
            public string Name { get; set; }

            public string Description { get; set; }

            public MyTest Link { get; set; }
        }

        private string GetSqlExpression(Expression expr, Dictionary<string, object> pars, Dictionary<string, object> tables)
        {
            if (expr is BinaryExpression binary)
            {
                switch (binary.NodeType)
                {
                    case ExpressionType.And:
                    case ExpressionType.AndAlso:
                        return $"{GetSqlExpression(binary.Left, pars, tables).Trim()} and {GetSqlExpression(binary.Right, pars, tables).Trim()} ";
                    case ExpressionType.Or:
                    case ExpressionType.OrElse:
                        return $"({GetSqlExpression(binary.Left, pars, tables).Trim()} or {GetSqlExpression(binary.Right, pars, tables).Trim()}) ";
                    case ExpressionType.Equal:
                        return $"{GetSqlExpression(binary.Left, pars, tables).Trim()} = {GetSqlExpression(binary.Right, pars, tables).Trim()} ";
                    case ExpressionType.NotEqual:
                        return $"({GetSqlExpression(binary.Left, pars, tables).Trim().Trim()} != {GetSqlExpression(binary.Right, pars, tables).Trim()}) ";
                    case ExpressionType.LessThan:
                        return $"({GetSqlExpression(binary.Left, pars, tables)} < {GetSqlExpression(binary.Right, pars, tables).Trim()}) ";
                    case ExpressionType.LessThanOrEqual:
                        return $"({GetSqlExpression(binary.Left, pars, tables).Trim()} <= {GetSqlExpression(binary.Right, pars, tables).Trim()}) ";
                    case ExpressionType.GreaterThan:
                        return $"({GetSqlExpression(binary.Left, pars, tables).Trim()} > {GetSqlExpression(binary.Right, pars, tables).Trim()}) ";
                    case ExpressionType.GreaterThanOrEqual:
                        return $"({GetSqlExpression(binary.Left, pars, tables).Trim()} >= {GetSqlExpression(binary.Right, pars, tables).Trim()}) ";
                }
            }
            if (expr is UnaryExpression unary)
            {
                switch (unary.NodeType)
                {
                    case ExpressionType.Not:
                        return $"not ({GetSqlExpression(unary.Operand, pars, tables)}) ";
                }
            }
            if (expr is MemberExpression member)
            {
                var tName = member.Expression.ToString().Replace(".", "_");
                if (!tables.ContainsKey(tName))
                {
                    tables.Add(tName, member.Expression);
                }

                return $"{tName}.{member.Member.Name} ";
            }
            if (expr is ConstantExpression cons)
            {
                var pname = $"@P{pars.Count + 1} ";
                pars.Add(pname, cons.Value);
                return $"{pname} ";
            }

            return "";
            //LogicalBinaryExpression
            //InstanceMethodCallExpression
        }

        private string GetSql<T>(Expression<Func<T, bool>> expr, Dictionary<string, object> pars, Dictionary<string, object> tables)
        {
            if (expr is LambdaExpression lambda)
            {
                return GetSqlExpression(lambda.Body, pars, tables);
            }

            return "";
        }

        [Fact]
        public void Main_Test()
        {
            try
            {
                var shuriks = StaticContext.IocManager.ResolveAll<IShurik>();
                var ss = shuriks.Select(x => new { Name = x.Name, NewP = "asd" }).ToList().FirstOrDefault();

                foreach (var shurik in shuriks)
                {
                    shurik.Name = "Shurik";
                    shurik.Name.ShouldBe("Shurik: Property Intercepted");
                    shurik.SetName("Shurik");
                    shurik.Name.ShouldBe("Shurik: Method Intercepted");
                }
            }
            catch (Exception)
            {
                throw;
            }
        }
    }

    public interface IShurik
    {
        string Name { get; set; }
        void SetName(string name);
    }

    public class Shurik : IShurik, ITransientDependency
    {
        public string Name { get; set; }

        public void SetName(string name)
        {
            Name = name;
        }
    }

    public class NewShurik : Shurik, ITransientDependency { }

    public class ShurikInterceptor : IAsyncInterceptor, ITransientDependency
    {
        public static void Configure(string key, IHandler handler)
        {
            var implementationType = handler.ComponentModel.Implementation.GetTypeInfo();
            if (implementationType.ImplementedInterfaces.Contains(typeof(IShurik)))
            {
                handler.ComponentModel.Interceptors.Add(
                    new Castle.Core.InterceptorReference(typeof(AbpAsyncDeterminationInterceptor<ShurikInterceptor>))
                );
            }
        }

        public void InterceptAsynchronous(IInvocation invocation)
        {
            var proceedInfo = invocation.CaptureProceedInfo();
            proceedInfo.Invoke();
            var task = (Task)invocation.ReturnValue;
            invocation.ReturnValue = task;
            return;
        }

        public void InterceptAsynchronous<TResult>(IInvocation invocation)
        {
            var proceedInfo = invocation.CaptureProceedInfo();
            proceedInfo.Invoke();
            var task = (Task<TResult>)invocation.ReturnValue;
            invocation.ReturnValue = task;
            return;
        }

        public void InterceptSynchronous(IInvocation invocation)
        {
            var method = GetMethodInfo(invocation);
            if (method.Name == "set_Name")
            {
                invocation.Arguments[0] = $"{invocation.Arguments[0]}: Property Intercepted";
            }
            if (method.Name == "SetName")
            {
                invocation.Arguments[0] = $"{invocation.Arguments[0]}: Method Intercepted";
            }
            invocation.Proceed();
            return;
        }

        private static MethodInfo GetMethodInfo(IInvocation invocation)
        {
            MethodInfo method;
            try
            {
                method = invocation.MethodInvocationTarget;
            }
            catch
            {
                method = invocation.GetConcreteMethod();
            }

            return method;
        }

    }
}
