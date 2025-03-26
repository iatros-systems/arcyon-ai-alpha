declare module 'react-syntax-highlighter' {
  import { ComponentType, ReactNode } from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children?: string;
    className?: string;
    PreTag?: string | ComponentType<any>;
    [key: string]: any;
  }
  
  export const Prism: ComponentType<SyntaxHighlighterProps>;
  export default ComponentType<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/styles/monokai' {
  const style: any;
  export default style;
}
