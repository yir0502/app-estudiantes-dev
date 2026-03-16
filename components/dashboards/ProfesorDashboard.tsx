import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  nombre?: string;
};

export default function ProfesorDashboard({ nombre }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel del profesor</Text>
      <Text style={styles.subtitle}>Hola, {nombre || "Profesor"}</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push("/perfil")}>
        <Text style={styles.cardTitle}>Mi perfil</Text>
        <Text style={styles.cardText}>Actualiza tus datos personales.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>Materias asignadas</Text>
        <Text style={styles.cardText}>Aquí verás tus materias y grupos.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>Horarios</Text>
        <Text style={styles.cardText}>Consulta tus clases programadas.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>Avisos</Text>
        <Text style={styles.cardText}>Consulta avisos institucionales.</Text>
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