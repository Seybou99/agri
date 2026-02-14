/**
 * Section Calendrier : navigation Catégories → Cultures → Détail (calendrier par phase).
 * UX : liste de catégories, tap → cultures de la catégorie, tap → détail étapes.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  Pressable,
} from 'react-native';
import { colors, spacing, typography } from '@theme';
import {
  CALENDAR_CATEGORIES_MALI,
  getCategoryById,
  getAllCulturesFromCategories,
  RENTABILITE_MALI,
  type CalendarCategory,
  type CultureCalendarItem,
} from '@/data/calendarGuideMali';
import type { ApiIconItem, ApiProfitabilityItem } from '@services/culturesApi';

/** 1 € ≈ XOF (Franc CFA) — affichage rentabilité Mali */
const EUR_TO_CFA = 656;

type ViewMode = 'categories' | 'cultures' | 'detail';

interface CalendarGuideSectionProps {
  calendars?: Record<string, unknown>;
  icons: ApiIconItem[];
  profitability: ApiProfitabilityItem[];
  loading: boolean;
  fromApi: boolean;
  style?: ViewStyle;
}

export const CalendarGuideSection: React.FC<CalendarGuideSectionProps> = ({
  profitability,
  loading,
  fromApi,
  style,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCulture, setSelectedCulture] = useState<CultureCalendarItem | null>(null);

  const selectedCategory = selectedCategoryId ? getCategoryById(selectedCategoryId) : null;

  // Rentabilité toutes catégories : API prioritaire, sinon RENTABILITE_MALI, tri par revenu max décroissant
  const apiProfitById = React.useMemo(() => {
    const map: Record<string, ApiProfitabilityItem> = {};
    profitability.forEach((p) => { map[p.culture_id] = p; });
    return map;
  }, [profitability]);
  const allCulturesRentabilite = React.useMemo(() => {
    const list: Array<{ culture_id: string; culture: string; revenu_ha_min: number; revenu_ha_max: number; niveau: string }> = [];
    getAllCulturesFromCategories().forEach((c) => {
      const fromApi = apiProfitById[c.id] ?? apiProfitById[c.id.toLowerCase()];
      const fromLocal = RENTABILITE_MALI[c.id];
      const src = fromApi ?? fromLocal;
      if (src) {
        list.push({
          culture_id: c.id,
          culture: c.nom,
          revenu_ha_min: src.revenu_ha_min,
          revenu_ha_max: src.revenu_ha_max,
          niveau: src.niveau,
        });
      }
    });
    list.sort((a, b) => b.revenu_ha_max - a.revenu_ha_max);
    return list;
  }, [apiProfitById]);

  const handleSelectCategory = useCallback((cat: CalendarCategory) => {
    setSelectedCategoryId(cat.id);
    setViewMode('cultures');
    setSelectedCulture(null);
  }, []);

  const handleSelectCulture = useCallback((culture: CultureCalendarItem) => {
    setSelectedCulture(culture);
    setViewMode('detail');
  }, []);

  const handleBackToCategories = useCallback(() => {
    setViewMode('categories');
    setSelectedCategoryId(null);
    setSelectedCulture(null);
  }, []);

  const handleBackToCultures = useCallback(() => {
    setViewMode('cultures');
    setSelectedCulture(null);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Chargement du guide…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* En-tête avec fil d'Ariane */}
      <View style={styles.breadcrumb}>
        <TouchableOpacity
          onPress={viewMode === 'detail' ? handleBackToCultures : viewMode === 'cultures' ? handleBackToCategories : undefined}
          style={[styles.backBtn, viewMode === 'categories' && styles.backBtnHidden]}
          disabled={viewMode === 'categories'}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnLabel}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbText} numberOfLines={1}>
          {viewMode === 'categories' && 'Catégories'}
          {viewMode === 'cultures' && selectedCategory && `${selectedCategory.emoji} ${selectedCategory.label}`}
          {viewMode === 'detail' && selectedCulture && `${selectedCulture.emoji} ${selectedCulture.nom}`}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Vue 1 : Liste des catégories */}
        {viewMode === 'categories' && (
          <>
            <Text style={styles.sectionTitle}>Calendrier cultural détaillé</Text>
            <Text style={styles.sectionSubtitle}>
              Choisissez une catégorie pour afficher les cultures et leurs périodes (Mali).
            </Text>
            <View style={styles.categoryGrid}>
              {CALENDAR_CATEGORIES_MALI.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={({ pressed }) => [styles.categoryCard, pressed && styles.categoryCardPressed]}
                  onPress={() => handleSelectCategory(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={`${cat.label}, ${cat.cultures.length} cultures`}
                >
                  <View style={styles.categoryIconWrap}>
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={1}>{cat.label}</Text>
                  <Text style={styles.categoryCount}>{cat.cultures.length} cultures</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Vue 2 : Liste des cultures de la catégorie */}
        {viewMode === 'cultures' && selectedCategory && (
          <>
            <Text style={styles.sectionSubtitle}>
              Touchez une culture pour voir les périodes (semis, récolte).
            </Text>
            <View style={styles.cultureList}>
              {selectedCategory.cultures.map((culture) => (
                <Pressable
                  key={culture.id}
                  style={({ pressed }) => [styles.cultureRow, pressed && styles.cultureRowPressed]}
                  onPress={() => handleSelectCulture(culture)}
                  accessibilityRole="button"
                  accessibilityLabel={culture.nom}
                >
                  <Text style={styles.cultureEmoji}>{culture.emoji}</Text>
                  <Text style={styles.cultureName} numberOfLines={1}>{culture.nom}</Text>
                  <Text style={styles.cultureChevron}>›</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Vue 3 : Détail calendrier (étapes) + rentabilité F CFA */}
        {viewMode === 'detail' && selectedCulture && (() => {
          const prof = allCulturesRentabilite.find(
            (p) => p.culture_id === selectedCulture.id || p.culture_id?.toLowerCase() === selectedCulture.id.toLowerCase()
          );
          const minCfa = prof ? Math.round(prof.revenu_ha_min * EUR_TO_CFA) : null;
          const maxCfa = prof ? Math.round(prof.revenu_ha_max * EUR_TO_CFA) : null;
          return (
            <>
              {selectedCulture.saison ? (
                <Text style={styles.saisonBadge}>{selectedCulture.saison}</Text>
              ) : null}
              <View style={styles.etapesCard}>
                <View style={styles.etapesTable}>
                  <View style={styles.rowHeader}>
                    <Text style={[styles.cell, styles.cellPhase]}>Phase</Text>
                    <Text style={[styles.cell, styles.cellDates, styles.cellMonth]}>Début</Text>
                    <Text style={[styles.cell, styles.cellDates, styles.cellMonth]}>Fin</Text>
                  </View>
                  {selectedCulture.etapes.map((e, i) => (
                    <View key={i} style={styles.row}>
                      <Text style={[styles.cell, styles.cellPhase]}>{e.phase}</Text>
                      <Text style={[styles.cell, styles.cellDates, styles.cellMonth]}>{e.debut}</Text>
                      <Text style={[styles.cell, styles.cellDates, styles.cellMonth]}>{e.fin}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {minCfa != null && maxCfa != null && (
                <View style={styles.rentabiliteCard}>
                  <Text style={styles.rentabiliteTitle}>Rentabilité indicative</Text>
                  <Text style={styles.rentabiliteValue}>
                    {minCfa.toLocaleString('fr-FR')} – {maxCfa.toLocaleString('fr-FR')} F CFA / ha
                  </Text>
                  {prof?.niveau ? (
                    <Text style={styles.rentabiliteNiveau}>{prof.niveau}</Text>
                  ) : null}
                </View>
              )}
            </>
          );
        })()}

        {/* Rentabilité globale : uniquement sur la vue catégories, en F CFA */}
        {viewMode === 'categories' && (
          <>
            <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Cultures les plus rentables par hectare</Text>
            <Text style={styles.sectionSubtitle}>
              Revenus bruts indicatifs (Mali, F CFA/ha).
            </Text>
            <View style={styles.profitCard}>
              {allCulturesRentabilite.length > 0 ? (
                allCulturesRentabilite.map((p) => {
                  const minCfa = Math.round(p.revenu_ha_min * EUR_TO_CFA);
                  const maxCfa = Math.round(p.revenu_ha_max * EUR_TO_CFA);
                  return (
                    <View key={p.culture_id} style={styles.profitRow}>
                      <Text style={styles.profitName} numberOfLines={2}>{p.culture}</Text>
                      <View style={styles.profitRowBottom}>
                        <Text style={styles.profitRange}>
                          {minCfa.toLocaleString('fr-FR')} – {maxCfa.toLocaleString('fr-FR')} F CFA
                        </Text>
                        <View style={styles.profitBadge}>
                          <Text style={styles.profitNiveau}>{p.niveau}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>Aucune donnée de rentabilité.</Text>
              )}
            </View>
          </>
        )}

        {fromApi && viewMode === 'categories' && (
          <Text style={styles.footer}>Données issues de l’API SeneGundo (Mali).</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: spacing.xxl },
  loadingText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  backBtn: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backBtnHidden: { opacity: 0 },
  backBtnLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
  breadcrumbText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionTitleSpaced: { marginTop: spacing.xl },
  sectionSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    width: '47%',
    minHeight: 100,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCardPressed: { opacity: 0.85, backgroundColor: colors.gray[50] },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryEmoji: { fontSize: 24 },
  categoryLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
  cultureList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cultureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[100],
  },
  cultureRowPressed: { backgroundColor: colors.gray[50] },
  cultureEmoji: { fontSize: 22, marginRight: spacing.md },
  cultureName: { flex: 1, fontSize: typography.body.fontSize, color: colors.text.primary },
  cultureChevron: { fontSize: 20, color: colors.text.secondary, fontWeight: '300' },
  saisonBadge: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.primary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  etapesCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  etapesTable: { marginTop: spacing.xs },
  rowHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[100],
  },
  cell: { fontSize: typography.body.fontSize, color: colors.text.primary },
  cellPhase: { flex: 1, fontWeight: '500' },
  cellDates: { width: 80 },
  cellMonth: { fontSize: 15, fontWeight: '500' },
  rentabiliteCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  rentabiliteTitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  rentabiliteValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
  rentabiliteNiveau: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  profitCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  profitRow: {
    flexDirection: 'column',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[100],
  },
  profitName: { fontSize: typography.body.fontSize, color: colors.text.primary, fontWeight: '600', marginBottom: spacing.xs },
  profitRowBottom: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  profitRange: { fontSize: typography.bodySmall.fontSize, color: colors.primary, fontWeight: '600' },
  profitBadge: { backgroundColor: colors.gray[100], paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 },
  profitNiveau: { fontSize: typography.caption.fontSize, color: colors.text.secondary },
  footer: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.lg,
  },
});
