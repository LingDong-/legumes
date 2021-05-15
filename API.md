
<a name="amd"></a>

# legumes

## Interfaces

- [Cresc\_itf](#interfacescresc_itfmd)
- [Drawing](#interfacesdrawingmd)
- [Element](#interfaceselementmd)
- [Instrument\_group\_itf](#interfacesinstrument_group_itfmd)
- [Measure\_itf](#interfacesmeasure_itfmd)
- [Midi\_event](#interfacesmidi_eventmd)
- [Midi\_file](#interfacesmidi_filemd)
- [Midi\_track](#interfacesmidi_trackmd)
- [Note\_itf](#interfacesnote_itfmd)
- [Rest\_itf](#interfacesrest_itfmd)
- [Score\_itf](#interfacesscore_itfmd)
- [Slur\_itf](#interfacesslur_itfmd)
- [Staff\_itf](#interfacesstaff_itfmd)
- [Tempo\_itf](#interfacestempo_itfmd)
- [Tuplet\_itf](#interfacestuplet_itfmd)

## Variables

### ACCIDENTAL

• `Const` **ACCIDENTAL**: *Record*<string, number\>

Defined in: common.ts:15

| Key | Value |
|-----|-------|
| SHARP | 1 |
| NATURAL | 0 |
| FLAT | -1 |
___

### ARTICULATION

• `Const` **ARTICULATION**: *Record*<string, number\>

Defined in: common.ts:29

| Key | Value |
|-----|-------|
| STACCATO | 11 |
| SPICCATO | 12 |
| TENUTO | 13 |
| FERMATA | 14 |
| ACCENT | 15 |
| MARCATO | 16 |
| TREMBLEMENT | 17 |
| TRILL | 18 |
| MORDENT | 19 |
| TURN | 20 |
| UP_BOW | 21 |
| FLAGEOLET | 22 |
| ARPEGGIATED | 23 |
| MORDENT_INV | -19 |
| TURN_INV | -20 |
___

### BARLINE

• `Const` **BARLINE**: *Record*<string, number\>

Defined in: common.ts:59

| Key | Value |
|-----|-------|
| NONE | 0 |
| SINGLE | 1 |
| DOUBLE | 2 |
| END | 3 |
| REPEAT_BEGIN | 4 |
| REPEAT_END | 5 |
| REPEAT_END_BEGIN | 6 |
___

### BRACKET

• `Const` **BRACKET**: *Record*<string, number\>

Defined in: common.ts:69

| Key | Value |
|-----|-------|
| NONE | 0 |
| BRACE | 1 |
| BRACKET | 2 |
___

### CLEF

• `Const` **CLEF**: *Record*<string, number\>

Defined in: common.ts:20

| Key | Value |
|-----|-------|
| TREBLE | 0 |
| BASS | 1 |
___

### CONFIG

• `Const` **CONFIG**: *Record*<string, any\>

Defined in: main.ts:29

| Key | Value |
|-----|-------|
| PAGE_WIDTH | 1200 |
| LINE_HEIGHT | 9 |
| NOTE_WIDTH | 12 |
| REST_WIDTH_MUL | 1 |
| CLEF_WIDTH_MUL | 2 |
| TIMESIG_WIDTH_MUL | 2 |
| KEYSIG_WIDTH_MUL | 0.8 |
| ACCIDENTAL_WIDTH_MUL | 1.2 |
| LEDGER_WIDTH_MUL | 0.75 |
| INTER_NOTE_WIDTH | 4 |
| DURATION_BASED_SPACING | 0.05 |
| FLAG_SPACING | 0.72 |
| MEASURE_PAD_FRONT | 12 |
| MEASURE_PAD_BACK | 12 |
| INTER_STAFF_HEIGHT | 70 |
| INTER_ROW_HEIGHT | 100 |
| STEM_LENGTH | 2.5 |
| PAGE_MARGIN_X | 100 |
| PAGE_MARGIN_Y | 50 |
| TITLE_TEXT_SIZE | 34 |
| SUBTITLE_TEXT_SIZE | 20 |
| TITLE_LINE_SPACING | 12 |
| TEMPO_COMPOSER_TEXT_SIZE | 14 |
| INSTRUMENT_TEXT_SIZE | 16 |
| MEASURE_NUMBER_TEXT_SIZE | 12 |
| INSTRUMENT_PAD_RIGHT | 20 |
| BEAM_MAX_SLOPE | 0.4 |
| LINES_PER_STAFF | 5 |
| GRACE_WIDTH_MUL | 0.4 |
| LYRIC_SCALE | 0.6 |
| LYRIC_SPACING | 12 |
| CUE_TEXT_SIZE | 22 |
| CUE_HEIGHT | 22 |
| SQUIGGLE_WIDTH_MUL | 1.5 |
| JUSTIFY_ALIGN_MIN | 0.75 |
| SLUR_ARC_MUL | 1 |
| SHOW_SOLO_INSTRUMENT | 0 |
| SHOW_MEASURE_NUMBER | 1 |
| HEADBUTT_RESOLVE | 1 |
| HEADBUTT_MERGE | 1 |
| CUE_EVADE | 1 |
| SLUR_EVADE | 1 |
| JOIN_STAFF_LINES | 1 |
| TUPLET_LABEL_SPACING | 1.1 |
| DEBUG_BLOCKS | 0 |
___

### CUE

• `Const` **CUE**: *Record*<string, string\>

Defined in: common.ts:46

| Key | Value |
|-----|-------|
| PEDAL_ON | "ped" |
| PEDAL_OFF | "*" |
| PIANISSISSIMO | "ppp" |
| PIANISSIMO | "pp" |
| PIANO | "p" |
| MEZZO_PIANO | "mp" |
| MEZZO_FORTE | "mf" |
| FORTE | "f" |
| FORTISSIMO | "ff" |
| FORTISSISSIMO | "fff" |
| SFORZANDO | "sfz" |
___

### NOTE\_LENGTH

• `Const` **NOTE\_LENGTH**: *Record*<string, number\>

Defined in: common.ts:5

| Key | Value |
|-----|-------|
| WHOLE | 64 |
| HALF | 32 |
| QUARTER | 16 |
| EIGHTH | 8 |
| SIXTEENTH | 4 |
| THIRTYSECOND | 2 |
| SIXTYFOURTH | 1 |
## Functions

### compile\_score

▸ **compile_score**(`score`: [*Score\_itf*](#interfacesscore_itfmd)): Score

#### Parameters

| Name | Type |
| :------ | :------ |
| `score` | [*Score\_itf*](#interfacesscore_itfmd) |

**Returns:** Score

Defined in: main.ts:536

___

### export\_animated\_svg

▸ **export_animated_svg**(`dr`: [*Drawing*](#interfacesdrawingmd), `params?`: { `background?`: *string* ; `speed?`: *number*  }): *string*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `dr` | [*Drawing*](#interfacesdrawingmd) | - |
| `params` | *object* | {} |
| `params.background?` | *string* | - |
| `params.speed?` | *number* | - |

**Returns:** *string*

Defined in: drawing.ts:910

___

### export\_gif

▸ **export_gif**(`dr`: [*Drawing*](#interfacesdrawingmd), `params?`: { `iter?`: *number* ; `scale?`: *number*  }): *number*[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `dr` | [*Drawing*](#interfacesdrawingmd) | - |
| `params` | *object* | {} |
| `params.iter?` | *number* | - |
| `params.scale?` | *number* | - |

**Returns:** *number*[]

Defined in: drawing.ts:1111

___

### export\_midi

▸ **export_midi**(`pattern`: [*Midi\_file*](#interfacesmidi_filemd)): *number*[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | [*Midi\_file*](#interfacesmidi_filemd) |

**Returns:** *number*[]

Defined in: midifmt.ts:211

___

### export\_mock\_svg

▸ **export_mock_svg**(`dr`: [*Drawing*](#interfacesdrawingmd)): *string*

#### Parameters

| Name | Type |
| :------ | :------ |
| `dr` | [*Drawing*](#interfacesdrawingmd) |

**Returns:** *string*

Defined in: drawing.ts:20

___

### export\_pdf

▸ **export_pdf**(`dr`: [*Drawing*](#interfacesdrawingmd)): *string*

#### Parameters

| Name | Type |
| :------ | :------ |
| `dr` | [*Drawing*](#interfacesdrawingmd) |

**Returns:** *string*

Defined in: drawing.ts:971

___

### export\_sketch\_svg

▸ **export_sketch_svg**(`dr`: [*Drawing*](#interfacesdrawingmd), `params?`: { `noise_mul?`: *number*  }): *string*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `dr` | [*Drawing*](#interfacesdrawingmd) | - |
| `params` | *object* | {} |
| `params.noise_mul?` | *number* | - |

**Returns:** *string*

Defined in: fx.ts:105

___

### export\_svg

▸ **export_svg**(`dr`: [*Drawing*](#interfacesdrawingmd), `params?`: { `background?`: *string*  }): *string*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `dr` | [*Drawing*](#interfacesdrawingmd) | - |
| `params` | *object* | {} |
| `params.background?` | *string* | - |

**Returns:** *string*

Defined in: drawing.ts:892

___

### export\_txt

▸ **export_txt**(`score`: [*Score\_itf*](#interfacesscore_itfmd)): *string*

#### Parameters

| Name | Type |
| :------ | :------ |
| `score` | [*Score\_itf*](#interfacesscore_itfmd) |

**Returns:** *string*

Defined in: txtfmt.ts:634

___

### parse\_midi

▸ **parse_midi**(`bytes`: *number*[]): [*Midi\_file*](#interfacesmidi_filemd)

#### Parameters

| Name | Type |
| :------ | :------ |
| `bytes` | *number*[] |

**Returns:** [*Midi\_file*](#interfacesmidi_filemd)

Defined in: midifmt.ts:66

___

### parse\_txt

▸ **parse_txt**(`txt`: *string*): [*Score\_itf*](#interfacesscore_itfmd)

#### Parameters

| Name | Type |
| :------ | :------ |
| `txt` | *string* |

**Returns:** [*Score\_itf*](#interfacesscore_itfmd)

Defined in: txtfmt.ts:24

___

### playhead\_coords

▸ **playhead_coords**(`score`: Score, `time_in_64th`: *number*): [*number*, *number*, *number*, *number*]

#### Parameters

| Name | Type |
| :------ | :------ |
| `score` | Score |
| `time_in_64th` | *number* |

**Returns:** [*number*, *number*, *number*, *number*]

Defined in: main.ts:2842

___

### register\_font

▸ **register_font**(`map_char_to_hid`: *Record*<string, number\>, `map_hid_to_data`: *Record*<number, string\>, `scale?`: *number*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `map_char_to_hid` | *Record*<string, number\> | - |
| `map_hid_to_data` | *Record*<number, string\> | - |
| `scale` | *number* | 1 |

**Returns:** *void*

Defined in: hershey.ts:150

___

### render\_score

▸ **render_score**(`score`: Score, `params?`: { `compute_polylines?`: *boolean*  }): [*Drawing*](#interfacesdrawingmd)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `score` | Score | - |
| `params` | *object* | {} |
| `params.compute_polylines?` | *boolean* | - |

**Returns:** [*Drawing*](#interfacesdrawingmd)

Defined in: main.ts:2820

___

### round\_polylines

▸ **round_polylines**(`polylines`: *number*[][][], `accuracy?`: *number*): *void*

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `polylines` | *number*[][][] | - |
| `accuracy` | *number* | 2 |

**Returns:** *void*

Defined in: drawing.ts:873

___

### score\_from\_midi

▸ **score_from_midi**(`pattern`: [*Midi\_file*](#interfacesmidi_filemd)): [*Score\_itf*](#interfacesscore_itfmd)

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | [*Midi\_file*](#interfacesmidi_filemd) |

**Returns:** [*Score\_itf*](#interfacesscore_itfmd)

Defined in: midicompile.ts:768

___

### score\_to\_midi

▸ **score_to_midi**(`score`: [*Score\_itf*](#interfacesscore_itfmd)): [*Midi\_file*](#interfacesmidi_filemd)

#### Parameters

| Name | Type |
| :------ | :------ |
| `score` | [*Score\_itf*](#interfacesscore_itfmd) |

**Returns:** [*Midi\_file*](#interfacesmidi_filemd)

Defined in: midicompile.ts:873


<a name="interfacescresc_itfmd"></a>

# Interface: Cresc\_itf

## Properties

### left

• **left**: *string*

Defined in: common.ts:137

___

### right

• **right**: *string*

Defined in: common.ts:138

___

### val\_left

• **val\_left**: *number*

Defined in: common.ts:139

___

### val\_right

• **val\_right**: *number*

Defined in: common.ts:140


<a name="interfacesdrawingmd"></a>

# Interface: Drawing

## Properties

### elements

• **elements**: [*Element*](#interfaceselementmd)[]

Defined in: drawing.ts:16

___

### h

• **h**: *number*

Defined in: drawing.ts:15

___

### polylines

• **polylines**: [*number*, *number*][][]

Defined in: drawing.ts:17

___

### w

• **w**: *number*

Defined in: drawing.ts:14


<a name="interfaceselementmd"></a>

# Interface: Element

## Indexable

▪ [other_options: *string*]: *any*

## Properties

### h

• **h**: *number*

Defined in: drawing.ts:9

___

### tag

• **tag**: *string*

Defined in: drawing.ts:5

___

### w

• **w**: *number*

Defined in: drawing.ts:8

___

### x

• **x**: *number*

Defined in: drawing.ts:6

___

### y

• **y**: *number*

Defined in: drawing.ts:7


<a name="interfacesinstrument_group_itfmd"></a>

# Interface: Instrument\_group\_itf

## Properties

### bracket

• **bracket**: *number*

Defined in: common.ts:151

___

### connect\_barlines

• **connect\_barlines**: *boolean*[]

Defined in: common.ts:153

___

### names

• **names**: *string*[]

Defined in: common.ts:152


<a name="interfacesmeasure_itfmd"></a>

# Interface: Measure\_itf

## Properties

### barline

• **barline**: *number*

Defined in: common.ts:115

___

### duration

• **duration**: *number*

Defined in: common.ts:114

___

### staves

• **staves**: [*Staff\_itf*](#interfacesstaff_itfmd)[]

Defined in: common.ts:116


<a name="interfacesmidi_eventmd"></a>

# Interface: Midi\_event

## Properties

### data

• **data**: *Record*<string, any\> \| *number*[]

Defined in: midifmt.ts:63

___

### delta\_time

• **delta\_time**: *number*

Defined in: midifmt.ts:62

___

### type

• **type**: *string*

Defined in: midifmt.ts:61


<a name="interfacesmidi_filemd"></a>

# Interface: Midi\_file

## Properties

### format

• **format**: *number*

Defined in: midifmt.ts:49

___

### magic

• **magic**: *string*

Defined in: midifmt.ts:48

___

### negative\_SMPTE\_format

• `Optional` **negative\_SMPTE\_format**: *number*

Defined in: midifmt.ts:53

___

### num\_tracks

• **num\_tracks**: *number*

Defined in: midifmt.ts:50

___

### ticks\_per\_frame

• `Optional` **ticks\_per\_frame**: *number*

Defined in: midifmt.ts:54

___

### ticks\_per\_quarter\_note

• `Optional` **ticks\_per\_quarter\_note**: *number*

Defined in: midifmt.ts:52

___

### time\_format

• **time\_format**: ``"METRIC"`` \| ``"TIME_CODE"``

Defined in: midifmt.ts:51

___

### tracks

• **tracks**: [*Midi\_track*](#interfacesmidi_trackmd)[]

Defined in: midifmt.ts:55


<a name="interfacesmidi_trackmd"></a>

# Interface: Midi\_track

## Properties

### events

• **events**: [*Midi\_event*](#interfacesmidi_eventmd)[]

Defined in: midifmt.ts:58


<a name="interfacesnote_itfmd"></a>

# Interface: Note\_itf

## Properties

### accidental

• **accidental**: *number*

Defined in: common.ts:86

___

### articulation

• `Optional` **articulation**: *number*

Defined in: common.ts:96

___

### begin

• **begin**: *number*

Defined in: common.ts:83

___

### cue

• `Optional` **cue**: Cue\_itf

Defined in: common.ts:97

___

### duration

• **duration**: *number*

Defined in: common.ts:84

___

### id

• `Optional` **id**: *string*

Defined in: common.ts:82

___

### lyric

• `Optional` **lyric**: *string*

Defined in: common.ts:95

___

### modifier

• **modifier**: *boolean*

Defined in: common.ts:85

___

### name

• **name**: *string*

Defined in: common.ts:87

___

### next\_in\_chord

• **next\_in\_chord**: *number*

Defined in: common.ts:92

___

### octave

• **octave**: *number*

Defined in: common.ts:88

___

### prev\_in\_chord

• **prev\_in\_chord**: *number*

Defined in: common.ts:91

___

### staff\_pos

• **staff\_pos**: *number*

Defined in: common.ts:90

___

### stem\_dir

• **stem\_dir**: *number*

Defined in: common.ts:93

___

### tuplet

• **tuplet**: [*Tuplet\_itf*](#interfacestuplet_itfmd)

Defined in: common.ts:94

___

### voice

• **voice**: *number*

Defined in: common.ts:89


<a name="interfacesrest_itfmd"></a>

# Interface: Rest\_itf

## Properties

### begin

• **begin**: *number*

Defined in: common.ts:106

___

### cue

• `Optional` **cue**: Cue\_itf

Defined in: common.ts:110

___

### duration

• **duration**: *number*

Defined in: common.ts:107

___

### tuplet

• **tuplet**: [*Tuplet\_itf*](#interfacestuplet_itfmd)

Defined in: common.ts:109

___

### voice

• **voice**: *number*

Defined in: common.ts:108


<a name="interfacesscore_itfmd"></a>

# Interface: Score\_itf

## Properties

### composer

• **composer**: *string*[]

Defined in: common.ts:158

___

### crescs

• **crescs**: [*Cresc\_itf*](#interfacescresc_itfmd)[]

Defined in: common.ts:163

___

### instruments

• **instruments**: [*Instrument\_group\_itf*](#interfacesinstrument_group_itfmd)[]

Defined in: common.ts:160

___

### measures

• **measures**: [*Measure\_itf*](#interfacesmeasure_itfmd)[]

Defined in: common.ts:162

___

### slurs

• **slurs**: [*Slur\_itf*](#interfacesslur_itfmd)[]

Defined in: common.ts:161

___

### tempo

• `Optional` **tempo**: [*Tempo\_itf*](#interfacestempo_itfmd)

Defined in: common.ts:159

___

### title

• **title**: *string*[]

Defined in: common.ts:157


<a name="interfacesslur_itfmd"></a>

# Interface: Slur\_itf

## Properties

### is\_tie

• **is\_tie**: *boolean*

Defined in: common.ts:133

___

### left

• **left**: *string*

Defined in: common.ts:131

___

### right

• **right**: *string*

Defined in: common.ts:132


<a name="interfacesstaff_itfmd"></a>

# Interface: Staff\_itf

## Properties

### beams

• **beams**: *number*[][]

Defined in: common.ts:127

___

### clef

• **clef**: *number*

Defined in: common.ts:122

___

### grace

• **grace**: [*Measure\_itf*](#interfacesmeasure_itfmd)[]

Defined in: common.ts:126

___

### key\_signature

• **key\_signature**: Key\_signature

Defined in: common.ts:121

___

### notes

• **notes**: [*Note\_itf*](#interfacesnote_itfmd)[]

Defined in: common.ts:125

___

### rests

• **rests**: [*Rest\_itf*](#interfacesrest_itfmd)[]

Defined in: common.ts:124

___

### time\_signature

• **time\_signature**: Time\_signature

Defined in: common.ts:120

___

### voices

• **voices**: *number*

Defined in: common.ts:123


<a name="interfacestempo_itfmd"></a>

# Interface: Tempo\_itf

## Properties

### bpm

• `Optional` **bpm**: *number*

Defined in: common.ts:147

___

### duration

• `Optional` **duration**: *number*

Defined in: common.ts:145

___

### modifier

• `Optional` **modifier**: *boolean*

Defined in: common.ts:146

___

### text

• `Optional` **text**: *string*

Defined in: common.ts:144


<a name="interfacestuplet_itfmd"></a>

# Interface: Tuplet\_itf

## Properties

### display\_duration

• **display\_duration**: *number*

Defined in: common.ts:77

___

### id

• **id**: *string*

Defined in: common.ts:76

___

### label

• **label**: *number*

Defined in: common.ts:78
