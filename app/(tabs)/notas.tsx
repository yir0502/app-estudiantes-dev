import { useEffect, useState, useMemo } from "react";
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAuth } from "@/src/lib/auth-context";
import { useGrades } from "@/hooks/use-grades";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useClasses } from "@/hooks/use-classes";
import { Colors } from "@/constants/theme";

export default function NotasScreen() {
  const { user, profile } = useAuth();
  const { myEnrollments, loading: loadingEnr } = useEnrollments();
  const { grades, loading: gradesLoading } = useGrades();
  const { professorClasses, loading: loadingClasses } = useClasses();

  const scheduleAverages = useMemo(() => {
    if (profile?.rol !== 'estudiante') return [];

    return myEnrollments.map(enr => {
      const classData = enr.classData;
      if (!classData) return null;

      const subjectGrades = grades.filter(g => g.classId === classData.id);
      
      let weightedSum = 0;
      let weightSum = 0;

      subjectGrades.forEach(grad => {
        weightedSum += grad.nota * (grad.porcentaje / 100);
        weightSum += grad.porcentaje;
      });

      return {
        id: classData.id,
        materia: classData.materia,
        color: classData.color,
        average: weightedSum,
        weightSum
      };
    }).filter((s): s is any => s !== null);
  }, [myEnrollments, grades, user, profile?.rol]);

  const globalAverage = useMemo(() => {
    if (scheduleAverages.length === 0) return 0;
    const subjectsWithGrades = scheduleAverages.filter(s => s && s.weightSum > 0);
    if (subjectsWithGrades.length === 0) return 0;
    
    const sum = subjectsWithGrades.reduce((acc, curr) => acc + (curr?.average || 0), 0);
    return sum / subjectsWithGrades.length;
  }, [scheduleAverages]);

  const progressPercentage = useMemo(() => {
    if (scheduleAverages.length === 0) return 0;
    const subjectsEvaluated = scheduleAverages.filter(s => s && s.weightSum === 100).length;
    return (subjectsEvaluated / scheduleAverages.length) * 100;
  }, [scheduleAverages]);

  const renderItemStudent = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: item.color || Colors.light.tint }]}
      onPress={() => router.push({ pathname: "/modals/view-grades", params: { classId: item.id } })}
    >
      <View style={styles.cardInfo}>
        <Text style={styles.subjectName}>{item.materia}</Text>
        <Text style={styles.weightText}>Progreso: {item.weightSum}%</Text>
      </View>
      <View style={styles.averageContainer}>
        <Text style={styles.averageLabel}>Promedio</Text>
        <Text style={[
          styles.averageValue, 
          { color: item.average >= 9 ? "#10B981" : item.average >= 8 ? "#F59E0B" : "#EF4444" }
        ]}>
          {item.average.toFixed(1)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loadingEnr || gradesLoading || loadingClasses) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  // VISTA PROFESOR
  if (profile?.rol === "profesor") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
           <Text style={styles.sectionTitle}>Gestión de Notas</Text>
           <Text style={styles.weightText}>Selecciona una clase para calificar alumnos</Text>
        </View>
        <FlatList
          data={professorClasses}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { borderLeftColor: item.color || Colors.light.tint }]}
              onPress={() => router.push({ 
                pathname: "/admin/manage-students", 
                params: { classId: item.id, className: item.materia } 
              })}
            >
              <View style={styles.cardInfo}>
                <Text style={styles.subjectName}>{item.materia}</Text>
                <Text style={styles.weightText}>
                  {Array.isArray(item.dias) ? item.dias.join(', ') : ''} | {item.horaInicio}
                </Text>
              </View>
              <Ionicons name="people-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Sin clases asignadas</Text>
              <Text style={styles.emptySubtitle}>No tienes clases registradas en este periodo.</Text>
            </View>
          }
        />
      </View>
    );
  }

  // VISTA ESTUDIANTE
  return (
    <View style={styles.container}>
      <View style={styles.dashboard}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Promedio General</Text>
          <Text style={[
            styles.statValue,
            { color: globalAverage >= 9 ? "#10B981" : globalAverage >= 8 ? "#F59E0B" : "#EF4444" }
          ]}>
            {globalAverage.toFixed(2)}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Avance Materias</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
          </View>
        </View>
      </View>

      {scheduleAverages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No hay materias inscritas</Text>
          <Text style={styles.emptySubtitle}>Inscríbete a materias en la pestaña Explorar para gestionar tus notas.</Text>
        </View>
      ) : (
        <FlatList
          data={scheduleAverages}
          renderItem={renderItemStudent}
          keyExtractor={item => item?.id || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Materias Inscritas</Text>}
        />
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
  header: {
    backgroundColor: "#FFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  dashboard: {
    backgroundColor: "#FFF",
    padding: 20,
    flexDirection: "row",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 10,
    color: "#6B7280",
    textTransform: "uppercase",
    fontWeight: "800",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#003B5C",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    minWidth: 35,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    borderLeftWidth: 5,
  },
  cardInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  weightText: {
    fontSize: 13,
    color: "#6B7280",
  },
  averageContainer: {
    alignItems: "flex-end",
    marginRight: 10,
  },
  averageLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  averageValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 40,
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
});
