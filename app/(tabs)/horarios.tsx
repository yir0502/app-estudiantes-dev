import React from "react";
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { doc, deleteDoc } from "firebase/firestore";

import { db } from "@/src/api/firebase";
import { useAuth } from "@/src/lib/auth-context";
import { useClasses } from "@/hooks/use-classes";
import { useEnrollments } from "@/hooks/use-enrollments";
import { Colors } from "@/constants/theme";

export default function HorariosScreen() {
  const { user, profile } = useAuth();
  
  // Hooks para Estudiantes
  const { myEnrollments, loading: loadingEnr } = useEnrollments();
  
  // Hooks para Profesores
  const { professorClasses, loading: loadingClasses } = useClasses();

  const isProfessor = profile?.rol === "profesor";
  const loading = isProfessor ? loadingClasses : loadingEnr;

  const data = isProfessor 
    ? professorClasses.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    : myEnrollments.map(enr => enr.classData).filter(Boolean).sort((a, b) => a!.horaInicio.localeCompare(b!.horaInicio));

  const handleRemove = async (id: string, name: string) => {
    const title = isProfessor ? "Eliminar Clase" : "Darse de baja";
    const message = isProfessor 
      ? `¿Estás seguro de que deseas eliminar la clase de ${name}? Se borrará para todos los alumnos.`
      : `¿Deseas darte de baja de la materia ${name}?`;

    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      { 
        text: isProfessor ? "Eliminar" : "Confirmar", 
        style: "destructive", 
        onPress: async () => {
          try {
            if (isProfessor) {
              await deleteDoc(doc(db, "classes", id));
            } else {
              // Buscar el enrollment id
              const enr = myEnrollments.find(e => e.classId === id);
              if (enr) await deleteDoc(doc(db, "enrollments", enr.id));
            }
          } catch (error) {
            Alert.alert("Error", "No se pudo realizar la acción.");
          }
        } 
      }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { borderLeftColor: item.color || Colors.light.tint }]}>
      <View style={styles.cardMain}>
        <View style={styles.cardHeader}>
          <Text style={styles.subject} numberOfLines={1}>{item.materia}</Text>
          <Text style={styles.time}>{item.horaInicio} - {item.horaFin}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.salon}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.dias.join(", ")}</Text>
          </View>
          {isProfessor && (
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color="#6B7280" />
              <Text style={styles.infoText}>Gestionar alumnos en Dashboard</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardActions}>
        {isProfessor && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push({ pathname: "/modals/add-schedule", params: { id: item.id } })}
          >
            <Ionicons name="pencil-outline" size={20} color="#4B5563" />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleRemove(item.id, item.materia)}
        >
          <Ionicons 
            name={isProfessor ? "trash-outline" : "exit-outline"} 
            size={20} 
            color="#EF4444" 
          />
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
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item?.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={isProfessor ? "school-outline" : "calendar-outline"} 
              size={64} color="#D1D5DB" 
            />
            <Text style={styles.emptyTitle}>
              {isProfessor ? "No has creado clases" : "No estás inscrito en ninguna materia"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isProfessor 
                ? "Presiona el botón + para registrar una nueva materia." 
                : "Ve a la pestaña Explorar para buscar y unirte a una clase."}
            </Text>
          </View>
        }
      />

      {isProfessor && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push("/modals/add-schedule")}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      )}
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 5,
  },
  cardMain: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subject: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  time: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.tint,
  },
  cardFooter: {
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
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
  },
});
