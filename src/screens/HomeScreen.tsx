import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Paragraph, Title } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';

interface UserInfo {
  full_name?: string;
  [key: string]: any;
}

interface AuthContextType {
  userInfo?: UserInfo;
}

const HomeScreen: React.FC = () => {
  const { userInfo } = useContext(AuthContext) ?? {};
  const [greeting, setGreeting] = useState<string>('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.greetingCard}>
        <LinearGradient
          colors={['#06b6d4', '#3b82f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Card.Content>
            <View style={styles.greetingHeader}>
              <Icon name="hand-wave" size={28} color="#ffffff" />
              <Title style={styles.greetingText}>
                {greeting}, {userInfo?.full_name || 'User'}!
              </Title>
            </View>
            <Paragraph style={styles.greetingSubtext}>
              Explore your courses, track progress, and manage your learning journey.
            </Paragraph>
          </Card.Content>
        </LinearGradient>
      </Card>

      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { borderTopWidth: 4, borderTopColor: '#1d4ed8' }]}>
          <Card.Content style={styles.centerContent}>
            <Icon name="book-open-variant" size={32} color="#1d4ed8" />
            <Title style={styles.statTitle}>10</Title>
            <Paragraph style={styles.statLabel}>Enrolled Courses</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { borderTopWidth: 4, borderTopColor: '#ff7900' }]}>
          <Card.Content style={styles.centerContent}>
            <Icon name="rocket-launch" size={32} color="#ff7900" />
            <Title style={styles.statTitle}>200</Title>
            <Paragraph style={styles.statLabel}>Courses Available</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { borderTopWidth: 4, borderTopColor: '#10b981' }]}>
          <Card.Content style={styles.centerContent}>
            <Icon name="clock-outline" size={32} color="#10b981" />
            <Title style={styles.statTitle}>3</Title>
            <Paragraph style={styles.statLabel}>Ongoing Courses</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { borderTopWidth: 4, borderTopColor: '#8b5cf6' }]}>
          <Card.Content style={styles.centerContent}>
            <Icon name="check-circle" size={32} color="#8b5cf6" />
            <Title style={styles.statTitle}>5</Title>
            <Paragraph style={styles.statLabel}>Completed Courses</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.sectionHeader}>
        <Icon name="book-education" size={24} color="#1d4ed8" />
        <Title style={styles.sectionTitle}>Enrolled Trainings</Title>
      </View>
      {[1, 2].map((i) => (
        <Card key={i} style={styles.courseCard}>
          <Card.Content>
            <View style={styles.courseHeader}>
              <Icon name="bookmark" size={20} color="#1d4ed8" />
              <Title style={styles.cardTitle}>Training {i}</Title>
            </View>
            <Paragraph style={styles.cardText}>Brief description of enrolled training.</Paragraph>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${Math.random() * 100}%` }]} />
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* Ongoing Trainings */}
      <View style={styles.sectionHeader}>
        <Icon name="progress-clock" size={24} color="#ff7900" />
        <Title style={styles.sectionTitle}>Ongoing Trainings</Title>
      </View>
      {[1].map((i) => (
        <Card key={i} style={[styles.courseCard, { borderLeftWidth: 4, borderLeftColor: '#ff7900' }]}>
          <Card.Content>
            <View style={styles.courseHeader}>
              <Icon name="alert-circle" size={20} color="#ff7900" />
              <Title style={styles.cardTitle}>Ongoing Training {i}</Title>
            </View>
            <Paragraph style={styles.cardText}>Session schedule and progress update.</Paragraph>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '65%', backgroundColor: '#ff7900' }]} />
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* Available Courses */}
      <View style={styles.sectionHeader}>
        <Icon name="school" size={24} color="#8b5cf6" />
        <Title style={styles.sectionTitle}>Available Courses</Title>
      </View>
      {[1, 2, 3].map((i) => (
        <Card key={i} style={styles.courseCard}>
          <Card.Content>
            <View style={styles.courseHeader}>
              <Icon name="star-circle" size={20} color="#8b5cf6" />
              <Title style={styles.cardTitle}>Course {i}</Title>
            </View>
            <Paragraph style={styles.cardText}>Short description of course content.</Paragraph>
            <View style={styles.courseFooter}>
              <Text style={styles.difficultyText}>Beginner</Text>
              <Text style={styles.durationText}>2 weeks</Text>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  greetingCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 24, elevation: 4 },
  gradient: { paddingVertical: 24, paddingHorizontal: 20 },
  greetingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  greetingText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginLeft: 8 },
  greetingSubtext: { color: '#e0f2fe', fontSize: 14, lineHeight: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { flex: 1, marginHorizontal: 6, borderRadius: 12, elevation: 2, backgroundColor: '#ffffff', paddingVertical: 12 },
  centerContent: { alignItems: 'center' },
  statTitle: { color: '#1e293b', marginTop: 8, fontWeight: 'bold', fontSize: 22 },
  statLabel: { color: '#64748b', fontSize: 12, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionTitle: { marginLeft: 8, fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  courseCard: { marginBottom: 12, borderRadius: 12, elevation: 1, backgroundColor: '#ffffff', paddingVertical: 8 },
  courseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardTitle: { color: '#1e293b', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  cardText: { color: '#64748b', fontSize: 13, marginBottom: 12 },
  progressContainer: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#1d4ed8' },
  courseFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  difficultyText: { color: '#10b981', fontSize: 12, fontWeight: '500' },
  durationText: { color: '#64748b', fontSize: 12 },
});
