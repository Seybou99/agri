import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import type { AppNavigationProp } from '@navigation/AppNavigator';
import { useMarketplace } from '@contexts/MarketplaceContext';
import type { MarketplaceSale } from '@models/MarketplaceOrder';
import { colors, spacing, typography } from '@theme';

export const MarketplaceMySalesScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { mySales, refreshOrders, ordersLoading } = useMarketplace();

  useFocusEffect(
    useCallback(() => {
      refreshOrders();
    }, [refreshOrders])
  );

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const totalRevenue = mySales.reduce((sum, s) => sum + s.totalAmount, 0);

  const renderItem = ({ item }: { item: MarketplaceSale }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        Vente · {item.items.length} article{item.items.length > 1 ? 's' : ''}
      </Text>
      <Text style={styles.cardMeta}>
        {formatPrice(item.totalAmount)} · {formatDate(item.createdAt)}
      </Text>
      <Text style={styles.cardBuyer}>Acheteur : {item.buyerDisplayName}</Text>
      {item.items.map((line) => (
        <Text key={`${item.id}-${line.productId}`} style={styles.lineItem} numberOfLines={1}>
          · {line.quantity}× {line.productName}
        </Text>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke={colors.text.primary}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes ventes Marché</Text>
        <View style={styles.spacer} />
      </View>

      {mySales.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Chiffre d’affaires enregistré</Text>
          <Text style={styles.summaryValue}>{formatPrice(totalRevenue)}</Text>
        </View>
      )}

      <FlatList
        data={mySales}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={ordersLoading} onRefresh={refreshOrders} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>Aucune vente sur le marché pour le moment</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  back: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { ...typography.h4, flex: 1 },
  spacer: { width: 40 },
  summary: {
    backgroundColor: colors.primaryLight + '50',
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
  summaryLabel: { ...typography.caption, color: colors.text.secondary },
  summaryValue: { ...typography.h3, color: colors.primaryDark, marginTop: spacing.xs },
  list: { padding: spacing.md, flexGrow: 1 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: { fontWeight: '700', color: colors.text.primary, marginBottom: spacing.xs },
  cardMeta: { ...typography.caption, color: colors.primaryDark },
  cardBuyer: { ...typography.caption, color: colors.text.secondary, marginTop: 4 },
  lineItem: { ...typography.caption, color: colors.text.secondary, marginTop: 4 },
  empty: { alignItems: 'center', padding: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
});
