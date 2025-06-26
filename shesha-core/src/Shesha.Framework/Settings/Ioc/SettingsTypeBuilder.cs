using Abp.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;

namespace Shesha.Settings.Ioc
{
    /// <summary>
    /// Settings type builder. Is used to build dynamic implementation of <see cref="ISettingAccessors"/>
    /// </summary>
    public class SettingsTypeBuilder
    {
        public Type BuildType(Type settingsInterface) 
        {
            if (!settingsInterface.IsInterface)
                throw new ArgumentException($"{nameof(SettingsTypeBuilder)}.{nameof(BuildType)} supports interfaces only", nameof(settingsInterface));

            var className = settingsInterface.Name.RemovePreFix("I") + "Default";

            var tb = GetTypeBuilder(typeof(object), className, new List<Type> { typeof(ISettingAccessors), settingsInterface });
            var constructor = tb.DefineDefaultConstructor(MethodAttributes.Public | MethodAttributes.SpecialName | MethodAttributes.RTSpecialName);

            var properties = settingsInterface.GetProperties();
            foreach (var property in properties) 
            {
                AddProperty(tb, property);
            }

            // copy attributes
            var attributeBuilders = GetAttributeBuilders(settingsInterface);
            foreach (var attributeBuilder in attributeBuilders)
            {
                tb.SetCustomAttribute(attributeBuilder);
            }

            var objectType = tb.CreateType();
            return objectType;
        }

        private static void AddProperty(TypeBuilder tb, PropertyInfo pi)
        {
            var propertyName = pi.Name;
            var propertyType = pi.PropertyType;

            var fieldBuilder = tb.DefineField("_" + propertyName, propertyType, FieldAttributes.Private);

            var propertyBuilder = tb.DefineProperty(propertyName, PropertyAttributes.HasDefault, propertyType, null);
            var getPropMthdBldr = tb.DefineMethod("get_" + propertyName,
                MethodAttributes.Public |
                MethodAttributes.SpecialName |
                MethodAttributes.HideBySig |
                MethodAttributes.Virtual,
                propertyType,
                Type.EmptyTypes);
            var getIl = getPropMthdBldr.GetILGenerator();

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

            var setIl = setPropMthdBldr.GetILGenerator();
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

            // copy attributes
            var attributeBuilders = GetAttributeBuilders(pi);
            foreach (var attributeBuilder in attributeBuilders) 
            {
                propertyBuilder.SetCustomAttribute(attributeBuilder);                
            }   
        }

        private TypeBuilder GetTypeBuilder(Type baseType, string typeName, IEnumerable<Type> interfaces)
        {
            var assemblyName = new AssemblyName($"{typeName}Assembly");
            var moduleName = $"{typeName}Module";

            var assemblyBuilder = AssemblyBuilder.DefineDynamicAssembly(assemblyName, AssemblyBuilderAccess.RunAndCollect);
            var moduleBuilder = assemblyBuilder.DefineDynamicModule(moduleName);
            var tb = moduleBuilder.DefineType(typeName,
                    TypeAttributes.Public |
                    TypeAttributes.Class |
                    TypeAttributes.AutoClass |
                    TypeAttributes.AnsiClass |
                    TypeAttributes.BeforeFieldInit |
                    TypeAttributes.AutoLayout,
                    baseType,
                    interfaces.ToArray());
            return tb;
        }

        
        private static CustomAttributeBuilder ToAttributeBuilder(CustomAttributeData data)
        {
            if (data == null)
            {
                throw new ArgumentNullException("data");
            }

            var constructorArguments = new List<object?>();
            foreach (var ctorArg in data.ConstructorArguments)
            {
                constructorArguments.Add(ctorArg.Value);
            }

            var propertyArguments = new List<PropertyInfo>();
            var propertyArgumentValues = new List<object?>();
            var fieldArguments = new List<FieldInfo>();
            var fieldArgumentValues = new List<object?>();
            foreach (var namedArg in data.NamedArguments)
            {
                var fi = namedArg.MemberInfo as FieldInfo;
                var pi = namedArg.MemberInfo as PropertyInfo;

                if (fi != null)
                {
                    fieldArguments.Add(fi);
                    fieldArgumentValues.Add(namedArg.TypedValue.Value);
                }
                else if (pi != null)
                {
                    propertyArguments.Add(pi);
                    propertyArgumentValues.Add(namedArg.TypedValue.Value);
                }
            }
            return new CustomAttributeBuilder(
              data.Constructor,
              constructorArguments.ToArray(),
              propertyArguments.ToArray(),
              propertyArgumentValues.ToArray(),
              fieldArguments.ToArray(),
              fieldArgumentValues.ToArray());
        }

        private static List<CustomAttributeBuilder> GetAttributeBuilders(MemberInfo oldMember) 
        {
            var result = new List<CustomAttributeBuilder>();
            
            var customMethodAttributes = CustomAttributeData.GetCustomAttributes(oldMember);
            foreach (var att in customMethodAttributes) 
            {
                var builder = ToAttributeBuilder(att);
                result.Add(builder);
            }

            return result;
        }
    }
}
