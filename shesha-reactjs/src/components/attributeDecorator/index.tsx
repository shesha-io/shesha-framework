import React, { useEffect, useRef, useState } from 'react';

interface AttributeDecoratorProps {
  /** Object of attributes to be injected into the element */
  attributes?: Record<string, string>;
  /** The element to be decorated */
  children: React.ReactElement;
}

/**
 * Takes decoration attributes as props.attributes [{ key: value }, ...] and injects them as custom data attributes to the element that is being wrapped / 'decorated'.  
 * The children must be a single element.  
 * 
 * Reference: https://stackoverflow.com/questions/65123286/inject-custom-data-attribute-to-react-props-children/75875667#75875667 with some modifications to make it more flexible.  
 * @returns The decorated element with the attributes injected into it
 */
const AttributeDecorator: React.FC<AttributeDecoratorProps> = props => {
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);
  const Wrapper = parentElement ? React.Fragment : 'div';
  const ref = useRef<HTMLDivElement>(null);
  const targetIndex = useRef(0);

  useEffect(() => {
    if (ref.current?.parentElement) {
      targetIndex.current = Array.from(ref.current.parentElement.children).indexOf(ref.current);
      setParentElement(ref.current.parentElement);
      return;
    }
  }, []);

  useEffect(() => {
    if (props.attributes) {
      Object.entries(props.attributes).forEach(([key, value]) => {
        parentElement?.children[targetIndex.current]?.setAttribute(key, value);
      });
    }
  }, [parentElement, targetIndex, props.attributes]);

  return <Wrapper ref={parentElement ? undefined : ref}>{props.children}</Wrapper>;
};

export default AttributeDecorator;