import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

type Props = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export function PrimaryButton({
  title,
  loading = false,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  ...props
}: Props) {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button, styles[`button_${size}` as keyof typeof styles] as ViewStyle];

    if (variant === 'primary') {
      baseStyle.push(styles.button_primary);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.button_secondary);
    } else if (variant === 'outline') {
      baseStyle.push(styles.button_outline);
    }

    if (isDisabled) {
      baseStyle.push(styles.button_disabled);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.text, styles[`text_${size}` as keyof typeof styles] as TextStyle];

    if (variant === 'outline') {
      baseStyle.push(styles.text_outline);
    } else {
      baseStyle.push(styles.text_filled);
    }

    return baseStyle;
  };

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        ...getButtonStyle(),
        pressed && !isDisabled && styles.button_pressed,
        style as ViewStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#2563eb' : '#ffffff'}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  button_sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button_md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button_lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  button_primary: {
    backgroundColor: '#2563eb',
  },
  button_secondary: {
    backgroundColor: '#525252',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  button_disabled: {
    opacity: 0.5,
  },
  button_pressed: {
    opacity: 0.8,
  },
  text: {
    fontWeight: '600',
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
  text_filled: {
    color: '#ffffff',
  },
  text_outline: {
    color: '#2563eb',
  },
});
