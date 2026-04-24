var line_of_fifths = [
  "F\u266D",
  "C\u266D",
  "G\u266D",
  "D\u266D",
  "A\u266D",
  "E\u266D",
  "B\u266D",
  "F",
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F\u266F",
  "C\u266F",
  "G\u266F",
  "D\u266F",
  "A\u266F",
  "E\u266F",
  "B\u266F",
];

function show_notes_to_play() {

  var keyNoteElement = document.getElementById("key");
  var keyModeElement = document.getElementById("mode");
  var bassNoteElement = document.getElementById("bassNote");
  var bassNote = bassNoteElement.options[bassNoteElement.selectedIndex].value;
  var keyNote = keyNoteElement.options[keyNoteElement.selectedIndex].text;
  var keyMode = keyModeElement.options[keyModeElement.selectedIndex].value;
  var scale = get_scale(keyNote, keyMode);
  var bassAccidentalElement = document.getElementById("accidental");
  var bassAccidental = bassAccidentalElement.options[bassAccidentalElement.selectedIndex].text;
  if (bassAccidental == "\u00A0") {
    if (!scale.includes(bassNote)) {
      var index = scale.findIndex(note => note.startsWith(bassNote));
      bassNote = scale[index];
    }
  }
  bassNote += bassAccidental;
  getIntervalAboveWithinKey(scale, bassNote, 5, 1);

  var figures = document.querySelector('input[name="figures"]:checked').value;
  var notes = realizeFigures(scale, bassNote.trim(), figures);
  var bSorted = -1;
  notes.sort();
  for (i = 0; bSorted != 1; i++) {
    if (notes[i] != null && compare(notes[i], bassNote) == -1)
      notes = mutableRotateLeft(notes);
    else
      bSorted = 1;
  }
  document.getElementById("demo").innerHTML = bassNote.trim() + "," + notes; // "Bass note: "+bassNote+"<br/>Notes to play above bass note: "+notes;
  notes.length = 0;

}

function compare(a, b) {
  if (a < b)
    return -1;
  else if (a > b)
    return 1;
  else
    return 0;
}

function mutableRotateLeft(arr) {
  arr.push(arr.shift());
  return arr;
}

function get_scale(keyNote, keyMode) {
  var scale = [];
  var keyNoteIndex = line_of_fifths.indexOf(keyNote);

  if (keyMode == "Major") {
    scale.push(line_of_fifths[keyNoteIndex]);
    scale.push(line_of_fifths[keyNoteIndex + 2]);
    scale.push(line_of_fifths[keyNoteIndex + 4]);
    scale.push(line_of_fifths[keyNoteIndex - 1]);
    scale.push(line_of_fifths[keyNoteIndex + 1]);
    scale.push(line_of_fifths[keyNoteIndex + 3]);
    scale.push(line_of_fifths[keyNoteIndex + 5]);
  }
  else {
    scale.push(line_of_fifths[keyNoteIndex]);
    scale.push(line_of_fifths[keyNoteIndex + 2]);
    scale.push(line_of_fifths[keyNoteIndex - 3]);
    scale.push(line_of_fifths[keyNoteIndex - 1]);
    scale.push(line_of_fifths[keyNoteIndex + 1]);
    scale.push(line_of_fifths[keyNoteIndex - 4]);
    scale.push(line_of_fifths[keyNoteIndex - 2]);
  }
  return scale;
}

