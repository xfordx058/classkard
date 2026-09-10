import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView, BlurTargetView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import UnsignedRecordsScreen from '../screens/UnsignedRecordsScreen';
import ClassesListScreen from '../screens/ClassesListScreen';
import SectionDetailScreen from '../screens/SectionDetailScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import CardDetailScreen from '../screens/CardDetailScreen';
import AddRecordScreen from '../screens/AddRecordScreen';
import TimelineScreen from '../screens/TimelineScreen';
import EnrollmentRequestsScreen from '../screens/EnrollmentRequestsScreen';
import AddStudentScreen from '../screens/AddStudentScreen';
import BulkScoreEntryScreen from '../screens/BulkScoreEntryScreen';
import SignatureScreen from '../screens/SignatureScreen';
import CreateSectionScreen from '../screens/CreateSectionScreen';
import QuickEntryScreen from '../screens/QuickEntryScreen';
import SearchScreen from '../screens/SearchScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ManageAcademicYearsScreen from '../screens/ManageAcademicYearsScreen';
import ManageSubjectsScreen from '../screens/ManageSubjectsScreen';
import StudentTimelineScreen from '../screens/StudentTimelineScreen';
import StudentDashboardScreen from '../screens/StudentDashboardScreen';
import JoinClassScreen from '../screens/JoinClassScreen';
import EditSignatureScreen from '../screens/EditSignatureScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const glassStyles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

function GlassTabBackdrop({ target }: { target: React.RefObject<View | null> }) {
  return (
    <BlurView
      blurTarget={target}
      blurMethod="dimezisBlurViewSdk31Plus"
      intensity={88}
      tint="light"
      style={glassStyles.backdrop}
    />
  );
}

const glassTabBarStyle = {
  backgroundColor: 'rgba(255,255,255,0.35)',
  borderTopColor: 'rgba(255,255,255,0.6)',
  borderTopWidth: StyleSheet.hairlineWidth + 0.5,
  elevation: 24,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: -8 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
} as const;

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: '600' as const },
  contentStyle: { backgroundColor: COLORS.background },
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function DashboardTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    </Stack.Navigator>
  );
}

function ClassesTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ClassesList" component={ClassesListScreen} options={{ title: 'Classes' }} />
    </Stack.Navigator>
  );
}

function QuickEntryTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="QuickEntry" component={QuickEntryScreen} options={{ title: 'Quick Entry' }} />
    </Stack.Navigator>
  );
}

function SearchTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
    </Stack.Navigator>
  );
}

function TeacherSettingsTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

function TeacherTabs() {
  const blurTarget = useRef<View | null>(null);
  const tabBarBackground = useCallback(
    () => <GlassTabBackdrop target={blurTarget} />,
    []
  );

  return (
    <BlurTargetView ref={blurTarget} style={glassStyles.fill}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarBackground,
          tabBarStyle: glassTabBarStyle,
          tabBarLabelStyle: { fontWeight: '600' as const },
        }}
      >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardTab}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ClassesTab"
        component={ClassesTab}
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, size }) => <Ionicons name="albums" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="QuickEntryTab"
        component={QuickEntryTab}
        options={{
          title: 'Quick Entry',
          tabBarIcon: ({ color, size }) => <Ionicons name="create" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchTab}
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="TeacherSettingsTab"
        component={TeacherSettingsTab}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
    </BlurTargetView>
  );
}

function TeacherRoot() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MainTabs" component={TeacherTabs} options={{ headerShown: false }} />
      <Stack.Screen name="UnsignedRecords" component={UnsignedRecordsScreen} options={{ title: 'Unsigned Records' }} />
      <Stack.Screen name="QuickEntry" component={QuickEntryScreen} options={{ title: 'Quick Entry' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      <Stack.Screen name="SectionDetail" component={SectionDetailScreen} options={{ title: 'Section Details' }} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: 'Student Profile' }} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: 'Card Details' }} />
      <Stack.Screen name="AddRecord" component={AddRecordScreen} options={{ title: 'Add Record' }} />
      <Stack.Screen name="Timeline" component={TimelineScreen} options={{ title: 'Timeline' }} />
      <Stack.Screen name="EnrollmentRequests" component={EnrollmentRequestsScreen} options={{ title: 'Enrollment Requests' }} />
      <Stack.Screen name="AddStudent" component={AddStudentScreen} options={{ title: 'Add Student' }} />
      <Stack.Screen name="BulkScoreEntry" component={BulkScoreEntryScreen} options={{ title: 'Bulk Score Entry' }} />
      <Stack.Screen name="Signature" component={SignatureScreen} options={{ title: 'Signature' }} />
      <Stack.Screen name="CreateSection" component={CreateSectionScreen} options={{ title: 'Create Section' }} />
      <Stack.Screen name="ManageAcademicYears" component={ManageAcademicYearsScreen} options={{ title: 'Academic Years' }} />
      <Stack.Screen name="ManageSubjects" component={ManageSubjectsScreen} options={{ title: 'Subjects' }} />
      <Stack.Screen name="EditSignature" component={EditSignatureScreen} options={{ title: 'My Signature' }} />
    </Stack.Navigator>
  );
}

function HomeTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MyCardsTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: 'My Cards' }} />
    </Stack.Navigator>
  );
}

function TimelineTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StudentTimeline" component={StudentTimelineScreen} options={{ title: 'Timeline' }} />
    </Stack.Navigator>
  );
}

function StudentSettingsTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

function StudentTabs() {
  const blurTarget = useRef<View | null>(null);
  const tabBarBackground = useCallback(
    () => <GlassTabBackdrop target={blurTarget} />,
    []
  );

  return (
    <BlurTargetView ref={blurTarget} style={glassStyles.fill}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarBackground,
          tabBarStyle: glassTabBarStyle,
          tabBarLabelStyle: { fontWeight: '600' as const },
        }}
      >
      <Tab.Screen
        name="HomeTab"
        component={HomeTab}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MyCardsTab"
        component={MyCardsTab}
        options={{
          title: 'My Cards',
          tabBarIcon: ({ color, size }) => <Ionicons name="albums" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="TimelineTab"
        component={TimelineTab}
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="StudentSettingsTab"
        component={StudentSettingsTab}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
    </BlurTargetView>
  );
}

function StudentRoot() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MainTabs" component={StudentTabs} options={{ headerShown: false }} />
      <Stack.Screen name="JoinClass" component={JoinClassScreen} options={{ title: 'Join a Class' }} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: 'My Cards' }} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: 'Card Details' }} />
      <Stack.Screen name="StudentTimeline" component={StudentTimelineScreen} options={{ title: 'Timeline' }} />
      <Stack.Screen name="EditSignature" component={EditSignatureScreen} options={{ title: 'My Signature' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <AuthStack />;
  }

  if (currentUser.role === 'teacher') {
    return <TeacherRoot />;
  }

  if (currentUser.role === 'student') {
    return <StudentRoot />;
  }

  return <AuthStack />;
}