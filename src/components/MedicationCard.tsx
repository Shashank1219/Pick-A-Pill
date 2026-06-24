import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, Droplet, Link, Syringe } from 'lucide-react-native';

import { StatusCircle } from '@/components/StatusCircle';
import {
  DoseRecord,
  DoseStatus,
  FormFactor,
  Medication,
} from '@/types';
import { Colors } from '@/tokens/colors';
import { CardShadow, CardSurfaceClip } from '@/tokens/elevation';
import { Typography } from '@/tokens/typography';
import { cycleDoseStatus } from '@/utils/courseHelpers';
import { formatTime } from '@/utils/dateHelpers';

interface Props {
  medication: Medication;
  slotTime: string;
  date: string;
  doseRecord?: DoseRecord;
  displayStatus: DoseStatus;
  onToggle: (status: DoseStatus) => void;
  disabled?: boolean;
}

function FormFactorIcon({ formFactor }: { formFactor: FormFactor }) {
  const color = Colors.navy;
  const size = 20;
  switch (formFactor) {
    case 'Liquid':
      return <Droplet size={size} color={color} />;
    case 'Injection':
      return <Syringe size={size} color={color} />;
    default:
      return <Link size={size} color={color} />;
  }
}

function StatusBadge({ status }: { status: DoseStatus }) {
  if (status === 'taken') {
    return (
      <View style={styles.badgeTaken}>
        <Text style={styles.badgeTextOnColor}>Taken</Text>
      </View>
    );
  }
  if (status === 'missed') {
    return (
      <View style={styles.badgeMissed}>
        <Text style={styles.badgeTextOnColor}>Missed</Text>
      </View>
    );
  }
  return (
    <View style={styles.badgePending}>
      <Text style={styles.badgeTextMuted}>Pending</Text>
    </View>
  );
}

export function MedicationCard({
  medication,
  slotTime,
  displayStatus,
  onToggle,
  disabled = false,
}: Props) {
  const cardStyle =
    displayStatus === 'taken'
      ? styles.takenCard
      : displayStatus === 'missed'
        ? styles.missedCard
        : styles.pendingCard;

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    onToggle(cycleDoseStatus(displayStatus));
  };

  const dosageLabel = medication.dosageStrength.trim() || '—';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        CardShadow,
        CardSurfaceClip,
        cardStyle,
        disabled && styles.disabledCard,
      ]}
      onPress={handleToggle}
      activeOpacity={disabled ? 1 : 0.75}
      disabled={disabled}>
      <View style={styles.iconWrap}>
        <FormFactorIcon formFactor={medication.formFactor} />
      </View>
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.name,
              displayStatus === 'taken' && styles.nameTaken,
            ]}>
            {medication.name}
          </Text>
          <StatusBadge status={displayStatus} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            {dosageLabel} · {medication.formFactor}
          </Text>
          <Text style={styles.meta}> · </Text>
          <Clock size={12} color={Colors.textMuted} />
          <Text style={styles.meta}> {formatTime(slotTime)}</Text>
        </View>
      </View>
      <StatusCircle
        status={displayStatus}
        onToggle={disabled ? () => {} : handleToggle}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  takenCard: {
    backgroundColor: Colors.takenBg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.takenBorder,
  },
  missedCard: {
    backgroundColor: Colors.missedBg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.missedBorder,
  },
  pendingCard: {
    backgroundColor: Colors.pendingBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledCard: {
    opacity: 0.55,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(62, 207, 178, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  name: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  nameTaken: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  badgeTaken: {
    backgroundColor: Colors.mint,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeMissed: {
    backgroundColor: Colors.coral,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgePending: {
    backgroundColor: Colors.progressBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeTextOnColor: {
    ...Typography.caption,
    color: Colors.textOnNavy,
    fontWeight: '600',
  },
  badgeTextMuted: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  meta: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
