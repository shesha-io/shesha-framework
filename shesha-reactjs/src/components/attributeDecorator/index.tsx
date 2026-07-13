import React, { useEffect, useRef } from 'react';

interface AttributeDecoratorProps {
  /** Object of attributes to be injected into the element */
  attributes?: Record<string, string>;
  /** The element to be decorated */
  children: React.ReactElement;
}

/**
 * Takes decoration attributes as props.attributes [{ key: value }, ...] and injects them as custom data attributes to the element that is being wrapped / 'decorated'.
 * The children must be a single element.
 * Based on https://stackoverflow.com/questions/65123286/inject-custom-data-attribute-to-react-props-children/75875667#75875667 with some modifications to make it more flexible.
 * Modified because the original code re-create children component twice (due to change Wrapper component to Fragment).
 *
 * 1. Create Div and childen component one after the other
 * 2. Get reference to the Div
 * 3. Get index of the childen component in the parent element
 * 4. Inject attributes
 * 5. Replace Div with Fragment (remove Div)
 *
 * @returns The decorated element with the attributes injected into it
 */
const AttributeDecorator: React.FC<AttributeDecoratorProps> = (props) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const parent = divRef.current.parentElement;
    if (!parent) return;

    // The target sibling is the element after the hidden div
    const targetIndex = Array.from(parent.children).indexOf(divRef.current) + 1;
    const targetElement = parent.children[targetIndex];

    if (props.attributes && targetElement) {
      Object.entries(props.attributes).forEach(([key, value]) => {
        targetElement.setAttribute(key, value);
      });
    }
  }, [props.attributes]);

  return (
    <>
      <div ref={divRef} style={{ display: 'none' }} />
      {props.children}
    </>
  );
};

export default AttributeDecorator;
