import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  nombre?: string;
};

export default function AdminDashboard({ nombre }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de administración</Text>
      <Text style={styles.subtitle}>Hola, {nombre || "Administrador"}</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push("/perfil")}>
        <Text style={styles.cardTitle}>Mi perfil</Text>
        <Text style={styles.cardText}>Consulta y edita tus datos.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push("/admin/usuarios")}>
        <Text style={styles.cardTitle}>Gestión de usuarios</Text>
        <Text style={styles.cardText}>
          Lista usuarios, cambia roles y activa o desactiva cuentas.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>Avisos</Text>
        <Text style={styles.cardText}>Crea y administra avisos generales.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>Configuración</Text>
        <Text style={styles.cardText}>Administra parámetros globales del sistema.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: "#6B7280",
  },
});