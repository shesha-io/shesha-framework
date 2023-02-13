using Abp.Domain.Entities;
using System;
using System.Reflection;
using System.Reflection.Emit;

namespace Shesha.DynamicEntities
{
    public static class ShaEntityTypeBuilder
    {
        public static object CreateNewObject(DynamicEntity entityMetadata)
        {
            var dynamicType = CompileResultType(entityMetadata);
            var dynamicObject = Activator.CreateInstance(dynamicType);
            return dynamicObject;
        }
        public static Type CompileResultType(DynamicEntity entityMetadata)
        {
            // code based on https://stackoverflow.com/questions/3862226/how-to-dynamically-create-a-class

            var tb = GetTypeBuilder("DynamicModule", entityMetadata.Name);
            var constructor = tb.DefineDefaultConstructor(MethodAttributes.Public | MethodAttributes.SpecialName | MethodAttributes.RTSpecialName);

            tb.AddInterfaceImplementation(typeof(IEntity<Guid>));

            // NOTE: assuming your list contains Field objects with fields FieldName(string) and FieldType(Type)
            foreach (var property in entityMetadata.Properties)
                CreateProperty(tb, property.PropertyName, property.PropertyType);

            /*
            var isTransientMethodBuilder = tb.DefineMethod(nameof(IEntity<Guid>.IsTransient),
                        MethodAttributes.Public | MethodAttributes.Virtual,
                        null,
                        null);
            var isTransientMethodIL = isTransientMethodBuilder.GetILGenerator();
            isTransientMethodIL.Emit(OpCodes.Ret);
            var isTransientMethod = typeof(IEntity<Guid>).GetMethod(nameof(IEntity<Guid>.IsTransient));
            tb.DefineMethodOverride(isTransientMethodBuilder, isTransientMethod);
            */
            var objectType = tb.CreateType();
            return objectType;
        }

        private static TypeBuilder GetTypeBuilder(string moduleName, string typeName)
        {
            var an = new AssemblyName(moduleName);
            
            var assemblyBuilder = AssemblyBuilder.DefineDynamicAssembly(an, AssemblyBuilderAccess.Run);
            var moduleBuilder = assemblyBuilder.DefineDynamicModule(moduleName);
            var tb = moduleBuilder.DefineType(typeName,
                    TypeAttributes.Public |
                    TypeAttributes.Class |
                    TypeAttributes.AutoClass |
                    TypeAttributes.AnsiClass |
                    TypeAttributes.BeforeFieldInit |
                    TypeAttributes.AutoLayout,
                    typeof(Entity<Guid>),
                    new Type[] { typeof(IEntity<Guid>) });
            return tb;
        }

        private static void CreateProperty(TypeBuilder tb, string propertyName, Type propertyType)
        {
            var fieldBuilder = tb.DefineField("_" + propertyName, propertyType, FieldAttributes.Private);

            var propertyBuilder = tb.DefineProperty(propertyName, PropertyAttributes.HasDefault, propertyType, null);
            var getPropMthdBldr = tb.DefineMethod("get_" + propertyName, 
                MethodAttributes.Public | 
                MethodAttributes.SpecialName | 
                MethodAttributes.HideBySig |
                MethodAttributes.Virtual, 
                propertyType, 
                Type.EmptyTypes);
            ILGenerator getIl = getPropMthdBldr.GetILGenerator();

            getIl.Emit(OpCodes.Ldarg_0);
            getIl.Emit(OpCodes.Ldfld, fieldBuilder);
            getIl.Emit(OpCodes.Ret);

            var setPropMthdBldr =
                tb.DefineMethod("set_" + propertyName,
                  MethodAttributes.Public |
                  MethodAttributes.SpecialName |
                  MethodAttributes.HideBySig |
                  MethodAttributes.Virtual,
                  null, new[] { propertyType });

            ILGenerator setIl = setPropMthdBldr.GetILGenerator();
            var modifyProperty = setIl.DefineLabel();
            var exitSet = setIl.DefineLabel();

            setIl.MarkLabel(modifyProperty);
            setIl.Emit(OpCodes.Ldarg_0);
            setIl.Emit(OpCodes.Ldarg_1);
            setIl.Emit(OpCodes.Stfld, fieldBuilder);

            setIl.Emit(OpCodes.Nop);
            setIl.MarkLabel(exitSet);
            setIl.Emit(OpCodes.Ret);

            propertyBuilder.SetGetMethod(getPropMthdBldr);
            propertyBuilder.SetSetMethod(setPropMthdBldr);

            // https://stackoverflow.com/questions/1822047/how-to-emit-explicit-interface-implementation-using-reflection-emit
            // DefineMethodOverride is used to associate the method 
            // body with the interface method that is being implemented.
            //
            /*
            if (propertyName == "Id") 
            {
                var getMethod = typeof(IEntity<Guid>).GetMethod("get_Id");
                tb.DefineMethodOverride(getPropMthdBldr, getMethod);

                var setMethod = typeof(IEntity<Guid>).GetMethod("set_Id");
                tb.DefineMethodOverride(setPropMthdBldr, setMethod);
            }            
            */
        }
    }
}
