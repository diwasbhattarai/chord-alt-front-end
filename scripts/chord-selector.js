const rootNoteSelect = document.getElementById('root-note');
const qualitySelect = document.getElementById('quality');
const addChordButton = document.getElementById('add-chord');
const chordsContainer = document.getElementById('chords-container');

// let chords = ['Gmaj', 'Emin', 'Cmaj', 'Dmaj'];
let chords = ['G', 'Em', 'C', 'D'];
// let chords = ["A#7", "G#dim7", "F#aug", "D#dim7"];


function buildChordName() {
    const rootNote = rootNoteSelect.value;
    const quality = qualitySelect.value;
    return rootNote + quality;
}

let chordIdx = 0;
function addChord() {
    
    stopPlaying();



    const chordName = buildChordName();
    const chord = document.getElementById('chords-container').appendChild(document.createElement('div'));
    chord.classList.add('col', 'chord_item', 'close-btn');
    chord.textContent = chordName;
    chord.addEventListener('click', () => removeChord(chord));
    chords.push(chordName);
    chordsContainer.appendChild(chord);

    showHidePlayReharmBtn();

    toggleAddBtn();
    
}

function toggleAddBtn() {
    if (chords.length >= 5) {
        $('#add-chord').prop('disabled', true);
        return;
    } else {
        $('#add-chord').prop('disabled', false);
    }
}

function firstLoad() {
    for (let i = 0; i < chords.length; i++) {
        const chordName = chords[i];
        let chord = document.getElementById('chords-container').appendChild(document.createElement('div'));
        
        chord.classList.add('col', 'chord_item', 'close-btn');
        chord.textContent = chordName;
        chord.addEventListener('click', () => removeChord(chord));
        chordsContainer.appendChild(chord);
    }
}

function removeChord(chord) {
    
    stopPlaying();

    const index = chords.indexOf(chord.textContent);
    if (index !== -1) {
        chords.splice(index, 1);
        chordsContainer.removeChild(chord);
    }

    showHidePlayReharmBtn();
    toggleAddBtn();
}

addChordButton.addEventListener('click', addChord);
firstLoad();