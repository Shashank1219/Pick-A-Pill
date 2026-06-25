import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { addDays, format, parseISO } from 'date-fns';
import { Bell } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { DateChip } from '@/components/DateChip';
import { MedicationCard } from '@/components/MedicationCard';
import { ProgressCard } from '@/components/ProgressCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useCourseStore } from '@/stores/useCourseStore';
import { useDoseStore } from '@/stores/useDoseStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { RootStackParamList, TabParamList } from '@/navigation/types';
import { DoseStatus, Medication } from '@/types';
import {
  computeAdherenceStats,
  computeCourseStatus,
  computeDisplayStatus,
  getMedicationSlots,
  getTimeOfDay,
  isDoseScheduledOnDate,
} from '@/utils/courseHelpers';
import { todayString } from '@/utils/dateHelpers';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

type TimelineSlot = {
  medication: Medication;
  courseId: string;
  medicationId: string;
  slotTime: string;
};

const SECTIONS = [
  { key: 'morning' as const, title: '🌅 Morning' },
  { key: 'afternoon' as const, title: '☀️ Afternoon' },
  { key: 'evening' as const, title: '🌙 Evening' },
];

function greetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning,';
  }
  if (hour < 17) {
    return 'Good afternoon,';
  }
  return 'Good evening,';
}

export function DashboardScreen({ navigation }: Props) {
  const profile = useProfileStore(s => s.profile);
  const courses = useCourseStore(s => s.courses);
  const markDose = useDoseStore(s => s.markDose);
  const getDoseForDay = useDoseStore(s => s.getDoseForDay);
  const records = useDoseStore(s => s.records);

  const [selectedDate, setSelectedDate] = useState(todayString());

  const dateChips = useMemo(() => {
    const today = parseISO(todayString());
    return Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));
  }, []);

  const activeCourses = useMemo(
    () => courses.filter(c => computeCourseStatus(c).isActive),
    [courses],
  );
  const stats = useMemo(
    () => computeAdherenceStats(courses, records),
    [courses, records],
  );
  const isToday = selectedDate === todayString();
  const isFutureDate = selectedDate > todayString();

  const { missedTodayCount, hasMissedToday } = useMemo(() => {
    const today = todayString();
    let count = 0;
    for (const course of activeCourses) {
      for (const medication of course.medications) {
        if (!isDoseScheduledOnDate(medication, course, today)) {
          continue;
        }
        for (const slot of getMedicationSlots(medication)) {
          const record = getDoseForDay(slot.medicationId, today);
          const status = computeDisplayStatus(
            record,
            medication,
            today,
            slot.slotTime,
          );
          if (status === 'missed') {
            count += 1;
          }
        }
      }
    }
    return { missedTodayCount: count, hasMissedToday: count > 0 };
  }, [activeCourses, getDoseForDay, records]);

  const handleBellPress = () => {
    if (missedTodayCount === 0) {
      ToastAndroid.show('No missed doses today', ToastAndroid.SHORT);
      return;
    }
    const label = missedTodayCount === 1 ? 'dose' : 'doses';
    ToastAndroid.show(
      `${missedTodayCount} ${label} missed today`,
      ToastAndroid.SHORT,
    );
  };

  const slots = useMemo(() => {
    const result: TimelineSlot[] = [];
    for (const course of courses) {
      for (const medication of course.medications) {
        if (!isDoseScheduledOnDate(medication, course, selectedDate)) {
          continue;
        }
        for (const slot of getMedicationSlots(medication)) {
          result.push({
            medication,
            courseId: course.id,
            medicationId: slot.medicationId,
            slotTime: slot.slotTime,
          });
        }
      }
    }
    return result;
  }, [courses, selectedDate]);

  const openAddFlow = () => {
    navigation.navigate('AddMedicationFlow', {});
  };

  if (activeCourses.length === 0) {
    return (
      <View style={[styles.container, styles.emptyWrap]}>
        <Text style={styles.emptyTitle}>No medications today</Text>
        <TouchableOpacity onPress={openAddFlow} activeOpacity={0.75}>
          <Text style={styles.emptyLink}>Add a course →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greetingPrefix()}</Text>
          <Text style={styles.name}>{profile?.name ?? 'User'} 👋</Text>
        </View>
        <TouchableOpacity onPress={handleBellPress} activeOpacity={0.75}>
          <Bell size={24} color={Colors.navy} />
          {hasMissedToday && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.datePicker}>
        {dateChips.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          return (
            <DateChip
              key={dateStr}
              date={date}
              isSelected={selectedDate === dateStr}
              onPress={() => setSelectedDate(dateStr)}
            />
          );
        })}
      </ScrollView>

      {isToday && stats.todayTotal > 0 && (
        <View style={styles.progressWrap}>
          <ProgressCard taken={stats.todayTaken} total={stats.todayTotal} />
        </View>
      )}

      {SECTIONS.map(section => {
        const sectionSlots = slots.filter(
          s => getTimeOfDay(s.slotTime) === section.key,
        );
        const done = sectionSlots.filter(s => {
          const record = getDoseForDay(s.medicationId, selectedDate);
          return (
            computeDisplayStatus(
              record,
              s.medication,
              selectedDate,
              s.slotTime,
            ) === 'taken'
          );
        }).length;

        return (
          <View key={section.key} style={styles.section}>
            <SectionHeader
              title={section.title}
              doneCount={done}
              totalCount={sectionSlots.length}
            />
            {sectionSlots.length === 0 ? (
              <Text style={styles.nothing}>Nothing scheduled</Text>
            ) : (
              sectionSlots.map(slot => {
                const record = getDoseForDay(
                  slot.medicationId,
                  selectedDate,
                );
                const displayStatus = computeDisplayStatus(
                  record,
                  slot.medication,
                  selectedDate,
                  slot.slotTime,
                );
                return (
                  <MedicationCard
                    key={`${slot.medicationId}-${selectedDate}`}
                    medication={slot.medication}
                    slotTime={slot.slotTime}
                    date={selectedDate}
                    displayStatus={displayStatus}
                    disabled={isFutureDate}
                    onToggle={(status: DoseStatus) =>
                      markDose(
                        slot.courseId,
                        slot.medicationId,
                        selectedDate,
                        status,
                      )
                    }
                  />
                );
              })
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 48,
  },
  greeting: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  name: {
    ...Typography.display,
    color: Colors.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.coral,
  },
  datePicker: {
    marginTop: 20,
  },
  progressWrap: {
    marginTop: 20,
  },
  section: {
    marginTop: 24,
  },
  nothing: {
    ...Typography.caption,
    color: Colors.textMuted,
    paddingVertical: 12,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    ...Typography.title,
    color: Colors.textMuted,
  },
  emptyLink: {
    ...Typography.bodySemiBold,
    color: Colors.mint,
    marginTop: 12,
  },
});
