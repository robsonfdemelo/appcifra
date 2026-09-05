import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type BottomTab = 'home' | 'search' | 'tools' | 'favorites' | 'profile';

type Props = {
  active: BottomTab;
  onChange: (tab: BottomTab) => void;
};

const items: Array<{ key: BottomTab; icon: string; label: string }> = [
  { key: 'home', icon: '⌂', label: 'Início' },
  { key: 'search', icon: '⌕', label: 'Buscar' },
  { key: 'tools', icon: '⌘', label: 'Ferramentas' },
  { key: 'favorites', icon: '♡', label: 'Favoritas' },
  { key: 'profile', icon: '○', label: 'Perfil' }
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      {items.map(item => {
        const selected = item.key === active;
        return (
          <Pressable key={item.key} style={styles.item} onPress={() => onChange(item.key)}>
            <Text style={[styles.icon, selected ? styles.active : null]}>{item.icon}</Text>
            <Text style={[styles.label, selected ? styles.active : null]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 10
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: 2
  },
  icon: {
    color: '#7B8581',
    fontSize: 21,
    fontWeight: '700'
  },
  label: {
    color: '#7B8581',
    fontSize: 10,
    fontWeight: '700'
  },
  active: {
    color: colors.green
  }
});
