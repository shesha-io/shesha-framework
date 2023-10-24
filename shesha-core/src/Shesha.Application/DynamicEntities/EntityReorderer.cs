using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using NHibernate.Linq;
using Shesha.Configuration.Runtime;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;
using System.Numerics;
using System.Reflection;
using System.Reflection.Emit;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Entities reorderer
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <typeparam name="TId"></typeparam>
    /// <typeparam name="TOrderIndex"></typeparam>
    public class EntityReorderer<T, TId, TOrderIndex> : IEntityReorderer<T, TId, TOrderIndex>, ITransientDependency 
        where T : Entity<TId> 
        where TId: IEquatable<TId>, IComparable<TId> 
        where TOrderIndex: IComparable<TOrderIndex>, INumber<TOrderIndex>
    {
        private readonly IRepository<T, TId> _repository;
        private readonly IEntityConfigurationStore _entityConfigStore;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public EntityReorderer(IUnitOfWorkManager unitOfWorkManager, IRepository<T, TId> repository, IEntityConfigurationStore entityConfigStore)
        {
            _repository = repository;
            _entityConfigStore = entityConfigStore;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public async Task<IReorderResponse> ReorderAsync(ReorderRequest input, PropertyInfo orderIndexProperty)
        {
            var entityConfig = _entityConfigStore.Get(typeof(T));
            
            var idConverter = System.ComponentModel.TypeDescriptor.GetConverter(typeof(TId));
            if (!idConverter.CanConvertFrom(typeof(string)))
                throw new NotSupportedException($"Conversion of string to type `{typeof(TId).FullName}` is not supported");

            var passedItems = input.Items.Select(item => new ReorderingItem<TId, TOrderIndex> {
                OrderIndex = convertOrderIndex(item.OrderIndex),
                Id = (TId)idConverter.ConvertFrom(item.Id) }
                )
                .ToList();
            
            var ids = passedItems.Select(item => item.Id).ToList();

            var result = new ReorderResponse<TId, TOrderIndex>();

            // Note: SoftDelete should be disabled to speed-up the query and to prevent wrong calculations. We load entitier by Id, so it's safe
            using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete)) 
            {
                var selectExpression = CreateSelectExpression(orderIndexProperty);
                var dbItems = await _repository.GetAll().Where(ent => ids.Contains(ent.Id))
                    .Select(selectExpression)
                    .ToListAsync();

                var numbers = new Stack<TOrderIndex>(passedItems.Select(i => i.OrderIndex).OrderByDescending(o => o));

                var partialType = CreatePartialType(orderIndexProperty.Name, orderIndexProperty.PropertyType);
                foreach (var passedItem in passedItems)
                {
                    var orderIndex = numbers.Pop();
                    var query = _repository.GetAll().Where(GetFindByIdExpression(passedItem.Id));
                    query.Update(GetUpdateExpression(partialType, orderIndexProperty.Name, orderIndex));

                    //result.Items.Add(new ReorderingItem<TId, TOrderIndex> { Id = passedItem.Id, OrderIndex = orderIndex });
                    result.ReorderedItems[passedItem.Id] = orderIndex;
                }
            }

            return result;
        }

        private TOrderIndex convertOrderIndex(double orderIndex)
        {
            if (typeof(TOrderIndex) == typeof(int))
                return (TOrderIndex)(Convert.ToInt32(orderIndex) as object);

            if (typeof(TOrderIndex) == typeof(Int64))
                return (TOrderIndex)(Convert.ToInt64(orderIndex) as object);

            if (typeof(TOrderIndex) == typeof(Single))
                return (TOrderIndex)(Convert.ToSingle(orderIndex) as object);

            if (typeof(TOrderIndex) == typeof(decimal))
                return (TOrderIndex)(Convert.ToDecimal(orderIndex) as object);

            if (typeof(TOrderIndex) == typeof(double))
                return (TOrderIndex)(orderIndex as object);

            throw new NotSupportedException($"Conversion of double to `{typeof(TOrderIndex).FullName}` type is not supported");
        }

        private IHasOrderIndex CreatePartialInstance(Type type, int orderIndex) 
        {
            var instanceUntyped = Activator.CreateInstance(type);
            var instance = instanceUntyped as IHasOrderIndex;
            instance.OrderIndex = orderIndex;
            return instance;
        }

        private Expression<Func<T, bool>> GetFindByIdExpression(TId id) 
        {
            var entParam = Expression.Parameter(typeof(T), "ent");
            var equalityExpression = Expression.Equal(Expression.PropertyOrField(entParam, nameof(IEntity.Id)), Expression.Constant(id, typeof(TId)));
            var lambda = Expression.Lambda<Func<T, bool>>(equalityExpression, entParam);
            return lambda;
        }

        private Expression<Func<T, object>> GetUpdateExpression(Type partialType, string orderIndexPropertyName, object orderIndex)
        {
            var entParam = Expression.Parameter(typeof(T), "ent");

            // new statement "new {}"
            var constructor = partialType.GetConstructors().Where(c => c.GetParameters().Any()).Single();

            var orderIndexProperty = partialType.GetProperty(orderIndexPropertyName);
            var newExpression = Expression.New(constructor, new Expression[] { Expression.Constant(orderIndex) }, orderIndexProperty);

            var lambda = Expression.Lambda<Func<T, object>>(newExpression, entParam);
            return lambda;
        }

        private Expression<Func<T, ReorderingItem<TId, int>>> CreateSelectExpression(PropertyInfo orderIndexProperty)
        {
            // input parameter "ent"
            var entParam = Expression.Parameter(typeof(T), "ent");

            // new statement "new ReorderingItem()"
            var newExpression = Expression.New(typeof(ReorderingItem<TId, int>));

            var bindings = new MemberBinding[]{
                Expression.Bind(typeof(ReorderingItem<TId, int>).GetProperty(nameof(ReorderingItem<TId, int>.Id)), Expression.Property(entParam, typeof(T).GetProperty("Id"))),
                Expression.Bind(typeof(ReorderingItem<TId, int>).GetProperty(nameof(ReorderingItem<TId, int>.OrderIndex)), Expression.Property(entParam, orderIndexProperty)),
            };
            var initExpression = Expression.MemberInit(newExpression, bindings);

            // expression "ent => new Data { Id = ent.Id, OrderIndex = ent.OrderIndex }"
            var lambda = Expression.Lambda<Func<T, ReorderingItem<TId, int>>>(initExpression, entParam);

            return lambda;
        }

        private static ModuleBuilder _moduleBuilder;
        protected static ModuleBuilder ModuleBuilder { 
            get 
            {
                if (_moduleBuilder == null) 
                {
                    var dynamicAssemblyName = new AssemblyName("Dynamic.EntityReordering");
                    var dynamicAssembly = AssemblyBuilder.DefineDynamicAssembly(dynamicAssemblyName, AssemblyBuilderAccess.Run);
                    _moduleBuilder = dynamicAssembly.DefineDynamicModule("DynamicModule");
                }
                return _moduleBuilder;
            }  
        }

        public static Type CreatePartialType(string propertyName, Type propertyType)
        {
            var typeName = $"{typeof(T)}.{propertyName}";
            var type = ModuleBuilder.GetType(typeName);
            if (type == null) 
            {
                var typeBuilder = ModuleBuilder.DefineType(typeName, TypeAttributes.Public | TypeAttributes.Class, typeof(object), new Type[] { typeof(IHasOrderIndex) });
                typeBuilder.DefineDefaultConstructor(MethodAttributes.Public | MethodAttributes.SpecialName | MethodAttributes.RTSpecialName);

                var fieldBuilder = TypeBuilderHelper.CreateAutoProperty(typeBuilder, propertyName, propertyType);

                var field = fieldBuilder;

                #region constructor

                var constructorBuilder = typeBuilder.DefineConstructor(
                    MethodAttributes.Public | MethodAttributes.HideBySig | MethodAttributes.SpecialName | MethodAttributes.RTSpecialName,
                    CallingConventions.Standard,
                    new Type[] { propertyType }
                );
                var ctorIL = constructorBuilder.GetILGenerator();

                ctorIL.Emit(OpCodes.Ldarg_0); // Loads the argument at index 0 onto the evaluation stack.
                ctorIL.Emit(OpCodes.Stfld, field); // Replaces the value stored in the field of an object reference or pointer with a new value.

                ctorIL.Emit(OpCodes.Ret);

                #endregion

                type = typeBuilder.CreateType();
            }
            return type;
        }

        private static void CreateConstructor(TypeBuilder typeBuilder, IReadOnlyList<dynamic> backingFields)
        {
            var constructorBuilder = typeBuilder.DefineConstructor(
                MethodAttributes.Public | MethodAttributes.HideBySig | MethodAttributes.SpecialName | MethodAttributes.RTSpecialName,
                CallingConventions.Standard,
                new[] {typeof(KeyValuePair<string, string>),
                typeof(Dictionary<string, Type>)}
            );
            var ctorIL = constructorBuilder.GetILGenerator();

            // Load the current instance ref in arg 0, along
            // with the value of parameter "x" stored in arg X, into stfld.

            for (var x = 0; x < backingFields.Count; x++)
            {
                ctorIL.Emit(OpCodes.Ldarg_0); // Loads the argument at index 0 onto the evaluation stack.
                ctorIL.Emit(OpCodes.Ldarg_S, x + 1); // Loads the argument (referenced by a specified short form index) onto the evaluation stack.
                ctorIL.Emit(OpCodes.Stfld, backingFields[x]); // Replaces the value stored in the field of an object reference or pointer with a new value.
            }

            ctorIL.Emit(OpCodes.Ret);
        }

        public interface IHasOrderIndex 
        { 
            public int OrderIndex { get; set; }
        }
    }
}
