import 'reflect-metadata';

export function transient() {
  return function (target: any, propertyKey: string) {
    const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
    descriptor.enumerable = false;
    Object.defineProperty(target, propertyKey, descriptor)
  };
}

