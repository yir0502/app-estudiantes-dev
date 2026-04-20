import { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { db } from "@/src/api/firebase";
import { Task, TaskPriority } from "@/src/domain/task";
import { Colors } from "@/constants/theme";

export default function ViewTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      try {
        const docRef = doc(db, "tasks", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTask({ id: docSnap.id, ...docSnap.data() } as Task);
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "alta": return "#EF4444";
      case "media": return "#F59E0B";
      case "baja": return "#10B981";
      default: return "#6B7280";
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró la tarea.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.titulo}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.prioridad) }]}>
          <Text style={styles.priorityText}>{task.prioridad.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Ionicons name="book-outline" size={20} color="#6B7280" />
          <Text style={styles.infoLabel}>Materia:</Text>
          <Text style={styles.infoValue}>{task.materiaNombre || "General"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="pricetag-outline" size={20} color="#6B7280" />
          <Text style={styles.infoLabel}>Tipo:</Text>
          <Text style={styles.infoValue}>{task.tipo || "Tarea"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle-outline" size={20} color={task.completada ? "#10B981" : "#6B7280"} />
          <Text style={styles.infoLabel}>Estado:</Text>
          <Text style={[styles.infoValue, task.completada && { color: "#10B981", fontWeight: "700" }]}>
            {task.completada ? "Completada" : "Pendiente"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.label}>Descripción</Text>
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>
          {task.descripcion || "Sin descripción adicional."}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.editButton} 
        onPress={() => {
          router.back();
          router.push({ pathname: "/modals/add-task", params: { id: task.id } });
        }}
      >
        <Ionicons name="pencil" size={20} color="#FFF" />
        <Text style={styles.editButtonText}>Editar Tarea</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    gap: 16,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: "#6B7280",
    width: 70,
  },
  infoValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  descriptionCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    minHeight: 120,
    elevation: 1,
  },
  descriptionText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  editButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
});
