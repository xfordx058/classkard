import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import BrandHeader from '../components/BrandHeader';

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
import SettingsScreen from '../screens/SettingsScreen';
import ManageAcademicYearsScreen from '../screens/ManageAcademicYearsScreen';
import ManageSubjectsScreen from '../screens/ManageSubjectsScreen';
import StudentTimelineScreen from '../screens/StudentTimelineScreen';
import StudentDashboardScreen from '../screens/StudentDashboardScreen';
import JoinClassScreen from '../screens/JoinClassScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard', headerTitle: () => <BrandHeader /> }} />
      <Stack.Screen name="UnsignedRecords" component={UnsignedRecordsScreen} options={{ title: 'Unsigned Records' }} />
    </Stack.Navigator>
  );
}

function ClassesTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ClassesList" component={ClassesListScreen} options={{ title: 'Classes', headerTitle: () => <BrandHeader /> }} />
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
    </Stack.Navigator>
  );
}

function QuickEntryTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="QuickEntry" component={QuickEntryScreen} options={{ title: 'Quick Entry', headerTitle: () => <BrandHeader /> }} />
    </Stack.Navigator>
  );
}

function SearchTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search', headerTitle: () => <BrandHeader /> }} />
    </Stack.Navigator>
  );
}

function TeacherSettingsTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings', headerTitle: () => <BrandHeader /> }} />
      <Stack.Screen name="ManageAcademicYears" component={ManageAcademicYearsScreen} options={{ title: 'Academic Years' }} />
      <Stack.Screen name="ManageSubjects" component={ManageSubjectsScreen} options={{ title: 'Subjects' }} />
    </Stack.Navigator>
  );
}

function TeacherTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
        },
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
  );
}

function HomeTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JoinClass" component={JoinClassScreen} options={{ title: 'Join a Class' }} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: 'My Class' }} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: 'Card Details' }} />
      <Stack.Screen name="StudentTimeline" component={StudentTimelineScreen} options={{ title: 'Timeline' }} />
    </Stack.Navigator>
  );
}

function MyCardsTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: 'My Cards' }} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: 'Card Details' }} />
      <Stack.Screen name="StudentTimeline" component={StudentTimelineScreen} options={{ title: 'Timeline' }} />
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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
        },
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
  );
}

export default function AppNavigator() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <AuthStack />;
  }

  if (currentUser.role === 'teacher') {
    return <TeacherTabs />;
  }

  if (currentUser.role === 'student') {
    return <StudentTabs />;
  }

  return <AuthStack />;
}
