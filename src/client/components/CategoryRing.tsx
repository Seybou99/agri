import React, { useMemo } from 'react';
import { View, Image, StyleSheet, type ImageSourcePropType, type ViewStyle } from 'react-native';

const RING_WHITE = '#FFFFFF';
const MAIN_BORDER_WIDTH = 2;
const OUTER_BORDER_WIDTH = 2;

/** Coins asymétriques — cercle légèrement « déformé » (maquette Diokolo). */
const ORGANIC_PRESETS: [number, number, number, number][] = [
  [0.52, 0.47, 0.49, 0.51],
  [0.48, 0.53, 0.51, 0.46],
  [0.51, 0.49, 0.46, 0.52],
  [0.47, 0.52, 0.52, 0.48],
  [0.53, 0.48, 0.48, 0.5],
];

function organicRadii(size: number, presetIndex: number): Pick<ViewStyle, 'borderTopLeftRadius' | 'borderTopRightRadius' | 'borderBottomLeftRadius' | 'borderBottomRightRadius'> {
  const [tl, tr, bl, br] = ORGANIC_PRESETS[presetIndex % ORGANIC_PRESETS.length];
  return {
    borderTopLeftRadius: size * tl,
    borderTopRightRadius: size * tr,
    borderBottomLeftRadius: size * bl,
    borderBottomRightRadius: size * br,
  };
}

export function categoryShapeSeed(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) {
    sum += id.charCodeAt(i);
  }
  return sum % ORGANIC_PRESETS.length;
}

interface CategoryRingProps {
  size: number;
  iconSize: number;
  image: ImageSourcePropType;
  borderColor: string;
  outerBorderColor: string;
  blobFill: string;
  shapeSeed: number;
}

/**
 * Cercle catégorie maquette : blob organique + bordure transparente + disque blanc bordé.
 */
export const CategoryRing: React.FC<CategoryRingProps> = ({
  size,
  iconSize,
  image,
  borderColor,
  outerBorderColor,
  blobFill,
  shapeSeed,
}) => {
  const blobSize = size + 14;
  const outerSize = size + 8;
  const frame = size + 18;

  const blobRadii = useMemo(() => organicRadii(blobSize, shapeSeed), [blobSize, shapeSeed]);
  const outerRadii = useMemo(() => organicRadii(outerSize, shapeSeed + 1), [outerSize, shapeSeed]);
  const innerRadii = useMemo(() => organicRadii(size, shapeSeed + 2), [size, shapeSeed]);

  return (
    <View style={[styles.frame, { width: frame, height: frame }]}>
      <View
        style={[
          styles.blob,
          blobRadii,
          {
            width: blobSize,
            height: blobSize,
            backgroundColor: blobFill,
          },
        ]}
      />
      <View
        style={[
          styles.outerRing,
          outerRadii,
          {
            width: outerSize,
            height: outerSize,
            borderColor: outerBorderColor,
          },
        ]}
      />
      <View
        style={[
          styles.innerRing,
          innerRadii,
          {
            width: size,
            height: size,
            borderColor,
          },
        ]}
      >
        <Image source={image} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
  },
  outerRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: OUTER_BORDER_WIDTH,
  },
  innerRing: {
    backgroundColor: RING_WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: MAIN_BORDER_WIDTH,
    zIndex: 2,
  },
});
