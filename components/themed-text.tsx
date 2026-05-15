import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor ?? '#000000', dark: darkColor ?? '#000000' }, 'text');

  const typeClassName =
    type === 'default'
      ? 'text-base leading-6'
      : type === 'title'
        ? 'text-[32px] font-bold leading-8'
        : type === 'defaultSemiBold'
          ? 'text-base leading-6 font-semibold'
          : type === 'subtitle'
            ? 'text-xl font-bold'
            : 'text-base leading-7 text-cyan-600';

  return (
    <Text
      className={className ? `${typeClassName} ${className}` : typeClassName}
      style={[{ color }, style]}
      {...rest}
    />
  );
}
