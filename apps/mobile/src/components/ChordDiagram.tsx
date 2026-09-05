import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ChordVoicing } from '@app-cifra/music-theory';
import { colors } from '../theme';

type Props = { voicing: ChordVoicing; light?: boolean; compact?: boolean };
const STRING_COUNT = 6;
const FRET_COUNT = 5;

export function ChordDiagram({ voicing, light = false, compact = false }: Props) {
  const positive = voicing.frets.filter(fret => fret > 0);
  const baseFret = positive.length && Math.max(...positive) > FRET_COUNT ? Math.min(...positive) : 1;
  const lineColor = light ? '#58635F' : '#777';
  const labelColor = light ? colors.ink : '#D8D8D8';
  const nutColor = light ? colors.ink : '#EAEAEA';
  const dotColor = light ? colors.ink : '#56C596';
  const dotBorder = light ? '#FFF' : '#0C1915';
  const width = compact ? 92 : 220;
  const height = compact ? 90 : 205;
  const dotSize = compact ? 11 : 22;

  return (
    <View style={[styles.wrapper, { width }]}>
      <View style={[styles.openRow, compact ? styles.openRowCompact : null]}>
        {voicing.frets.map((fret, index) => <Text key={`${index}-${fret}`} style={[styles.openLabel, compact ? styles.openLabelCompact : null, { color: labelColor }]}>{fret < 0 ? '×' : fret === 0 ? '○' : ' '}</Text>)}
      </View>
      <View style={[styles.diagram, { height }, compact ? styles.diagramCompact : null]}>
        {baseFret > 1 ? <Text style={[styles.baseFret, compact ? styles.baseFretCompact : null, { color: labelColor }]}>{baseFret}</Text> : null}
        {Array.from({ length: STRING_COUNT }).map((_, index) => <View key={`string-${index}`} style={[styles.string,{left:`${(index/(STRING_COUNT-1))*100}%`,backgroundColor:lineColor}]} />)}
        {Array.from({ length: FRET_COUNT + 1 }).map((_, index) => <View key={`fret-${index}`} style={[styles.fret,{backgroundColor:lineColor},index===0&&baseFret===1?[styles.nut,{backgroundColor:nutColor}]:null,{top:`${(index/FRET_COUNT)*100}%`}]} />)}
        {voicing.frets.map((fret,stringIndex)=>{
          if(fret<=0) return null;
          const relativeFret=fret-baseFret+1;
          if(relativeFret<1||relativeFret>FRET_COUNT) return null;
          const finger=voicing.fingers?.[stringIndex];
          return <View key={`dot-${stringIndex}-${fret}`} style={[styles.dot,{width:dotSize,height:dotSize,borderRadius:dotSize/2,marginLeft:-dotSize/2,marginTop:-dotSize/2,backgroundColor:dotColor,borderColor:dotBorder,left:`${(stringIndex/(STRING_COUNT-1))*100}%`,top:`${((relativeFret-.5)/FRET_COUNT)*100}%`}]}>{!compact&&finger&&finger>0?<Text style={styles.finger}>{finger}</Text>:null}</View>;
        })}
      </View>
    </View>
  );
}

const styles=StyleSheet.create({wrapper:{alignSelf:'center'},openRow:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:2,marginBottom:8},openRowCompact:{marginBottom:4},openLabel:{width:20,textAlign:'center',fontSize:18,fontWeight:'800'},openLabelCompact:{width:10,fontSize:10},diagram:{marginHorizontal:10,position:'relative'},diagramCompact:{marginHorizontal:6},string:{position:'absolute',top:0,bottom:0,width:1.4},fret:{position:'absolute',left:0,right:0,height:1.4},nut:{height:4},dot:{position:'absolute',borderWidth:2,alignItems:'center',justifyContent:'center'},finger:{color:'#FFF',fontSize:10,fontWeight:'900'},baseFret:{position:'absolute',left:-28,top:8,fontSize:12,fontWeight:'800'},baseFretCompact:{left:-16,top:2,fontSize:8}});
