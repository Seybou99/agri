import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { ParcelHistoryGroup } from '@models/ParcelHistory';
import { getParcelHistoryGroups } from '@services/parcelHistoryStorage';

export function useParcelHistory() {
  const [groups, setGroups] = useState<ParcelHistoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getParcelHistoryGroups();
    setGroups(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { groups, loading, refresh };
}
