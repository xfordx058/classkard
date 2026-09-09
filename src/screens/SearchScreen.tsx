import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { searchStudents } from '../db/queries';
import { COLORS } from '../theme/colors';
import { Student } from '../types';

export default function SearchScreen() {
  const { db } = useApp();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(Student & { sectionNames?: string })[]>([]);
  const [searched, setSearched] = useState(false);

  async function doSearch() {
    if (!db || !query.trim()) return;
    setSearched(true);
    const data = await searchStudents(db, query.trim());
    setResults(data);
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, student number, section..."
          placeholderTextColor={COLORS.textLight}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={doSearch}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() => {
              if (item.sectionNames) {
                navigation.navigate('StudentProfile', {
                  studentId: item.id,
                  sectionId: undefined,
                });
              }
            }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.firstName[0]}{item.lastName[0]}
              </Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>
                {item.lastName}, {item.firstName} {item.middleName}
              </Text>
              <Text style={styles.resultNumber}>{item.studentNumber}</Text>
              {item.sectionNames ? (
                <Text style={styles.resultSection} numberOfLines={1}>
                  {item.sectionNames}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          searched ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Search for students</Text>
              <Text style={styles.emptySubtext}>Enter a name, student number, or section</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    margin: 16,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultNumber: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  resultSection: {
    fontSize: 11,
    color: COLORS.info,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
});
