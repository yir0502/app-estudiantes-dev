import React from 'react';
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

type Props = {
  saludo: string;
  nombre?: string;
  fallbackName: string;
  roleText: string;
};

export default function DashboardHero({ saludo, nombre, fallbackName, roleText }: Props) {
  return (
    <View style={styles.hero}>
      <View style={styles.logoRow}>
        <View style={styles.logoCircle}>
          <Ionicons name="school" size={24} color={Colors.light.accent} />
        </View>
        <Text style={styles.buapText}>BUAP</Text>
      </View>
      <Text style={styles.welcomeText}>{saludo} {nombre || fallbackName}!</Text>
      <Text style={styles.roleText}>{roleText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Colors.light.headerBackground,
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buapText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },
});
