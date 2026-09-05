import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  title: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  dark?: boolean;
};

export function ScreenHeader({ title, onBack, rightLabel, onRightPress, dark = false }: Props) {
  const textColor = dark ? '#FFFFFF' : colors.ink;
  const mutedColor = dark ? '#B7C0BC' : colors.greenDark;

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Text style={[styles.backText, { color: textColor }]}>‹</Text>
          </Pressable>
        ) : null}
      </View>
      <Text numberOfLines={1} style={[styles.title, { color: textColor }]}>{title}</Text>
      <View style={[styles.side, styles.sideRight]}>
        {rightLabel ? (
          <Pressable onPress={onRightPress} hitSlop={8}>
            <Text style={[styles.rightLabel, { color: mutedColor }]}>{rightLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  side: {
    width: 72,
    minHeight: 44,
    justifyContent: 'center'
  },
  sideRight: {
    alignItems: 'flex-end'
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center'
  },
  backText: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '300'
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center'
  },
  rightLabel: {
    fontSize: 13,
    fontWeight: '800'
  }
});
