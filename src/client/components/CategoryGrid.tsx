import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { HOME_CATEGORIES, type HomeCategory } from '@client/constants/homeCategories';
import { CategoryRing, categoryShapeSeed } from '@client/components/CategoryRing';
import { useClientTheme } from '@client/theme/useClientTheme';
import { colors, spacing } from '@theme';

const RING_WHITE = '#FFFFFF';

const LARGE_RING = 68;
const LARGE_ICON = 52;
const SMALL_RING = 56;
const SMALL_ICON = 42;

const RING_BORDER_WIDTH = 2;
const PILL_OVERLAP_LARGE = 14;
const PILL_OVERLAP_SMALL = 10;

interface CategoryGridProps {
  onCategoryPress: (category: HomeCategory) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryPress }) => {
  const { width } = useWindowDimensions();
  const t = useClientTheme();

  const pad = spacing.md;
  const gap = spacing.xs + 2;
  const largeWidth = (width - pad * 2 - gap) / 2;
  const smallWidth = (width - pad * 2 - gap * 2) / 3;

  const large = HOME_CATEGORIES.filter((c) => c.size === 'large');
  const small = HOME_CATEGORIES.filter((c) => c.size === 'small');

  const renderTile = (item: HomeCategory, tileWidth: number, variant: 'large' | 'small') => {
    const ringSize = variant === 'large' ? LARGE_RING : SMALL_RING;
    const iconSize = variant === 'large' ? LARGE_ICON : SMALL_ICON;
    const pillOverlap = variant === 'large' ? PILL_OVERLAP_LARGE : PILL_OVERLAP_SMALL;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.tile, { width: tileWidth }]}
        onPress={() => onCategoryPress(item)}
        activeOpacity={0.88}
      >
        <View style={styles.stack}>
          <CategoryRing
            size={ringSize}
            iconSize={iconSize}
            image={item.image}
            borderColor={t.categoryRingBorder}
            outerBorderColor={t.categoryRingBorderOuter}
            blobFill={t.categoryBlobFill}
            shapeSeed={categoryShapeSeed(item.id)}
          />
          <View
            style={[
              styles.labelPill,
              variant === 'small' && styles.labelPillSmall,
              {
                marginTop: -pillOverlap,
                borderColor: t.categoryRingBorder,
                minWidth: ringSize + 4,
                maxWidth: tileWidth - 4,
              },
            ]}
          >
            {item.labelLines ? (
              item.labelLines.map((line) => (
                <Text
                  key={line}
                  style={[styles.labelText, variant === 'small' && styles.labelTextSmall]}
                >
                  {line}
                </Text>
              ))
            ) : (
              <Text
                style={[styles.labelText, variant === 'small' && styles.labelTextSmall]}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.grid}>
      <View style={styles.row}>{large.map((item) => renderTile(item, largeWidth, 'large'))}</View>
      <View style={styles.row}>{small.map((item) => renderTile(item, smallWidth, 'small'))}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    justifyContent: 'space-between',
  },
  tile: {
    alignItems: 'center',
  },
  stack: {
    alignItems: 'center',
  },
  labelPill: {
    backgroundColor: RING_WHITE,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: RING_BORDER_WIDTH,
    zIndex: 3,
  },
  labelPillSmall: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    minHeight: 26,
    borderRadius: 16,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 13,
  },
  labelTextSmall: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
  },
});
