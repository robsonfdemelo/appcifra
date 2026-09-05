import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  compact?: boolean;
};

export function AppLogo({ compact = false }: Props) {
  return (
    <View style={[styles.wrapper, compact ? styles.wrapperCompact : null]}>
      <View style={[styles.mark, compact ? styles.markCompact : null]}>
        <Text style={[styles.icon, compact ? styles.iconCompact : null]}>♫</Text>
      </View>
      <View>
        <Text style={[styles.name, compact ? styles.nameCompact : null]}>App Cifra</Text>
        {!compact ? <Text style={styles.tagline}>Estude, toque e evolua</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 12
  },
  wrapperCompact: {
    flexDirection: 'row',
    gap: 9
  },
  mark: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '8deg' }]
  },
  markCompact: {
    width: 42,
    height: 42,
    borderRadius: 15
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    transform: [{ rotate: '-8deg' }]
  },
  iconCompact: {
    fontSize: 24
  },
  name: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    textAlign: 'center'
  },
  nameCompact: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'left'
  },
  tagline: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 14,
    textAlign: 'center'
  }
});
