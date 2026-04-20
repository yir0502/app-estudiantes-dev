import React, { useEffect } from "react";
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Alert
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/src/api/firebase";
import { useEnrollments } from "@/hooks/use-enrollments";
import { Colors } from "@/constants/theme";

export default function ManageStudentsScreen() {
  const { classId, className } = useLocalSearchParams<{ classId: string; className: string }>();
  const { useClassMembers } = useEnrollments();
  const { members, markAsViewed } = useClassMembers(classId || "");

  // Cuando se entra a la pantalla, marcamos a todos como vistos tras un pequeño delay
  // para que el profesor alcance a ver quién era nuevo.
  useEffect(() => {
    const timer = setTimeout(() => {
      markAsViewed();
    }, 2000);
    return () => clearTimeout(timer);
  }, [members.length]);

  const removeStudent = (enrollmentId: string, studentName: string) => {
    Alert.alert(
      "Remover Alumno",
      `¿Estás seguro de que deseas eliminar a ${studentName} de esta clase?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "enrollments", enrollmentId));
            } catch (error) {
              Alert.alert("Error", "No se pudo remover al alumno.");
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.studentCard, !item.viewedByProfessor && styles.newStudentCard]}
      onPress={() => router.push({ 
        pathname: "/modals/view-grades", 
        params: { classId, studentId: item.studentId, studentName: item.studentNombre } 
      })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.studentNombre.charAt(0)}</Text>
      </View>
      <View style={styles.studentInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.studentName}>{item.studentNombre}</Text>
          {!item.viewedByProfessor && (
            <View style={styles.newTag}>
              <Text style={styles.newTagText}>NUEVO</Text>
            </View>
          )}
        </View>
        <Text style={styles.studentDetails}>Inscrito: {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeStudent(item.id, item.studentNombre)}
      >
        <Ionicons name="person-remove-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{className}</Text>
          <Text style={styles.subtitle}>{members.length} Alumnos inscritos</Text>
        </View>
      </View>

      <FlatList
        data={members}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Aún no hay alumnos inscritos.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  list: {
    padding: 16,
  },
  studentCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  newStudentCard: {
    backgroundColor: "#FEFCE8", // Amarillo muy suave para resaltar
    borderColor: "#FDE047",
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  studentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  newTag: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newTagText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
  },
  studentDetails: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  removeButton: {
    padding: 10,
  },
  empty: {
    alignItems: "center",
    marginTop: 100,
    gap: 12,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
});
