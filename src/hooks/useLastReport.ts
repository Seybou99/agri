import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { loadLastReport, type LastReportSnapshot } from '@services/lastReportStorage';

export function useLastReport() {
  const [report, setReport] = useState<LastReportSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadLastReport();
    setReport(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { report, loading, refresh };
}