function getIntervalAboveWithinKey(scale, noteBass, nStepsUp, iAlter) {
  var startIndex = scale.findIndex(note => note.startsWith(noteBass.charAt(0)));
  var endIndex = startIndex + nStepsUp - 1;
  if (endIndex > 6)
    endIndex %= 7;
  var newNote = scale[endIndex];
  switch (iAlter) {
    case -2:
      {
        for (i = 0; i < 2; i++) {
          if (newNote.endsWith("\u266F"))
            newNote = newNote.substring(0, newNote.length - 1);
          else
            newNote += "\u266D";
        }
        break;
      }
    case -1:
      {
        if (newNote.endsWith("\u266F"))
          newNote = newNote.substring(0, newNote.length - 1);
        else
          newNote += "\u266D";
        break;
      }
    case 1:
      {
        if (newNote.endsWith("\u266D"))
          newNote = newNote.substring(0, newNote.length - 1);
        else
          newNote += "\u266F";
        break;
      }
    case 2:
      {
        for (i = 0; i < 2; i++) {
          if (newNote.endsWith("\u266D"))
            newNote = newNote.substring(0, newNote.length - 1);
          else
            newNote += "\u266F";
        }
        break;
      }
    case 0:
    default:
  }
  //alert("Bass Note: "+noteBass+" Scale: "+scale+" Index: "+startIndex+" End Index: "+endIndex+" New Note: "+newNote);
  return newNote;
}

function realizeFigures(scale, noteBass, sFB) {
  var figures = [];
  var notes = [];
  notes.push(noteBass);
  var iAlter = 0;

  for (index = 0; index < sFB.length; index++) {
    if (sFB.charAt(index) == '#' || sFB.charAt(index) == '+' || sFB.charAt(index) == '\u266F')
      iAlter += 1;
    else if (sFB.charAt(index) == 'b' || sFB.charAt(index) == '-' || sFB.charAt(index) == '\u266D')
      iAlter -= 1;
    else if (sFB.charAt(index) == 'T' || sFB.charAt(index) == '0') {
      figures.length = 0;
      figures.push(0);
      notes.length = 0;
      notes.push("none");
      return notes;
    }
    else if (!isNaN(parseInt(sFB.charAt(index), 10))) //isDigit?
    {
      var nSteps = parseInt(sFB.charAt(index), 10);
      var note = getIntervalAboveWithinKey(scale, noteBass, nSteps, iAlter);
      notes.push(note);
      figures.push(nSteps);
      iAlter = 0;

    }
  }
  if (!figures.includes(5))
    if (!figures.includes(6)) {
      var note = getIntervalAboveWithinKey(scale, noteBass, 5, 0);
      notes.push(note);
      if (getNumberOfSecondsInChord(notes) > 1) {
        notes = arrayRemove(notes, note);
        note = getIntervalAboveWithinKey(scale, noteBass, 6, 0);
        notes.push(note);
        if (getNumberOfSecondsInChord(notes) > 1)
          notes = arrayRemove(notes, note);
      }
    }
  if (!figures.includes(3))
    if (!figures.includes(4)) {
      if (sFB.length == 1 && (sFB == "#" || sFB == "+" || sFB == "\u266F"))
        var note = getIntervalAboveWithinKey(scale, noteBass, 3, 1);
      else if (sFB.length == 1 && (sFB == "b" || sFB == "-" || sFB == "\u266D"))
        var note = getIntervalAboveWithinKey(scale, noteBass, 3, -1);
      else
        var note = getIntervalAboveWithinKey(scale, noteBass, 3, iAlter);
      notes.push(note);
      if (getNumberOfSecondsInChord(notes) > 1) {
        notes = arrayRemove(notes, note);
        note = getIntervalAboveWithinKey(scale, noteBass, 4, 0);
        notes.push(note);
        if (getNumberOfSecondsInChord(notes) > 1)
          notes = arrayRemove(notes, note);
      }
    }
  notes.shift();
  return notes;
}

function getNumberOfSecondsInChord(notes) {
  var nSteps = 0;
  notes.forEach(function (element) {
    notes.forEach(function (element2) {
      if (isStep(element, element2))
        nSteps++;
    });
  });
  return nSteps;
}

