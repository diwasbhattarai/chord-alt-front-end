const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const INTERVALS = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    '7': [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    minmaj7: [0, 3, 7, 11],
    dim7: [0, 3, 6, 9],
    hdim7: [0, 3, 6, 10],
    aug7: [0, 4, 8, 10],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    '9': [0, 4, 7, 10, 14],
    maj9: [0, 4, 7, 11, 14],
    min9: [0, 3, 7, 10, 14],
    '11': [0, 4, 7, 10, 14, 17],
    maj11: [0, 4, 7, 11, 14, 17],
    min11: [0, 3, 7, 10, 14, 16],
    '13': [0, 4, 7, 10, 14, 17, 21],
    maj13: [0, 4, 7, 11, 14, 17, 21],
    min13: [0, 3, 7, 10, 14, 17, 21],
    add9: [0, 4, 7, 14],
  };
function getNoteIndex(note) {
  const index = NOTES.indexOf(note);
  if (index === -1) throw new Error('Invalid note name');
  return index;
}

function transposeNote(note, interval) {
    const index = (getNoteIndex(note) + interval + NOTES.length) % NOTES.length;
    return NOTES[index];
  }

function spellChord(chord) {
    const regex = /^([A-Ga-g])([#b]?)([^#b]*)$/;
    const match = chord.match(regex);
  
    if (!match) throw new Error('Invalid chord name');
  
    const [, note, accidental, suffix] = match;

    let root = note.toUpperCase();
    if (accidental === 'b') {
      root = transposeNote(root, -1);
    } else if (accidental === '#') {
      root = transposeNote(root, 1);
    }
  
    let intervals;
    if (INTERVALS.hasOwnProperty(suffix)) {
      intervals = INTERVALS[suffix];
    } else {
      const baseIntervals = suffix.startsWith('m') ? INTERVALS.min : INTERVALS.maj;
      const additionalSuffix = suffix.startsWith('m') ? suffix.slice(1) : suffix;
      const additionalIntervals = INTERVALS[additionalSuffix];
         if (additionalIntervals) {
             intervals = [
               ...baseIntervals.slice(0, 3),
               ...additionalIntervals.slice(3),
             ];
      } else {
        intervals = baseIntervals;
      }
    }
  
    const notes = intervals.map(interval => transposeNote(root, interval));
    return notes;
  
}

let pianoPart;
let responseData;
let playing = false;
Tonal.ChordType.add(['1P', '3m', '5P', '7m'], ['min9'], 'minor ninth')
Tonal.ChordType.add(['1P', '3m', '5d', '7m'], ['min7b5'], 'minor seventh flat five')
Tonal.ChordType.add(['1P', '3m', '5P', '7m', '9M', '13M'], ['min13'], 'minor thirteenth')
Tonal.ChordType.add(['1P', '3m', '5P', '7m', '9M', '11P'], ['min11'], 'minor eleventh')
Tonal.ChordType.add(['1P', '3m', '5d', '7d'], ['ø7'], 'diminished seventh')

function playChordProgression(chordProgression, alternate, altIndex, alternate0, altIndex0) {

    // select all elements with class='chord_%d' and only remove the class 'chord_%d'
    $('.chord_item').each(function(index) {
        $(this).removeClass('chord_'+index);
    });

    $('.alt_chord_item').each(function(index) {
        // remove all classes that start with 'chord_' and end with '_%d'
        $(this).removeClass(function (index, css) {
            return (css.match (/(^|\s)chord_\S+/g) || []).join(' ');
        });
    });

    if (playing) {
        
        // if (alternate) 
        // {
        //     changePlayIcon('.alternates_'+altIndex);   
        // }
        // changePlayIcon('#play_original_button_icon');
        stopPlaying();
        return;
    }




    debugger;
    if (!alternate0) { // original progression
        // get all elements with class='chord_item' and sequentially add chord_1, chord_2, chord_3, etc.
        $('.chord_item').each(function(index) {
            $(this).addClass('chord_'+index);
        });
    } else {
        // console.log('.alt_chord'+altIndex0+'_'+altIndex);
        if (!alternate) {
            $('.alt_chords'+altIndex0).each(function(index) {
                $(this).addClass('chord_'+index);
            });
        } else {
            $('.alt_chords_passing'+altIndex0).each(function(index) {
                $(this).addClass('chord_'+index);
            });
        }
    }




    var synth = new Tone.PolySynth(Tone.Synth).toMaster();

    notesCollection = [];
    for (let i = 0; i < chordProgression.length; i++) {
        let chord = chordProgression[i];
        let notes = Tonal.Chord.get(chord)['notes'].map((note, idx) => idx===0 ? note+'3' : note+'4');
        // console.log(chord, notes);
        notesCollection.push(notes);
    }

    let timeline = [];
    for (let i = 0; i < notesCollection.length; i++) {
        let chord = notesCollection[i];
        let time = i * 2;
        timeline.push(['0:'+time, chord]);
    }
    
    let idx = 0;
    pianoPart = new Tone.Part(function(time, chord) {
        synth.triggerAttackRelease(chord, "1", time);
        changeChordColor(idx++ % chordProgression.length, alternate0, altIndex0, alternate, altIndex);
    }, timeline).start();

    pianoPart.loop = true;
    pianoPart.loopEnd = chordProgression.length + '';
    pianoPart.start();
    Tone.Transport.start();
    
    playing = !playing;

    if (!alternate0) {
        changePlayIcon('#play_original_button_icon');
    } else {
        if (alternate) {
            changePlayIcon('.alternates_'+altIndex0);
        } else {
            changePlayIcon('.alternates0_'+altIndex0);
        }
    }
    
}

function changePlayIcon(selector) {
    if (playing) {
        $(selector).toggleClass('fa-stop');
    } else {
        $(selector).toggleClass('fa-play');
    }
}

function showHidePlayReharmBtn() {
    if (chords.length > 0) {
        $('#play_original_button').show();
        $('#submit_button').show();
    } else {
        $('#play_original_button').hide();
        $('#submit_button').hide();
    }
}

function changeChordColor(index, alternate, altIndex, passing, passingIndex) {
    if (!alternate) {
        $('.chord_item').css('background-color', 'white');
        $('.chord_'+index).css('background-color', '#3e8e415f');
    } else {
        console.log('.alt_chord_item .alt_chords'+(altIndex)+'_'+index+' chord_'+index);
        if (passing){
            $('.alt_chord_item').css('background-color', 'white');
            $('.alt_chord_item.alt_chords_passing'+(altIndex)+'_'+index+'.chord_'+index).css('background-color', '#3e8e415f');
        } else {
            $('.alt_chord_item').css('background-color', 'white');
            $('.alt_chord_item.alt_chords'+(altIndex)+'_'+index+'.chord_'+index).css('background-color', '#3e8e415f');
        }
        
    }
}

function getNewProgressionWPassingChords(index) {
    let currentAlt = (responseData['alternates'][index]);
    let newProgression = [];
    for (let i = 0; i < currentAlt['reharmonized'].length; i++) {
        let current = currentAlt['reharmonized'];
        if (current[i] === currentAlt['passing_chord_locations'][0]){
            if (i+1 < current.length && current[i+1] === currentAlt['passing_chord_locations'][1]){
                newProgression.push(current[i]);
                newProgression.push(currentAlt['new_passing_chords'][0])
            } else if (i+1 === current.length && current[0] === currentAlt['passing_chord_locations'][1]){
                newProgression.push(current[i]);
                newProgression.push(currentAlt['new_passing_chords'][0])
            }
        }
        else
            newProgression.push(current[i]);
    }
    
    return newProgression;
}

function playChordProgressionPassing(index) {
    let newProgression = getNewProgressionWPassingChords(index);
    playChordProgression(newProgression, true, -1, true, index);
}

function stopPlaying() {
    
    if (pianoPart)
        try{
            pianoPart.stop();
        } catch (e) {
            console.log(e);
        }
    if (Tone.Transport.state === 'started')
        Tone.Transport.stop();
    
    playing = false;
    $('#current_progression').empty();
    $('.chord_item').css('background-color', 'white');
    $('.alt_chord_item').css('background-color', 'white');
    
    changePlayIcon('#play_original_button_icon');
    changePlayIcon('.alternates');
    changePlayIcon('.alternates0');
}

function transformChordType(arrayOfStrings) {
    // changes ['Cmaj', 'Dm'] to '[Cmaj, Dm]'
    let newString = '[';
    for (let i = 0; i < arrayOfStrings.length; i++) {
        newString += arrayOfStrings[i];
        if (i !== arrayOfStrings.length-1)
            newString += ', ';
    }
    newString += ']';
    return newString;
}

function inverseTransformChordType(str) {
    // changes '[Cmaj, Dm]' to ['Cmaj', 'Dm']
    // console.log(str);
    let newstr = str.substring(1, str.length-1).split(",").map(s => s.trim());
    return newstr;
}

$(document).on('click', '#play_original_button',(function(e) {
    e.preventDefault();
    
    let progression = transformChordType(chords);
    

    // take the progression and split each chord it into an array
    let progression_chord_array = progression.substring(1, progression.length-1).split(",").map(s => s.trim());
    // console.log(progression_chord_array);

    // playing = true;
    playChordProgression(progression_chord_array);

    // changePlayIcon('#play_original_button_icon');
}));


let showingTab = {index: -1, passing: false};
$(document).on('click', '#submit_button',(function(e) {
	e.preventDefault();
    // $('#output').empty();
	// let progression = $('#progression_input').val();
    let progression = transformChordType(chords);
    let style = $('#style_input').val();
    let passingChords = $('#passing_input').val();
    let number = $('#number_input').val();
	
    
    $('.loading-spinner').show();
    $('#submit_button').prop('disabled', true);

    // url: 'http://localhost:5000/api/reharmonize',

	$.ajax({
        url: 'https://chord-alt-api.azurewebsites.net/api/reharmonize',
		type: 'GET',
		dataType: 'json',
		data: {'progression': progression},
		contentType: 'application/json; charset=utf-8',
		success: function(response) {
            responseData = response;
			console.log(response);
            
            
            let genChordContainer = document.getElementById('gen-container');
            genChordContainer.innerHTML = '';
            genChordContainer.appendChild(document.createElement('hr'))
            genChordContainer.classList.add('row');

            for (let i = 0; i < response['alternates'].length; i++) {
                let chords = response['alternates'][i]['reharmonized'];
                let explanation = response['alternates'][i]['explanation'];
                let newPassingChords = response['alternates'][i]['new_passing_chords'];
                let passingChordLocations = response['alternates'][i]['passing_chord_locations'];
                let passingChordExplanation = response['alternates'][i]['passing_chord_explanation'];
                let fingerings = response['chord_fingerings'];
                
                let inv_chords = (chords);
                let inv_passingChords = (getNewProgressionWPassingChords(i));

                genChordsDiv = genChordContainer.appendChild(document.createElement('div'))
                genChordsDiv.classList.add('gen_chords_container');
                genChordsDiv = genChordsDiv.appendChild(document.createElement('div'))
                let genChordsDivOg = genChordsDiv;
                genChordsDiv = genChordsDiv.appendChild(document.createElement('div'))
                genChordsDiv.classList.add('row', 'gen_chords_progression');

                genChordsDiv.innerHTML += `
                    <h6 class="text-sm-right text-muted" style="text-align: left; padding-top:5px">Progression ${i+1}</h6>
                `;

                let explanationHTML = `
                <div class="">
                    <div class="col-auto">
                        <p class="text-sm-left" style="text-align: left;">${explanation}</p>
                    </div>
                </div>

                `;
                genChordsDiv.innerHTML += explanationHTML;

                // add a circular play button for each alternate
                let genChordsItem = (document.createElement('div'))
                genChordsItem.classList.add('col-md-2');
                genChordsItem.classList.add('align-self-center');
                
                let showTabDiv = document.createElement('div');
                showTabDiv.classList.add('row');
                showTabDiv.innerHTML = `
                            <button type="button" class="col btn btn-primary-outline btn-icon" style="background-color:transparent">
                                <i class="fa fa-guitar" style="color:black"></i>
                            </button>`;

                showTabDiv.onclick = (function(index, progression, passing, fingerings_dict) {
                    return function () {
                        console.log(index, progression, passing, fingerings_dict, showingTab);

                        if (showingTab.index !== -1) {
                            let tabs = document.querySelectorAll("[class^='tab-chords']");
                            
                            for (let i = 0; i < tabs.length; i++) {
                                $(tabs[i]).text('');
                            }

                            // for (i = 0; i < progression.length; i++) {
                            //     // if (showingTab.passing) {
                            //         let element = document.getElementsByClassName('tab-chords-passing' + index + '_' + (i))[0];
                            //         element.innerHTML = '';
                            //     // } else {
                            //         element = document.getElementsByClassName('tab-chords' + index + '_' + (i))[0];
                            //         element.innerHTML = '';
                            //     // }
                            // }
                            
                            showingTab.index = -1;
                            // showingTab.passing = false;
                        } else {
                            for (i = 0; i < progression.length; i++) {
                                let chord = progression[i];
                                let fingering = fingerings_dict[chord];

                                let element = document.getElementsByClassName('tab-chords' + index + '_' + (i))[0];
                                element.innerHTML = '';
                                // element.classList.add('col-md-3')
                                if (!fingering) continue;

                                let shape = fingering[0]['positions'].join('');
                                let root = 1;
                                for (let j = 0; j < shape.length; j++) {
                                    if (shape[j] === 'x') continue;
                                    else { 
                                        root = j + 1;
                                        break;
                                    }
                                }
                                
                                let svg = new ChordySvg({ name: '', 
                                                        shape: fingering[0]['positions'].join(''), 
                                                        root: root,
                                                        stringCount: 6,
                                                        }, 
                                                        { target: element });
                                // debugger;
                            }
                            showingTab.index = index;
                            // showingTab.passing = passing;
                        }

                    };
                })(i, chords, false, fingerings);


                genChordsItem.appendChild(showTabDiv);

                let playChordsBtnDiv = document.createElement('div');
                // playChordsBtnDiv.classList.add('row');
                playChordsBtnDiv.innerHTML = `
                            <button type="button" class="btn btn-primary btn-sm btn-rounded btn-icon rounded-circle play_button">
                                <i class="fa fa-play alternates0 alternates0_${i}"></i>
                            </button>`;
                genChordsItem.appendChild(playChordsBtnDiv);

                playChordsBtnDiv.onclick = (function(i){
                    return function() { 
                        // debugger;
                        playChordProgression(chords, false, -1, true, i);
                    };
                })(i)
                genChordsDiv.appendChild(genChordsItem);
                
                let genChordGrp = document.createElement('div');
                genChordGrp.classList.add('col-md-10', 'align-self-center');


                
                // genChordsItem = (document.createElement('div'));
                // genChordsItem.classList.add('col-md-10');
                // loop through each chord in the progression
                for (let j = 0; j < chords.length; j++) {
                    // genChordsItem = genChordsItem.appendChild(document.createElement('div'))
                    let tabDiv = document.createElement('div');
                    tabDiv.classList.add('tab-chords'+i+'_'+j);
                    
                    // genChordsDiv.appendChild(genChordsItem);

                    genChordsItem = genChordsItem.appendChild(document.createElement('div'))
                    
                    genChordsItem.classList.add('col-auto', 'align-self-center', 'alt_chord_item', 'alt_chords'+i, 'alt_chords'+i+'_'+j);
                    genChordsItem.textContent = inv_chords[j];

                    genChordsItem.appendChild(tabDiv);
                    
                    genChordGrp.appendChild(genChordsItem);
                }
                genChordsDiv.appendChild(genChordGrp);
                let hr = document.createElement('hr');
                // hr.style.marginTop = '20px';
                genChordsDivOg.appendChild(hr);

                explanationHTML = `
                <div class="">
                    <div class="col-12">
                        <p style="text-align: left;">${passingChordExplanation}</p>
                    </div>
                </div>

                `;
                



                genChordsDiv = genChordsDivOg.appendChild(document.createElement('div'))
                genChordsDiv.innerHTML += explanationHTML;

                genChordsDiv = genChordsDiv.appendChild(document.createElement('div'))

                // genChordsDiv.classList.add('row', 'gen_chords_passing', 'gen_chords_progression', 'flex-nowrap');
                genChordsDiv.classList.add('row', 'gen_chords_passing', 'gen_chords_progression');

                genChordsItem = (document.createElement('div'))
                genChordsItem.classList.add('col-md-2');
                genChordsItem.classList.add('align-self-center');
                // genChordsDiv.innerHTML += explanationHTML;
                showTabDiv = document.createElement('div');
                showTabDiv.classList.add('row');
                showTabDiv.innerHTML = `
                            <button type="button" class="col btn btn-primary-outline btn-icon" style="background-color:transparent">
                                <i class="fa fa-guitar" style="color:black"></i>
                            </button>`;

                genChordsItem.appendChild(showTabDiv);

                playChordsBtnDiv = document.createElement('div');
                // playChordsBtnDiv.classList.add('row');
                playChordsBtnDiv.innerHTML = `
                            <button type="button" class="btn btn-primary btn-sm btn-rounded btn-icon rounded-circle play_button">
                                <i class="fa fa-play alternates alternates_${i}"></i>
                            </button>`;
                playChordsBtnDiv.onclick = (function(i){
                    return function() { 
                        debugger;
                        playChordProgression(inv_passingChords, true, -1, true, i);
                    };
                })(i)

                showTabDiv.onclick = (function(index, progression, passing, fingerings_dict) {
                    return function () {
                        console.log(index, progression, passing, fingerings_dict, showingTab);

                        if (showingTab.index !== -1) {
                            let tabs = document.querySelectorAll("[class^='tab-chords']");
                            
                            for (let i = 0; i < tabs.length; i++) {
                                $(tabs[i]).text('');
                            }
                            // for (i = 0; i < progression.length; i++) {
                            //     // if (showingTab.passing) {
                            //     let element = document.getElementsByClassName('tab-chords-passing' + index + '_' + (i))[0];
                            //     element.innerHTML = '';
                            //     // } else {
                            //     element = document.getElementsByClassName('tab-chords' + index + '_' + (i))[0];
                            //     element.innerHTML = '';
                            //     // }
                            // }
                            
                            showingTab.index = -1;
                            // showingTab.passing = false;
                            return;
                        }



                        for (i = 0; i < progression.length; i++) {
                            let chord = progression[i];
                            let fingering = fingerings_dict[chord];

                            let element = document.getElementsByClassName('tab-chords-passing' + index + '_' + (i))[0];
                            element.innerHTML = '';
                            // element.classList.add('col-md-3')
                            if (!fingering) continue;

                            let shape = fingering[0]['positions'].join('');
                            let root = 1;
                            for (let j = 0; j < shape.length; j++) {
                                if (shape[j] === 'x') continue;
                                else { 
                                    root = j + 1;
                                    break;
                                }
                            }
                            
                            let svg = new ChordySvg({ name: '', 
                                                        shape: fingering[0]['positions'].join(''), 
                                                        root: root,
                                                        stringCount: 6,
                                                    }, 
                                                        { target: element });
                        }
                        showingTab.index = index;
                        // showingTab.passing = passing;

                    };
                })(i, inv_passingChords, true, fingerings);
                genChordsItem.appendChild(playChordsBtnDiv);

                // genChordsItem.innerHTML = `
                //             <button type="button" class="btn btn-primary btn-sm btn-rounded btn-icon rounded-circle play_button">
                //                 <i class="fa fa-play alternates alternates_${i}"></i>
                //             </button>
                // `;
                console.log([chords.map((chord) => `'${chord}'`).join(', ')]);
                
                // genChordsItem.onclick = function() { 
                //     playChordProgressionPassing(i)
                // }
                genChordsDiv.appendChild(genChordsItem);
                
                genChordGrp = (document.createElement('div'))
                genChordGrp.classList.add('col-md-10', 'align-self-center');

                for (let j = 0; j < inv_passingChords.length; j++) {
                    genChordsItem = (document.createElement('div'))
                    genChordsItem.classList.add('col-auto', 'alt_chord_item', 'alt_chords_passing'+i, 'alt_chords_passing'+i+'_'+j);
                    genChordsItem.textContent = inv_passingChords[j];

                    let tabDiv = document.createElement('div');
                    tabDiv.classList.add('tab-chords-passing'+i+'_'+j);
                    genChordsItem.appendChild(tabDiv);

                    genChordGrp.appendChild(genChordsItem);
                }
                genChordsDiv.appendChild(genChordGrp);
            }
            
            $('.loading-spinner').hide();
            $('#submit_button').prop('disabled', false);
        },
        error: function (error) {
            console.error('ERROR: ', error);
            $('.toast').toast('show');
            $('.loading-spinner').hide();
            $('#submit_button').prop('disabled', false);
        }
	});
}));


