import { auth } from "@/src/api/firebase";
import { useAuth } from "@/src/lib/auth-context";
import { signOut } from "firebase/auth";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AdminDashboard from "@/components/dashboards/AdminDashboard";
import EstudianteDashboard from "@/components/dashboards/EstudianteDashboard";
import ProfesorDashboard from "@/components/dashboards/ProfesorDashboard";

export default function HomeScreen() {
  const { user, profile, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert("Error", "No fue posible cerrar sesión.");
    }
  };

  const fallbackEmail = user?.email ?? "";

  const renderDashboard = () => {
    switch (profile?.rol) {
      case "admin":
        return <AdminDashboard nombre={profile.nombre} />;

      case "profesor":
        return <ProfesorDashboard nombre={profile.nombre} />;

      case "estudiante":
        return <EstudianteDashboard nombre={profile.nombre} />;

      default:
        return (
          <View style={styles.fallbackCard}>
            <Text style={styles.fallbackTitle}>Perfil sin configurar</Text>
            <Text style={styles.fallbackText}>
              No se encontró un rol válido para este usuario.
            </Text>
            <Text style={styles.fallbackText}>{fallbackEmail}</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderDashboard()}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#F5F7FB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },
  fallbackCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  logoutButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});