function isStep(note1, note2) {
  switch (note1.charAt(0)) {
    case 'A':
      {
        if (note2.charAt(0) == 'B')
          return true;
        else
          return false;
      }
    case 'B':
      {
        if (note2.charAt(0) == 'C')
          return true;
        else
          return false;
      }
    case 'C':
      {
        if (note2.charAt(0) == 'D')
          return true;
        else
          return false;
      }
    case 'D':
      {
        if (note2.charAt(0) == 'E')
          return true;
        else
          return false;
      }
    case 'E':
      {
        if (note2.charAt(0) == 'F')
          return true;
        else
          return false;
      }
    case 'F':
      {
        if (note2.charAt(0) == 'G')
          return true;
        else
          return false;
      }
    case 'G':
      {
        if (note2.charAt(0) == 'A')
          return true;
        else
          return false;
      }
    default:
      return false;
  }
}


function arrayRemove(arr, value) {

  return arr.filter(function (ele) {
    return ele != value;
  });

}

function convert_pitch_to_int(name, accidental) {
  iStepClass = -1;
  switch (name) {
    case 'C': iStepClass = 0; break;
    case 'D': iStepClass = 1; break;
    case 'E': iStepClass = 2; break;
    case 'F': iStepClass = 3; break;
    case 'G': iStepClass = 4; break;
    case 'A': iStepClass = 5; break;
    case 'B': iStepClass = 6; break;
    default: break;
  }
  return iStepClass;
}

function change_mode() {
  var key = document.getElementById("key");
  var mode = document.getElementById("mode");
  var index = key.selectedIndex;
  if (mode.options[mode.selectedIndex].value == "Major") {
    key.options[0] = new Option('C\u266D', 'Cb');
    key.options[1] = new Option('G\u266D', 'Gb');
    key.options[2] = new Option('D\u266D', 'Db');
    key.options[3] = new Option('A\u266D', 'Ab');
    key.options[4] = new Option('E\u266D', 'Eb');
    key.options[5] = new Option('B\u266D', 'Bb');
    key.options[6] = new Option('F', 'F');
    key.options[7] = new Option('C', 'C');
    key.options[8] = new Option('G', 'G');
    key.options[9] = new Option('D', 'D');
    key.options[10] = new Option('A', 'A');
    key.options[11] = new Option('E', 'E');
    key.options[12] = new Option('B', 'B');
    key.options[13] = new Option('F\u266F', 'F#');
    key.options[14] = new Option('C\u266F', 'C#');
    index += 3;
    if (index > 14)
      index -= 12;
    key.selectedIndex = index;
  }
  else {
    key.options[0] = new Option('A\u266D', 'Ab');
    key.options[1] = new Option('E\u266D', 'Eb');
    key.options[2] = new Option('B\u266D', 'Bb');
    key.options[3] = new Option('F', 'F');
    key.options[4] = new Option('C', 'C');
    key.options[5] = new Option('G', 'G');
    key.options[6] = new Option('D', 'D');
    key.options[7] = new Option('A', 'A');
    key.options[8] = new Option('E', 'E');
    key.options[9] = new Option('B', 'B');
    key.options[10] = new Option('F\u266F', 'F#');
    key.options[11] = new Option('C\u266F', 'C#');
    key.options[12] = new Option('G\u266F', 'G#');
    key.options[13] = new Option('D\u266F', 'D#');
    key.options[14] = new Option('A\u266F', 'A#');
    index -= 3;
    if (index < 0)
      index += 12;
    key.selectedIndex = index;
  }
}


function close_dropdown() {
  // var lab = document.getElementById("dropbuttonlabel");
  // var btn = document.getElementById("dropbutton");
  // var radioButtons = document.getElementsByName("figures");
  // for (var x = 0; x < radioButtons.length; x++) {
  //   if (radioButtons[x].checked) {
  //     lab.innerHTML = radioButtons[x].nextSibling.innerHTML + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class='triangle'>&#9660;</span>";
  //   }
  // }
  // btn.checked = false;
}

function deleteAllCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}