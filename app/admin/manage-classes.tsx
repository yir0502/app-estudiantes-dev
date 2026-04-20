import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useClasses } from "@/hooks/use-classes";
import { useEnrollments } from "@/hooks/use-enrollments";
import { Colors } from "@/constants/theme";
import React from 'react';

export default function ManageClassesScreen() {
  const { professorClasses, loading } = useClasses();
  const { useNewEnrollmentsCount } = useEnrollments();

  const ClassItem = ({ item }: { item: any }) => {
    // Hook para contar nuevos alumnos específicos de ESTA clase
    const newCount = useNewEnrollmentsCount([item.id]);

    return (
      <TouchableOpacity 
        style={styles.classCard}
        onPress={() => router.push({ 
          pathname: "/admin/manage-students", 
          params: { classId: item.id, className: item.materia } 
        })}
      >
        <View style={[styles.colorBar, { backgroundColor: item.color || Colors.light.tint }]} />
        <View style={styles.classInfo}>
          <Text style={styles.className}>{item.materia}</Text>
          <Text style={styles.classDetails}>{item.salon} • {item.horaInicio}-{item.horaFin}</Text>
        </View>
        
        {newCount > 0 && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{newCount}</Text>
          </View>
        )}
        
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Materias</Text>
        <Text style={styles.subtitle}>Selecciona una materia para gestionar alumnos.</Text>
      </View>

      <FlatList
        data={professorClasses}
        renderItem={({ item }) => <ClassItem item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="school-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No has creado ninguna clase aún.</Text>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 24,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  classCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: "hidden",
  },
  colorBar: {
    width: 6,
    height: "100%",
  },
  classInfo: {
    flex: 1,
    padding: 16,
  },
  className: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  classDetails: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  newBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 6,
  },
  newBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
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
