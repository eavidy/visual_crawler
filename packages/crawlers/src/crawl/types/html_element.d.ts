interface NodeList<T extends Node = Node> {
  readonly length: number;
  forEach(
    callbackfn: (value: Node, key: number, parent: NodeList<T>) => void,
    thisArg?: any,
  ): void;
  [index: number]: T;
}

interface Node extends EventTarget {
  readonly baseURI: string;
  readonly childNodes: NodeList;
  readonly firstChild: Node | null;
  readonly isConnected: boolean;
  readonly lastChild: Node | null;
  readonly nextSibling: Node | null;
  readonly nodeName: string;
  readonly nodeType: number;
  nodeValue: string | null;

  readonly parentElement: Element | null;
  readonly parentNode: ParentNode | null;
  readonly previousSibling: Node | null;
  textContent: string | null;
  appendChild<T extends Node>(node: T): T;
  cloneNode(deep?: boolean): Node;
  compareDocumentPosition(other: Node): number;
  contains(other: Node | null): boolean;
  hasChildNodes(): boolean;
  insertBefore<T extends Node>(node: T, child: Node | null): T;
  isDefaultNamespace(namespace: string | null): boolean;
  isEqualNode(otherNode: Node | null): boolean;
  isSameNode(otherNode: Node | null): boolean;
  lookupNamespaceURI(prefix: string | null): string | null;
  lookupPrefix(namespace: string | null): string | null;
  normalize(): void;
  removeChild<T extends Node>(child: T): T;
  replaceChild<T extends Node>(node: Node, child: T): T;
  readonly ATTRIBUTE_NODE: number;
  readonly CDATA_SECTION_NODE: number;
  readonly COMMENT_NODE: number;
  readonly DOCUMENT_FRAGMENT_NODE: number;
  readonly DOCUMENT_NODE: number;
  readonly DOCUMENT_POSITION_CONTAINED_BY: number;
  readonly DOCUMENT_POSITION_CONTAINS: number;
  readonly DOCUMENT_POSITION_DISCONNECTED: number;
  readonly DOCUMENT_POSITION_FOLLOWING: number;
  readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
  readonly DOCUMENT_POSITION_PRECEDING: number;
  readonly DOCUMENT_TYPE_NODE: number;
  readonly ELEMENT_NODE: number;
  readonly ENTITY_NODE: number;
  readonly ENTITY_REFERENCE_NODE: number;
  readonly NOTATION_NODE: number;
  readonly PROCESSING_INSTRUCTION_NODE: number;
  readonly TEXT_NODE: number;
}
interface HTMLCollectionBase {
  readonly length: number;

  item(index: number): Element | null;
  [index: number]: Element;
}

interface HTMLCollection<T extends Element = Element>
  extends HTMLCollectionBase {
  item(index: number): T | null;
  namedItem(name: string): T | null;
  [Symbol.iterator]: () => Generator<T, T, undefined>;
  [index: number]: T;
}
interface ParentNode extends Node {
  readonly childElementCount: number;

  readonly children: HTMLCollection;

  readonly firstElementChild: Element | null;

  readonly lastElementChild: Element | null;
  /**
   * Inserts nodes after the last child of node, while replacing strings in nodes with equivalent Text nodes.
   *
   * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
   */
  append(...nodes: (Node | string)[]): void;
  /**
   * Inserts nodes before the first child of node, while replacing strings in nodes with equivalent Text nodes.
   *
   * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
   */
  prepend(...nodes: (Node | string)[]): void;

  querySelector<E extends Element = Element>(selectors: string): E | null;
  querySelectorAll<E extends Element = Element>(selectors: string): NodeList<E>;
  /**
   * Replace all children of node with nodes, while replacing strings in nodes with equivalent Text nodes.
   *
   * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
   */
  replaceChildren(...nodes: (Node | string)[]): void;
}
interface InnerHTML {
  innerHTML: string;
  innerText: string;
}
interface NonDocumentTypeChildNode {
  readonly nextElementSibling: Element | null;

  readonly previousElementSibling: Element | null;
}
interface Attr extends Node {
  readonly localName: string;
  readonly name: string;
  readonly namespaceURI: string | null;
  readonly ownerElement: Element | null;
  readonly prefix: string | null;

  readonly specified: boolean;
  value: string;
}
interface NamedNodeMap {
  readonly length: number;
  getNamedItem(qualifiedName: string): Attr | null;
  getNamedItemNS(namespace: string | null, localName: string): Attr | null;
  item(index: number): Attr | null;
  removeNamedItem(qualifiedName: string): Attr;
  removeNamedItemNS(namespace: string | null, localName: string): Attr;
  setNamedItem(attr: Attr): Attr | null;
  setNamedItemNS(attr: Attr): Attr | null;
  [index: number]: Attr;
}
interface DOMTokenList {
  readonly length: number;

  value: string;
  toString(): string;

  add(...tokens: string[]): void;
  contains(token: string): boolean;
  item(index: number): string | null;
  remove(...tokens: string[]): void;
  replace(token: string, newToken: string): boolean;
  supports(token: string): boolean;
  toggle(token: string, force?: boolean): boolean;
  forEach(
    callbackfn: (value: string, key: number, parent: DOMTokenList) => void,
    thisArg?: any,
  ): void;
  [index: number]: string;
}

export interface Element
  extends Node,
    Node,
    InnerHTML,
    NonDocumentTypeChildNode,
    ParentNode {
  readonly attributes: NamedNodeMap;

  readonly classList: DOMTokenList;

  className: string;
  readonly clientHeight: number;
  readonly clientLeft: number;
  readonly clientTop: number;
  readonly clientWidth: number;

  id: string;

  readonly localName: string;

  readonly namespaceURI: string | null;
  onfullscreenchange: ((this: Element, ev: Event) => any) | null;
  onfullscreenerror: ((this: Element, ev: Event) => any) | null;
  outerHTML: string;

  readonly prefix: string | null;
  readonly scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
  readonly scrollWidth: number;

  slot: string;

  readonly tagName: string;

  getAttribute(qualifiedName: string): string | null;

  getAttributeNS(namespace: string | null, localName: string): string | null;

  getAttributeNames(): string[];

  getElementsByClassName(classNames: string): HTMLCollection<Element>;

  getElementsByTagName(qualifiedName: string): HTMLCollection<Element>;

  getElementsByTagNameNS(
    namespace: string | null,
    localName: string,
  ): HTMLCollection<Element>;

  hasAttribute(qualifiedName: string): boolean;

  hasAttributeNS(namespace: string | null, localName: string): boolean;

  hasAttributes(): boolean;
  hasPointerCapture(pointerId: number): boolean;

  matches(selectors: string): boolean;
  releasePointerCapture(pointerId: number): void;

  removeAttribute(qualifiedName: string): void;

  removeAttributeNS(namespace: string | null, localName: string): void;
  removeAttributeNode(attr: Attr): Attr;

  /**
   * If force is not given, "toggles" qualifiedName, removing it if it is present and adding it if it is not present. If force is true, adds qualifiedName. If force is false, removes qualifiedName.
   *
   * Returns true if qualifiedName is now present, and false otherwise.
   */
  toggleAttribute(qualifiedName: string, force?: boolean): boolean;

  webkitMatchesSelector(selectors: string): boolean;
}

interface EventListenerOptions {
  capture?: boolean;
}
interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
  signal?: any;
}
