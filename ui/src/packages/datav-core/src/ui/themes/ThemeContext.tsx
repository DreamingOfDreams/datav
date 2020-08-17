import React, { useContext } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { getTheme } from './getTheme';
import { Themeable } from '../types';
import { DatavTheme, ThemeType, currentTheme } from '../../data';
import { stylesFactory } from './stylesFactory';

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Subtract<T, K> = Omit<T, keyof K>;

/**
 * Mock used in tests
 */
let ThemeContextMock: React.Context<DatavTheme> | null = null;

// Use Grafana Dark theme by default
export const ThemeContext = React.createContext(getTheme(currentTheme));
ThemeContext.displayName = 'ThemeContext';

export const withTheme = <P extends Themeable, S extends {} = {}>(Component: React.ComponentType<P>) => {
  const WithTheme: React.FunctionComponent<Subtract<P, Themeable>> = props => {
    /**
     * If theme context is mocked, let's use it instead of the original context
     * This is used in tests when mocking theme using mockThemeContext function defined below
     */
    const ContextComponent = ThemeContextMock || ThemeContext;
    // @ts-ignore
    return <ContextComponent.Consumer>{theme => <Component {...props} theme={theme} />}</ContextComponent.Consumer>;
  };

  WithTheme.displayName = `WithTheme(${Component.displayName})`;
  hoistNonReactStatics(WithTheme, Component);
  type Hoisted = typeof WithTheme & S;
  return WithTheme as Hoisted;
};

export function useTheme(useNewContext?: boolean): DatavTheme {
  // if (useNewContext) {
  //   const theme = React.createContext(getTheme(currentTheme));
  //   return useContext(ThemeContextMock || theme);
  // }

  return useContext(ThemeContextMock || ThemeContext);
}
/** Hook for using memoized styles with access to the theme. */
export const useStyles = (getStyles: (theme?: DatavTheme) => any) => {
  const currentTheme = useTheme();
  const callback = stylesFactory(stylesTheme => getStyles(stylesTheme));
  return callback(currentTheme);
};

/**
 * Enables theme context  mocking
 */
export const mockThemeContext = (theme: Partial<DatavTheme>) => {
  ThemeContextMock = React.createContext(theme as DatavTheme);
  return () => {
    ThemeContextMock = null;
  };
};