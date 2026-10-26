  var M = 'https://www.muscleandstrength.com/exercises/';
  function IM(q) { return 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(q + ' Übung'); }
  var GROUPS = [
    { k: 'pull', n: 'Pull', i: 'pull' },
    { k: 'push', n: 'Push', i: 'push' },
    { k: 'core', n: 'Core', i: 'core' },
    { k: 'kh', n: 'Hantel', i: 'dumbbell' },
    { k: 'skill', n: 'Skills', i: 'star' },
    { k: 'cardio', n: 'Bike', i: 'bike' },
    { k: 'mob', n: 'Mobility', i: 'roll' }
  ];
  var EX = [
    { id: 'chin', n: 'Klimmzug eng, Rückgriff', g: 'pull', mu: 'Rücken · Bizeps', u: 'Wdh.', sets: 5, mode: 'best', goal: 5, url: M + 'chin-up.html', hint: 'Bis 1-2 Wdh. vor dem Versagen aufhören.' },
    { id: 'neg', n: 'Negative Klimmzüge', g: 'pull', mu: 'Rücken · Bizeps', u: 'Sek.', sets: 3, mode: 'best', goal: 5, url: M + 'eccentric-only-pull-up', hint: 'Sekunden, die du zum Runterlassen brauchst.' },
    { id: 'hang', n: 'Dead Hang', g: 'pull', mu: 'Griff · Schulter · Nacken', u: 'Sek.', sets: 3, mode: 'best', goal: 90, url: 'https://fitnessvolt.com/dead-hangs/', hint: 'Längste Hängezeit pro Satz.' },
    { id: 'scap', n: 'Scapula-Pulls', g: 'pull', mu: 'Nacken · Schulterblätter', u: 'Wdh.', sets: 2, mode: 'all', goal: 12, url: 'https://fitnessvolt.com/scapular-pull-ups/', hint: 'Arme gestreckt, nur die Schulterblätter bewegen.' },
    { id: 'pull', n: 'Klimmzug eng, Vorgriff', g: 'pull', mu: 'Rücken · Schulter', u: 'Wdh.', sets: 5, mode: 'best', goal: 5, req: [['chin', 5]], url: M + 'pull-up' },
    { id: 'wide', n: 'Klimmzug weit', g: 'pull', mu: 'Rücken (Breite) · Schulter', u: 'Wdh.', sets: 5, mode: 'best', goal: 5, req: [['pull', 5]], url: M + 'wide-grip-pull-up.html' },
    { id: 'sclose', n: 'Klimmzug seitlich eng', g: 'pull', mu: 'Rücken · Arme', u: 'Wdh.', sets: 5, mode: 'best', goal: 5, req: [['wide', 5]], url: M + 'v-bar-pull-up.html' },
    { id: 'swide', n: 'Klimmzug seitlich weit', g: 'pull', mu: 'Rücken · Arme', u: 'Wdh.', sets: 5, mode: 'best', goal: 5, req: [['sclose', 5]], url: M + 'v-bar-pull-up.html' },
    { id: 'ultra', n: 'Klimmzug ganz weit', g: 'pull', mu: 'Rücken · Schulter', u: 'Wdh.', sets: 5, mode: 'best', goal: 3, req: [['swide', 5]], url: M + 'wide-grip-pull-up.html' },
    { id: 'push', n: 'Liegestütz', g: 'push', mu: 'Brust · Trizeps · Schulter', u: 'Wdh.', sets: 3, mode: 'all', goal: 20, url: M + 'push-up.html', hint: 'Zählt, wenn alle Sätze es erreichen.' },
    { id: 'pclose', n: 'Liegestütz eng', g: 'push', mu: 'Trizeps · Brust (Brett: Trizeps)', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, req: [['push', 20]], url: M + 'close-grip-push-up.html' },
    { id: 'pwide', n: 'Liegestütz weit', g: 'push', mu: 'Brust · Schulter (Brett: Brust)', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, req: [['push', 20]], url: M + 'wide-grip-push-ups.html' },
    { id: 'pike', n: 'Pike-Liegestütz', g: 'push', mu: 'Schulter · Nacken', u: 'Wdh.', sets: 3, mode: 'all', goal: 10, req: [['pclose', 10], ['pwide', 10]], url: 'https://fitnessvolt.com/pike-push-up/' },
    { id: 'hollow', n: 'Hollow-Body-Hold', g: 'core', mu: 'Core', u: 'Sek.', sets: 3, mode: 'all', goal: 45, url: M + 'hollow-body-hold' },
    { id: 'plank', n: 'Plank', g: 'core', mu: 'Core · Unterarme', u: 'Sek.', sets: 3, mode: 'all', goal: 60, url: M + 'hover.html' },
    { id: 'knee', n: 'Knieheben am Hang', g: 'core', mu: 'Core · Griff', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, req: [['hang', 90]], url: M + 'hanging-knee-raise.html' },
    { id: 'leg', n: 'Beinheben am Hang', g: 'core', mu: 'Core · Griff', u: 'Wdh.', sets: 3, mode: 'all', goal: 10, req: [['knee', 12]], url: M + 'hanging-leg-raise.html' },
    { id: 'lat', n: 'Seitheben', g: 'kh', mu: 'Schulter', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, kg: true, req: [['push', 20]], url: M + 'dumbbell-lateral-raise.html', hint: 'Bei 3x15 das Gewicht erhöhen.' },
    { id: 'rev', n: 'Reverse Fly', g: 'kh', mu: 'Schulter hinten · Rücken', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, kg: true, req: [['push', 20]], url: M + 'dumbbell-reverse-fly.html', hint: 'Bei 3x15 das Gewicht erhöhen.' },
    { id: 'shrug', n: 'Shrugs', g: 'kh', mu: 'Nacken · Trapez', u: 'Wdh.', sets: 3, mode: 'all', goal: 20, kg: true, req: [['hang', 90]], url: M + 'dumbbell-shrugs.html', hint: 'Bei 3x20 das Gewicht erhöhen.' },
    { id: 'curl', n: 'Bizeps-Curls', g: 'kh', mu: 'Bizeps', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, kg: true, req: [['chin', 5]], url: M + 'seated-dumbbell-curl.html', hint: 'Bei 3x15 das Gewicht erhöhen.' },
    { id: 'goblet', n: 'Goblet-Kniebeuge', g: 'kh', mu: 'Beine · Core', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, kg: true, req: [['chin', 3]], url: M + 'dumbbell-goblet-squat', hint: 'Ab 15 kg langsamer statt schwerer.' },
    { id: 'lunge', n: 'Ausfallschritte', g: 'kh', mu: 'Beine (Wdh. je Seite)', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['goblet', 15]], url: M + 'dumbbell-lunge.html', hint: 'Je Seite. Ab 15 kg langsamer.' },
    { id: 'lever', n: 'Frontlever Tuck', g: 'skill', mu: 'Core · Rücken', u: 'Sek.', sets: 3, mode: 'all', goal: 10, req: [['wide', 5], ['hollow', 45]], url: 'https://fitnessvolt.com/calisthenics/front-lever/', hint: 'Braucht Platz unter der Stange.' },
    { id: 'hand', n: 'Wand-Handstand', g: 'skill', mu: 'Schulter · Core · Nacken', u: 'Sek.', sets: 3, mode: 'all', goal: 45, req: [['pike', 10]], url: 'https://torokhtiy.com/blogs/guides/how-to-do-a-wall-handstand' },
    { id: 'deadbug', n: 'Dead Bug', g: 'core', mu: 'Core · tiefer Bauch', u: 'Wdh.', sets: 3, mode: 'all', goal: 10, url: IM('Dead Bug'), hint: 'Je Seite, unterer Rücken bleibt am Boden.' },
    { id: 'bridge', n: 'Glute Bridge', g: 'core', mu: 'Po · unterer Rücken', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, url: IM('Glute Bridge'), hint: 'Oben 1 Sek. halten.' },
    { id: 'super', n: 'Superman-Hold', g: 'core', mu: 'Unterer Rücken · Nacken', u: 'Sek.', sets: 3, mode: 'all', goal: 30, url: IM('Superman Hold') },
    { id: 'sidep', n: 'Seitstütz', g: 'core', mu: 'Seitliche Core', u: 'Sek.', sets: 3, mode: 'all', goal: 30, req: [['plank', 45]], url: IM('Seitstütz Side Plank'), hint: 'Zeit je Seite.' },
    { id: 'climb', n: 'Mountain Climbers', g: 'core', mu: 'Core · Kondition', u: 'Sek.', sets: 3, mode: 'all', goal: 30, req: [['plank', 45]], url: IM('Mountain Climbers') },
    { id: 'decl', n: 'Liegestütz, Füße erhöht', g: 'push', mu: 'Obere Brust · Schulter', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, req: [['pclose', 15], ['pwide', 15]], url: IM('Decline Push-up'), hint: 'Füße auf Stuhl oder Sofa.' },
    { id: 'archer', n: 'Archer-Liegestütz', g: 'push', mu: 'Brust · Trizeps (einseitig)', u: 'Wdh.', sets: 3, mode: 'all', goal: 6, req: [['decl', 15]], url: IM('Archer Push-up'), hint: 'Wiederholungen je Seite.' },
    { id: 'row', n: 'Hantelrudern', g: 'kh', mu: 'Rücken · Bizeps', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['chin', 3]], url: IM('Kurzhantel Rudern vorgebeugt'), hint: 'Rücken gerade, Ellbogen nah am Körper.' },
    { id: 'ohp', n: 'Schulterdrücken', g: 'kh', mu: 'Schulter · Trizeps', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['push', 20]], url: IM('Kurzhantel Schulterdrücken'), hint: 'Bei 3x12 das Gewicht erhöhen.' },
    { id: 'floor', n: 'Floor Press', g: 'kh', mu: 'Brust · Trizeps', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['push', 20]], url: IM('Kurzhantel Floor Press'), hint: 'Liegend auf dem Boden.' },
    { id: 'tri', n: 'Trizeps-Strecken', g: 'kh', mu: 'Trizeps', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['pclose', 10]], url: IM('Trizeps Überkopf Kurzhantel'), hint: 'Eine Hantel mit beiden Händen.' },
    { id: 'ham', n: 'Hammer-Curls', g: 'kh', mu: 'Bizeps · Unterarm', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['curl', 12]], url: IM('Hammer Curls') },
    { id: 'rdl', n: 'Rumänisches Kreuzheben', g: 'kh', mu: 'Hintere Kette · Rücken', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['goblet', 12]], url: IM('Rumänisches Kreuzheben Kurzhantel'), hint: 'Rücken gerade, Hüfte nach hinten.' },
    { id: 'calf', n: 'Wadenheben', g: 'kh', mu: 'Waden', u: 'Wdh.', sets: 3, mode: 'all', goal: 20, kg: true, req: [['goblet', 10]], url: IM('Wadenheben Kurzhantel') },
    { id: 'lsit', n: 'L-Sit', g: 'skill', mu: 'Core · Trizeps', u: 'Sek.', sets: 3, mode: 'all', goal: 15, req: [['hollow', 45], ['knee', 12]], url: IM('L-Sit am Boden'), hint: 'Auf den Griffen des Liegestützbretts.' },
    { id: 'advfl', n: 'Frontlever Advanced Tuck', g: 'skill', mu: 'Core · Rücken', u: 'Sek.', sets: 3, mode: 'all', goal: 10, req: [['lever', 10]], url: IM('Advanced Tuck Front Lever') },
    { id: 'archpu', n: 'Archer-Klimmzug', g: 'skill', mu: 'Rücken · Arme (einseitig)', u: 'Wdh.', sets: 3, mode: 'all', goal: 3, req: [['ultra', 3]], url: IM('Archer Pull-up'), hint: 'Wiederholungen je Seite.' },
    { id: 'crow', n: 'Krähe (Crow)', g: 'skill', mu: 'Core · Arme · Balance', u: 'Sek.', sets: 3, mode: 'all', goal: 20, req: [['plank', 60], ['hollow', 30]], url: IM('Crow Pose Krähe'), hint: 'Auf der Matte, Blick nach vorn.' },
    { id: 'psplan', n: 'Pseudo-Planche-Liegestütz', g: 'skill', mu: 'Schulter · Core · Handgelenke', u: 'Wdh.', sets: 3, mode: 'all', goal: 8, req: [['archer', 6], ['pike', 10]], url: IM('Pseudo Planche Push-up') },
    { id: 'hspu', n: 'Handstand-Liegestütz Wand', g: 'skill', mu: 'Schulter · Trizeps', u: 'Wdh.', sets: 3, mode: 'all', goal: 5, req: [['hand', 45], ['pike', 10]], url: IM('Wall Handstand Push-up') },
    { id: 'bike', n: 'Homebike', g: 'cardio', mu: 'Ausdauer · Beine', u: 'Min.', sets: 1, mode: 'best', goal: 20, url: IM('Heimtrainer Training locker'), hint: 'Locker, Gespräch möglich.' },
    { id: 'bikei', n: 'Bike-Intervalle', g: 'cardio', mu: 'Kondition · Beine', u: 'Runden', sets: 1, mode: 'best', goal: 6, req: [['bike', 20]], url: IM('Heimtrainer Intervalle HIIT'), hint: '30 Sek. schwer, 60 Sek. locker.' },
    { id: 'inc', n: 'Liegestütz, Hände erhöht', g: 'push', mu: 'Brust · Trizeps', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, url: IM('Incline Push-up'), hint: 'Hände auf Stuhl oder Sofa, leichter als normal.' },
    { id: 'taps', n: 'Schulter-Taps', g: 'push', mu: 'Schulter · Core', u: 'Wdh.', sets: 3, mode: 'all', goal: 20, url: IM('Plank Shoulder Taps'), hint: 'Hüfte bleibt ruhig.' },
    { id: 'dips', n: 'Dips am Stuhl', g: 'push', mu: 'Trizeps · Brust', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, req: [['push', 15]], url: IM('Bench Dips Stuhl') },
    { id: 'ppush', n: 'Pause-Liegestütz', g: 'push', mu: 'Brust · Kraft', u: 'Wdh.', sets: 3, mode: 'all', goal: 10, req: [['push', 15]], url: IM('Paused Push-up'), hint: '2 Sek. unten pausieren.' },
    { id: 'slow', n: 'Langsame Liegestütz', g: 'push', mu: 'Brust · Trizeps', u: 'Wdh.', sets: 3, mode: 'all', goal: 8, req: [['push', 15]], url: IM('Tempo Push-up'), hint: '4 Sek. runter, 1 Sek. hoch.' },
    { id: 'fly', n: 'Fliegende am Boden', g: 'kh', mu: 'Brust', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['push', 20]], url: IM('Dumbbell Floor Fly') },
    { id: 'frontr', n: 'Frontheben', g: 'kh', mu: 'Schulter vorn', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['push', 20]], url: IM('Dumbbell Front Raise') },
    { id: 'br_back', n: 'Blackroll Rücken', g: 'mob', mu: 'Brustwirbelsäule', u: 'Sek.', sets: 1, mode: 'best', goal: 60, url: IM('Blackroll Rücken Brustwirbelsäule'), hint: 'Langsam rollen, auf Druckpunkten kurz halten.' },
    { id: 'br_lat', n: 'Blackroll Seite', g: 'mob', mu: 'Latissimus', u: 'Sek.', sets: 1, mode: 'best', goal: 60, url: IM('Blackroll Latissimus'), hint: 'Je Seite, Arm gestreckt.' },
    { id: 'br_chest', n: 'Blackroll Brust', g: 'mob', mu: 'Brust · Schulter vorn', u: 'Sek.', sets: 1, mode: 'best', goal: 60, url: IM('Blackroll Brust Faszienball') },
    { id: 'br_quad', n: 'Blackroll Oberschenkel vorn', g: 'mob', mu: 'Quadrizeps', u: 'Sek.', sets: 1, mode: 'best', goal: 60, url: IM('Blackroll Oberschenkel vorne') },
    { id: 'br_ham', n: 'Blackroll Oberschenkel hinten', g: 'mob', mu: 'Beinbeuger', u: 'Sek.', sets: 1, mode: 'best', goal: 60, url: IM('Blackroll Oberschenkel hinten') },
    { id: 'br_glute', n: 'Blackroll Gesäß', g: 'mob', mu: 'Po · Hüfte', u: 'Sek.', sets: 1, mode: 'best', goal: 60, url: IM('Blackroll Gesäß') },
    { id: 'br_calf', n: 'Blackroll Waden', g: 'mob', mu: 'Waden', u: 'Sek.', sets: 1, mode: 'best', goal: 60, url: IM('Blackroll Waden') },
    { id: 'expl', n: 'Explosiver Klimmzug', g: 'pull', mu: 'Rücken · Explosivkraft', u: 'Wdh.', sets: 4, mode: 'best', goal: 5, req: [['pull', 8]], url: IM('Explosive Pull-up'), hint: 'Oben so schnell wie möglich, Brust Richtung Stange.' },
    { id: 'c2b', n: 'Klimmzug Brust zur Stange', g: 'pull', mu: 'Rücken · Explosivkraft', u: 'Wdh.', sets: 4, mode: 'best', goal: 5, req: [['expl', 5]], url: IM('Chest to Bar Pull-up') },
    { id: 'toes', n: 'Toes-to-Bar', g: 'core', mu: 'Core · Griff · Hüftbeuger', u: 'Wdh.', sets: 3, mode: 'all', goal: 6, req: [['leg', 10]], url: IM('Toes to Bar') },
    { id: 'vup', n: 'V-Up', g: 'core', mu: 'Core', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, req: [['hollow', 30]], url: IM('V-Up') },
    { id: 'bicy', n: 'Bicycle Crunch', g: 'core', mu: 'Schräge Bauchmuskeln', u: 'Wdh.', sets: 3, mode: 'all', goal: 20, url: IM('Bicycle Crunch'), hint: 'Insgesamt, langsam.' },
    { id: 'twist', n: 'Russian Twist', g: 'core', mu: 'Schräge Bauchmuskeln', u: 'Wdh.', sets: 3, mode: 'all', goal: 20, url: IM('Russian Twist') },
    { id: 'bird', n: 'Bird Dog', g: 'core', mu: 'Core · unterer Rücken', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, url: IM('Bird Dog'), hint: 'Je Seite, Rücken bleibt ruhig.' },
    { id: 'flut', n: 'Flutter Kicks', g: 'core', mu: 'Unterer Bauch', u: 'Sek.', sets: 3, mode: 'all', goal: 30, req: [['hollow', 30]], url: IM('Flutter Kicks') },
    { id: 'dia', n: 'Diamond-Liegestütz', g: 'push', mu: 'Trizeps · Brust', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, req: [['pclose', 15]], url: IM('Diamond Push-up') },
    { id: 'hindu', n: 'Hindu-Liegestütz', g: 'push', mu: 'Schulter · Brust · Beweglichkeit', u: 'Wdh.', sets: 3, mode: 'all', goal: 10, req: [['pike', 10]], url: IM('Hindu Push-up') },
    { id: 'bulg', n: 'Bulgarian Split Squat', g: 'kh', mu: 'Beine · Po', u: 'Wdh.', sets: 3, mode: 'all', goal: 10, kg: true, req: [['lunge', 12]], url: IM('Bulgarian Split Squat Kurzhantel'), hint: 'Je Seite, Fuß hinten auf Stuhl.' },
    { id: 'step', n: 'Step-ups', g: 'kh', mu: 'Beine · Po', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['goblet', 12]], url: IM('Dumbbell Step-up'), hint: 'Je Seite.' },
    { id: 'hipt', n: 'Hip Thrust', g: 'kh', mu: 'Po · hintere Kette', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, kg: true, req: [['bridge', 15]], url: IM('Dumbbell Hip Thrust'), hint: 'Hantel auf der Hüfte, Schultern aufs Sofa.' },
    { id: 'arnold', n: 'Arnold Press', g: 'kh', mu: 'Schulter · Trizeps', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['ohp', 12]], url: IM('Arnold Press') },
    { id: 'pullo', n: 'Pullover', g: 'kh', mu: 'Brust · Latissimus', u: 'Wdh.', sets: 3, mode: 'all', goal: 12, kg: true, req: [['floor', 12]], url: IM('Dumbbell Pullover') },
    { id: 'rrow', n: 'Renegade Row', g: 'kh', mu: 'Rücken · Core', u: 'Wdh.', sets: 3, mode: 'all', goal: 8, kg: true, req: [['row', 12], ['plank', 60]], url: IM('Renegade Row'), hint: 'Je Seite, Hüfte ruhig.' },
    { id: 'sumo', n: 'Sumo-Kniebeuge', g: 'kh', mu: 'Beine innen · Po', u: 'Wdh.', sets: 3, mode: 'all', goal: 15, kg: true, req: [['goblet', 15]], url: IM('Dumbbell Sumo Squat') },
    { id: 'thr', n: 'Thrusters', g: 'kh', mu: 'Ganzkörper', u: 'Wdh.', sets: 3, mode: 'all', goal: 10, kg: true, req: [['goblet', 15], ['ohp', 12]], url: IM('Dumbbell Thruster') },
    { id: 'wallw', n: 'Wall Walk', g: 'skill', mu: 'Schulter · Core', u: 'Wdh.', sets: 3, mode: 'all', goal: 5, req: [['pike', 8]], url: IM('Wall Walk Handstand') },
    { id: 'hsfree', n: 'Freier Handstand', g: 'skill', mu: 'Schulter · Balance', u: 'Sek.', sets: 3, mode: 'best', goal: 15, req: [['hand', 45]], url: IM('Freestanding Handstand Anleitung'), hint: 'Auf der Matte, Platz zum Abrollen.' },
    { id: 'planl', n: 'Planche Lean', g: 'skill', mu: 'Schulter · Handgelenke', u: 'Sek.', sets: 3, mode: 'all', goal: 20, req: [['psplan', 8]], url: IM('Planche Lean') },
    { id: 'tplan', n: 'Tuck Planche', g: 'skill', mu: 'Schulter · Core · Handgelenke', u: 'Sek.', sets: 3, mode: 'all', goal: 8, req: [['planl', 20]], url: IM('Tuck Planche') },
    { id: 'blever', n: 'Backlever Tuck', g: 'skill', mu: 'Schulter · Bizeps · Core', u: 'Sek.', sets: 3, mode: 'all', goal: 10, req: [['lever', 10], ['hang', 90]], url: IM('Tuck Back Lever'), hint: 'Schultern vorher gut aufwärmen.' },
    { id: 'sfl', n: 'Frontlever Straddle', g: 'skill', mu: 'Core · Rücken', u: 'Sek.', sets: 3, mode: 'all', goal: 8, req: [['advfl', 10]], url: IM('Straddle Front Lever') },
    { id: 'mun', n: 'Muscle-up negativ', g: 'skill', mu: 'Rücken · Trizeps · Explosivkraft', u: 'Wdh.', sets: 3, mode: 'all', goal: 3, req: [['c2b', 5]], url: IM('Negative Muscle-up') },
    { id: 'mu', n: 'Muscle-up', g: 'skill', mu: 'Rücken · Brust · Trizeps', u: 'Wdh.', sets: 3, mode: 'best', goal: 3, req: [['mun', 3], ['dips', 12]], url: IM('Muscle-up Anleitung') },
    { id: 'pistol', n: 'Pistol Squat', g: 'skill', mu: 'Beine · Balance', u: 'Wdh.', sets: 3, mode: 'all', goal: 5, req: [['bulg', 10], ['goblet', 15]], url: IM('Pistol Squat'), hint: 'Je Seite, erst mit Stuhl.' },
    { id: 'oap', n: 'Einarmiger Liegestütz', g: 'skill', mu: 'Brust · Core · Trizeps', u: 'Wdh.', sets: 3, mode: 'all', goal: 3, req: [['archer', 6]], url: IM('One Arm Push-up Progression'), hint: 'Wiederholungen je Seite.' },
    { id: 'burp', n: 'Burpees', g: 'cardio', mu: 'Ganzkörper · Kondition', u: 'Wdh.', sets: 3, mode: 'all', goal: 10, url: IM('Burpees') },
    { id: 'bikel', n: 'Bike lang', g: 'cardio', mu: 'Ausdauer · Beine', u: 'Min.', sets: 1, mode: 'best', goal: 45, req: [['bike', 20]], url: IM('Heimtrainer lange Einheit'), hint: 'Ruhiges Tempo, Grundlagenausdauer.' },
    { id: 'st_hip', n: 'Hüftbeuger dehnen', g: 'mob', mu: 'Hüfte · Oberschenkel vorn', u: 'Sek.', sets: 1, mode: 'best', goal: 45, url: IM('Hüftbeuger Dehnung Kniender Ausfallschritt'), hint: 'Je Seite, Becken nach vorn schieben.' },
    { id: 'st_ham', n: 'Beinbeuger dehnen', g: 'mob', mu: 'Oberschenkel hinten', u: 'Sek.', sets: 1, mode: 'best', goal: 45, url: IM('Beinbeuger Dehnung Boden') },
    { id: 'st_thor', n: 'Brustwirbel-Rotation', g: 'mob', mu: 'Brustwirbelsäule · Schulter', u: 'Wdh.', sets: 1, mode: 'best', goal: 10, url: IM('Thoracic Rotation Seitenlage'), hint: 'Je Seite, langsam.' },
    { id: 'st_door', n: 'Brust im Türrahmen', g: 'mob', mu: 'Brust · Schulter vorn', u: 'Sek.', sets: 1, mode: 'best', goal: 45, url: IM('Brustdehnung Türrahmen'), hint: 'Je Seite, Unterarm am Rahmen.' },
    { id: 'st_child', n: 'Kindhaltung', g: 'mob', mu: 'Rücken · Latissimus', u: 'Sek.', sets: 1, mode: 'best', goal: 60, url: IM('Kindhaltung Yoga') },
    { id: 'st_90', n: '90/90 Hüfte', g: 'mob', mu: 'Hüftrotation', u: 'Wdh.', sets: 1, mode: 'best', goal: 8, url: IM('90 90 Hip Switch') },
    { id: 'st_wgs', n: 'World\'s Greatest Stretch', g: 'mob', mu: 'Hüfte · Rücken · Schulter', u: 'Wdh.', sets: 1, mode: 'best', goal: 6, url: IM('World\'s Greatest Stretch'), hint: 'Je Seite.' }
  ];
  var TIERS = ['Neuling', '', 'Geübt', 'Stark', 'Elite', 'Meister'], TH = [0, .4, .65, .95, 1.4, 99], TCLS = [0, 2, 3, 4, 5], SW = [.6, .75, .9, 1];
  var DAILY = 4, MILES = [3, 7, 14, 30], WK_GOAL = 4, MO_GOAL = 16, WK_XP = 120, MO_XP = 400, WARM_XP = 15;
  var DAYB = { dia: 1, hindu: 1, arnold: 1, pullo: 1, sumo: 1, thr: 1, bulg: 1, step: 1, hipt: 1, vup: 1, bicy: 1, twist: 1, bird: 1, flut: 1, wallw: 1, hsfree: 1, planl: 1, tplan: 1, oap: 1, pistol: 1, burp: 1, inc: 1, taps: 1, dips: 1, ppush: 1, slow: 1, fly: 1, frontr: 1, hollow: 1, deadbug: 1, push: 1, pclose: 1, pwide: 1, pike: 1, decl: 1, archer: 1, plank: 1, sidep: 1, climb: 1, bridge: 1, lat: 1, ohp: 1, floor: 1, tri: 1, goblet: 1, lunge: 1, rdl: 1, calf: 1, hand: 1, hspu: 1, psplan: 1, crow: 1 };
  function dayOf(e) { return e.g === 'cardio' || e.g === 'mob' ? 'x' : DAYB[e.id] ? 'b' : 'a'; }
  var WARM = ['Armkreise', 'Schulterhang', 'Handgelenke kreisen', 'Finger & Unterarme dehnen', 'Rumpfdrehen', 'Kniebeugen'];
  var REST = { pull: 120, push: 90, core: 60, kh: 75, skill: 120, cardio: 60, mob: 20 }, RESTX = { scap: 60, hang: 90 };
  var restOn = true;
  try { restOn = localStorage.getItem('zenit.rest') !== '0'; } catch (err) { /* egal */ }

  /*PURE*/
  var EXB = {};
  EX.forEach(function (e) { EXB[e.id] = e; });
  function metric(e, s) {
    var v = s.filter(function (x) { return isFinite(x); });
    if (!v.length) return { val: 0, full: false };
    if (e.mode === 'all') { var w = v.slice(0, e.sets); return { val: Math.min.apply(null, w), full: w.length >= e.sets }; }
    return { val: Math.max.apply(null, v), full: true };
  }
  function setUnits(e, r) { return e.u === 'Sek.' ? Math.round(r / 5) : Math.round(r); }
  function setXp(e, r, i) {
    var frac = Math.min(r / e.goal, 1), over = Math.max(0, r - e.goal);
    if (e.u === 'Sek.') over = over / 5;
    return Math.round(12 * frac * (1 + 0.25 * Math.min(i || 0, 6)) + over * 0.5 + (r >= e.goal ? 4 : 0));
  }
  function planXp(e) { var t = 10; for (var i = 0; i < e.sets; i++) t += setXp(e, e.goal, i); return t; }
  function mult(st) { return st >= 30 ? 2 : st >= 14 ? 1.5 : st >= 7 ? 1.25 : st >= 3 ? 1.1 : 1; }
  function dayIdx(ms) { var d = new Date(ms); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  function wkOf(d) { return d - (d + 3) % 7; }
  function moOf(d) { var q = new Date(d * 864e5); return q.getUTCFullYear() * 12 + q.getUTCMonth(); }
