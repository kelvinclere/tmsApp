import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../../lib/axiosInstance';
import { Button, Chip, Snackbar, Card, Title, Paragraph } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserProfile, ApiResponse } from '../../types/UserProfile';
import ProfileUpdateModal from '../components/ProfileUpdateModal';

const { width } = Dimensions.get('window');

const Colors = {
  primary: '#0047AB',
  accent: '#FFD700',
  background: '#F0F4F8',
  surface: '#FFFFFF',
  text: '#333333',
  subtleText: '#666666',
  success: '#4CAF50',
  error: '#EF4444',
};

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const { userInfo, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get<ApiResponse<UserProfile>>('/v1/cemastea/user/profile');
      const userData = response.data.user || response.data.data?.user;

      if (!userData) {
        throw new Error('User data not found in response');
      }

      setProfile({
        ...userData,
        phone: userData.phone || '',
        citizenship: userData.citizenship || 'Kenyan',
        sex: userData.sex || '',
        id_number: userData.id_number || '',
        tsc_number: userData.tsc_number || '',
        school_name: userData.school_name || '',
        school_county: userData.school_county || '',
        school_sub_county: userData.school_sub_county || '',
        organization_name: userData.organization_name || '',
        designation: userData.designation || '',
        teaching: userData.teaching || [],
        profile_completed: userData.profile_completed || false,
      });

      if (!userData.profile_completed) {
        setModalVisible(true);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile');
      if (err.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again', [{ text: 'OK', onPress: logout }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axiosInstance.get('/v1/cemastea/subjects');
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setSubjects(['Mathematics', 'English', 'Kiswahili', 'Science', 'History', 'Geography', 'CRE', 'IRE', 'Business']);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchSubjects();
    }
  }, [isAuthenticated]);

  const handleUpdateClick = () => {
    setModalVisible(true);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onDismissSnackbar = () => {
    setSnackbarVisible(false);
  };

  const getGenderIcon = () => {
    if (profile?.sex === 'Male') return <Icon name="gender-male" size={20} color={Colors.primary} />;
    if (profile?.sex === 'Female') return <Icon name="gender-female" size={20} color={Colors.accent} />;
    return <Icon name="gender-male-female" size={20} color={Colors.subtleText} />;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={40} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchProfile} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Icon name="account-circle" size={90} color={Colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Title style={styles.name}>{profile?.first_name} {profile?.last_name}</Title>
              <View style={styles.emailContainer}>
                <Icon name="email" size={16} color={Colors.subtleText} />
                <Paragraph style={styles.email}>{profile?.email}</Paragraph>
                {profile?.profile_completed && (
                  <Chip icon="check-circle" style={styles.verifiedChip}>Verified</Chip>
                )}
              </View>
              <View style={styles.tagsContainer}>
                <Chip icon="earth" style={styles.tagChip}>
                  {profile?.citizenship || 'Not specified'}
                </Chip>
                <Chip icon={() => getGenderIcon()} style={styles.tagChip}>
                  {profile?.sex || 'Not specified'}
                </Chip>
                <Chip
                  icon={profile?.sne ? "alert-circle" : "account"}
                  style={[styles.tagChip, { backgroundColor: profile?.sne ? '#fef3c7' : Colors.background }]}
                >
                  {profile?.sne ? 'Special Needs' : 'No Special Needs'}
                </Chip>
              </View>
            </View>
            <Button
              mode="contained"
              style={styles.editButton}
              onPress={handleUpdateClick}
              icon="pencil"
            >
              Update
            </Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="account-box-multiple" size={24} color={Colors.primary} />
            <Title style={styles.cardTitle}>Personal Information</Title>
          </View>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>First Name</Text>
              <Text style={styles.detailValue}>{profile?.first_name || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Name</Text>
              <Text style={styles.detailValue}>{profile?.last_name || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{profile?.phone || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>ID/Passport</Text>
              <Text style={styles.detailValue}>{profile?.id_number || 'Not provided'}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="briefcase" size={24} color={Colors.primary} />
            <Title style={styles.cardTitle}>Professional Information</Title>
          </View>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Organization</Text>
              <Text style={styles.detailValue}>{profile?.organization_name || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Designation</Text>
              <Text style={styles.detailValue}>{profile?.designation || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>TSC Number</Text>
              <Text style={styles.detailValue}>{profile?.tsc_number || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>School</Text>
              <Text style={styles.detailValue}>{profile?.school_name || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {profile?.school_sub_county && profile?.school_county ?
                  `${profile.school_sub_county}, ${profile.school_county}` :
                  'Not provided'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Subjects</Text>
              <View style={styles.subjectsContainer}>
                {profile?.teaching?.length ?
                  profile.teaching.map((subject, index) => (
                    <Chip key={index} style={styles.subjectChip}>{subject}</Chip>
                  )) :
                  <Text style={styles.detailValue}>Not provided</Text>}
              </View>
            </View>
          </View>
        </Card>

        <Button mode="contained" style={styles.logoutButton} onPress={logout} icon="logout">
          Logout
        </Button>
      </ScrollView>

      {profile && (
        <ProfileUpdateModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          initialValues={profile}
          subjectsList={subjects}
          onSuccess={() => {
            setModalVisible(false);
            fetchProfile();
            showSnackbar('Profile updated successfully!');
          }}
          onError={(message) => {
            showSnackbar(message);
          }}
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={onDismissSnackbar}
        action={{
          label: 'Dismiss',
          onPress: onDismissSnackbar,
        }}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 16,
    paddingTop: 30,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.primary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.error,
    marginVertical: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    padding: 20,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 20,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  email: {
    marginLeft: 8,
    color: Colors.subtleText,
  },
  verifiedChip: {
    marginLeft: 8,
    backgroundColor: Colors.success,
    height: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Aligns chips vertically
    justifyContent: 'flex-start',
    flexWrap: 'wrap', // Wraps chips to the next line if needed
    marginTop: 8,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: Colors.background,
    borderColor: Colors.subtleText,
    borderWidth: 1,
    height: 32, // Adjusted height for better alignment
    paddingHorizontal: 6, // Adjusted padding
  },
  editButton: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  detailGrid: {
    paddingHorizontal: 10,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.subtleText,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 16,
    marginTop: 4,
    color: Colors.text,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  subjectChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: Colors.accent,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: Colors.error,
    borderRadius: 20,
    marginHorizontal: 16,
  },
  snackbar: {
    backgroundColor: Colors.success,
  },
});

export default ProfileScreen;