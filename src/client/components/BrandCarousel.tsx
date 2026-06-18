import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { FEATURED_BRANDS, type FeaturedBrand } from '@client/constants/homeCategories';
import type { ClientTheme } from '@client/theme/useClientTheme';
import { spacing } from '@theme';

const BRANDS_PER_PAGE = 4;

function chunkBrands<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages.length > 0 ? pages : [[]];
}

interface BrandCarouselProps {
  theme: ClientTheme;
  onBrandPress?: () => void;
}

export const BrandCarousel: React.FC<BrandCarouselProps> = ({ theme, onBrandPress }) => {
  const { width } = useWindowDimensions();
  const pageWidth = width;
  const pages = chunkBrands(FEATURED_BRANDS, BRANDS_PER_PAGE);
  const [activePage, setActivePage] = useState(0);
  const listRef = useRef<FlatList<FeaturedBrand[]>>(null);

  const cardGap = spacing.sm;
  const horizontalPad = spacing.lg;
  const cardWidth = (pageWidth - horizontalPad * 2 - cardGap * (BRANDS_PER_PAGE - 1)) / BRANDS_PER_PAGE;

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
      setActivePage(Math.min(index, pages.length - 1));
    },
    [pageWidth, pages.length]
  );

  const renderBrand = (brand: FeaturedBrand) => (
    <TouchableOpacity
      key={brand.id}
      style={[styles.brandCard, { width: cardWidth, backgroundColor: theme.brandCard }]}
      activeOpacity={0.85}
      onPress={onBrandPress}
    >
      <Text style={[styles.brandLogo, { color: brand.accentColor ?? theme.text }]}>{brand.logoText}</Text>
      {brand.subLabel ? (
        <Text style={[styles.brandSub, { color: theme.textSecondary }]} numberOfLines={1}>
          {brand.subLabel}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View>
      <FlatList
        ref={listRef}
        data={pages}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={pageWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces
        keyExtractor={(_, index) => `brand-page-${index}`}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: pageWidth,
          offset: pageWidth * index,
          index,
        })}
        renderItem={({ item: pageBrands }) => (
          <View style={[styles.page, { width: pageWidth }]}>
            <View style={[styles.pageInner, { paddingHorizontal: horizontalPad, gap: cardGap }]}>
              {pageBrands.map(renderBrand)}
              {pageBrands.length < BRANDS_PER_PAGE &&
                Array.from({ length: BRANDS_PER_PAGE - pageBrands.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={{ width: cardWidth }} />
                ))}
            </View>
          </View>
        )}
      />

      <View style={styles.dots}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activePage && [styles.dotActive, { backgroundColor: theme.tabActive }],
              index !== activePage && { backgroundColor: theme.border },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    justifyContent: 'center',
  },
  pageInner: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  brandCard: {
    height: 92,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  brandLogo: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  brandSub: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
  },
});
