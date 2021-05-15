FMT = svg
EXT = svg
all:
	../legc --format $(FMT) einsamer_wanderer.txt --cue-height 0 --duration-based-spacing 0.01 --inter-note-width 2 --inter-row-height 140 > einsamer_wanderer.$(EXT)
	../legc --format $(FMT) auld_lang_syne.txt --duration-based-spacing 0.1 --inter-row-height 80 > auld_lang_syne.$(EXT)
	../legc --format $(FMT) wu_xi_jing.txt --font ../tools/chinese.hf.json --lyric-scale 0.75 --duration-based-spacing 0.075 --inter-note-width 5 --beam-policy 1 > wu_xi_jing.$(EXT)
	../legc --format $(FMT) yang_guan_san_die.txt --font ../tools/chinese.hf.json --lyric-scale 0.72 --cue-height 5 > yang_guan_san_die.$(EXT)
	../legc --format $(FMT) mozart_turkish_march.txt --stem-length 3 --beam-max-slope 0.2 --cue-height 0 > mozart_turkish_march.$(EXT)
	../legc --format $(FMT) chopin_berceuse.txt --inter-note-width 0 --tuplet-label-spacing 0.1 --inter-row-height 150 > chopin_berceuse.$(EXT)
	../legc --format $(FMT) chopin_prelude_7.txt --stem-length 3 --page-margin-x 42 --tempo-composer-text-size 20 > chopin_prelude_7.$(EXT)
	../legc --format $(FMT) minuet_G.txt --stem-length 3 --inter-note-width 2 --duration-based-spacing 0.04 > minuet_G.$(EXT)
	../legc --format $(FMT) beethoven_moonlight.txt --tuplet-label-spacing 1.7 > beethoven_moonlight.$(EXT)
	../legc --format $(FMT) art_of_fugue.txt --inter-staff-height 50 --page-width 1600 --page-margin-x 80 --duration-based-spacing 0.04 --tempo-composer-text-size 20 --timesig-common-time-c 1 > art_of_fugue.$(EXT)
	../legc --format $(FMT) bwv9_excerpt.txt --inter-staff-height 50 --page-width 1350 --page-margin-x 60 --duration-based-spacing 0.00 --inter-note-width 5 --lyric-scale 0.5 --beam-policy 1 > bwv9_excerpt.$(EXT)