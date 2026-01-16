import { useRef, useEffect, useState } from 'react';
import { useForm } from '@/providers/form';
import { isComponentInsideParentOfType } from './componentHierarchy';
import { useFormMarkup } from '@/providers/form/providers/formMarkupProvider';

/**
 * Hook to check if a component is inside a data context, with stable memoization
 * that only recomputes when the component's actual parent relationships change.
 *
 * This prevents infinite loops during drag operations by using refs to track
 * the serialized state and only triggering updates when it actually changes.
 */
export const useIsInsideDataContext = (componentId: string): boolean => {
  const { formMode } = useForm();
  const { allComponents, componentRelations } = useFormMarkup();

  // Use refs to store previous serialized state and result
  const prevRelationshipKeyRef = useRef<string>('');
  const prevDataContextTypesRef = useRef<string>('');
  const prevResultRef = useRef<boolean | null>(null);

  // Use state to trigger rerenders only when hierarchy actually changes
  const [isInside, setIsInside] = useState<boolean>(() => {
    if (formMode !== 'designer') return true;
    const result = isComponentInsideParentOfType(componentId, 'dataContext', { allComponents, componentRelations });
    prevResultRef.current = result; // Initialize ref with initial state
    return result;
  });

  useEffect(() => {
    // Skip check in runtime modes
    if (formMode !== 'designer') {
      if (prevResultRef.current !== true) {
        prevResultRef.current = true;
        setIsInside(true);
      }
      return;
    }

    if (!componentId) {
      return;
    }

    // Serialize the current relationships
    const relationshipKey = componentRelations
      ? Object.entries(componentRelations)
        .map(([parentId, children]) => `${parentId}:${(children || []).join(',')}`)
        .sort()
        .join('|')
      : '';

    // Serialize which components are DataContext types
    const dataContextTypes = allComponents
      ? Object.entries(allComponents)
        .filter(([_, component]) => component.type === 'dataContext')
        .map(([id]) => id)
        .sort()
        .join(',')
      : '';

    // Only recalculate if serialized keys actually changed
    if (
      relationshipKey !== prevRelationshipKeyRef.current ||
      dataContextTypes !== prevDataContextTypesRef.current
    ) {
      prevRelationshipKeyRef.current = relationshipKey;
      prevDataContextTypesRef.current = dataContextTypes;

      // Perform the actual hierarchy check
      const newIsInside = isComponentInsideParentOfType(componentId, 'dataContext', { allComponents, componentRelations });

      // Only update state if the result changed
      if (newIsInside !== prevResultRef.current) {
        prevResultRef.current = newIsInside;
        setIsInside(newIsInside);
      }
    } else {
      // Even if serialized keys didn't change, we should still check if the result
      // might have changed due to component property updates (e.g., component type change)
      // This handles edge cases where a component might be converted to/from dataContext type
      const newIsInside = isComponentInsideParentOfType(componentId, 'dataContext', { allComponents, componentRelations });

      if (newIsInside !== prevResultRef.current) {
        prevResultRef.current = newIsInside;
        setIsInside(newIsInside);
      }
    }
  }, [componentId, formMode, { allComponents, componentRelations }]); // Only depend on the actual values we need

  return isInside;
};
