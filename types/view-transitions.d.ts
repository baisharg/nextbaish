// View Transition API type definitions

// Options object for startViewTransition
interface ViewTransitionOptions {
  update?: () => void | Promise<void>;
  types?: string[];
}

// Document API with both overloads
interface Document {
  startViewTransition(callback?: () => void | Promise<void>): ViewTransition;
  startViewTransition(options?: ViewTransitionOptions): ViewTransition;
}

// ViewTransition object
interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
  types: ReadonlyArray<string>;
}

// CSS properties
interface CSSStyleDeclaration {
  viewTransitionName?: string;
  viewTransitionClass?: string;
}
