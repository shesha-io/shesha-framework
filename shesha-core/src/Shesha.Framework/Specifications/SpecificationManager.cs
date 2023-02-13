using Abp;
using Abp.Dependency;
using Abp.Specifications;
using Castle.Core.Internal;
using Shesha.Specifications.Exceptions;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace Shesha.Specifications
{
    /// <summary>
    /// Provides access to a list of specifications that should be applied in current execution context. Includes both global specifications and custom ones (e.g. applied to concrete API endpoints)
    /// </summary>
    public class SpecificationManager : ISpecificationManager, ITransientDependency
    {
        private static readonly AsyncLocal<SpecificationManagerState> InternalState = new AsyncLocal<SpecificationManagerState>();

        private static readonly AsyncLocal<bool> IsDisabled = new AsyncLocal<bool>();

        private readonly ISpecificationsFinder _specificationsFinder;

        public IIocManager IocManager { get; set; }

        public SpecificationManager(ISpecificationsFinder specificationsFinder)
        {
            _specificationsFinder = specificationsFinder;
        }

        private static SpecificationManagerState State
        {
            get 
            {
                if (InternalState.Value != null)
                    return InternalState.Value;
                lock (InternalState)
                {
                    if (InternalState.Value != null)
                        return InternalState.Value;

                    return InternalState.Value = new SpecificationManagerState();
                }
            }
        }

        public List<Type> SpecificationTypes => ActiveSpecifications.Select(s => s.SpecificationsType).ToList();

        public List<ISpecificationInfo> ActiveSpecifications {
            get 
            {
                if (!State.IsEnabled)
                    return new List<ISpecificationInfo>();

                var specs = _specificationsFinder.GlobalSpecifications;
                var localSpecs = State.Stack.ToList().Select(s => s.SpecificationInfo).ToList();
                
                return specs.Union(localSpecs).ToList();
            }
        }

        public IQueryable<T> ApplySpecifications<T>(IQueryable<T> queryable)
        {
            var specs = GetSpecifications<T>();
            var filteredQuery = queryable;
            
            foreach (var spec in specs) 
            {
                filteredQuery = filteredQuery.Where(spec.ToExpression());
            }
            return filteredQuery;
        }

        public List<ISpecification<T>> GetSpecifications<T>()
        {
            var specTypes = ActiveSpecifications.Where(t => t.EntityType == typeof(T));

            return specTypes.Select(si => GetSpecificationInstance<T>(si)).ToList();
        }

        public List<ISpecification<T>> GetSpecifications<T>(List<string> specifications)
        {
            var specTypes = specifications.Select(sn => _specificationsFinder.FindSpecification(typeof(T), sn)).ToList();

            return specTypes.Select(si => GetSpecificationInstance<T>(si)).ToList();
        }
        
        /// inheritedDoc
        public ISpecification<T> GetSpecificationInstance<T>(ISpecificationInfo specInfo)
        {
            var specInstance = IocManager.IsRegistered(specInfo.SpecificationsType)
                ? IocManager.Resolve(specInfo.SpecificationsType)
                : Activator.CreateInstance(specInfo.SpecificationsType);

            if (specInstance is ISpecification<T> thisTypeSpec)
                return thisTypeSpec;

            // check type and interitance
            if (!specInfo.EntityType.IsAssignableFrom(typeof(T)))
                throw new InvalidCastException($"Type `{typeof(T).FullName}` is not inherited from `{specInfo.EntityType}`");

            var specType = typeof(InheritedSpecification<,>).MakeGenericType(specInfo.EntityType, typeof(T));
            var instance = Activator.CreateInstance(specType, specInstance);
            return instance as ISpecification<T>;
        }

        public ISpecificationsContext Use<TSpec, TEntity>() where TSpec : ISpecification<TEntity>
        {
            var context = new SpecificationsContext(typeof(TSpec), typeof(TEntity));

            State.Stack.Push(context);

            context.Disposed += (sender, args) =>
            {
                if (!State.Stack.TryPop(out var specificationsContext))
                    throw new Exception("Failed to remove specifications from the current context");
                
                if (specificationsContext != context)
                    throw new Exception("Wrong specifications sequence. Make sure that you dispose specification contexts in a correct sequence");
            };
            return context;
        }

        public IDisposable Use(params Type[] specificationType)
        {
            var specifications = specificationType.SelectMany(t => SpecificationsHelper.GetSpecificationsInfo(t)).ToList();

            var stack = new Stack<IDisposable>();
            foreach (var specification in specifications) 
                stack.Push(Use(specification.SpecificationsType, specification.EntityType));

            return new DisposeAction(() => {
                while (stack.TryPop(out var disposable))
                    disposable.Dispose();
            });
        }

        private ISpecificationsContext Use(Type specificationType, Type entityType)
        {
            var context = new SpecificationsContext(specificationType, entityType);

            State.Stack.Push(context);

            context.Disposed += (sender, args) =>
            {
                if (!State.Stack.TryPop(out var specificationsContext))
                    throw new Exception("Failed to remove specifications from the current context");

                if (specificationsContext != context)
                    throw new Exception("Wrong specifications sequence. Make sure that you dispose specification contexts in a correct sequence");
            };
            return context;
        }

        protected void EnableSpecifications()
        {
            State.IsEnabled = true;
        }

        public IDisposable DisableSpecifications()
        {
            State.IsEnabled = false;
            return new DisposeAction(() => EnableSpecifications());
        }

        public IQueryable<T> ApplySpecifications<T>(IQueryable<T> queryable, List<string> specifications)
        {
            var specs = GetSpecifications<T>(specifications);

            var filteredQuery = queryable;

            foreach (var spec in specs)
            {
                filteredQuery = filteredQuery.Where(spec.ToExpression());
            }
            return filteredQuery;
        }
    }

    /// <summary>
    /// Specifications menager state
    /// </summary>
    public class SpecificationManagerState 
    {
        public ConcurrentStack<ISpecificationsContext> Stack { get; set; }
        public bool IsEnabled { get; set; }

        public SpecificationManagerState()
        {
            Stack = new ConcurrentStack<ISpecificationsContext>();
            IsEnabled = true;
        }
    }
}
