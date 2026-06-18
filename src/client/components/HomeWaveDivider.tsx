import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HomeWaveDividerProps {
  /** Couleur du hero (vert SeneGundo). */
  topColor: string;
  /** Fond de la zone contenu (blanc ou noir selon thème). */
  bottomColor: string;
  /** Ombre sous la vague (profondeur maquette). */
  shadowWaveColor?: string;
}

const WAVE_HEIGHT = 52;

function buildShadowPath(width: number, height: number): string {
  return `M0,${height} L0,${height * 0.7} C${width * 0.25},${height * 0.1} ${width * 0.45},${height} ${width * 0.65},${height * 0.4} S${width * 0.85},${height * 0.05} ${width},${height * 0.5} L${width},${height} Z`;
}

function buildMainPath(width: number, height: number): string {
  return `M0,${height} L0,${height * 0.55} C${width * 0.25},${height * 0.0} ${width * 0.45},${height * 0.95} ${width * 0.65},${height * 0.35} S${width * 0.85},${height * 0.02} ${width},${height * 0.45} L${width},${height} Z`;
}

/** Double vague : ombre puis hero — courbes amples type maquette Diokolo. */
export const HomeWaveDivider: React.FC<HomeWaveDividerProps> = ({
  topColor,
  bottomColor,
  shadowWaveColor = 'rgba(0, 0, 0, 0.12)',
}) => {
  const { width } = useWindowDimensions();
  const height = WAVE_HEIGHT;

  const shadowPath = useMemo(() => buildShadowPath(width, height), [width, height]);
  const mainPath = useMemo(() => buildMainPath(width, height), [width, height]);

  return (
    <View style={[styles.wrap, { backgroundColor: bottomColor, marginTop: -2 }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Path d={shadowPath} fill={shadowWaveColor} />
        <Path d={mainPath} fill={topColor} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
