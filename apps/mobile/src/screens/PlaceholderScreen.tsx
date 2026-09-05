import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme';

type Props = {
  title: string;
  subtitle: string;
  icon: string;
  onBack: () => void;
  actionLabel?: string;
};

export function PlaceholderScreen({ title, subtitle, icon, onBack, actionLabel = 'Voltar para a Home' }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <ScreenHeader title={title} onBack={onBack} />
        <View style={styles.center}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Próxima etapa</Text>
          </View>
          <Pressable style={styles.button} onPress={onBack}>
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    flex: 1,
    paddingHorizontal: 18
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 70
  },
  iconBox: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    color: colors.greenDark,
    fontSize: 38,
    fontWeight: '900'
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 20
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8
  },
  badge: {
    borderRadius: 999,
    backgroundColor: '#F2F5F3',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 18
  },
  badgeText: {
    color: '#6F7A76',
    fontSize: 11,
    fontWeight: '900'
  },
  button: {
    minWidth: 210,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 18
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900'
  }
});
