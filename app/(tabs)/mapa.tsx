import React, { useMemo } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";

import { useAuth } from "@/src/lib/auth-context";
import { useGrades } from "@/hooks/use-grades";
import { useEnrollments } from "@/hooks/use-enrollments";
import { STUDY_PLANS, PlanSubject } from "@/src/domain/study-plan";
import { PlanEstudio } from "@/src/domain/user";
import { Colors } from "@/constants/theme";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function MapaGraficoScreen() {
  const { profile, loading: authLoading } = useAuth();
  const { grades, loading: gradesLoading } = useGrades();
  const { myEnrollments, loading: enrollmentsLoading } = useEnrollments();

  const [selectedPlanProfesor, setSelectedPlanProfesor] = React.useState<PlanEstudio | "">("");

  const studentProfile = profile?.rol === 'estudiante' ? profile : null;
  const isProfesor = profile?.rol === 'profesor';
  const planName = isProfesor ? selectedPlanProfesor : studentProfile?.planEstudio;
  const currentPlan = planName ? STUDY_PLANS[planName as PlanEstudio] : null;

  const subjectStates = useMemo(() => {
    if (!currentPlan) return [];

    return currentPlan.materias.map((planSub: PlanSubject) => {
      // 1. Buscar en myEnrollments si hay una inscripción donde classData.materia coincida
      const enrollment = myEnrollments.find(enr => 
        enr.classData?.materia.toLowerCase() === planSub.materia.toLowerCase()
      );

      if (!enrollment) {
        return { ...planSub, status: 'pendiente' as const, finalGrade: 0, totalWeight: 0 };
      }

      // 2. Si hay inscripción, filtrar grades usando el classId de esa inscripción
      const subjectGrades = grades.filter(g => g.classId === enrollment.classId);
      
      if (subjectGrades.length === 0) {
        return { ...planSub, status: 'cursando' as const, finalGrade: 0, totalWeight: 0 };
      }

      // 3. Si hay grades, calcular promedio ponderado
      let weightedSum = 0;
      let totalWeight = 0;

      subjectGrades.forEach(g => {
        weightedSum += g.nota * (g.porcentaje / 100);
        totalWeight += g.porcentaje;
      });

      // El promedio final es la suma ponderada actual (si totalWeight < 100, es el promedio parcial)
      const finalGrade = weightedSum;
      const status = finalGrade >= 6.0 ? 'aprobada' : 'reprobada';

      return {
        ...planSub,
        status,
        finalGrade,
        totalWeight
      };
    });
  }, [currentPlan, grades, myEnrollments]);

  const semesters = useMemo(() => {
    const sems: Record<number, any[]> = {};
    subjectStates.forEach((sub: any) => {
      if (!sems[sub.semestre]) sems[sub.semestre] = [];
      sems[sub.semestre].push(sub);
    });
    return Object.keys(sems).sort((a, b) => Number(a) - Number(b)).map(Number);
  }, [subjectStates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobada': return "#FFB81C"; // Dorado BUAP
      case 'cursando': return "#003B5C"; // Azul BUAP
      case 'reprobada': return "#EF4444"; // Rojo
      default: return "#E5E7EB"; // Gris
    }
  };

  const getStatusTextColor = (status: string) => {
    return status === 'pendiente' ? "#6B7280" : "#FFFFFF";
  };

  if (authLoading || gradesLoading || enrollmentsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (isProfesor && !selectedPlanProfesor) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="map-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Explorador de Planes</Text>
        <Text style={styles.emptySubtitle}>Selecciona un plan de estudios para consultar sus materias.</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedPlanProfesor}
            onValueChange={(val) => setSelectedPlanProfesor(val as PlanEstudio)}
            style={{ height: 50 }}
          >
            <Picker.Item label="Seleccionar Plan..." value="" />
            <Picker.Item label="Anterior a 2016" value="Anterior 2016" />
            <Picker.Item label="2016 - 2023" value="2016-2023" />
            <Picker.Item label="2024" value="2024" />
          </Picker>
        </View>
      </View>
    );
  }

  if (!isProfesor && !studentProfile) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="lock-closed-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Acceso Restringido</Text>
        <Text style={styles.emptySubtitle}>Esta sección es exclusiva para estudiantes.</Text>
      </View>
    );
  }

  if (!isProfesor && !planName) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="map-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Plan no seleccionado</Text>
        <Text style={styles.emptySubtitle}>Por favor, selecciona tu Plan de Estudios en tu perfil para ver el mapa.</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push("/perfil")}
        >
          <Text style={styles.actionButtonText}>Ir a Perfil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.planTitle}>{currentPlan?.nombre}</Text>
          {isProfesor && (
            <TouchableOpacity onPress={() => setSelectedPlanProfesor("")}>
              <Text style={styles.changePlanText}>Cambiar Plan</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.planDesc}>{currentPlan?.descripcion}</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: "#FFB81C" }]} /><Text style={styles.legendText}>Aprobada</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: "#003B5C" }]} /><Text style={styles.legendText}>Cursando</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: "#EF4444" }]} /><Text style={styles.legendText}>Reprobada</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: "#E5E7EB" }]} /><Text style={styles.legendText}>Pendiente</Text></View>
      </View>

      {semesters.map(sem => (
        <View key={sem} style={styles.semesterContainer}>
          <Text style={styles.semesterTitle}>Semestre {sem}</Text>
          <View style={styles.grid}>
            {subjectStates.filter(s => s.semestre === sem).map(sub => (
              <TouchableOpacity 
                key={sub.id} 
                style={[styles.subjectCard, { backgroundColor: getStatusColor(sub.status) }]}
                onPress={() => {
                  if (sub.status !== 'pendiente') {
                    Alert.alert(
                      sub.materia, 
                      `Estado: ${sub.status.toUpperCase()}\nPromedio Parcial: ${sub.finalGrade.toFixed(1)}\nProgreso: ${sub.totalWeight || 0}%`
                    );
                  } else {
                    Alert.alert(sub.materia, "Esta materia aún no ha sido cursada.");
                  }
                }}
              >
                <View>
                  <Text style={[styles.subjectCode, { color: getStatusTextColor(sub.status) }]}>{sub.codigo}</Text>
                  <Text 
                    style={[styles.subjectName, { color: getStatusTextColor(sub.status) }]}
                    numberOfLines={2}
                  >
                    {sub.materia}
                  </Text>
                </View>
                {sub.status !== 'pendiente' && (
                  <View style={styles.cardFooter}>
                    <Text style={[styles.gradeText, { color: getStatusTextColor(sub.status) }]}>
                      {sub.finalGrade.toFixed(1)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#003B5C",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changePlanText: {
    color: "#003B5C",
    fontWeight: "700",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  planDesc: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  pickerWrapper: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 24,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#4B5563",
  },
  semesterContainer: {
    marginBottom: 24,
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    paddingLeft: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  subjectCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    padding: 12,
    minHeight: 110,
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subjectCode: {
    fontSize: 10,
    fontWeight: "800",
    opacity: 0.8,
    marginBottom: 2,
  },
  subjectName: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardFooter: {
    alignItems: "flex-end",
  },
  gradeText: {
    fontSize: 18,
    fontWeight: "900",
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
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: "#003B5C",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "700",
  }
});
