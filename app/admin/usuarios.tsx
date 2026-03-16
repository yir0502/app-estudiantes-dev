import { router } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useUsers } from "@/hooks/use-users";
import { db } from "@/src/api/firebase";
import { UserProfile, UserRole } from "@/src/domain/user";

const ROLE_OPTIONS: UserRole[] = ["estudiante", "profesor", "admin"];

export default function AdminUsuariosScreen() {
  const { users, loading } = useUsers();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      const nombre = user.nombre?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      const matricula =
        user.rol === "estudiante" ? user.matricula?.toLowerCase() ?? "" : "";

      return (
        nombre.includes(q) ||
        email.includes(q) ||
        matricula.includes(q)
      );
    });
  }, [users, search]);

  const handleChangeRole = async (uid: string, newRole: UserRole) => {
    try {
      setSaving(true);
      await updateDoc(doc(db, "users", uid), {
        rol: newRole,
      });
      Alert.alert("Éxito", "Rol actualizado correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No fue posible actualizar el rol.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActivo = async (uid: string, currentValue: boolean) => {
    try {
      setSaving(true);
      await updateDoc(doc(db, "users", uid), {
        activo: !currentValue,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No fue posible actualizar el estado.");
    } finally {
      setSaving(false);
    }
  };

  const openEditProfile = (user: UserProfile) => {
    router.push({
      pathname: "/perfil",
      params: { uid: user.uid },
    });
  };

  const roleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "profesor":
        return "Profesor";
      case "estudiante":
        return "Estudiante";
      default:
        return role;
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
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de usuarios</Text>
      <Text style={styles.subtitle}>
        Administra roles, estado y perfiles de los usuarios.
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre, correo o matrícula"
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.nombre || "Sin nombre"}</Text>
                <Text style={styles.email}>{item.email || "Sin correo"}</Text>
              </View>

              <TouchableOpacity
                style={styles.roleButton}
                onPress={() => setSelectedUser(item)}
                disabled={saving}
              >
                <Text style={styles.roleButtonText}>{roleLabel(item.rol)}</Text>
              </TouchableOpacity>
            </View>

            {item.rol === "estudiante" && (
              <Text style={styles.meta}>
                Matrícula: {item.matricula || "No capturada"}
              </Text>
            )}

            <View style={styles.bottomRow}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {item.activo ? "Activo" : "Inactivo"}
                </Text>
                <Switch
                  value={item.activo}
                  onValueChange={() => handleToggleActivo(item.uid, item.activo)}
                  disabled={saving}
                />
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditProfile(item)}
              >
                <Text style={styles.editButtonText}>Editar perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={!!selectedUser}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cambiar rol</Text>
            <Text style={styles.modalSubtitle}>
              {selectedUser?.nombre || "Usuario"}
            </Text>

            {ROLE_OPTIONS.map((role) => (
              <Pressable
                key={role}
                style={[
                  styles.modalRoleOption,
                  selectedUser?.rol === role && styles.modalRoleOptionActive,
                ]}
                onPress={async () => {
                  if (!selectedUser) return;
                  await handleChangeRole(selectedUser.uid, role);
                  setSelectedUser(null);
                }}
              >
                <Text
                  style={[
                    styles.modalRoleText,
                    selectedUser?.rol === role && styles.modalRoleTextActive,
                  ]}
                >
                  {roleLabel(role)}
                </Text>
              </Pressable>
            ))}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedUser(null)}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 20,
    paddingTop: 30,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 18,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DDE7",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#111827",
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  meta: {
    marginTop: 10,
    color: "#4B5563",
    fontSize: 13,
  },
  bottomRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchLabel: {
    fontWeight: "600",
    color: "#111827",
  },
  roleButton: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  roleButtonText: {
    color: "#3730A3",
    fontWeight: "700",
    fontSize: 13,
  },
  editButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  modalSubtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 18,
  },
  modalRoleOption: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  modalRoleOptionActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  modalRoleText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#111827",
  },
  modalRoleTextActive: {
    color: "#2563EB",
  },
  modalCloseButton: {
    marginTop: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
  },
  modalCloseButtonText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#111827",
  },
});