import { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from "react-native";
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    updateDoc, 
    doc,
    deleteDoc
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert } from "react-native";

import { db } from "@/src/api/firebase";
import { useAuth } from "@/src/lib/auth-context";
import { Task, TaskPriority } from "@/src/domain/task";
import { Colors } from "@/constants/theme";

export default function TareasScreen() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("fechaEntrega", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        completada: !currentStatus
      });
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    Alert.alert(
      "Eliminar Tarea",
      "¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "tasks", taskId));
            } catch (error) {
              console.error("Error al eliminar tarea:", error);
              Alert.alert("Error", "No se pudo eliminar la tarea.");
            }
          } 
        }
      ]
    );
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "alta": return "#EF4444";
      case "media": return "#F59E0B";
      case "baja": return "#10B981";
      default: return "#6B7280";
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.checkButton} 
        onPress={() => toggleTask(item.id, item.completada)}
      >
        <Ionicons 
          name={item.completada ? "checkbox" : "square-outline"} 
          size={24} 
          color={item.completada ? "#10B981" : "#D1D5DB"} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.content}
        onPress={() => router.push({ pathname: "/modals/view-task" as any, params: { id: item.id } })}
      >
        <Text style={[styles.title, item.completada && styles.completedText]} numberOfLines={1}>
          {item.titulo}
        </Text>
        <Text style={styles.details}>{item.materiaNombre || "General"}</Text>
        <View style={styles.footer}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.prioridad) }]}>
            <Text style={styles.priorityText}>{item.prioridad}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => router.push({ pathname: "/modals/add-task", params: { id: item.id } })}
        >
          <Ionicons name="pencil-outline" size={20} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => deleteTask(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Sin tareas pendientes</Text>
          <Text style={styles.emptySubtitle}>Disfruta de tu tiempo libre o registra un nuevo pendiente.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push("/modals/add-task")}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  checkButton: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  details: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: Colors.light.tint,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
