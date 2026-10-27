  // ---------- Essen
  // Prinzip: Schnell-Kacheln (häufigste Einträge, 1 Tipp), Suche (Datenbank, eigene Lebensmittel, Gerichte) mit Mengenwahl, Schnell-Eintrag ohne Lebensmittel.
  // Einträge: {t, n, k, p, f?, c?, fb?, su?, r?: {i: Quelle, g: Gramm bzw. Portionen}}. Ziele: automatisch aus dem Rechner ({a: 1}) oder eigene Werte
  // Lebensmittel je 100 g: id, Name, kcal, Protein, Fett, Kohlenhydrate, Ballaststoffe, Zucker, Portionen (Name:Gramm|…, * = vorgewählt, sonst die erste).
  // Richtwerte, gerundet nach üblichen Nährwerttabellen; Markenprodukte weichen ab (eigene Lebensmittel anlegen)
  var FOODS = [
    ['hafer', 'Haferflocken', 372, 13.5, 7, 59, 10, 1.2, 'Portion:40|Schale:80'],
    ['muesli', 'Müsli ungezuckert', 360, 10, 7, 60, 8, 12, 'Schale:60'],
    ['cornfl', 'Cornflakes', 375, 7, 1, 83, 3, 8, 'Schale:40'],
    ['reis_r', 'Reis roh', 349, 7, 0.6, 78, 1.4, 0.2, 'Portion:75'],
    ['reis_g', 'Reis gekocht', 130, 2.7, 0.3, 28, 0.4, 0.1, 'Portion:200'],
    ['nud_r', 'Nudeln roh', 357, 12.5, 1.5, 70, 3, 3, 'Portion:100'],
    ['nud_g', 'Nudeln gekocht', 150, 5.5, 0.9, 30, 1.8, 0.6, 'Portion:250'],
    ['vknud', 'Vollkornnudeln roh', 340, 13, 2.5, 62, 8, 3, 'Portion:100'],
    ['kart', 'Kartoffeln gekocht', 72, 2, 0.1, 15, 2, 0.8, 'Stück:100'],
    ['skart', 'Süßkartoffel', 86, 1.6, 0.1, 20, 3, 4, 'Stück:200'],
    ['quinoa', 'Quinoa roh', 368, 14, 6, 64, 7, 0, 'Portion:75'],
    ['cous', 'Couscous roh', 360, 12.5, 1.1, 72, 5, 0.5, 'Portion:75'],
    ['vkbrot', 'Vollkornbrot', 220, 7.5, 1.5, 41, 7.5, 2.5, 'Scheibe:50'],
    ['mischbr', 'Mischbrot', 240, 7, 1.5, 47, 5, 2, 'Scheibe:45'],
    ['broet', 'Brötchen', 270, 9, 1.5, 54, 3, 2, 'Stück:60'],
    ['toast', 'Toastbrot', 260, 8, 4, 47, 3, 4, 'Scheibe:25'],
    ['wrap', 'Tortilla Wrap', 300, 8, 7, 50, 3, 2, 'Stück:60'],
    ['reisw', 'Reiswaffel', 385, 8, 3, 80, 4, 0.5, 'Stück:8'],
    ['milch15', 'Milch 1,5 %', 47, 3.4, 1.5, 4.9, 0, 4.9, 'Glas:200'],
    ['milch35', 'Milch 3,5 %', 64, 3.3, 3.5, 4.8, 0, 4.8, 'Glas:200'],
    ['hafmil', 'Haferdrink', 45, 0.5, 1.5, 6.5, 0.8, 4, 'Glas:200'],
    ['sojmil', 'Sojadrink ungesüßt', 33, 3.3, 1.8, 0.7, 0.5, 0.3, 'Glas:200'],
    ['skyr', 'Skyr', 63, 11, 0.2, 4, 0, 4, 'Portion:150|*Becher:500'],
    ['mquark', 'Magerquark', 67, 12, 0.3, 4, 0, 4, 'Becher:250'],
    ['quark40', 'Quark 40 %', 140, 11, 8, 3, 0, 3, 'Becher:250'],
    ['joghurt', 'Naturjoghurt 1,5 %', 47, 4, 1.5, 4.5, 0, 4.5, 'Portion:150|*Becher:500'],
    ['grjog', 'Griechischer Joghurt', 120, 4, 10, 4, 0, 4, 'Becher:150'],
    ['huette', 'Hüttenkäse', 100, 12, 4.5, 3, 0, 3, 'Becher:200'],
    ['gouda', 'Gouda', 360, 25, 28, 0, 0, 0, 'Scheibe:25'],
    ['mozz', 'Mozzarella', 250, 18, 19, 1, 0, 1, 'Kugel:125'],
    ['feta', 'Feta', 270, 17, 22, 0.5, 0, 0.5, 'Portion:50'],
    ['parm', 'Parmesan', 400, 33, 29, 0, 0, 0, 'EL:10'],
    ['butter', 'Butter', 740, 0.7, 83, 0.6, 0, 0.6, 'TL:5'],
    ['sahne', 'Sahne 30 %', 300, 2.4, 30, 3.2, 0, 3.2, 'EL:15'],
    ['whey', 'Whey-Protein', 380, 78, 6, 6, 0, 5, 'Messlöffel:30'],
    ['ppudd', 'Proteinpudding', 75, 10, 1.5, 5, 0, 4, 'Becher:200'],
    ['ei', 'Ei', 155, 13, 11, 1.1, 0, 1.1, 'Stück:60'],
    ['eiklar', 'Eiklar', 50, 11, 0.2, 0.7, 0, 0.7, 'Ei:35'],
    ['haehn', 'Hähnchenbrust', 110, 23, 1.5, 0, 0, 0, 'Filet:150'],
    ['pute', 'Putenbrust', 107, 24, 1, 0, 0, 0, 'Filet:150'],
    ['rhack', 'Rinderhack', 215, 19, 15, 0, 0, 0, 'Portion:125'],
    ['steak', 'Rindersteak', 130, 22, 4, 0, 0, 0, 'Stück:200'],
    ['schwf', 'Schweinefilet', 110, 21, 2, 0, 0, 0, 'Portion:150'],
    ['kschin', 'Kochschinken', 110, 19, 3.5, 1, 0, 1, 'Scheibe:20'],
    ['salami', 'Salami', 400, 22, 34, 1, 0, 1, 'Scheibe:10'],
    ['lachs', 'Lachs', 200, 20, 13, 0, 0, 0, 'Filet:125'],
    ['thun', 'Thunfisch (Dose, Wasser)', 110, 25, 1, 0, 0, 0, 'Dose:130'],
    ['garnel', 'Garnelen', 85, 19, 1, 0, 0, 0, 'Portion:100'],
    ['seela', 'Seelachs', 80, 18, 1, 0, 0, 0, 'Filet:125'],
    ['linsen_r', 'Linsen roh', 330, 24, 1.5, 50, 11, 2, 'Portion:75'],
    ['linsen_g', 'Linsen gekocht', 116, 9, 0.4, 17, 8, 1.8, 'Portion:200'],
    ['kicher', 'Kichererbsen (Dose)', 120, 7, 2.6, 16, 5, 0.5, 'Dose:240'],
    ['kidney', 'Kidneybohnen (Dose)', 100, 7, 0.5, 14, 6, 0.5, 'Dose:250'],
    ['tofu', 'Tofu natur', 120, 13, 7, 1.5, 0.5, 0.5, 'Packung:200'],
    ['edam', 'Edamame', 120, 11, 5, 9, 5, 2, 'Portion:100'],
    ['hummus', 'Hummus', 280, 8, 20, 14, 6, 0.5, 'EL:20'],
    ['brok', 'Brokkoli', 35, 2.8, 0.4, 3.6, 3, 1.7, 'Portion:150'],
    ['papr', 'Paprika', 30, 1, 0.3, 5, 2, 4, 'Stück:150'],
    ['tomate', 'Tomate', 18, 0.9, 0.2, 3, 1.2, 2.6, 'Stück:100'],
    ['gurke', 'Gurke', 15, 0.6, 0.1, 2.5, 0.5, 1.7, 'Stück:300'],
    ['karotte', 'Karotte', 36, 0.9, 0.2, 7, 3, 4.7, 'Stück:80'],
    ['zucch', 'Zucchini', 20, 1.5, 0.3, 2.5, 1, 2, 'Stück:200'],
    ['spinat', 'Spinat', 23, 2.9, 0.4, 1.4, 2.2, 0.4, 'Portion:150'],
    ['salat', 'Blattsalat', 15, 1.3, 0.2, 1.5, 1.5, 1, 'Schale:80'],
    ['zwieb', 'Zwiebel', 40, 1.1, 0.1, 8, 1.7, 4.2, 'Stück:80'],
    ['champ', 'Champignons', 22, 3, 0.3, 0.5, 2, 0.3, 'Portion:150'],
    ['mais', 'Mais (Dose)', 80, 2.5, 1.2, 14, 2.5, 4, 'Dose:140'],
    ['erbsen', 'Erbsen (TK)', 80, 5, 0.5, 11, 5, 4, 'Portion:150'],
    ['avoc', 'Avocado', 160, 2, 15, 2, 6.7, 0.7, 'Hälfte:75'],
    ['banane', 'Banane', 93, 1.2, 0.2, 20, 2, 17, 'Stück:120'],
    ['apfel', 'Apfel', 54, 0.3, 0.2, 12, 2.4, 10, 'Stück:150'],
    ['beeren', 'Beerenmischung (TK)', 40, 1, 0.4, 6, 4, 6, 'Schale:125'],
    ['erdb', 'Erdbeeren', 32, 0.7, 0.3, 5.5, 1.6, 5.5, 'Schale:200'],
    ['orange', 'Orange', 47, 1, 0.2, 9, 2.2, 9, 'Stück:150'],
    ['trauben', 'Weintrauben', 70, 0.7, 0.3, 16, 1.5, 16, 'Handvoll:80'],
    ['kiwi', 'Kiwi', 60, 1, 0.6, 10, 3, 9, 'Stück:75'],
    ['datteln', 'Datteln getrocknet', 280, 2, 0.5, 66, 8, 63, 'Stück:8'],
    ['mandeln', 'Mandeln', 600, 21, 52, 6, 12, 4, 'Handvoll:25'],
    ['walnuss', 'Walnüsse', 670, 15, 65, 7, 6, 2.6, 'Handvoll:25'],
    ['erdnuss', 'Erdnüsse', 600, 25, 49, 8, 8, 4, 'Handvoll:25'],
    ['ernmus', 'Erdnussmus', 620, 25, 50, 10, 7, 6, 'EL:15'],
    ['cashew', 'Cashews', 570, 18, 44, 27, 3, 6, 'Handvoll:25'],
    ['leins', 'Leinsamen', 500, 18, 42, 2, 26, 1.5, 'EL:10'],
    ['chia', 'Chiasamen', 480, 17, 31, 8, 34, 0, 'EL:12'],
    ['olivoel', 'Olivenöl', 884, 0, 100, 0, 0, 0, 'EL:10'],
    ['rapsoel', 'Rapsöl', 884, 0, 100, 0, 0, 0, 'EL:10'],
    ['zbschok', 'Zartbitterschokolade 70 %', 580, 9, 42, 33, 11, 28, 'Rippe:10'],
    ['mschok', 'Milchschokolade', 540, 7, 31, 56, 2, 54, 'Rippe:10'],
    ['priegel', 'Proteinriegel', 360, 33, 12, 30, 8, 3, 'Riegel:60'],
    ['chips', 'Chips', 540, 6, 34, 50, 4, 1, 'Handvoll:30'],
    ['gummi', 'Gummibärchen', 340, 6, 0, 77, 0, 46, 'Handvoll:25'],
    ['honig', 'Honig', 310, 0.4, 0, 76, 0, 76, 'TL:10'],
    ['marm', 'Marmelade', 250, 0.3, 0.1, 60, 1, 55, 'TL:15'],
    ['nusscr', 'Nuss-Nougat-Creme', 540, 6, 31, 58, 3.5, 57, 'TL:15'],
    ['vaneis', 'Vanilleeis', 200, 3.5, 11, 22, 0, 20, 'Kugel:60'],
    ['osaft', 'Orangensaft', 45, 0.7, 0.2, 9, 0.2, 8.5, 'Glas:200'],
    ['cola', 'Cola', 42, 0, 0, 10.6, 0, 10.6, 'Dose:330'],
    ['bier', 'Bier', 42, 0.5, 0, 3, 0, 0, 'Flasche:500|Flasche 0,33:330'],
    ['pizza', 'Pizza Margherita', 230, 10, 8, 29, 2, 3, 'Pizza:350'],
    ['doener', 'Döner', 215, 12, 10, 19, 1.5, 2, 'Stück:350'],
    ['burger', 'Cheeseburger', 260, 13, 12, 24, 1.5, 5, 'Stück:120'],
    ['pommes', 'Pommes', 290, 3.4, 15, 35, 3, 0.5, 'Portion:150'],
    ['lasag', 'Lasagne', 160, 8, 8, 13, 1, 2.5, 'Portion:350'],
    // Varianten (Light, Fettstufen) und Fast Food; Fast Food je Verkaufsportion nach Herstellerangaben (gerundet, über Nährwert-Datenbanken), ~ = Grundeinheit
    ['milch03', 'Milch 0,3 %', 35, 3.4, 0.3, 4.9, 0, 4.9, 'Glas:200'],
    ['quark20', 'Quark 20 %', 109, 12.5, 5, 3, 0, 3, 'Becher:250'],
    ['joghurt35', 'Naturjoghurt 3,5 %', 65, 3.5, 3.5, 4.5, 0, 4.5, 'Portion:150|*Becher:500'],
    ['joghurt01', 'Joghurt 0,1 %', 37, 4.3, 0.1, 4.6, 0, 4.6, 'Portion:150|*Becher:500'],
    ['grjog2', 'Griechischer Joghurt 2 %', 70, 6, 2, 5, 0, 5, 'Becher:150'],
    ['goudal', 'Gouda light', 270, 30, 16, 0, 0, 0, 'Scheibe:25'],
    ['mozzl', 'Mozzarella light', 165, 19, 9, 1, 0, 1, 'Kugel:125'],
    ['fetal', 'Feta light', 180, 18, 11, 1, 0, 1, 'Portion:50'],
    ['frisch', 'Frischkäse', 245, 5.5, 23, 3, 0, 3, 'EL:20'],
    ['frischl', 'Frischkäse light', 110, 9, 6, 4, 0, 4, 'EL:20'],
    ['sahnel', 'Kochsahne 15 %', 160, 3, 15, 4.5, 0, 4.5, 'EL:15'],
    ['halbf', 'Halbfettbutter', 370, 1, 40, 1, 0, 1, 'TL:5'],
    ['salamil', 'Salami light', 250, 25, 16, 1, 0, 1, 'Scheibe:10'],
    ['rhack5', 'Rinderhack mager 5 %', 125, 21, 5, 0, 0, 0, 'Portion:125'],
    ['colaz', 'Cola Zero', 0.3, 0, 0, 0, 0, 0, 'Dose:330'],
    ['bieraf', 'Bier alkoholfrei', 25, 0.4, 0, 5.5, 0, 3, 'Flasche:500|Flasche 0,33:330'],
    ['mc_bigmac', "Big Mac (McDonald's)", 235, 11.4, 12.1, 19, 1.5, 4, 'Stück:232'],
    ['mc_cheese', "Cheeseburger (McDonald's)", 254, 13, 10.7, 26, 1.6, 5.8, 'Stück:121'],
    ['mc_hamb', "Hamburger (McDonald's)", 240, 12.4, 8, 28.6, 1.7, 6, 'Stück:105'],
    ['mc_chick', "McChicken (McDonald's)", 243, 9.5, 11.7, 24, 1.5, 2.8, 'Stück:179'],
    ['mc_nug', 'Chicken McNuggets', 245, 13.8, 12.8, 16.5, 1, 0.3, '~Nugget:18.2|*6er-Box:109.2|9er-Box:163.8|20er-Box:364'],
    ['mc_pom', "Pommes (McDonald's)", 289, 3.4, 14.5, 36, 3.5, 0.3, 'Portion klein:80|*Portion mittel:114|Portion groß:150'],
    ['bk_whop', 'Whopper (Burger King)', 218, 9.8, 12.4, 17, 1.1, 4, 'Stück:275'],
    ['sub_chick', 'Sub Chicken Teriyaki (Subway)', 143, 10.4, 2, 21, 2, 7, 'Sub 15 cm:230|Sub 30 cm:460'],
    ['kfc_strip', 'Crispy Strips (KFC)', 250, 19, 13, 14, 1, 0.5, '~Strip:40|*3er:120|5er:200'],
    // Restaurant: Werte je 100 g inkl. üblichem Fett der Küche, Portionen klein / normal / groß
    ['schnitz', 'Schnitzel mit Pommes', 230, 11, 12, 20, 2, 0.5, 'klein:350|*Teller:500|groß:650'],
    ['spagb', 'Spaghetti Bolognese', 150, 7, 5, 19, 1.5, 3, 'klein:350|*Teller:500|groß:650'],
    ['pcarb', 'Pasta Carbonara', 210, 8, 10, 22, 1, 1.5, 'klein:350|*Teller:500|groß:650'],
    ['curryr', 'Curry mit Reis', 155, 6, 6, 19, 1.5, 3, 'klein:400|*Teller:550|groß:700'],
    ['gyros', 'Gyros-Teller', 190, 11, 11, 13, 1.5, 1.5, 'klein:400|*Teller:550|groß:700'],
    ['rburg', 'Burger mit Pommes', 260, 11, 14, 23, 2, 4, 'klein:400|*Teller:550|groß:700'],
    ['steakb', 'Steak mit Beilage', 170, 14, 9, 8, 1.5, 1, 'klein:400|*Teller:550|groß:700'],
    ['cwurst', 'Currywurst mit Pommes', 250, 7, 15, 22, 2, 5, 'klein:350|*Teller:450|groß:550'],
    ['bowl', 'Bowl mit Hähnchen', 140, 9, 6, 13, 2.5, 3, 'klein:400|*Bowl:550|groß:700'],
    ['csalat', 'Salat mit Hähnchen', 120, 9, 7, 5, 2, 3, 'klein:300|*Teller:400|groß:550'],
    ['sushi', 'Sushi', 150, 6, 2, 28, 1, 5, '8 Stück:200|*12 Stück:300|16 Stück:400'],
    ['ramen', 'Ramen', 90, 4.5, 3.5, 10, 0.8, 1, 'klein:500|*Schale:700|groß:900']
  ].map(function (r) {
    var o = { id: r[0], n: r[1], k: r[2], p: r[3], f: r[4], c: r[5], fb: r[6], su: r[7], u: [] };
    r[8].split('|').forEach(function (s) { var q = s.split(':'), nm = q[0]; if (nm[0] === '*') { nm = nm.slice(1); o.d = +q[1]; } if (nm[0] === '~') { nm = nm.slice(1); o.ub = 1; } o.u.push([nm, +q[1]]); });
    return o;
  });
  var FOODB = {}; FOODS.forEach(function (x) { FOODB[x.id] = x; });
  // Kategorien für die Übersicht in der Suche
  var FCATS = [
    ['g', 'Getreide & Brot', 'hafer muesli cornfl reis_r reis_g nud_r nud_g vknud kart skart quinoa cous vkbrot mischbr broet toast wrap reisw'],
    ['m', 'Milch & Käse', 'milch35 milch15 milch03 hafmil sojmil skyr mquark quark40 quark20 joghurt35 joghurt joghurt01 grjog grjog2 huette frisch frischl gouda goudal mozz mozzl feta fetal parm butter halbf sahne sahnel whey ppudd'],
    ['e', 'Eier, Fleisch & Fisch', 'ei eiklar haehn pute rhack rhack5 steak schwf kschin salami salamil lachs thun garnel seela'],
    ['h', 'Hülsenfrüchte & Tofu', 'linsen_r linsen_g kicher kidney tofu edam hummus'],
    ['v', 'Gemüse', 'brok papr tomate gurke karotte zucch spinat salat zwieb champ mais erbsen avoc'],
    ['o', 'Obst', 'banane apfel beeren erdb orange trauben kiwi datteln'],
    ['n', 'Nüsse, Samen & Öl', 'mandeln walnuss erdnuss ernmus cashew leins chia olivoel rapsoel'],
    ['s', 'Süßes & Snacks', 'zbschok mschok priegel chips gummi honig marm nusscr vaneis'],
    ['d', 'Getränke', 'osaft cola colaz bier bieraf'],
    ['f', 'Fast Food', 'mc_bigmac mc_cheese mc_hamb mc_chick mc_nug mc_pom bk_whop sub_chick kfc_strip'],
    ['r', 'Restaurant & Imbiss', 'schnitz spagb pcarb curryr gyros rburg steakb cwurst bowl csalat sushi ramen pizza doener burger pommes lasag']
  ];
  FCATS.forEach(function (c) { c[2].split(' ').forEach(function (id) { if (FOODB[id]) FOODB[id].cat = c[0]; }); });
  // Varianten: Grundname (bn) in Listen ohne Fett-Angabe, Variante (vl) in der Mengenwahl umschaltbar (vg); in Kategorien und Suche nur die erste (vh = versteckt)
  var FVAR = [['Milch', [['milch15', '1,5 %'], ['milch35', '3,5 %'], ['milch03', '0,3 %']]], ['Quark', [['mquark', 'Mager'], ['quark20', '20 %'], ['quark40', '40 %']]], ['Naturjoghurt', [['joghurt', '1,5 %'], ['joghurt35', '3,5 %'], ['joghurt01', '0,1 %']]],
    ['Griechischer Joghurt', [['grjog', '10 %'], ['grjog2', '2 %']]], ['Gouda', [['gouda', 'Normal'], ['goudal', 'Light']]], ['Mozzarella', [['mozz', 'Normal'], ['mozzl', 'Light']]], ['Feta', [['feta', 'Normal'], ['fetal', 'Light']]],
    ['Frischkäse', [['frisch', 'Normal'], ['frischl', 'Light']]], ['Sahne', [['sahne', '30 %'], ['sahnel', '15 %']]], ['Butter', [['butter', 'Normal'], ['halbf', 'Halbfett']]], ['Salami', [['salami', 'Normal'], ['salamil', 'Light']]],
    ['Rinderhack', [['rhack', 'Normal'], ['rhack5', 'Mager']]], ['Cola', [['cola', 'Normal'], ['colaz', 'Zero']]], ['Bier', [['bier', 'Normal'], ['bieraf', 'Alkoholfrei']]]];
  FVAR.forEach(function (g) { g[1].forEach(function (v, i) { var x = FOODB[v[0]]; if (x) { x.vg = g[1]; x.bn = g[0]; x.vl = v[1]; if (i) x.vh = 1; } }); });
  // Getränke in ml; Fast Food (pc) nur in Verkaufsportionen
  'milch15 milch35 milch03 hafmil sojmil osaft cola colaz bier bieraf'.split(' ').forEach(function (id) { FOODB[id].ml = 1; });
  FOODS.forEach(function (x) { if (x.cat === 'f') x.pc = 1; });
  function fName(it) { return it.bn || it.n; }
  function fEn(it) { return it.bn ? it.bn + (it.vl === 'Normal' ? '' : ' ' + it.vl) : it.n; }
  function fHay(it) { return it.vg ? it.bn + ' ' + it.vg.map(function (v) { return FOODB[v[0]].n + ' ' + v[1]; }).join(' ') : it.n + (it.b ? ' ' + it.b : ''); }
  var NK = ['k', 'p', 'f', 'c', 'fb', 'su'], NSH = { k: 'kcal', p: 'Protein', f: 'Fett', c: 'Kohlenh.', fb: 'Ballast.', su: 'Zucker' };
  // Kacheln, solange es noch wenig Verlauf gibt: [Lebensmittel, Gramm]
  var TILEDEF = [['skyr', 150], ['hafer', 80], ['ei', 180], ['banane', 120], ['whey', 30], ['haehn', 150], ['reis_g', 200], ['mandeln', 25], ['vkbrot', 100], ['apfel', 150], ['mquark', 250], ['brok', 150]];
  function foodState() {
    if (!state.food) state.food = { g: null, e: [], d: [] };
    ['d', 'w', 'm', 'o', 'pl'].forEach(function (k) { if (!state.food[k]) state.food[k] = []; });
    if (!state.food.wa) state.food.wa = {};
    return state.food;
  }
  function fDish(id) { return foodState().d.filter(function (x) { return x.id === id; })[0]; }
  function fOwn(id) { return foodState().o.filter(function (x) { return x.id === id; })[0]; }
  function fItem(id) {
    // Quelle: eingebautes oder eigenes Lebensmittel (Werte je 100 g) oder Gericht (Werte je Portion, Menge in Portionen)
    if (FOODB[id]) return FOODB[id];
    if (/^u/.test(id)) return fOwn(id) || null;
    var d = fDish(id); if (!d) return null;
    var t = dishTot(d), kn = d.ing.some(function (q) { return q.f != null; });
    return { id: d.id, n: d.n, dish: 1, k: t.pk, p: t.pp, f: kn ? t.pf : null, c: kn ? t.pc : null, fb: kn ? t.pfb : null, su: kn ? t.psu : null, u: [] };
  }
  function fNut(it, a) { var m = it.dish ? a : a / 100, o = {}; NK.forEach(function (k) { o[k] = it[k] == null ? null : it[k] * m; }); return o; }
  function fAmt(it, a, grams) {
    // Menge lesbar: die Portion, die mit der kleinsten Anzahl glatt aufgeht („1 Schale“, „3× Stück“, halbe erlaubt), sonst Gramm
    if (it.dish) return fN(a) + (a === 1 ? ' Portion' : ' Portionen');
    var best = null;
    if (!grams) it.u.forEach(function (u) { var n = a / u[1]; if (n >= 0.5 && n <= 12 && Math.abs(n * 2 - Math.round(n * 2)) < 0.01 && (!best || n < best[0])) best = [n, u[0]]; });
    return best ? (best[0] === 1 ? '1 ' : fN(best[0]) + '× ') + best[1] : Math.round(a) + (it.ml ? ' ml' : ' g');
  }
  function fnorm(s) { return String(s).toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss'); }
  function foodSum(di) {
    var o = { items: [] }; NK.forEach(function (k) { o[k] = 0; });
    foodState().e.forEach(function (x, i) { if (dayIdx(x.t) === di) { NK.forEach(function (k) { o[k] += x[k] || 0; }); o.items.push({ x: x, i: i }); } });
    o.k = Math.round(o.k); o.p = Math.round(o.p); return o;
  }
  // Geplantes eines Tages (food.pl): Summen wie foodSum, items mit Index in pl
  function planSum(di) {
    var o = { items: [] }; NK.forEach(function (k) { o[k] = 0; });
    foodState().pl.forEach(function (x, i) { if (x.d === di) { NK.forEach(function (k) { o[k] += x[k] || 0; }); o.items.push({ x: x, i: i }); } });
    o.k = Math.round(o.k); o.p = Math.round(o.p); return o;
  }

  // Rechner: Grundumsatz (Mifflin-St Jeor) × Alltagsfaktor + Trainingszuschlag + Ziel-Tempo + Korrektur aus dem Gewichtsverlauf
  var GOS = [['bulk', 'Aufbau', 0.25], ['keep', 'Halten', 0], ['cut', 'Definition', -0.5]], RATES = [-0.75, -0.5, -0.25, 0, 0.25, 0.5];
  function palOf(pr) { return pr.pal || { 1.2: 1.25, 1.375: 1.35, 1.55: 1.45, 1.725: 1.55 }[pr.act] || 1.4; }
  function rateOf(pr) { return isFinite(pr.rt) ? pr.rt : (GOS.filter(function (g) { return g[0] === pr.go; })[0] || GOS[0])[2]; }
  function wAt(di) { var w = foodState().w, r = null; w.forEach(function (x) { if (dayIdx(x.t) <= di) r = x; }); r = r || w[0]; return r ? r.kg : 0; }
  var durM = null, durN = -1;
  function trainKcal(di, kg) {
    // Trainingszuschlag: Dauer × Gewicht × MET (Kraft 5, Ausdauer 7). Vergangene Tage nach dem, was trainiert wurde; heute/künftig nach Plan
    if (durN !== state.logs.length) { durM = durEst(); durN = state.logs.length; }
    var today = dayIdx(Date.now()), sec = 0, did = false, cardio = false;
    state.logs.forEach(function (l) { if (dayIdx(l.t) !== di) return; if (l.e === 'sess') sec += l.s[0]; else if (EXB[l.e]) { did = true; if (EXB[l.e].g === 'cardio') cardio = true; } });
    if (!sec && did) sec = 2700;
    if (!sec && di >= today) schedFor(di).forEach(function (x) { sec += (durM[x.id] || 45) * 60; if (domGroup(x) === 'cardio') cardio = true; });
    return Math.round((cardio ? 7 : 5) * kg * sec / 3600);
  }
  function calcWith(pr, w, di) {
    if (!pr || !pr.h || !pr.a || !w) return null;
    var bmr = 10 * w + 6.25 * pr.h - 5 * pr.a + (pr.s === 'f' ? -161 : 5), pal = palOf(pr), tb = pr.tb === 0 ? 0 : trainKcal(di, w);
    var maint = bmr * pal + tb, rt = rateOf(pr), k = Math.round((maint + rt * 1100 + (pr.adj || 0)) / 10) * 10;
    var p = Math.round(w * (pr.pkg || (rt < 0 ? 2.2 : 2))), f = Math.round(k * (pr.fp || 25) / 900), c = Math.max(0, Math.round((k - 4 * p - 9 * f) / 4));
    return { k: k, p: p, f: f, c: c, fb: Math.round(k * 0.014), su: Math.round(k * 0.025), bmr: bmr, pal: pal, tb: tb, maint: maint, rt: rt, w: w };
  }
  function calcFor(di) { return calcWith(foodState().pr, wAt(di), di); }
  function foodGoal(di) {
    // Automatisch: Rechner je Tag (Trainingstage mehr). Eigene Werte: fehlende Makros aus den kcal ableiten (Fett 25 %, Ballaststoffe 14 g/1000 kcal, Zucker ≤ 10 %)
    var g = foodState().g, c;
    if (!g || g.a) { c = calcFor(di == null ? dayIdx(Date.now()) : di); if (c) return c; }
    var b = g && !g.a ? g : { k: 2500, p: 140 }, f = b.f || Math.round(b.k * 0.25 / 9);
    return { k: b.k, p: b.p, f: f, c: b.c || Math.max(0, Math.round((b.k - 4 * b.p - 9 * f) / 4)), fb: b.fb || Math.round(b.k * 0.014), su: b.su || Math.round(b.k * 0.025) };
  }
  function tdeeEst(pr) {
    // Echter Bedarf aus 28 Tagen: Ø gegessen − Gewichtstrend × 7700 kcal/kg. Verglichen mit der Formel ohne Korrektur ergibt das die Korrektur
    var today = dayIdx(Date.now()), n = 0, kc = 0, mt = 0, pts = [];
    for (var di = today - 28; di < today; di++) { var s = foodSum(di), c = calcWith(pr, wAt(di), di); if (s.k >= 800 && c) { n++; kc += s.k; mt += c.maint; } }
    foodState().w.forEach(function (x) { var d = dayIdx(x.t); if (d >= today - 28 && d <= today) pts.push([d, x.kg]); });
    var span = pts.length ? pts[pts.length - 1][0] - pts[0][0] : 0;
    if (n < 10 || pts.length < 3 || span < 10) return { n: n, wn: pts.length, span: span };
    var mx = pts.reduce(function (a, q) { return a + q[0]; }, 0) / pts.length, my = pts.reduce(function (a, q) { return a + q[1]; }, 0) / pts.length, sxy = 0, sxx = 0;
    pts.forEach(function (q) { sxy += (q[0] - mx) * (q[1] - my); sxx += (q[0] - mx) * (q[0] - mx); });
    var slope = sxx ? sxy / sxx : 0, est = kc / n - slope * 7700, maint = mt / n;
    if (est < maint * 0.7 || est > maint * 1.3) return { off: 1, n: n, wn: pts.length, est: Math.round(est), maint: Math.round(maint) };
    return { ok: 1, n: n, wn: pts.length, est: Math.round(est), maint: Math.round(maint), adj: Math.round((est - maint) / 50) * 50, wk: slope * 7 };
  }

  // Kacheln: 2 zuletzt gegessen + 2 am häufigsten in den letzten 3 Wochen (gleiche Quelle und Menge), aufgefüllt mit Vorschlägen; jedes Lebensmittel nur einmal
  function fTiles() {
    var m = {}, arr = [], out = [], since = Date.now() - 21 * 864e5;
    foodState().e.forEach(function (x) {
      if (x.t < since || !x.r || !fItem(x.r.i)) return;
      var key = x.r.i + '|' + x.r.g; if (!m[key]) { m[key] = { i: x.r.i, g: x.r.g, c: 0, t: 0 }; arr.push(m[key]); } m[key].c++; m[key].t = Math.max(m[key].t, x.t);
    });
    function add(x) { if (out.length < 4 && !out.some(function (y) { return y.i === x.i; })) out.push(x); }
    arr.slice().sort(function (a, b) { return b.t - a.t; }).forEach(function (x) { if (out.length < 2) add(x); });
    arr.sort(function (a, b) { return b.c - a.c || b.t - a.t; }).forEach(add);
    TILEDEF.forEach(function (d) { add({ i: d[0], g: d[1], c: 0 }); });
    return out;
  }
  function fbar(k, v, g, ex, pw) {
    // Mini-Balken: hit = im Ziel, over = über der Grenze (FLIM: Fett/Kohlenhydrate 110 %, Zucker 100 %, Protein 140 %, Ballaststoffe 160 % als gesundes Maximum)
    // low = orange: Protein/Ballaststoffe weit hinter dem, was zur Tageszeit zu erwarten ist (ex = erwarteter Anteil, fExp)
    var su = k === 'su', p = g ? v / g : 0, lim = FLIM[k], bad = p > lim, hit = !bad && (k === 'p' || k === 'fb' ? p >= 0.9 : !su && p >= 0.85), low = !bad && !hit && (k === 'p' || k === 'fb') && ex >= 0.3 && p < ex * 0.6;
    return '<div class="fmb ' + k + (bad ? ' over' : hit ? ' hit' : low ? ' low' : '') + fAnim(k, bad ? 'over' : hit ? 'hit' : '', v) + '" data-fnut="' + k + '" role="button" tabindex="0"><span aria-label="' + NSH[k] + '">' + ic(NIC[k]) + '<b>' + Math.round(v) + '</b><small>/' + (su ? '≤' : '') + g + '</small></span><i class="fbt"><i' + pv('fm' + k, Math.min(1, p)) + '></i>' + fGh(p, g ? (pw || 0) / g : 0) + fOv(p, lim) + '</i></div>';
  }
  // Grenzen als Anteil vom Ziel: darüber = zu viel (k = kcal, wa = Wasser)
  var FLIM = { k: 1.1, p: 1.4, f: 1.1, c: 1.1, fb: 1.6, su: 1, wa: 1.5 };
  // Zu viel: roter Balken füllt sich über der eigenen Farbe neu, je 1/3 über der Grenze ein voller Balken
  // Geplant (noch nicht gegessen): schraffiertes Stück ab der Füllung a, Breite w (Anteile vom Ziel)
  function fGh(a, w) { a = Math.min(1, a); return w > 0 && a < 1 ? '<i class="gh" style="--a:' + a.toFixed(3) + ';--w:' + Math.min(w, 1 - a).toFixed(3) + '"></i>' : ''; }
  function fOv(p, lim) { return p > lim ? '<i class="ov" style="--o:' + Math.min(1, (p / lim - 1) * 3).toFixed(3) + '"></i>' : ''; }
  // Einmal-Animation seit dem letzten Zeichnen (gleicher Tag): ins Ziel = fa-hit; über die Grenze oder weiter darüber (jeder neue Eintrag) = fa-bad
  function fAnim(k, st, v) {
    var sd = fSd(); if (ui.fstd !== sd) { ui.fstd = sd; ui.fst = {}; ui.fsv = {}; }
    var was = ui.fst[k], v0 = ui.fsv[k]; ui.fst[k] = st; ui.fsv[k] = v;
    if (was === undefined) return '';
    if (st === 'over') return was !== 'over' || v > v0 ? ' fa-bad' : '';
    return st === 'hit' && was !== 'hit' ? ' fa-hit' : '';
  }
  function dishTot(dd) {
    var o = {}; NK.forEach(function (k) { o[k] = 0; });
    dd.ing.forEach(function (q) { NK.forEach(function (k) { o[k] += (+q.a || 0) * (+q[k] || 0) / 100; }); });
    var n = Math.max(1, +dd.por || 1);
    return { k: o.k, p: o.p, f: o.f, c: o.c, fb: o.fb, su: o.su, pk: o.k / n, pp: o.p / n, pf: o.f / n, pc: o.c / n, pfb: o.fb / n, psu: o.su / n };
  }
  function fN(x) { return String(Math.round(x * 10) / 10).replace('.', ','); }
  // Gewählter Tag (Leiste oben, letzte 7 Tage); Wasserziel 35 ml je kg in 250-ml-Schritten
  function fExp(di) {
    // Erwarteter Anteil des Tagesziels: vergangene Tage 1, heute von 8 bis 20 Uhr linear 0 → 1
    var t = dayIdx(Date.now()); if (di < t) return 1; var n = new Date(); return Math.max(0, Math.min(1, (n.getHours() + n.getMinutes() / 60 - 8) / 12));
  }
  function fSd() { var t = dayIdx(Date.now()); return ui.fsd != null && ui.fsd <= t && ui.fsd > t - 366 ? ui.fsd : t; }
  function fMon(di) { var q = new Date(di * 864e5); return q.toLocaleDateString('de-DE', q.getUTCFullYear() === new Date().getFullYear() ? { month: 'long', timeZone: 'UTC' } : { month: 'long', year: 'numeric', timeZone: 'UTC' }); }
  function fdsMove(dir) {
    // Tagesleiste wischen: 7 Tage zurück/vor (höchstens bis heute, ein Jahr zurück); neuer Monat wird kurz eingeblendet
    var t = dayIdx(Date.now()), sd = fSd(), pg = Math.floor((t - sd + 3) / 7), n = sd + dir * 7;
    if ((dir > 0 && !pg) || n <= t - 366) return false;
    n = Math.min(t, n); var e0 = t + 3 - pg * 7, e1 = t + 3 - (pg - dir) * 7, a = dir < 0 ? e0 - 6 : e0, b = dir < 0 ? e1 - 6 : e1;
    if (fMon(a) !== fMon(b)) ui.fmon = fMon(b);
    ui.fsd = n; ui.fdir = dir; ui.fresh = false; buzz(4); render(); return true;
  }
  function waGoal(di) { var kg = wAt(di) || 75; return Math.max(1500, Math.min(4000, Math.round(kg * 35 / 250) * 250)); }
  // Wasser-Regler im Fenster (Skala) in 50-ml-Schritten: Antippen/Ziehen setzt den Wert direkt, Loslassen speichert
  var wsl = null;
  function waShow(v) {
    // Wasser-Wert live in Zahl, Feld und Fenster-Regler zeigen (ohne Speichern)
    document.querySelectorAll('[data-wav]').forEach(function (e) { e.textContent = fN2(v / 1000); });
    var f = $('wa-v'), r = $('wa-r'); if (f && f !== document.activeElement) f.value = fN2(v / 1000);
    if (r) { r.firstElementChild.style.setProperty('--p', Math.min(1, v / +r.dataset.max).toFixed(3)); r.classList.toggle('over', v > +r.dataset.lim); }
  }
  function wslSet(x) {
    var r = wsl.el.getBoundingClientRect(), mx = +wsl.el.dataset.max;
    var v = Math.round(Math.max(0, Math.min(1, (x - r.left) / r.width)) * mx / 50) * 50;
    v = Math.max(0, Math.min(8000, v)); if (v === wsl.v) return;
    wsl.v = v; buzz(3); waShow(v);
    wsl.el.firstElementChild.style.setProperty('--p', Math.min(1, v / mx).toFixed(4));
  }
  function wslEnd() {
    if (!wsl) return; var w = wsl; wsl = null; if (w.v !== w.v0) waSet(w.v);
    if (ui.sheet && ui.sheet.wa) $('sheet').innerHTML = waHtml();
  }
  document.addEventListener('pointerdown', function (ev) {
    var el = ev.target.closest && ev.target.closest('.wsl'); if (!el) return;
    wsl = { el: el, x: ev.clientX, v0: +el.dataset.v, v: +el.dataset.v }; wslSet(ev.clientX);
  });
  document.addEventListener('pointermove', function (ev) { if (wsl) wslSet(ev.clientX); });
  document.addEventListener('pointerup', wslEnd);
  document.addEventListener('pointercancel', wslEnd);
  function waSet(v) {
    // Wasser des gewählten Tags setzen (ml), Seite neu zeichnen; gibt den gespeicherten Wert zurück
    var wd = fSd(), fs = foodState(); v = Math.max(0, Math.min(8000, Math.round(v || 0)));
    if (v) fs.wa[wd] = v; else delete fs.wa[wd]; persist(); ui.fresh = false; render(); return v;
  }
  function waHtml() {
    // Wasser genau: Zahl (tippen oder wischen) mit ±50 ml, breiter Regler mit Skala (Striche je 250 ml, Ziel-Marke, rot über dem Höchstwert), Schnellwerte
    var sd = fSd(), wa = foodState().wa[sd] || 0, wg = waGoal(sd), lim = wg * FLIM.wa, mx = Math.max(Math.ceil(lim / 500) * 500, Math.ceil(wa / 500) * 500), lb = '';
    for (var l = 0; l * 1000 <= mx; l++) lb += '<span style="--x:' + (l * 1000 / mx).toFixed(4) + '">' + l + '</span>';
    return shHead('drop', 'Wasser', (sd === dayIdx(Date.now()) ? 'Heute' : fmtDayL(sd))) +
      '<div class="wahd"><button class="sb" data-fwa="-50" aria-label="50 ml weniger"' + (wa ? '' : ' disabled') + '>' + ic('minus') + '</button>' +
      '<label class="wnum"><span><input id="wa-v" type="text" inputmode="decimal" value="' + fN2(wa / 1000) + '" aria-label="Wasser in Litern"><em>l</em></span><small>von ' + fN(wg / 1000) + ' l</small></label>' +
      '<button class="sb" data-fwa="50" aria-label="50 ml mehr">' + ic('plus') + '</button></div>' +
      '<div class="wsc" data-noswipe="1"><i id="wa-r" class="wsl wbig' + (wa > lim ? ' over' : '') + '" data-max="' + mx + '" data-lim="' + lim + '" data-v="' + wa + '" role="slider" aria-label="Wasser">' +
      '<i style="--p:' + Math.min(1, wa / mx).toFixed(3) + '"></i><em style="--x:' + (wg / mx).toFixed(4) + '"></em></i><div class="wsx" style="--n:' + mx / 250 + '">' + lb + '</div></div>' +
      '<div class="wqk">' + [['glass', 250], ['bottle', 500], ['bottle', 750]].map(function (q) { return '<button data-fwa="' + q[1] + '">' + ic(q[0]) + '<b>+' + q[1] + '</b></button>'; }).join('') +
      '<button data-fwaz="1" aria-label="Auf 0 setzen"' + (wa ? '' : ' disabled') + '>' + ic('undo') + '<b>0</b></button></div>';
  }
  function viewFood(d, now) {
    var today = dayIdx(now), sd = fSd(), ex = fExp(sd), g = foodGoal(sd), s = foodSum(sd), pq = sd === today ? planSum(sd) : planSum(-1), tl = fTiles(), kp = s.k / g.k, wa = foodState().wa[sd] || 0, wg = waGoal(sd);
    ui.ftiles = tl;
    // Keine Überschrift (wie in Spielen ergibt sich der Bereich aus der unteren Leiste); Ziele/Rechner im Profil
    var h = '';
    // Tagesleiste: 7 Tage, heute in der Mitte (wischen = 7 Tage zurück/vor), Balken = kcal vom Ziel; grün = Protein (fast) erreicht und kcal im Rahmen, orange = deutlich zu wenig, rot = über 110 %.
    // Künftige Tage nur zur Ansicht: Umriss, Balken = geplant; antippen öffnet den Tag in Planen
    var ds = '', pe = today + 3 - Math.floor((today - sd + 3) / 7) * 7; for (var i = 6; i >= 0; i--) {
      var di = pe - i, fu = di > today, sm = fu ? planSum(di) : foodSum(di), gd = foodGoal(di), kq = sm.k / gd.k, dc = fu ? ' fut' + (sm.items.length ? ' pl' : '') : !sm.items.length ? '' : kq > 1.1 ? ' over' : sm.p >= gd.p * 0.9 && kq >= 0.85 ? ' ok' : di < today && (sm.p < gd.p * 0.6 || kq < 0.6) ? ' low' : '';
      ds += '<button class="fdd' + (di === sd ? ' sel' : '') + (di === today ? ' today' : '') + dc + '" ' + (fu ? 'data-pgo' : 'data-fsd') + '="' + di + '" aria-label="' + esc(fmtDayL(di)) + (fu ? ', in Planen' : '') + '"><small>' + WDN[wdOf(di)].slice(0, 2) + '</small><b>' + new Date(di * 864e5).getUTCDate() + '</b><i style="--p:' + Math.min(1, kq).toFixed(2) + '"></i></button>';
    }
    h += '<div class="fdw rise" style="--i:0">' + (ui.fmon ? '<b class="fmo">' + esc(ui.fmon) + '</b>' : '') + '<nav class="fds' + (ui.fdir ? (ui.fdir > 0 ? ' in-r' : ' in-l') : '') + '">' + ds + '</nav></div>';
    ui.fmon = ''; ui.fdir = 0;
    // Bilanz: kcal groß mit Balken, darunter Protein, Fett, Kohlenhydrate, Ballaststoffe, Zucker
    h += '<section class="fbal rise" style="--i:1"><div class="fbk' + (kp > FLIM.k ? ' over' : kp >= 0.9 ? ' hit' : ex >= 0.3 && kp < ex * 0.6 ? ' low' : '') + fAnim('k', kp > FLIM.k ? 'over' : kp >= 0.9 ? 'hit' : '', s.k) + '" data-fnut="k" role="button" tabindex="0"><b data-n="' + s.k + '" data-nk="fkv">' + s.k + '</b><span>/ ' + g.k + ' kcal</span>' +
      '<em><b>' + Math.abs(g.k - s.k) + '</b>' + (g.k - s.k >= 0 ? 'offen' : 'drüber') + '</em><i class="fbt"><i' + pv('fkb', Math.min(1, kp)) + '></i>' + fGh(kp, pq.k / g.k) + fOv(kp, FLIM.k) + '</i></div>' +
      '<div class="fbm">' + ['p', 'f', 'c', 'fb', 'su'].map(function (k) { return fbar(k, s[k], g[k], ex, pq[k]); }).join('') + '</div>' +
      '<div class="fwa' + (wa > wg * FLIM.wa ? ' over' : wa >= wg ? ' hit' : '') + fAnim('wa', wa > wg * FLIM.wa ? 'over' : wa >= wg ? 'hit' : '', wa) + '">' + ic('drop') +
      '<i class="fbt' + (wa > wg ? ' hi' : '') + '" data-fwao="1" role="button" aria-label="Wasser"><i' + pv('fwa', Math.min(1, wa / wg)) + '></i>' + fOv(wa / wg, FLIM.wa) + '</i>' +
      '<button class="fwv" data-fwao="1" aria-label="Wasser genau eintragen"><b><span data-wav="1">' + fN2(wa / 1000) + '</span><small>/' + fN(wg / 1000) + ' l</small></b></button>' +
      '</div></section>';
    // Gegessen in einer Zeile (immer gleich hoch): je Mahlzeit in fester Reihenfolge eine Karte (kcal, Kategorien überlappend), fehlende als leerer Platzhalter
    // (antippen = Suche, Vorschlag hineinziehen = in diese Mahlzeit). Karte antippen = diese Mahlzeit in derselben Zeile (Kategorie-Stapel, Einträge). Leer: „Wie gestern“ klein in der Kopfzeile
    var cp = !s.items.length && foodSum(sd - 1).items.length, gs = fGroups(s.items), gm = gs.filter(function (q) { return ui.fmeal === sd + q.m; })[0];
    h += '<section class="fdl rise" style="--i:2"><h2 class="sec-h">' + esc(dayHead(sd)) + (cp ? '<button class="fcpy" data-fcopy="1">' + ic('swap') + 'Wie gestern</button>' : '') + '</h2><div class="fchips' + (gm ? '' : ' fem') + '" data-noswipe="1">' + (gm ? fMeal(gm) : MEALS.map(function (m) {
        var q = gs.filter(function (x) { return x.m === m[1]; })[0], pi = pq.items.filter(function (o) { return o.x.mk === m[1]; });
        if (q) return fMealCard(q, pi.length);
        if (pi.length) return '<button class="fmc fpm m-' + m[1] + '" data-fpe="' + m[1] + '" aria-label="' + m[2] + ' geplant, antippen = gegessen"><span class="fmt">' + ic(MEALI[m[1]]) + ic('check') + '</span><b>' + Math.round(pi.reduce(function (a, o) { return a + o.x.k; }, 0)) + '<em>kcal</em></b><small>' + pi.length + ' geplant</small></button>';
        return '<button class="fmc fme m-' + m[1] + '" data-fsearch="1" aria-label="' + m[2] + ' eintragen">' + ic(MEALI[m[1]]) + '</button>';
      }).join('')) + '</div></section>';
    h += '<div class="fact2 rise" style="--i:3"><button class="btn fsrb" data-fsearch="1">' + ic('search') + 'Suchen, scannen …</button><button class="btn" data-fdishes="1">' + ic('pot') + 'Gerichte</button></div>';
    // Vorschläge: 2 zuletzt, 2 häufig (antippen = Menge wählen, nach oben ziehen = sofort eintragen)
    h += '<section class="ftl rise" style="--i:4" data-noswipe="1">' + tl.map(function (x, j) {
      var it = fItem(x.i), v = fNut(it, x.g);
      return '<button class="fti' + (ui.ftok === j ? ' done' : '') + '" data-ftile="' + j + '" aria-label="' + esc(fEn(it) + ', ' + fAmt(it, x.g)) + '"><b>' + esc(fEn(it)) + '</b><small style="--nc:var(' + NCOL.p + ')">' + ic(NIC.p) + fN(v.p) + ' g</small><span>' + Math.round(v.k) + '<em>kcal</em></span></button>';
    }).join('') + '</section>';
    ui.ftok = null;
    return h;
  }
  // Kategorien: Icon und kurzer Name (Suche, Gegessen); Schlüssel wie FCATS, dazu Eigene, Gerichte, Schnell, Sonstiges
  var CATI = { g: ['bread', 'Brot'], m: ['milk', 'Milch'], e: ['egg', 'Fleisch'], h: ['bean', 'Bohnen'], v: ['carrot', 'Gemüse'], o: ['snack', 'Obst'], n: ['nut', 'Nüsse'], s: ['candy', 'Süßes'], d: ['glass', 'Getränke'],
    f: ['burger', 'Fast Food'], r: ['food', 'Restaurant'], u: ['user', 'Eigene'], dish: ['pot', 'Gerichte'], q: ['bolt', 'Schnell'], x: ['food', 'Sonstiges'] };
  // Kategorie eines Eintrags: Schlüssel aus FCATS, sonst Eigene, Gerichte oder Schnell
  function fCat(x) {
    var id = x.r && x.r.i, it = id && FOODB[id];
    if (!id) return 'q'; if (/^d/.test(id)) return 'dish'; if (/^u/.test(id)) return 'u';
    return it && CATI[it.cat] ? it.cat : 'x';
  }
  function fCats(g) {
    // Einträge einer Mahlzeit nach Kategorie: [{c, l}], Reihenfolge nach dem ersten Eintrag
    var cs = [], cm = {};
    g.l.forEach(function (o) { var c = fCat(o.x); if (!cm[c]) { cm[c] = { c: c, l: [] }; cs.push(cm[c]); } cm[c].l.push(o); });
    return cs;
  }
  function fKc(l) { return Math.round(l.reduce(function (a, o) { return a + (o.x.k || 0); }, 0)); }
  function fMealCard(g, np) {
    // Mahlzeit-Karte: Symbol und Anzahl, kcal groß (auch 4-stellig), darunter die Kategorien als überlappende Kreise (höchstens 3)
    var cs = fCats(g);
    return '<button class="fmc m-' + g.m + '" data-fml="' + g.m + '" data-fdelg="' + g.l.map(function (o) { return o.i; }).join(',') + '" aria-label="' + mealOfE(g.l[0].x)[2] + ', ' + g.l.length + ' Einträge, ' + fKc(g.l) + ' kcal"><span class="fmt">' + ic(MEALI[g.m]) + '<small>×' + g.l.length + (np ? ' <i>+' + np + '</i>' : '') + '</small></span><b>' + fKc(g.l) + '<em>kcal</em></b>' +
      '<span class="fcs">' + cs.slice(0, 3).map(function (q) { return '<i>' + ic(CATI[q.c][0]) + '</i>'; }).join('') + '</span></button>';
  }
  function fMeal(g) {
    // Eine Mahlzeit in der Zeile: Zurück-Knopf (Symbol, Uhrzeit), Einträge gleicher Kategorie ab 2 als Stapel mit Anzahl (antippen = aufklappen)
    var pi = fSd() === dayIdx(Date.now()) ? planSum(fSd()).items.filter(function (o) { return o.x.mk === g.m; }) : [];
    return '<button class="fmz m-' + g.m + '" data-fml="" aria-label="Zurück zu allen Mahlzeiten">' + ic('back') + ic(MEALI[g.m]) + '<small>' + hmOf(g.t0) + '</small></button>' +
      (pi.length ? '<button class="fcpi fpm m-' + g.m + '" data-fpe="' + g.m + '"><b>' + ic('check') + 'Geplant</b><small>' + pi.map(function (o) { return esc(o.x.n || 'Mahlzeit'); }).join(', ') + '</small><em>' + Math.round(pi.reduce(function (a, o) { return a + o.x.k; }, 0)) + '<i>kcal</i></em></button>' : '') + fCats(g).map(function (q) {
      if (q.l.length < 2) return fChip(q.l[0]);
      var key = fSd() + g.m + q.c;
      if (ui.fstk[key]) return '<div class="fgrp m-' + g.m + '"><button class="fgx" data-fstk="' + key + '" aria-label="' + CATI[q.c][1] + ' zuklappen">' + ic(CATI[q.c][0]) + '<small>×' + q.l.length + '</small>' + ic('close') + '</button>' + q.l.map(fChip).join('') + '</div>';
      return '<button class="fcpi fstk m-' + g.m + '" data-fstk="' + key + '" data-fdelg="' + q.l.map(function (o) { return o.i; }).join(',') + '"><b>' + ic(CATI[q.c][0]) + esc(CATI[q.c][1]) + '</b><small>' + q.l.length + '× · ' + q.l.map(function (o) { return esc(o.x.n || 'Mahlzeit'); }).join(', ') + '</small><em>' + fKc(q.l) + '<i>kcal</i></em></button>';
    }).join('');
  }


  // Sheets: Suche → Menge, Schnell, eigenes Lebensmittel, Gerichte, Ziele/Rechner
  function shHead(icn, title, sub, back) {
    return '<div class="grab"></div><div class="sh-h">' + (back ? '<button class="x" data-fback="1" aria-label="Zurück">' + ic('back') + '</button>' : '<span class="gi">' + ic(icn) + '</span>') + '<div class="nm"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></div><button class="x" data-sheet-close aria-label="Schließen">' + ic('close') + '</button></div>';
  }
  function sheetOpen(html, tall) { $('sheet').className = 'sheet' + (tall ? ' tall' : ''); $('sheet').innerHTML = html; $('shade').classList.add('open'); $('sheet').classList.add('open'); }
  function openFsearch(keep) {
    ui.sheet = { fsearch: true }; ui.fq = ''; ui.fcat = keep ? ui.fcat : ''; if (!keep) ui.ftab = 'c'; ui.fqm = false; ui.fpick = null; if (!ui.fplan) ui.fday = dayIdx(Date.now()) - fSd();
    sheetOpen(shHead('search', ui.ingm ? 'Zutat' : 'Eintragen', ui.ingm ? 'Für das Gericht' : 'Lebensmittel oder Gericht suchen', !!ui.ingm) + '<div class="fqw"><input id="fq" class="fnm fq" type="search" placeholder="Suchen, z. B. Skyr" autocomplete="off" aria-label="Suchen"><button class="x" data-fscan="1" aria-label="Barcode scannen">' + ic('scan') + '</button></div><div id="fres" class="fsr">' + fresHtml() + '</div>', true);
    $('sheet').classList.add('fs');
    setTimeout(function () { var i = $('fq'); if (i && !('ontouchstart' in window)) i.focus(); }, 350);
  }
  function fRow(id) {
    // Treffer-Zeile: Kategorie-Icon, Name, übliche Menge (Stück/Portion statt 100 g, Getränke 250 ml) mit allen nennenswerten Nährwerten (≥ 0,5 g), kcal dieser Menge
    var it = fItem(id), uu = !it.dish && !it.pc && it.u.length ? it.u[it.ub && it.u[1] ? 1 : 0] : null, pa = it.dish ? 1 : it.pc ? it.d || it.u[it.ub ? 1 : 0][1] : uu ? uu[1] : it.ml ? 250 : 100, v = fNut(it, pa), ck = it.dish ? 'dish' : /^u/.test(id) ? 'u' : CATI[it.cat] ? it.cat : 'x';
    // Darunter klein die Werte je 100 g (bei Gerichten je Portion) in festen Spalten: die drei, die für die Kategorie zählen (NREL, z. B. Zucker bei Süßem)
    var h100 = it.dish ? v : it, nr = NREL[ck] || NREL.x;
    return '<button class="fsi" data-fpick="' + id + '"><i class="fsc">' + ic(CATI[ck][0]) + '</i><span><b>' + esc(fName(it)) + (it.b ? ' <small>' + esc(it.b) + '</small>' : '') + '</b>' +
      '<small class="f100">' + nr.map(function (k) { return '<i style="--nc:var(' + NCOL[k] + ')" aria-label="' + NSH[k] + '">' + ic(NIC[k]) + fN(h100[k] || 0) + '</i>'; }).join('') + '<em>' + (it.dish ? '/Port.' : it.ml ? '/100 ml' : '/100 g') + '</em></small></span>' +
      '<i class="fsk"><b>' + Math.round(v.k) + '<small>kcal</small></b><small>' + (uu ? '1 ' + esc(uu[0]) : fAmt(it, pa)) + '</small></i></button>';
  }
  // Je Kategorie die drei Nährwerte, die beim Auswählen zählen (Suche, Treffer-Zeile)
  var NREL = { g: ['c', 'fb', 'p'], m: ['p', 'f', 'su'], e: ['p', 'f', 'c'], h: ['p', 'fb', 'c'], v: ['c', 'fb', 'su'], o: ['su', 'fb', 'c'], n: ['f', 'p', 'fb'], s: ['su', 'f', 'c'], d: ['su', 'c', 'p'], f: ['f', 'p', 'c'], r: ['p', 'f', 'c'], x: ['p', 'f', 'c'] };
  // Farbe je Hauptkategorie (Gerichte-Karten)
  var CCOL = { g: '#c9a227', m: '#5b8fd6', e: '#c0573e', h: '#9a7b4f', v: 'var(--ac)', o: '#e0a24a', n: '#a0703c', s: 'var(--g-core)', d: 'var(--g-cardio)', f: 'var(--g-push)', r: 'var(--g-mob)', x: 'var(--line)' };
  function fDishCard(x) {
    // Gericht-Karte: Farbe und Icon der Zutat-Kategorie mit den meisten kcal, dazu die Symbole seiner Mahlzeiten; kcal und Makro-Leiste je Portion.
    // Antippen = Menge wählen (dort auch bearbeiten), nach rechts wischen = 1 Portion sofort
    var t = dishTot(x), ck = {}, top = 'x', ms = dishMeals(x);
    x.ing.forEach(function (q) { var it = q.i && FOODB[q.i], c = it ? it.cat : 'x'; ck[c] = (ck[c] || 0) + (+q.a || 0) * (+q.k || 0) / 100; if (c !== 'x' && (top === 'x' || ck[c] > ck[top])) top = c; });
    return '<div class="fdc" style="--dc:' + (CCOL[top] || CCOL.x) + '"><button class="fdcb" data-fpick="' + x.id + '" data-fdsw="' + x.id + '"><i class="fdci">' + ic((CATI[top] || CATI.x)[0]) + ms.map(function (m) { return ic(MEALI[m]); }).join('') + '</i><b>' + esc(x.n) + '</b>' +
      '<i class="fdck">' + Math.round(t.pk) + '<small>kcal</small></i><small class="f100">' + [['p', t.pp], ['f', t.pf], ['c', t.pc]].map(function (q) { return '<i style="--nc:var(' + NCOL[q[0]] + ')" aria-label="' + NSH[q[0]] + '">' + ic(NIC[q[0]]) + Math.round(q[1]) + '</i>'; }).join('') + '</small></button></div>';
  }
  function dishMeals(x) {
    // Mahlzeiten eines Gerichts: fest gewählt (x.m), sonst die, zu der es meist gegessen wird
    if (x.m && x.m.length) return x.m;
    var mc = {}, ml = null;
    foodState().e.forEach(function (e) { if (e.r && e.r.i === x.id) { var m = mealOfE(e)[1]; mc[m] = (mc[m] || 0) + 1; if (!ml || mc[m] > mc[ml]) ml = m; } });
    return ml ? [ml] : [];
  }
  function fresHtml() {
    // Ohne Suchtext drei Reiter: Zuletzt, Kategorien (antippen = Liste, Zurück oben), Meins (Schnell / Lebensmittel anlegen / Gericht anlegen, Gerichte als Karten, eigene Lebensmittel);
    // mit Suchtext nur die Treffer
    var q = fnorm(ui.fq.trim()), st = foodState(), tab = ui.ftab || 'r', list = [], h = '';
    if (q) {
      var sc = [];
      st.o.map(function (x) { return x.id; }).concat((ui.ingm ? [] : st.d).map(function (x) { return x.id; }), FOODS.filter(function (x) { return !x.vh; }).map(function (x) { return x.id; })).forEach(function (id) {
        var it0 = fItem(id), n = fnorm(fHay(it0)), i = n.indexOf(q); if (i >= 0) sc.push([id, i === 0 ? 0 : n.indexOf(' ' + q) >= 0 ? 1 : 2]);
      });
      sc.sort(function (a, b) { return a[1] - b[1]; });
      h = sc.length ? sc.slice(0, 30).map(function (x) { return fRow(x[0]); }).join('') : '<p class="muted">Hier nichts gefunden.</p>';
      h += '<div id="fon">' + fonHtml() + '</div>';
    } else {
      // Zutat fürs Gericht: kein Schnell-Reiter
      if (ui.ingm && tab === 'q') tab = 'r';
      h = '<div class="seg fst">' + [['r', 'Zuletzt'], ['c', 'Kategorien']].concat(ui.ingm ? [] : [['q', 'Schnell']]).map(function (x) { return '<button data-ftab="' + x[0] + '" aria-pressed="' + (tab === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>';
      if (tab === 'r') st.e.slice().sort(function (a, b) { return b.t - a.t; }).forEach(function (x) { if (list.length < 6 && x.r && fItem(x.r.i) && list.indexOf(x.r.i) < 0 && !(ui.ingm && /^d/.test(x.r.i))) list.push(x.r.i); });
      else if (tab === 'q') h += quickHtml(null);
      else if (ui.fcat) {
        h += '<button class="fcb" data-fcat="">' + ic('back') + ic(CATI[ui.fcat][0]) + '<b>' + (ui.fcat === 'u' ? 'Eigene' : FCATS.filter(function (c) { return c[0] === ui.fcat; })[0][1]) + '</b></button>';
        list = ui.fcat === 'u' ? st.o.map(function (x) { return x.id; }) : FOODS.filter(function (x) { return x.cat === ui.fcat && !x.vh; }).map(function (x) { return x.id; });
      } else {
        // Kategorien alphabetisch in zwei Spalten, eigene Lebensmittel als eigene Kategorie
        var cl = FCATS.map(function (c) { return [c[0], c[1], FOODS.filter(function (x) { return x.cat === c[0] && !x.vh; }).length]; }).concat(st.o.length ? [['u', 'Eigene', st.o.length]] : []);
        h += '<div class="fcl">' + cl.sort(function (a, b) { return a[1].localeCompare(b[1], 'de'); }).map(function (c) {
          return '<button data-fcat="' + c[0] + '">' + ic(CATI[c[0]][0]) + '<b>' + c[1] + '</b><small>' + c[2] + '</small></button>';
        }).join('') + '</div>';
      }
      h += list.map(fRow).join('') + (tab === 'r' && !list.length ? '<p class="muted">Noch nichts eingetragen.</p>' : '');
    }
    return h;
  }
  // Online (Open Food Facts, frei, ohne Schlüssel): Suche ab 3 Zeichen kurz nach dem Tippen, Barcode über die Kamera.
  // Gewählte Produkte werden eigene Lebensmittel (mit Marke b und Barcode bc) und sind danach offline da.
  var OFF = 'https://de.openfoodfacts.org/', OFF_F = 'code,product_name,product_name_de,brands,quantity,product_quantity,serving_quantity,nutriments', fonT = null;
  function offMap(p) {
    var nu = p && p.nutriments || {}, k = nu['energy-kcal_100g'];
    if (k == null && nu.energy_100g != null) k = nu.energy_100g / 4.184;
    var n = String(p && (p.product_name_de || p.product_name) || '').trim();
    if (!n || !(+k >= 0) || !p.code) return null;
    function v(key) { var x = nu[key + '_100g']; return x == null || !isFinite(+x) ? null : Math.round(+x * 10) / 10; }
    var u = [], sq = +p.serving_quantity, pq = +p.product_quantity;
    if (sq > 0 && sq <= 2000) u.push(['Portion', Math.round(sq)]);
    if (pq > 0 && pq <= 3000 && Math.round(pq) !== Math.round(sq)) u.push(['Packung', Math.round(pq)]);
    return { bc: String(p.code), n: n.slice(0, 30), b: String(p.brands || '').split(',')[0].trim().slice(0, 24), qt: String(p.quantity || '').slice(0, 16), k: Math.round(+k), p: v('proteins'), f: v('fat'), c: v('carbohydrates'), fb: v('fiber'), su: v('sugars'), u: u, ml: /\d\s*(ml|cl|l)\b/i.test(String(p.quantity || '')) ? 1 : 0 };
  }
  function offSave(x) {
    var st = foodState(), ex = st.o.filter(function (o) { return o.bc === x.bc; })[0]; if (ex) return ex.id;
    var o = { id: 'u' + Date.now().toString(36), n: x.n, b: x.b, bc: x.bc, u: x.u.slice(0, 4) }; if (x.ml) o.ml = 1;
    NK.forEach(function (k) { o[k] = x[k] || 0; }); st.o.push(o); persist(); return o.id;
  }
  function fonHtml() {
    var o = ui.fon, q = ui.fq.trim(), w = '<p class="muted fon">' + ic('globe');
    if (q.length < 3) return '';
    if (!navigator.onLine && !(o && o.q === q && o.st === 'ok')) return w + 'Offline</p>';
    if (!o || o.q !== q || o.st === 'load') return w + 'Suche online …</p>';
    if (o.st === 'err') return w + 'Open Food Facts antwortet nicht<button class="btn small fre" data-fonr="1">' + ic('undo') + 'Nochmal</button></p>';
    if (!o.r.length) return w + 'Auch online nicht gefunden. Barcode scannen (oben) oder unten selbst anlegen.</p>';
    return '<h3 class="xg">' + ic('globe') + 'Online</h3>' + o.r.map(function (x, i) {
      return '<button class="fsi web" data-foff="' + i + '"><span><b>' + esc(x.n) + '</b><small>' + esc([x.b, x.qt].filter(Boolean).join(' · ')) + '</small></span><em>' + x.k + '</em></button>';
    }).join('');
  }
  function fonUpd() { var e = $('fon'); if (e) e.innerHTML = fonHtml(); }
  // Treffer je Suchwort zwischengespeichert (zuletzt 30 Suchen, 7 Tage): Wiederholen kommt sofort, auch offline
  var OFFC = {};
  try { OFFC = JSON.parse(localStorage.getItem('zenit.offc') || '{}') || {}; } catch (err) { OFFC = {}; }
  function offCache(q, r) {
    var k = fnorm(q);
    if (r === undefined) { var c = OFFC[k]; return c && Date.now() - c.t < 7 * 864e5 ? c.r : null; }
    OFFC[k] = { t: Date.now(), r: r };
    var ks = Object.keys(OFFC).sort(function (a, b) { return OFFC[b].t - OFFC[a].t; }); ks.slice(30).forEach(function (x) { delete OFFC[x]; });
    try { localStorage.setItem('zenit.offc', JSON.stringify(OFFC)); } catch (err) { /* voll: nur im Speicher */ }
  }
  function offSearch(q, done) {
    // Die Suche von Open Food Facts antwortet oft langsam oder mit 503 (ohne CORS = „Failed to fetch“): de und world gleichzeitig, je 8 s Zeitlimit, 12 Treffer (kleinere Antwort).
    // de mit Treffern gewinnt sofort, sonst world; beide fehlgeschlagen = null (search.openfoodfacts.org wäre schneller, erlaubt aber kein CORS).
    // Gibt eine Abbruch-Funktion zurück (weitergetippt: alte Anfragen nicht weiterladen)
    var hit = offCache(q); if (hit) { done(hit); return function () {}; }
    var res = {}, n = 0, fin = false, acs = [];
    function end(k, r) {
      res[k] = r; n++; if (fin) return;
      if (k === 'de' && r && r.length) { fin = true; offCache(q, r); done(r); return; }
      if (n === 2) { fin = true; var b = res.de && res.de.length ? res.de : res.w && res.w.length ? res.w : res.de || res.w || null; if (b && b.length) offCache(q, b); done(b); }
    }
    [['de', OFF], ['w', 'https://world.openfoodfacts.org/']].forEach(function (b) {
      var ac = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ac) ac.abort(); }, 8000); if (ac) acs.push(ac);
      fetch(b[1] + 'cgi/search.pl?search_terms=' + encodeURIComponent(q) + '&search_simple=1&json=1&page_size=12&sort_by=unique_scans_n&fields=' + OFF_F, ac ? { signal: ac.signal } : {})
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) { clearTimeout(tm); end(b[0], (d.products || []).map(offMap).filter(Boolean)); }, function () { clearTimeout(tm); end(b[0], null); });
    });
    return function () { fin = true; acs.forEach(function (a) { a.abort(); }); };
  }
  var fonAb = null;
  function fonSearch() {
    var q = ui.fq.trim(); if (q.length < 3 || (ui.fon && ui.fon.q === q && ui.fon.st !== 'err')) return;
    if (!navigator.onLine && !offCache(q)) return;
    if (fonAb) fonAb();
    ui.fon = { q: q, st: 'load', r: [] }; fonUpd();
    fonAb = offSearch(q, function (r) {
      if (!ui.fon || ui.fon.q !== q) return;
      if (!r) { ui.fon.st = 'err'; fonUpd(); return; }
      var have = {}; foodState().o.forEach(function (x) { if (x.bc) have[x.bc] = 1; });
      ui.fon.r = r.filter(function (x) { return !have[x.bc]; }).slice(0, 12); ui.fon.st = 'ok'; fonUpd();
    });
  }
  // Barcode: eingebauter BarcodeDetector, sonst (iOS) zxing über jsDelivr, erst beim ersten Scan geladen und danach vom Service Worker gecacht
  var scan = null, BCLIB = 'https://cdn.jsdelivr.net/npm/barcode-detector@3.2.2/dist/iife/ponyfill.js';
  function bcDet() {
    var F = { formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] };
    if (window.BarcodeDetector) return Promise.resolve(new window.BarcodeDetector(F));
    if (window.BarcodeDetectionAPI) return Promise.resolve(new window.BarcodeDetectionAPI.BarcodeDetector(F));
    return new Promise(function (ok, no) { var sc = document.createElement('script'); sc.src = BCLIB; sc.onload = function () { if (window.BarcodeDetectionAPI) ok(new window.BarcodeDetectionAPI.BarcodeDetector(F)); else no(); }; sc.onerror = no; document.head.appendChild(sc); });
  }
  function scanEnd(me) { me.on = false; if (me.s) me.s.getTracks().forEach(function (tr) { tr.stop(); }); if (scan === me) { scan = null; document.body.classList.remove('scan'); } }
  function scanStop() { if (scan) scanEnd(scan); }
  function openScan(mode) {
    scanStop(); ui.sheet = { fscan: true, from: mode === 'own' ? 'o' : 's', mode: mode };
    sheetOpen(shHead('scan', 'Barcode', 'In den Rahmen halten, egal wie herum', true) + '<div class="fscan"><video id="fsv" playsinline muted autoplay></video><i></i></div><p class="muted fon" id="fsm">…</p>', true);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { $('fsm').textContent = 'Keine Kamera'; return; }
    var me = scan = { on: true, s: null }; document.body.classList.add('scan');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(function (str) {
      me.s = str; if (!me.on || !$('fsv')) { scanEnd(me); return; }
      $('fsv').srcObject = str; $('fsm').textContent = '';
      bcDet().then(function (det) {
        (function tick() {
          var v = $('fsv'); if (!me.on || !v) { scanEnd(me); return; }
          (v.readyState >= 2 ? det.detect(v) : Promise.resolve([])).then(function (c) { if (!me.on) return; if (c && c[0]) { scanEnd(me); scanHit(String(c[0].rawValue)); } else setTimeout(tick, 200); }, function () { setTimeout(tick, 400); });
        })();
      }, function () { var m = $('fsm'); if (m) m.textContent = 'Scanner nicht geladen (offline?)'; });
    }).catch(function () { var m = $('fsm'); if (m) m.textContent = 'Kamera nicht erlaubt'; });
  }
  function pickFrom(id) { openPick(id); ui.sheet.from = 's'; $('sheet').innerHTML = fpickHtml(); }
  function scanHit(code) {
    if (ui.sheet && ui.sheet.mode === 'own') { buzz(20); openOwn(ui.odraft.id, code, ui.odraft); toast('Barcode erkannt', 'check'); return; }
    buzz(20); var ex = foodState().o.filter(function (o) { return o.bc === code; })[0];
    if (ex) { pickFrom(ex.id); return; }
    if (!navigator.onLine) { openOwn('new', code); toast('Offline · einmal selbst eintragen', 'bolt'); return; }
    $('fsm').textContent = code + ' …';
    fetch(OFF + 'api/v2/product/' + code + '?fields=' + OFF_F).then(function (r) { return r.json(); }).then(function (d) {
      if (!ui.sheet || !ui.sheet.fscan) return;
      var x = d && d.status === 1 ? offMap(Object.assign({ code: code }, d.product)) : null;
      if (x) pickFrom(offSave(x)); else { openOwn('new', code); toast('Unbekannt · einmal eintragen, dann kennt Zenit es', 'bolt'); }
    }).catch(function () { if (ui.sheet && ui.sheet.fscan) { openOwn('new', code); toast('Nicht erreichbar · selbst eintragen', 'bolt'); } });
  }
  function fvarHtml(it, id) {
    if (!it.vg) return '';
    return '<div class="seg fvs" style="grid-template-columns: repeat(' + it.vg.length + ', 1fr)">' + it.vg.map(function (v) { return '<button data-fvar="' + v[0] + '" aria-pressed="' + (v[0] === id) + '">' + v[1] + '</button>'; }).join('') + '</div>';
  }
  function openPick(id, a, edit) {
    var it = fItem(id); if (!it) return;
    ui.sheet = { fpick: true }; ui.fpick = { i: id, a: a != null ? a : it.dish ? 1 : it.d || (it.u.length ? it.u[it.ub && it.u[1] ? 1 : 0][1] : 100), edit: edit };
    sheetOpen(fpickHtml(), true); $('sheet').classList.add('fp');
  }
  function fpickHtml() {
    var pk = ui.fpick, it = fItem(pk.i), back = !!(ui.sheet && ui.sheet.from), un = it.ml ? 'ml' : 'g', b0 = it.u[0];
    // Schnellmengen passend zur Einheit, aufsteigend, mindestens 15 % auseinander: Stück/Portionen als 1×–3× (ein Ei wiegt keiner), Getränke in Glas-/Flaschengrößen,
    // sonst runde Mengen um die übliche; Gericht halbe Portionen, Fast Food Verkaufsportionen. Letzte Pille = zuletzt eingetragene Menge (Uhr), sonst eine fünfte Stufe
    var d0 = it.d || (b0 ? b0[1] : 100), r5 = function (x) { return Math.max(5, Math.round(x / 5) * 5); }, ch, last = null;
    foodState().e.forEach(function (x) { if (x.r && x.r.i === pk.i && (!last || x.t > last.t)) last = { t: x.t, g: x.r.g }; });
    if (it.dish) ch = [[0.5], [1], [1.5], [2], [3]];
    else if (it.pc) ch = (it.u.length > 1 ? it.u.slice(it.ub ? 1 : 0).map(function (u) { return [u[1]]; }) : []).concat([1, 2, 3, 4].map(function (n) { return [b0[1] * n]; }));
    else if (it.u.length) ch = it.u.map(function (u) { return [u[1]]; }).concat([[b0[1] * 2], [b0[1] * 3]], it.u[1] ? [[it.u[1][1] * 2]] : [], [[b0[1] * 4]]);
    else if (it.ml) ch = [[200, 1], [250, 1], [330, 1], [500, 1], [750, 1]];
    else ch = [[r5(d0 / 2), 1], [d0, 1], [r5(d0 * 1.5), 1], [d0 * 2, 1], [d0 * 3, 1]];
    for (var cn = 5; ch.length < 12 && !it.dish; cn++) ch.push([(b0 && !it.ml ? b0[1] : d0) * cn, !b0 || it.ml ? 1 : 0]);
    ch = ch.filter(function (x, i, a) { return !a.slice(0, i).some(function (y) { return Math.abs(y[0] - x[0]) < Math.max(y[0], x[0]) * 0.15; }); });
    if (last && !ch.slice(0, 4).some(function (y) { return y[0] === last.g; })) ch = ch.slice(0, 4).sort(function (a, b) { return a[0] - b[0]; }).concat([[last.g, 0, 1]]);
    else ch = ch.slice(0, 5).sort(function (a, b) { return a[0] - b[0]; });
    var sub = it.dish ? 'Gericht · je Portion' : (it.b ? it.b + ' · ' : '') + (it.pc ? b0[0] + ' = ' + Math.round(it.k * b0[1] / 100) + ' kcal' : '100 ' + un + ' = ' + Math.round(it.k) + ' kcal');
    var amt = it.pc ? '<label class="fpcn"><b id="fpcn">' + fAmt(it, pk.a) + '</b></label>' :
      '<label><input id="fa" type="number" inputmode="decimal" min="0" step="' + (it.dish ? 0.5 : 5) + '" value="' + pk.a + '" aria-label="Menge"><span>' + (it.dish ? 'Port.' : un) + '</span></label>';
    // Kopf: Marke wählen (eingebaute Lebensmittel) und Barcode direkt neben dem Schließen
    var hd = shHead('food', fName(it), sub, back), hb = (FOODB[pk.i] && !it.pc && it.cat !== 'r' ? '<button class="x' + (ui.fbr && ui.fbr.i === pk.i ? ' on' : '') + '" data-fbr="1" aria-label="Marke wählen">' + ic('tag') + '</button>' : '') + '<button class="x" data-fscan="1" aria-label="Barcode scannen">' + ic('scan') + '</button>';
    hd = hd.replace('<button class="x" data-sheet-close', hb + '<button class="x" data-sheet-close');
    // Kompakt, ohne Scrollen: Menge (± und wischbar), 4 Schnellmengen, Nährwert-Icons mit Tagesbalken, Tag/Mahlzeit/Uhrzeit in einer Zeile, Eintragen mit „danach frei“
    var ex = /^u/.test(pk.i) ? '<button class="btn ghost small" data-fown="' + pk.i + '">' + ic('edit') + 'Lebensmittel bearbeiten</button>' : /^d/.test(pk.i) && !ui.ingm ? '<button class="btn ghost small" data-fde="' + pk.i + '">' + ic('edit') + 'Gericht bearbeiten</button>' : '';
    return hd + '<div id="fbr">' + fbrHtml() + '</div>' + fvarHtml(it, pk.i) +
      '<div class="fstep"><button class="sb" data-fstep="-1" aria-label="Weniger">' + ic('minus') + '</button>' + amt + '<button class="sb" data-fstep="1" aria-label="Mehr">' + ic('plus') + '</button></div>' +
      '<div class="fpc">' + ch.map(function (c) { return '<button data-famt="' + c[0] + '" aria-pressed="' + (c[0] === pk.a) + '"' + (c[2] ? ' aria-label="Zuletzt: ' + fAmt(it, c[0]) + '">' + ic('clock') : '>') + fAmt(it, c[0], c[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="ftot" id="ftot">' + ftotHtml(fNut(it, pk.a)) + '</div>' + (ui.ingm || ui.fplan ? '' : whenFor(pk.edit)) +
      // Eintragen und (beim Ändern) Löschen teilen sich die Zeile: Löschen klein, rot, nur Mülleimer
      '<div class="fpgo"><button class="btn primary big" data-fpadd="1">' + ic('check') + '<span>' + (ui.ingm ? 'Hinzufügen' : ui.fplan ? 'Einplanen' : pk.edit != null ? 'Ändern' : 'Eintragen') + (ui.ingm ? '' : '<small id="ffit">' + ffitHtml() + '</small>') + '</span></button>' +
      (pk.edit != null ? '<button class="btn big fpdel" data-fdel="' + pk.edit + '" aria-label="Eintrag löschen">' + ic('trash') + '</button>' : '') + '</div>' +
      (ex ? '<div class="fsb fpx">' + ex + '</div>' : '');
  }
  function fDaySum() {
    // Tagessumme des Ziel-Tags ohne den Eintrag, der gerade geändert wird, dazu das Tagesziel
    var pk = ui.fpick, di = dayIdx(Date.now()) - (ui.fday || 0), s = foodSum(di), ox = pk && pk.edit != null ? foodState().e[pk.edit] : null;
    if (ox) NK.forEach(function (k) { s[k] -= ox[k] || 0; });
    // Beim Planen zählt das schon Geplante mit
    if (ui.fplan) { var q = planSum(di); NK.forEach(function (k) { s[k] += q[k] || 0; }); }
    return { s: s, g: foodGoal(di) };
  }
  function ffitHtml() {
    // Passt das noch? kcal danach frei bzw. drüber (Grenzen der übrigen Werte zeigen die Kacheln rot)
    var pk = ui.fpick, v = fNut(fItem(pk.i), pk.a), d = fDaySum(), rest = Math.round(d.g.k - d.s.k - (v.k || 0));
    return rest >= 0 ? rest + ' kcal danach frei' : -rest + ' kcal über dem Ziel';
  }
  function fbrLoad() {
    var bi = ui.fpick.i, bit = fItem(bi), bw = fnorm(fName(bit)).split(' ')[0]; ui.fbr = { i: bi, st: 'load', r: [] }; $('fbr').innerHTML = fbrHtml(); document.querySelector('[data-fbr]').classList.add('on');
    offSearch(fEn(bit), function (r) { if (!ui.fbr || ui.fbr.i !== bi) return; ui.fbr.st = r ? 'ok' : 'err'; ui.fbr.r = r ? r.filter(function (x) { return fnorm(x.n).indexOf(bw) >= 0; }).slice(0, 10) : []; var e = $('fbr'); if (e) e.innerHTML = fbrHtml(); });
  }
  function fbrHtml() {
    // Marke wählen: Open-Food-Facts-Produkte zum Grundnamen (nur eingebaute Lebensmittel, nicht Restaurant/Fast Food)
    var b = ui.fbr, pk = ui.fpick, it = pk && FOODB[pk.i];
    if (!it || it.pc || it.cat === 'r') return '';
    if (!b || b.i !== pk.i) return '';
    var foot = '<button class="btn fanl" data-fownb="1">' + ic('plus') + 'Fehlt? Selbst anlegen</button>';
    if (b.st === 'load') return '<p class="muted fon">' + ic('globe') + 'Suche Marken …</p>';
    if (!b.r.length) return '<p class="muted fon">' + ic('globe') + (b.st === 'err' ? 'Open Food Facts antwortet nicht<button class="btn small fre" data-fbrr="1">' + ic('undo') + 'Nochmal</button>' : 'Keine Marke gefunden. Barcode scannen oder selbst anlegen.') + '</p>' + foot;
    return '<h3 class="xg">' + ic('globe') + 'Marken</h3>' + b.r.map(function (x, i) { return '<button class="fsi web" data-fbrp="' + i + '"><span><b>' + esc(x.n) + '</b><small>' + esc([x.b, x.qt].filter(Boolean).join(' · ')) + '</small></span><em>' + x.k + '</em></button>'; }).join('') + foot;
  }
  function ftotHtml(v) {
    // Nährwert-Kacheln in den Nährwertfarben: Wert dieser Menge; Balken + Prozent = Anteil dieser Menge am Tagesziel, rot wenn der Tag damit über die Grenze geht.
    // Beim Gericht-Zutat ohne Balken
    var d = ui.ingm ? null : fDaySum();
    return NK.map(function (k) {
      var bar = '';
      if (d) { var gk = d.g[k] || 1, a = (v[k] || 0) / gk; bar = '<em' + ((d.s[k] || 0) + (v[k] || 0) > gk * FLIM[k] ? ' class="over"' : '') + '><i><i style="width:' + Math.min(100, a * 100).toFixed(1) + '%"></i></i>' + Math.round(a * 100) + '%</em>'; }
      return '<div style="--nc:var(' + NCOL[k] + ')" aria-label="' + (k === 'k' ? 'kcal' : NSH[k]) + '"><span>' + ic(NIC[k]) + '<b>' + fNv(k, v[k]) + '</b></span>' + bar + '</div>';
    }).join('');
  }
  function fpickUpd() {
    var pk = ui.fpick, it = fItem(pk.i); if (!it) return;
    $('ftot').innerHTML = ftotHtml(fNut(it, pk.a)); if ($('ffit')) $('ffit').textContent = ffitHtml();
    var pc = $('fpcn'); if (pc) pc.textContent = fAmt(it, pk.a);
    document.querySelectorAll('[data-famt]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.famt === pk.a)); });
  }
  function quickHtml(idx) {
    // Schnell eintragen ohne Lebensmittel (z. B. Restaurant): kcal und Nährwerte, Name, Tag/Mahlzeit/Uhrzeit; auch als Reiter in der Suche
    var x = idx != null ? foodState().e[idx] : null;
    function f(k, u) { return '<label style="--nc:var(' + NCOL[k] + ')">' + ic(NIC[k]) + '<input id="f-' + k + '" type="number" inputmode="decimal" min="0" value="' + (x && x[k] != null ? x[k] : '') + '" placeholder="0" aria-label="' + (k === 'k' ? 'Kalorien' : NSH[k]) + '"><span>' + u + '</span></label>'; }
    return '<div class="finp">' + f('k', 'kcal') + f('p', 'g') + '</div><div class="finp four">' + f('f', 'g') + f('c', 'g') + f('fb', 'g') + f('su', 'g') + '</div>' +
      '<div class="fqn"><input id="f-n" class="fnm" type="text" maxlength="30" placeholder="Name (optional)" value="' + (x ? esc(x.n) : '') + '" aria-label="Name">' +
      (x ? '' : '<button class="x" data-fqm="1" aria-pressed="' + !!ui.fqm + '" aria-label="Als eigenes Lebensmittel merken">' + ic('star') + '</button>') + '</div>' + (ui.fplan ? '' : whenFor(idx)) +
      '<div class="fpgo"><button class="btn primary big" data-fsave="1">' + ic('check') + (x ? 'Ändern' : ui.fplan ? 'Einplanen' : 'Eintragen') + '</button>' + (x ? '<button class="btn big fpdel" data-fdel="' + idx + '" aria-label="Eintrag löschen">' + ic('trash') + '</button>' : '') + '</div>' +
      (x ? '' : '<div class="fsb fpx"><button class="btn ghost small" data-fown="new">' + ic('plus') + 'Lebensmittel je 100 g anlegen</button></div>');
  }
  function openQuick(idx) {
    ui.sheet = { food: true, idx: idx }; if (!ui.fplan) ui.fday = dayIdx(Date.now()) - fSd(); ui.fqm = false;
    sheetOpen(shHead('bolt', idx != null ? 'Eintrag ändern' : 'Schnell eintragen', 'Ohne Lebensmittel, z. B. Restaurant') + quickHtml(idx), true);
  }
  function openOwn(id, bc, dr) {
    // dr: Entwurf aus dem Formular (zurück vom Barcode-Scan)
    var o = id && id !== 'new' ? fOwn(id) : null, src = dr || o || {}, code = bc || (dr && dr.bc) || (o && o.bc) || '';
    ui.sheet = { fown: o ? o.id : 'new', bc: code, ml: src.ml ? 1 : 0 };
    function f(k) { return '<label class="nl" style="--nc:var(' + NCOL[k] + ')">' + ic(NIC[k]) + '<input id="o-' + k + '" type="number" inputmode="decimal" min="0" value="' + (src[k] != null ? src[k] : '') + '" placeholder="' + (k === 'k' ? 'kcal' : 'g') + '" aria-label="' + (k === 'k' ? 'Kalorien' : NSH[k]) + '"></label>'; }
    var un = dr ? dr.un : o && o.u[0] ? o.u[0][0] : '', ug = dr ? dr.ug : o && o.u[0] ? o.u[0][1] : '';
    sheetOpen(shHead('plus', o ? 'Lebensmittel' : 'Eigenes Lebensmittel', 'Werte je 100 g bzw. 100 ml, z. B. von der Packung') +
      '<input id="o-n" class="fnm" type="text" maxlength="30" placeholder="Name, z. B. Proteinbrot" value="' + esc(src.n || '') + '" aria-label="Name">' +
      '<div class="own2"><input id="o-b" class="fnm" type="text" maxlength="24" placeholder="Marke (optional)" value="' + esc(src.b || '') + '" aria-label="Marke">' +
      '<div class="fqw"><input id="o-bc" class="fnm" type="text" inputmode="numeric" maxlength="14" placeholder="Barcode (optional)" value="' + esc(code) + '" aria-label="Barcode"><button class="x" data-fscan="own" aria-label="Barcode scannen">' + ic('scan') + '</button></div></div>' +
      '<div class="seg fvs"><button data-oml="0" aria-pressed="' + !ui.sheet.ml + '">g</button><button data-oml="1" aria-pressed="' + !!ui.sheet.ml + '">ml</button></div>' +
      '<div class="dg3">' + NK.map(f).join('') + '</div>' +
      '<div class="dg3 two"><label>Portion<input id="o-un" type="text" maxlength="12" placeholder="z. B. Scheibe" value="' + esc(String(un)) + '"></label><label>Menge<input id="o-ug" type="number" inputmode="decimal" min="0" value="' + ug + '"></label></div>' +
      '<button class="btn primary big" data-fownsave="1">' + ic('check') + 'Speichern</button>' + (o ? '<button class="btn ghost small" data-fowndel="1">' + ic('trash') + 'Löschen</button>' : ''), true);
  }
  function ownDraft() { var d = { n: $('o-n').value, b: $('o-b').value, un: $('o-un').value, ug: $('o-ug').value, ml: ui.sheet.ml, bc: $('o-bc').value }; NK.forEach(function (k) { d[k] = $('o-' + k).value; }); return d; }
  function openDishes() {
    ui.sheet = { fdishes: true }; if (!ui.fplan) ui.fday = dayIdx(Date.now()) - fSd(); sheetOpen(dishesHtml(), true);
  }
  function dishesHtml() {
    // Gerichte-Menü: Filter nach Mahlzeit (fest gewählt oder meist gegessen, dishMeals); Karten (antippen = Menge wählen und bearbeiten, nach rechts wischen = 1 Portion sofort),
    // zuletzt gegessene zuerst; unten „Neues Gericht“
    var st = foodState(), lt = {}, f = ui.dmf || '';
    st.e.forEach(function (x) { if (x.r && /^d/.test(x.r.i)) lt[x.r.i] = Math.max(lt[x.r.i] || 0, x.t); });
    var l = st.d.filter(function (x) { return !f || dishMeals(x).indexOf(f) >= 0; }).sort(function (a, b) { return (lt[b.id] || 0) - (lt[a.id] || 0); });
    return shHead('pot', 'Gerichte', st.d.length + (st.d.length === 1 ? ' Gericht' : ' Gerichte') + ' · je Portion') +
      (st.d.length ? '<div class="seg fdm">' + [['', 'Alle']].concat(MEALS.map(function (m) { return [m[1], m[2]]; })).map(function (m) {
        return '<button data-dmf="' + m[0] + '" aria-pressed="' + (f === m[0]) + '" aria-label="' + m[1] + '">' + (m[0] ? ic(MEALI[m[0]]) : 'Alle') + '</button>'; }).join('') + '</div>' : '') +
      (l.length ? '<div class="fdg" data-noswipe="1">' + l.map(fDishCard).join('') + '</div><p class="sh-note">Nach rechts wischen = 1 Portion eintragen</p>' : '<p class="muted">' + (st.d.length ? 'Zu dieser Mahlzeit noch kein Gericht gegessen.' : 'Noch kein Gericht. Einmal anlegen, dann mit einem Tipp eintragen.') + '</p>') +
      '<div class="fpgo"><button class="btn primary big" data-fde="new">' + ic('plus') + 'Neues Gericht</button></div>';
  }
  // Gericht bearbeiten: Zutaten aus der Datenbank füllen alle Nährwerte, sonst kcal und Protein von Hand
  function libFind(name) {
    var q = fnorm(name.trim()); if (!q) return null;
    var all = foodState().o.concat(FOODS); for (var i = 0; i < all.length; i++) if (fnorm(all[i].n) === q) return all[i];
    return null;
  }
  // Zutat fürs Gericht: Suche, Marke und Barcode im Zutat-Modus (ui.ingm); „Hinzufügen“ trägt Menge und Werte je 100 g ein
  function ingBack() { ui.ingm = false; ui.sheet = { dishEdit: true }; sheetOpen(dishEditHtml(), true); }
  function ingAdd(id, a) {
    var it = fItem(id), dd = ui.dd; if (!it || !dd) return;
    var r = { n: fEn(it).slice(0, 30), a: Math.round(a * 10) / 10, k: it.k, p: it.p, i: id }; ['f', 'c', 'fb', 'su'].forEach(function (k) { if (it[k] != null) r[k] = it[k]; });
    var last = dd.ing[dd.ing.length - 1]; if (last && !last.n && last.a === '') dd.ing.pop();
    dd.ing.push(r); ingBack();
  }
  function dishEditHtml() {
    // Gericht anlegen: Name, darunter je Portion live (Nährwert-Icons) mit Portionen ±; Zutaten kompakt (Name, Gramm, entfernen) – aus der Datenbank mit Nährwerten je 100 g,
    // von Hand mit kcal und Protein je 100 g; Zutat suchen (Suche hat Barcode) oder von Hand; Speichern und Löschen teilen sich die Zeile
    var dd = ui.dd, t = dishTot(dd);
    return shHead('pot', dd.id ? 'Gericht' : 'Neues Gericht', 'Zutaten eintragen, durch Portionen teilen') +
      '<input id="dd-n" class="fnm" type="text" maxlength="30" placeholder="Name, z. B. Chili" value="' + esc(dd.n) + '" aria-label="Name">' +
      // Mahlzeiten: keine gewählt = automatisch (wann es meist gegessen wird), sonst eine oder mehrere
      '<div class="seg fdm ddm">' + MEALS.map(function (m) { return '<button data-ddm="' + m[1] + '" aria-pressed="' + ((dd.m || []).indexOf(m[1]) >= 0) + '" aria-label="' + m[2] + '">' + ic(MEALI[m[1]]) + '</button>'; }).join('') + '</div>' +
      '<datalist id="ing-lib">' + foodState().o.concat(FOODS).map(function (x) { return '<option value="' + esc(x.n) + '">'; }).join('') + '</datalist>' +
      '<div class="dgt"><div id="dd-tot">' + dishTotHtml(t) + '</div><div class="dgpor"><button class="sb" data-dpor="-1" aria-label="Eine Portion weniger">' + ic('minus') + '</button>' +
      '<label><input id="dd-por" type="number" inputmode="decimal" min="1" step="1" value="' + dd.por + '" aria-label="Portionen"><span>Port.</span></label><button class="sb" data-dpor="1" aria-label="Eine Portion mehr">' + ic('plus') + '</button></div></div>' +
      dd.ing.map(function (q, i) {
        return '<div class="dg"><div class="dg-h"><input id="di-n-' + i + '" type="text" list="ing-lib" maxlength="30" placeholder="Zutat" value="' + esc(q.n) + '" aria-label="Zutat">' +
          '<label class="dgam"><input id="di-a-' + i + '" type="number" inputmode="decimal" min="0" value="' + (q.a === '' ? '' : q.a) + '" placeholder="0" aria-label="Menge in g"><span>g</span></label>' +
          '<button class="xs2" data-dgx="' + i + '" aria-label="Zutat entfernen">' + ic('close') + '</button></div>' +
          (q.i ? '<small class="dgl">' + ['k', 'p', 'f', 'c'].map(function (k) { return '<span style="--nc:var(' + NCOL[k] + ')">' + ic(NIC[k]) + fNv(k, q[k]) + '</span>'; }).join('') + 'je 100 g</small>' :
            '<div class="dg3 two"><label class="nl" style="--nc:var(' + NCOL.k + ')">' + ic(NIC.k) + '<input id="di-k-' + i + '" type="number" inputmode="decimal" min="0" value="' + (q.k === '' ? '' : q.k) + '" placeholder="kcal /100 g" aria-label="kcal je 100 g"></label>' +
            '<label class="nl" style="--nc:var(' + NCOL.p + ')">' + ic(NIC.p) + '<input id="di-p-' + i + '" type="number" inputmode="decimal" min="0" value="' + (q.p === '' ? '' : q.p) + '" placeholder="g /100 g" aria-label="Protein je 100 g"></label></div>') + '</div>';
      }).join('') +
      '<div class="fsb dga"><button class="btn small" data-dgs="1">' + ic('search') + 'Zutat suchen</button><button class="btn small" data-dga="1">' + ic('plus') + 'Von Hand</button></div>' +
      '<div class="fpgo"><button class="btn primary big" data-dsave="1">' + ic('check') + 'Speichern</button>' + (dd.id ? '<button class="btn big fpdup" data-ddup="1" aria-label="Als Kopie anlegen">' + ic('cards') + '</button><button class="btn big fpdel" data-ddel="1" aria-label="Gericht löschen">' + ic('trash') + '</button>' : '') + '</div>';
  }
  function dishTotHtml(t) {
    // Gericht: je Portion als Nährwert-Icons, darunter die Summe
    return '<div class="dgp">' + [['k', t.pk], ['p', t.pp], ['f', t.pf], ['c', t.pc]].map(function (q) { return '<span style="--nc:var(' + NCOL[q[0]] + ')">' + ic(NIC[q[0]]) + '<b>' + Math.round(q[1]) + '</b></span>'; }).join('') + '</div><small>je Portion · gesamt ' + Math.round(t.k) + ' kcal</small>';
  }
  function openDishEdit(id) {
    var x = id && id !== 'new' ? fDish(id) : null;
    ui.dd = x ? JSON.parse(JSON.stringify(x)) : { id: null, n: '', por: 1, ing: [{ n: '', a: '', k: '', p: '' }] };
    ui.ddel = 0; ui.sheet = { dishEdit: true }; sheetOpen(dishEditHtml(), true);
  }
  function readDraft() {
    var dd = ui.dd; if (!dd || !$('dd-n')) return;
    dd.n = $('dd-n').value; dd.por = Math.max(1, parseFloat($('dd-por').value) || 1);
    dd.ing.forEach(function (q, i) {
      // Fehlt das Feld (Zutat aus der Datenbank: kcal/Protein nicht editierbar), bleibt der bisherige Wert
      function v(k) { var e = $('di-' + k + '-' + i); if (!e) return q[k]; var f = parseFloat(e.value); return isFinite(f) ? f : ''; }
      q.n = $('di-n-' + i).value; q.a = v('a'); q.k = v('k'); q.p = v('p');
    });
  }
  function saveDish() {
    readDraft(); var dd = ui.dd, ing = dd.ing.filter(function (q) { return (+q.a || 0) > 0 && ((+q.k || 0) > 0 || (+q.p || 0) > 0); });
    if (!dd.n.trim()) { toast('Name fehlt', 'bolt'); return; }
    if (!ing.length) { toast('Zutat mit Menge eintragen', 'bolt'); return; }
    var st = foodState(), o = { id: dd.id || 'd' + Date.now().toString(36), n: dd.n.trim().slice(0, 30), por: dd.por, ing: ing.map(function (q) {
      var r = { n: (q.n || '').trim().slice(0, 30), a: +q.a || 0, k: +q.k || 0, p: +q.p || 0 }; ['f', 'c', 'fb', 'su'].forEach(function (k) { if (q[k] != null) r[k] = +q[k] || 0; }); if (q.i) r.i = q.i; return r;
    }) };
    if (dd.m && dd.m.length) o.m = dd.m.slice();
    var ix = st.d.map(function (y) { return y.id; }).indexOf(o.id); if (ix >= 0) st.d[ix] = o; else st.d.push(o);
    persist(); ui.fresh = false; render(); toast('Gericht gespeichert', 'check'); openDishes();
  }
  function daysSince(t) { return dayIdx(Date.now()) - dayIdx(t); }
  function openWeight() {
    var st = foodState(), lw = lastW(), td = lw && daysSince(lw.t) === 0;
    ui.sheet = { weight: true };
    sheetOpen(shHead('scale', 'Gewicht', td ? 'Heutigen Wert ändern' : 'Heute wiegen') +
      '<div class="finp one"><label>Gewicht<input id="w-v" type="number" inputmode="decimal" step="0.1" min="20" max="400" value="' + (lw ? lw.kg : '') + '" placeholder="0"><span>kg</span></label></div>' +
      '<button class="btn primary big" data-wsave="1">' + ic('check') + 'Speichern</button>' +
      (st.w.length ? '<div class="wl">' + st.w.slice(-6).reverse().map(function (x) { return '<div><span>' + fmtDayL(dayIdx(x.t)) + '</span><b>' + fN(x.kg) + ' kg</b><button class="xs2" data-wdel="' + x.t + '" aria-label="Löschen">' + ic('close') + '</button></div>'; }).join('') + '</div>' : ''));
    setTimeout(function () { var i = $('w-v'); if (i && !('ontouchstart' in window)) { i.focus(); i.select(); } }, 350);
  }
  // Mahlzeit aus der Uhrzeit: bis 10:30 Frühstück, bis 14:30 Mittag, bis 17:30 Snack, danach Abend
  // Mahlzeiten: [bis Uhrzeit, Schlüssel, Name, übliche Uhrzeit (beim Hineinziehen in eine andere Mahlzeit)]
  var MEALS = [[10.5, 'fr', 'Frühstück', 8], [14.5, 'mi', 'Mittag', 12.5], [17.5, 'sn', 'Snack', 16], [24, 'ab', 'Abend', 19]], MEALI = { fr: 'sun', mi: 'food', sn: 'snack', ab: 'moon' };
  function mealOf(t) { var q = new Date(t), h = q.getHours() + q.getMinutes() / 60; return MEALS.filter(function (m) { return h < m[0]; })[0]; }
  function hmOf(t) { var q = new Date(t); return ('0' + q.getHours()).slice(-2) + ':' + ('0' + q.getMinutes()).slice(-2); }
  function whenRow(t, withDay, mk) {
    // Tag (nur neue Einträge) oben, darunter eine Zeile: Mahlzeit als Symbol-Leiste + Uhrzeit-Pille; die Mahlzeit folgt der Uhrzeit, bis man sie wählt
    var ml = mk || mealOf(t || Date.now())[1];
    return '<div class="fwh">' + (withDay ? dayTog() : '') + '<div class="seg fmk" role="group" aria-label="Mahlzeit"><input type="hidden" id="fmk" value="' + ml + '"' + (mk ? ' data-man="1"' : '') + '>' +
      MEALS.map(function (m) { return '<button type="button" data-fmk="' + m[1] + '" aria-pressed="' + (m[1] === ml) + '" aria-label="' + m[2] + '">' + ic(MEALI[m[1]]) + '</button>'; }).join('') + '</div>' +
      '<label class="ftm">' + ic('clock') + '<b id="ftmv">' + hmOf(t || Date.now()) + '</b><input id="ftm" type="time" value="' + hmOf(t || Date.now()) + '" aria-label="Uhrzeit"></label></div>';
  }
  function whenFor(idx) { var x = idx != null ? foodState().e[idx] : null; return whenRow(x ? x.t : 0, !x, x ? x.mk : ''); }
  function mealOfE(x) { return x.mk ? MEALS.filter(function (m) { return m[1] === x.mk; })[0] || mealOf(x.t) : mealOf(x.t); }
  function dayTog() {
    // Tag als ein Knopf: antippen wechselt Heute → Gestern → (älterer gewählter Tag) → Heute
    var t = dayIdx(Date.now()), b = t - fSd(), o = [0, 1], cur = ui.fday || 0; if (b > 1) o.push(b);
    return '<button type="button" class="fdt" data-fday="' + o[(o.indexOf(cur) + 1) % o.length] + '" aria-label="Tag wechseln">' + ic('cal') + '<b>' + (cur === 0 ? 'Heute' : cur === 1 ? 'Gestern' : esc(fmtDayL(t - cur))) + '</b></button>';
  }
  function lastW() { var w = foodState().w; return w.length ? w[w.length - 1] : null; }

  // Ziele: automatisch (Rechner) oder eigene Werte
  function openGoals() {
    var st = foodState(), pr = st.pr || {}, lw = lastW();
    ui.sheet = { goals: true }; ui.gmode = st.g && !st.g.a ? 'm' : 'a';
    ui.cpr = { h: pr.h || '', a: pr.a || '', s: pr.s || 'm', pal: palOf(pr), rt: rateOf(pr), pkg: pr.pkg || (rateOf(pr) < 0 ? 2.2 : 2), fp: pr.fp || 25, tb: pr.tb === 0 ? 0 : 1, adj: pr.adj || 0, w: lw ? lw.kg : '' };
    sheetOpen(goalsHtml(), true); $('sheet').classList.add('fp'); calcUpd();
  }
  function fN2(x) { return String(Math.round(x * 100) / 100).replace('.', ','); }
  function rateText(r) { return r === 0 ? 'Halten' : (r > 0 ? '+' : '−') + fN2(Math.abs(r)); }
  function goalsHtml() {
    // Ziele im Stil der übrigen Fenster: Nährwert-Icons und -Farben statt Namen, Übernehmen/Speichern unten fixiert
    var c = ui.cpr, g = foodGoal(), h = shHead('calc', 'Rechner', 'Tagesziel für kcal und Nährwerte') + '<div class="seg"><button data-gmode="a" aria-pressed="' + (ui.gmode === 'a') + '">Automatisch</button><button data-gmode="m" aria-pressed="' + (ui.gmode === 'm') + '">Eigene Werte</button></div>';
    if (ui.gmode === 'm') {
      return h + '<div class="dg3">' + NK.map(function (k) { return '<label class="nl" style="--nc:var(' + NCOL[k] + ')">' + ic(NIC[k]) + '<input id="g-' + k + '" type="number" inputmode="numeric" min="0" value="' + g[k] + '" aria-label="' + (k === 'k' ? 'kcal' : NSH[k] + ' in g') + '"></label>'; }).join('') + '</div>' +
        '<p class="muted fnote">Leere Felder rechnet die App aus den kcal (Fett 25 %, Ballaststoffe 14 g je 1000 kcal, Zucker höchstens 10 %).</p><div class="fpgo"><button class="btn primary big" data-fgsave="1">' + ic('check') + 'Speichern</button></div>';
    }
    function crg(id, lab, v, min, max, st, lo, hi, k) { return '<label class="crg"' + (k ? ' style="--nc:var(' + NCOL[k] + ')"' : '') + '><span><i class="crn">' + (k ? ic(NIC[k]) : '') + lab + '</i><b id="c-' + id + 'v"></b></span><input id="c-' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + st + '" value="' + v + '">' + (lo ? '<i class="crl"><em>' + lo + '</em><em>' + hi + '</em></i>' : '') + '</label>'; }
    return h + '<div class="cres" id="c-res"></div>' +
      '<div class="cin"><label>cm<input id="c-h" type="number" inputmode="numeric" value="' + c.h + '"></label><label>Jahre<input id="c-a" type="number" inputmode="numeric" value="' + c.a + '"></label><label>kg<input id="c-w" type="number" inputmode="decimal" step="0.1" value="' + c.w + '"></label>' +
      '<div class="seg"><button data-csx="m" aria-pressed="' + (c.s !== 'f') + '">M</button><button data-csx="f" aria-pressed="' + (c.s === 'f') + '">W</button></div></div>' +
      '<div class="crg"><span>Tempo<b>kg / Woche</b></span><div class="seg six">' + RATES.map(function (r) { return '<button data-crt="' + r + '" aria-pressed="' + (r === c.rt) + '">' + rateText(r) + '</button>'; }).join('') + '</div></div>' +
      crg('pal', 'Alltag', c.pal, 1.2, 1.9, 0.05, 'sitzend', 'körperlich') + crg('pkg', 'Protein', c.pkg, 1.4, 2.6, 0.1, '', '', 'p') + crg('fp', 'Fett', c.fp, 20, 40, 5, '', '', 'f') +
      '<div class="clearn" id="c-learn"></div><details class="cway"><summary>' + ic('chev') + 'Rechenweg</summary><div id="c-way"></div></details>' +
      '<div class="fpgo"><button class="btn primary big" data-cuse="1" id="c-use">' + ic('check') + 'Übernehmen</button></div>';
  }
  function calcRead() {
    var c = ui.cpr; function v(id) { var e = $(id); return e ? parseFloat(e.value) || 0 : 0; }
    if ($('c-h')) { c.h = v('c-h'); c.a = v('c-a'); c.w = v('c-w'); c.pal = v('c-pal') || c.pal; c.pkg = v('c-pkg') || c.pkg; c.fp = v('c-fp') || c.fp; }
    return c;
  }
  function calcUpd() {
    var r = $('c-res'); if (!r) return;
    var c = calcRead(), today = dayIdx(Date.now()), ok = c.h >= 120 && c.a >= 14 && c.w >= 20;
    $('c-palv').textContent = fN2(c.pal); $('c-pkgv').textContent = fN(c.pkg) + ' g/kg'; $('c-fpv').textContent = c.fp + ' %';
    if (!ok) { r.innerHTML = '<p class="muted">Größe, Alter und Gewicht eintragen.</p>'; $('c-learn').innerHTML = ''; $('c-way').innerHTML = ''; $('c-use').disabled = true; return; }
    $('c-use').disabled = false;
    var pr = { h: c.h, a: c.a, s: c.s, pal: c.pal, rt: c.rt, pkg: c.pkg, fp: c.fp, tb: c.tb, adj: c.adj }, rest = calcWith(Object.assign({}, pr, { tb: 0 }), c.w, today);
    var tday = null, tdi = 0; for (var i = 0; i < 8 && !tday; i++) if (schedFor(today + i).length) { tdi = today + i; tday = calcWith(Object.assign({}, pr, { tb: 1 }), c.w, tdi); }
    function sg(v) { return (v >= 0 ? '+' : '−') + Math.abs(Math.round(v)); }
    // Oben (sticky): Ruhetag, Trainingstag mit Kästchen (Zuschlag an/aus), Makros des Ruhetags
    var on = !!(c.tb && tday);
    r.innerHTML = '<div class="ctop"><div class="cday"><small>' + ic('moon') + 'Ruhetag</small><b>' + rest.k + '<em>kcal</em></b></div>' +
      '<button class="cday" data-ctb="1" aria-pressed="' + on + '"' + ' aria-label="Zuschlag an Trainingstagen"><small>' + ic('dumbbell') + 'Training<i class="ctg">' + (on ? ic('check') : '') + '</i></small><b>' + (on ? tday.k : rest.k) + '<em>' + (on ? sg(tday.tb) : 'kcal') + '</em></b></button></div>' +
      '<div class="cmac">' + ['p', 'f', 'c', 'fb', 'su'].map(function (k) { return '<div style="--nc:var(' + NCOL[k] + ')" aria-label="' + NSH[k] + '">' + ic(NIC[k]) + '<b>' + (k === 'su' ? '≤' : '') + rest[k] + '<small>g</small></b></div>'; }).join('') + '</div>';
    // Rechenweg (aufklappbar)
    function row(lab, v, cls) { return '<div' + (cls ? ' class="' + cls + '"' : '') + '><span>' + lab + '</span><b>' + v + '</b></div>'; }
    $('c-way').innerHTML = row('Grundumsatz', Math.round(rest.bmr)) + row('× Alltag ' + fN2(c.pal), Math.round(rest.bmr * c.pal)) +
      (c.rt ? row('Tempo ' + rateText(c.rt) + ' kg/Woche', sg(c.rt * 1100)) : '') + (c.adj ? row('Anpassung aus Verlauf', sg(c.adj)) : '') + row('Ruhetag (gerundet)', rest.k + ' kcal', 'tot') +
      (on ? row('Training ' + esc(fmtDayL(tdi)), sg(tday.tb)) + row('Trainingstag', tday.k + ' kcal', 'tot') : '') +
      row('Protein ' + fN(c.pkg) + ' g × ' + fN(c.w) + ' kg', rest.p + ' g', 'sub') + row('Fett ' + c.fp + ' % der kcal', rest.f + ' g', 'sub') + row('Kohlenhydrate = Rest', rest.c + ' g', 'sub') +
      row('Ballaststoffe 14 g je 1000 kcal', rest.fb + ' g', 'sub') + row('Zucker höchstens 10 %', '≤ ' + rest.su + ' g', 'sub');
    // Echter Bedarf aus Essen + Gewicht (tdeeEst): Abweichung zur Formel wird als Anpassung ins Ziel übernommen
    var e = tdeeEst(pr), L = $('c-learn');
    if (e.off) L.innerHTML = '<div>' + ic('chart') + '<span><b>Echter Bedarf: noch unklar</b><small>Essen und Gewicht passen nicht zusammen (' + e.est + ' statt ' + e.maint + ' kcal). Meist fehlen Einträge.</small></span></div>';
    else if (!e.ok) L.innerHTML = '<div>' + ic('chart') + '<span><b>Echter Bedarf: lernt noch</b><small>aus Essen und Gewicht der letzten 4 Wochen</small><span class="cprg"><i style="--p:' + Math.min(1, e.n / 10).toFixed(2) + '"></i>Tage ' + Math.min(e.n, 10) + '/10</span><span class="cprg"><i style="--p:' + Math.min(1, e.wn / 3).toFixed(2) + '"></i>Wiegen ' + Math.min(e.wn, 3) + '/3</span></span></div>';
    else {
      var diff = e.adj - c.adj;
      L.innerHTML = '<div>' + ic('chart') + '<span><b>Echter Bedarf ≈ ' + e.est + ' kcal</b><small>Formel sagt ' + e.maint + ' kcal. Gemessen aus ' + e.n + ' Tagen Essen und Gewicht (' + (e.wk >= 0 ? '+' : '−') + fN(Math.abs(e.wk)) + ' kg/Woche).</small></span></div>' +
        (Math.abs(diff) >= 50 ? '<button class="btn small" data-cadj="' + e.adj + '">' + ic('check') + 'Ziel um ' + sg(e.adj) + ' kcal anpassen</button>' :
          '<small class="ok">' + ic('check') + (c.adj ? 'Ziel angepasst (' + sg(c.adj) + ' kcal)' : 'Formel passt') + '</small>' + (c.adj ? '<button class="btn ghost small" data-cadj="0">Anpassung entfernen</button>' : ''));
    }
  }
  function goalsSave() {
    var st = foodState(), c = calcRead(), o = Object.assign({}, st.pr || {}, { h: Math.round(c.h), a: Math.round(c.a), s: c.s, pal: c.pal, rt: c.rt, pkg: c.pkg, fp: c.fp, tb: c.tb, adj: c.adj });
    o.go = c.rt > 0 ? 'bulk' : c.rt < 0 ? 'cut' : 'keep'; st.pr = o;
    var kg = Math.round(c.w * 10) / 10, lw = lastW(); if (kg >= 20 && kg <= 400 && (!lw || lw.kg !== kg)) { if (lw && daysSince(lw.t) === 0) lw.kg = kg; else st.w.push({ t: Date.now(), kg: kg }); }
    st.g = { a: 1 }; persist(); closeSheet(true); ui.fresh = false; render(); toast('Ziele: ' + foodGoal().k + ' kcal heute', 'check');
  }

  function fmkSet(v) { $('fmk').value = v; document.querySelectorAll('[data-fmk]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.fmk === v)); }); }
  // Gegessenes gruppieren: je Mahlzeit eine Gruppe (Reihenfolge und Uhrzeit nach dem ersten Eintrag)
  function fGroups(items) {
    var gs = [], gm = {};
    items.slice().sort(function (a, b) { return a.x.t - b.x.t; }).forEach(function (o) { var m = mealOfE(o.x)[1]; if (!gm[m]) { gm[m] = { m: m, t0: o.x.t, l: [] }; gs.push(gm[m]); } gm[m].l.push(o); });
    return gs;
  }
  // Nährwertfarben (wie in der Bilanz) und -Icons statt Namen (Name bleibt als aria-label)
  var NCOL = { k: '--g-push', p: '--g-kh', f: '--g-mob', c: '--g-cardio', fb: '--g-pull', su: '--g-core' }, NIC = { k: 'nk', p: 'np', f: 'nf', c: 'nc', fb: 'nfb', su: 'nsu' };  function fNv(k, v) { return v == null ? '–' : k === 'k' ? String(Math.round(v)) : fN(v); }
  // Nährwert antippen: gleiche Lebensmittel zusammengefasst (×n, gestapelt), sortiert nach diesem Wert, Anteil am Tag als Balken; antippen = übrige Nährwerte darunter (nur ansehen)
  function openNut(k) {
    var sd = fSd(), s = foodSum(sd), g = foodGoal(sd), u = k === 'k' ? ' kcal' : ' g', tot = s[k] || 0, gm = {}, gl = [], unk = 0;
    s.items.forEach(function (o) {
      var x = o.x, key = x.r ? x.r.i : 'n:' + (x.n || ''); if (x[k] == null) unk++;
      if (!gm[key]) { gm[key] = { n: x.n || 'Mahlzeit', c: 0, v: {} }; gl.push(gm[key]); }
      gm[key].c++; NK.forEach(function (j) { if (x[j] != null) gm[key].v[j] = (gm[key].v[j] || 0) + x[j]; });
    });
    var rows = gl.filter(function (q) { return q.v[k] > 0; }).sort(function (a, b) { return b.v[k] - a.v[k]; }).map(function (q) {
      var sh = tot ? q.v[k] / tot : 0;
      // Ring links = Anteil am Tag (Prozent darin), Name mit „n× gegessen“, rechts der Wert
      return '<div class="fnr' + (q.c > 1 ? ' fnrs' : '') + '" data-fnx="1" role="button" tabindex="0" aria-expanded="false"><div class="fnh"><i class="fnp" style="--p:' + sh.toFixed(3) + '" aria-label="' + Math.round(sh * 100) + ' Prozent des Tages">' + Math.round(sh * 100) + '</i>' +
        '<span><b>' + esc(q.n) + '</b>' + (q.c > 1 ? '<small>' + q.c + '× gegessen</small>' : '') + '</span><em>' + fNv(k, q.v[k]) + u + '</em></div>' +
        '<div class="fnd">' + NK.filter(function (j) { return j !== k; }).map(function (j) { return '<span style="--nc:var(' + NCOL[j] + ')" aria-label="' + (j === 'k' ? 'kcal' : NSH[j]) + '">' + ic(NIC[j]) + '<b>' + fNv(j, q.v[j]) + '</b></span>'; }).join('') + '</div></div>';
    }).join('');
    ui.sheet = { nut: k };
    sheetOpen(shHead(NIC[k], (k === 'k' ? 'Kalorien' : NSH[k]) + (sd === dayIdx(Date.now()) ? ' heute' : ''), (k === 'k' ? Math.round(tot) : fN(tot)) + ' / ' + (k === 'su' ? '≤' : '') + g[k] + u) +
      '<div class="fnl" style="--fc:var(' + NCOL[k] + ')"><i class="fnb" style="--p:' + Math.min(1, tot / (g[k] || 1)).toFixed(3) + '"></i>' + (rows || '<p class="muted">Noch nichts mit ' + (k === 'k' ? 'Kalorien' : NSH[k]) + '.</p>') + '</div>' +
      (unk ? '<p class="sh-note">' + unk + (unk === 1 ? ' Eintrag' : ' Einträge') + ' ohne Angabe</p>' : ''), true);
  }
  function fChip(o) {
    // Eintrag-Chip in der Mahlzeit-Zeile: Name, Menge (sonst Uhrzeit), kcal
    var ml = mealOfE(o.x), it = o.x.r && fItem(o.x.r.i);
    return '<button class="fcpi m-' + ml[1] + '" data-fedit="' + o.i + '"><b>' + esc(o.x.n || 'Mahlzeit') + '</b><small>' + (it ? fAmt(it, o.x.r.g) : hmOf(o.x.t)) + '</small><em>' + Math.round(o.x.k) + '<i>kcal</i></em></button>';
  }
  function foodDel(i) {
    // Ein Eintrag (Zahl) oder eine ganze Gruppe (Liste von Indizes, absteigend gelöscht, damit die Indizes stimmen)
    var st = foodState(), l = [].concat(i).filter(function (j) { return j >= 0 && j < st.e.length; }).sort(function (a, b) { return b - a; }); if (!l.length) return; fUndo(); l.forEach(function (j) { st.e.splice(j, 1); });
    persist(); closeSheet(true); ui.fresh = false; render(); toast(l.length > 1 ? l.length + ' Einträge gelöscht' : 'Gelöscht', 'close', true); buzz(10);
  }
  // Rückgängig fürs Essen: Stand vor der Änderung merken (Pfeil im Hinweis, solange er steht)
  function fUndo() { ui.undo = '#' + JSON.stringify(state.food); }
  // Wischen: Vorschlag nach oben ziehen = sofort eintragen (Menge wie angezeigt), Eintrag nach unten ziehen = löschen (mit Rückgängig).
  // Waagerecht bleibt Scrollen der Reihe; ein Wischen löst kein Antippen aus
  var fsw = null, fswMoved = false;
  document.addEventListener('pointerdown', function (ev) { var el = ev.target.closest && ev.target.closest('.fti, .fcpi:not(.fpm), .fmc[data-fdelg]'); fswMoved = false; fsw = el ? { el: el, x: ev.clientX, y: ev.clientY, dy: 0, add: el.classList.contains('fti') } : null; });
  document.addEventListener('pointermove', function (ev) {
    if (!fsw) return; var dx = ev.clientX - fsw.x, dy = ev.clientY - fsw.y;
    if (!fswMoved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { fsw = null; return; }
    if (Math.abs(dy) > 6) fswMoved = true; if (!fswMoved) return;
    // Vorschlag folgt dem Finger frei nach oben; liegt der Finger über einer Mahlzeit (Karte, Platzhalter, Gruppe), wird sie markiert und ist das Ziel
    var v = fsw.add ? Math.min(0, dy) : Math.max(0, Math.min(70, dy)); fsw.dy = v;
    fsw.el.style.transform = fsw.add ? 'translate(' + dx + 'px,' + v + 'px)' : 'translateY(' + v + 'px)'; fsw.el.classList.toggle('arm', Math.abs(v) > 44);
    if (fsw.add) {
      fsw.el.style.pointerEvents = 'none';
      var hit = document.elementFromPoint(ev.clientX, ev.clientY), tg = hit && hit.closest && hit.closest('.fdl .fmc, .fdl .fmz, .fdl .fgrp, .fdl .fcpi');
      if (tg !== fsw.tg) { if (fsw.tg) fsw.tg.classList.remove('drop'); if (tg) tg.classList.add('drop'); fsw.tg = tg; }
    }
  });
  function fswEnd() {
    if (!fsw) return; var f = fsw; fsw = null; f.el.style.pointerEvents = ''; if (f.tg) f.tg.classList.remove('drop');
    if (Math.abs(f.dy) > 44) {
      if (f.add) {
        // Eintragen: abgelegt auf einer Mahlzeit = diese Mahlzeit, sonst nach der aktuellen Uhrzeit
        var j = +f.el.dataset.ftile, tl = (ui.ftiles || [])[j], mm = f.tg && /\bm-(fr|mi|sn|ab)\b/.exec(f.tg.className);
        if (tl) { ui.fday = dayIdx(Date.now()) - fSd(); ui.ftok = j; ui.fdmk = mm ? mm[1] : null; buzz([10, 30, 10]); foodRef(tl.i, tl.g); return; }
      } else { f.el.classList.add('gone'); setTimeout(function () { foodDel(f.el.dataset.fdelg ? f.el.dataset.fdelg.split(',').map(Number) : +f.el.dataset.fedit); }, 160); return; }
    }
    f.el.style.transform = ''; f.el.classList.remove('arm');
  }
  // Gerichte-Menü: Karte nach rechts wischen = 1 Portion sofort eintragen
  var fdsw = null, fdswMoved = false;
  document.addEventListener('pointerdown', function (ev) { var el = ev.target.closest && ev.target.closest('[data-fdsw]'); fdswMoved = false; fdsw = el ? { el: el, x: ev.clientX, y: ev.clientY } : null; });
  document.addEventListener('pointermove', function (ev) {
    if (!fdsw) return; var dx = ev.clientX - fdsw.x, dy = ev.clientY - fdsw.y;
    if (!fdswMoved && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { fdsw = null; return; }
    if (dx > 14) fdswMoved = true; if (!fdswMoved) return;
    var v = Math.max(0, Math.min(90, dx)); fdsw.dx = v; fdsw.el.style.transform = 'translateX(' + v + 'px)'; fdsw.el.classList.toggle('arm', v > 60);
  });
  document.addEventListener('pointerup', function () {
    if (!fdsw) return; var f = fdsw; fdsw = null; f.el.style.transform = ''; f.el.classList.remove('arm');
    if (f.dx > 60) { ui.fday = dayIdx(Date.now()) - fSd(); buzz([10, 30, 10]); closeSheet(true); foodRef(f.el.dataset.fdsw, 1); }
  });
  document.addEventListener('pointercancel', function () { if (fdsw) { fdsw.el.style.transform = ''; fdsw.el.classList.remove('arm'); fdsw = null; } });
  var fsT = null;
  document.addEventListener('touchstart', function (ev) { fsT = ev.target.closest && ev.target.closest('.fti, .fcpi:not(.fpm), .fmc[data-fdelg]') ? { x: ev.touches[0].clientX, y: ev.touches[0].clientY, v: null } : null; }, { passive: true });
  document.addEventListener('touchmove', function (ev) {
    if (!fsT) return; var dx = ev.touches[0].clientX - fsT.x, dy = ev.touches[0].clientY - fsT.y;
    if (fsT.v === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) fsT.v = Math.abs(dy) > Math.abs(dx);
    if (fsT.v) ev.preventDefault();
  }, { passive: false });
  document.addEventListener('pointerup', fswEnd);
  // Abgebrochene Geste (iOS-Systemgeste, Anruf): nur zurücksetzen, nie löschen oder eintragen
  document.addEventListener('pointercancel', function () { if (fsw) { fsw.el.style.transform = ''; fsw.el.style.pointerEvents = ''; fsw.el.classList.remove('arm'); if (fsw.tg) fsw.tg.classList.remove('drop'); fsw = null; } });
  function foodPush(x, editIdx) {
    if (ui.fplan && editIdx == null) {
      // Planen: als geplanter Eintrag (Tag, Mahlzeit) speichern, zurück zur Mahlzeit
      var fp = ui.fplan; fUndo(); x.d = fp.d; x.mk = fp.mk; foodState().pl.push(x);
      persist(); ui.fresh = false; render(); toast('Geplant · ' + Math.round(x.k) + ' kcal', 'cal', true); openPlanMeal(fp.d, fp.mk); return;
    }
    var st = foodState(), today = dayIdx(Date.now()), before = foodSum(today).p, goal = foodGoal(today).p;
    // Uhrzeit aus dem Fenster (falls vorhanden) auf den Tag des Eintrags setzen
    var old = editIdx != null ? st.e[editIdx] : null, base = old ? old.t : Date.now() - (ui.fday || 0) * 864e5, tm = $('ftm') && $('sheet').classList.contains('open') ? $('ftm').value : '';
    if (/^\d\d:\d\d$/.test(tm)) { var q = new Date(base); q.setHours(+tm.slice(0, 2), +tm.slice(3), 0, 0); base = q.getTime(); }
    // In eine andere Mahlzeit gezogen (ui.fdmk): deren übliche Uhrzeit, wenn sie schon vorbei ist (sonst jetzt, nur als diese Mahlzeit markiert)
    if (ui.fdmk && !tm && ui.fdmk !== mealOf(base)[1]) { var mt = MEALS.filter(function (m) { return m[1] === ui.fdmk; })[0][3], qm = new Date(base); qm.setHours(Math.floor(mt), Math.round(mt % 1 * 60), 0, 0); if (qm.getTime() < Date.now()) base = qm.getTime(); }
    // Mahlzeit aus dem Fenster, sonst aus dem Ablegen eines Vorschlags auf eine Mahlzeit (ui.fdmk)
    x.t = base; var mk = $('fmk') && $('sheet').classList.contains('open') ? $('fmk').value : ui.fdmk || ''; ui.fdmk = null; if (mk && mk !== mealOf(base)[1]) x.mk = mk;
    fUndo(); if (old) st.e[editIdx] = x; else st.e.push(x);
    persist(); closeSheet(true); ui.fresh = false; render();
    var after = foodSum(today).p;
    if (editIdx == null && before < goal && after >= goal) { toast('Proteinziel erreicht', 'trophy', true); sparks(90); buzz([40, 30, 40]); }
    else toast((editIdx != null ? 'Geändert · ' : '+') + Math.round(x.k) + ' kcal · ' + fN(x.p) + ' g Protein' + (ui.fday ? ' · ' + (ui.fday === 1 ? 'gestern' : fmtDayL(dayIdx(Date.now()) - ui.fday)) : ''), 'check', true);
    ui.fday = 0;
  }
  function foodRef(id, a, editIdx) {
    var it = fItem(id); if (!it || !(a > 0)) return;
    var v = fNut(it, a), x = { n: fEn(it).slice(0, 30) };
    NK.forEach(function (k) { if (v[k] != null) x[k] = k === 'k' ? Math.round(v.k) : Math.round(v[k] * 10) / 10; });
    x.r = { i: id, g: Math.round(a * 10) / 10 }; foodPush(x, editIdx);
  }
  function openPlanMeal(d, mk) {
    // Mahlzeit planen (aus Planen): Geplantes mit Entfernen, darunter Gerichte dieser Mahlzeit und häufige Lebensmittel (antippen = einplanen), Suchen und Schnell im Plan-Modus
    var m = MEALS.filter(function (x) { return x[1] === mk; })[0], st = foodState(), ps = planSum(d).items.filter(function (o) { return o.x.mk === mk; }), seen = {};
    var tl = st.d.slice().sort(function (a, b) { return (dishMeals(b).indexOf(mk) >= 0) - (dishMeals(a).indexOf(mk) >= 0); }).slice(0, 4).map(function (x) { return { i: x.id, g: 1 }; }).concat(fTiles())
      .filter(function (x) { if (seen[x.i] || !fItem(x.i)) return false; seen[x.i] = 1; return true; }).slice(0, 8);
    ui.fplan = { d: d, mk: mk }; ui.fday = dayIdx(Date.now()) - d; ui.sheet = { plmeal: true };
    sheetOpen(shHead(MEALI[mk], m[2] + ' planen', dayHead(d) + (ps.length ? ' · ' + Math.round(ps.reduce(function (a, o) { return a + o.x.k; }, 0)) + ' kcal' : '')) +
      (ps.length ? '<div class="fpl">' + ps.map(function (o) {
        var it = o.x.r && fItem(o.x.r.i);
        return '<div class="fplr m-' + mk + '"><span><b>' + esc(o.x.n || 'Mahlzeit') + '</b><small>' + (it ? fAmt(it, o.x.r.g) : 'Schnell') + '</small></span><em>' + Math.round(o.x.k) + '<i>kcal</i></em><button class="x" data-plx="' + o.i + '" aria-label="Entfernen">' + ic('close') + '</button></div>';
      }).join('') + '</div>' : '') +
      '<div class="ftl fplt">' + tl.map(function (x) {
        var it = fItem(x.i), v = fNut(it, x.g);
        return '<button class="fti" data-pla="' + x.i + '|' + x.g + '" aria-label="' + esc(fEn(it) + ', ' + fAmt(it, x.g)) + ' einplanen"><b>' + esc(fEn(it)) + '</b><small style="--nc:var(' + NCOL.p + ')">' + ic(NIC.p) + fN(v.p) + ' g</small><span>' + Math.round(v.k) + '<em>kcal</em></span></button>';
      }).join('') + '</div>' +
      '<div class="fact2"><button class="btn fsrb" data-plsr="1">' + ic('search') + 'Suchen, scannen …</button><button class="btn" data-plq="1">' + ic('bolt') + 'Schnell</button></div>', true);
  }
  function planEat(mk) {
    // Heute Geplantes einer Mahlzeit als gegessen eintragen: jetzt, oder zur üblichen Uhrzeit, wenn die Mahlzeit schon vorbei ist
    var st = foodState(), today = dayIdx(Date.now()), l = st.pl.filter(function (x) { return x.d === today && x.mk === mk; }); if (!l.length) return;
    var base = Date.now(), cur = mealOf(base)[1];
    if (mk !== cur) { var mt = MEALS.filter(function (m) { return m[1] === mk; })[0][3], q = new Date(base); q.setHours(Math.floor(mt), Math.round(mt % 1 * 60), 0, 0); if (q.getTime() < base) base = q.getTime(); }
    fUndo();
    l.forEach(function (o, j) { var x = JSON.parse(JSON.stringify(o)); delete x.d; delete x.mk; x.t = base + j; if (mk !== mealOf(x.t)[1]) x.mk = mk; st.e.push(x); });
    st.pl = st.pl.filter(function (x) { return !(x.d === today && x.mk === mk); });
    persist(); ui.fresh = false; render(); toast('Gegessen · ' + Math.round(l.reduce(function (a, o) { return a + o.k; }, 0)) + ' kcal', 'check', true); buzz([10, 30, 10]);
  }
  function fSheetBack() {
    // Kreuz in Essen-Fenstern geht eine Ebene zurück (wie der Zurück-Pfeil), erst auf der obersten Ebene schließt es
    if (!ui.sheet) return false;
    var fb = document.querySelector('#sheet [data-fback]'); if (fb) return foodClick(fb);
    if (ui.sheet.fsearch && ui.fcat && !ui.fq) { ui.fcat = ''; $('fres').innerHTML = fresHtml(); return true; }
    if (ui.sheet.dishEdit) { openDishes(); return true; }
    if (ui.fplan && !ui.sheet.plmeal) { openPlanMeal(ui.fplan.d, ui.fplan.mk); return true; }
    return false;
  }
  function foodClick(t) {
    var el, st = foodState();
    if ((el = t.closest('[data-ddm]'))) {
      readDraft(); var dm = ui.dd.m || [], on = dm.indexOf(el.dataset.ddm) < 0;
      ui.dd.m = MEALS.map(function (m) { return m[1]; }).filter(function (k) { return k === el.dataset.ddm ? on : dm.indexOf(k) >= 0; }); el.setAttribute('aria-pressed', String(on)); buzz(4); return true;
    }
    if ((el = t.closest('[data-pml]'))) { var pd0 = ui.pd == null ? dayIdx(Date.now()) : ui.pd; openPlanMeal(pd0, el.dataset.pml); return true; }
    if ((el = t.closest('[data-pla]'))) { var pa = el.dataset.pla.split('|'); buzz(8); foodRef(pa[0], +pa[1]); return true; }
    if ((el = t.closest('[data-plx]'))) { fUndo(); foodState().pl.splice(+el.dataset.plx, 1); persist(); ui.fresh = false; render(); openPlanMeal(ui.fplan.d, ui.fplan.mk); buzz(6); return true; }
    if (t.closest('[data-plsr]')) { openFsearch(); return true; }
    if (t.closest('[data-plq]')) { openQuick(null); return true; }
    if ((el = t.closest('[data-fpe]'))) { if (fswMoved) { fswMoved = false; return true; } planEat(el.dataset.fpe); return true; }
    if ((el = t.closest('[data-pgo]'))) { ui.pd = +el.dataset.pgo; ui.ca = ui.pd; ui.pft = 'e'; goTab('tage'); return true; }
    if ((el = t.closest('[data-fqm]'))) { ui.fqm = !ui.fqm; el.setAttribute('aria-pressed', String(ui.fqm)); buzz(4); return true; }
    if (t.closest('[data-fdsw]') && fdswMoved) { fdswMoved = false; return true; }
    if ((el = t.closest('[data-fdel]'))) { foodDel(+el.dataset.fdel); return true; }
    if ((el = t.closest('[data-fmk]'))) { fmkSet(el.dataset.fmk); $('fmk').dataset.man = '1'; buzz(4); return true; }
    if ((el = t.closest('[data-fml], [data-fstk]')) && fswMoved) { fswMoved = false; return true; }
    if ((el = t.closest('[data-fml]'))) { ui.fmeal = el.dataset.fml ? fSd() + el.dataset.fml : null; ui.fstk = {}; ui.fresh = false; render(); buzz(4); return true; }
    if ((el = t.closest('[data-fstk]'))) { var sk = el.dataset.fstk, son = !ui.fstk[sk]; ui.fstk = {}; if (son) ui.fstk[sk] = 1; ui.fresh = false; render(); buzz(4);
      // Geöffnete Gruppe an den linken Rand der Zeile holen (die Zeile ist neu gezeichnet und stünde sonst wieder am Anfang)
      var gp = document.querySelector('.fgrp'), gsc = gp && gp.parentNode;
      if (gsc) gsc.scrollTo({ left: gp.getBoundingClientRect().left - gsc.getBoundingClientRect().left - 20, behavior: 'smooth' });
      return true;
    }
    if ((el = t.closest('[data-fedit]'))) { if (fswMoved) { fswMoved = false; return true; } var x = st.e[+el.dataset.fedit]; if (x && x.r && fItem(x.r.i)) openPick(x.r.i, x.r.g, +el.dataset.fedit); else openQuick(+el.dataset.fedit); return true; }
    if ((el = t.closest('[data-ftile]'))) { if (fswMoved) { fswMoved = false; return true; } var tl = (ui.ftiles || [])[+el.dataset.ftile]; if (tl) { ui.fday = dayIdx(Date.now()) - fSd(); buzz(8); openPick(tl.i, tl.g); } return true; }
    if (t.closest('[data-fsearch]')) { openFsearch(); return true; }
    if (t.closest('[data-fdishes]')) { openDishes(); return true; }
    if (t.closest('[data-fquick]')) { openQuick(null); return true; }
    if ((el = t.closest('[data-fpick]'))) { var from = ui.sheet && (ui.sheet.fsearch || ui.sheet.fdishes) ? (ui.sheet.fsearch ? 's' : 'd') : null; openPick(el.dataset.fpick); ui.sheet.from = from; $('sheet').innerHTML = fpickHtml(); return true; }
    if (t.closest('[data-fback]')) { if (ui.sheet && ui.sheet.fsearch && ui.ingm) ingBack(); else if (ui.sheet && ui.sheet.from === 'o') openOwn(ui.odraft.id, null, ui.odraft); else if (ui.sheet && ui.sheet.from === 'd') openDishes(); else { var q0 = ui.fq; openFsearch(true); ui.fq = q0 || ''; $('fq').value = ui.fq; $('fres').innerHTML = fresHtml(); } return true; }
    if ((el = t.closest('[data-fvar]'))) { ui.fpick.i = el.dataset.fvar; $('sheet').innerHTML = fpickHtml(); return true; }
    if ((el = t.closest('[data-foff]'))) { var ox = ui.fon && ui.fon.r[+el.dataset.foff]; if (ox) pickFrom(offSave(ox)); return true; }
    if ((el = t.closest('[data-fscan]'))) { if (el.dataset.fscan === 'own') { ui.odraft = ownDraft(); ui.odraft.id = ui.sheet.fown; openScan('own'); } else openScan(); return true; }
    if ((el = t.closest('[data-oml]'))) { ui.sheet.ml = +el.dataset.oml; document.querySelectorAll('[data-oml]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); return true; }
    if ((el = t.closest('[data-fsd]'))) { ui.fsd = +el.dataset.fsd; ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-fwa], [data-fwaz]'))) {
      var rc = el.getBoundingClientRect(), wq = +el.dataset.fwa || 0; waSet(el.dataset.fwaz ? 0 : (st.wa[fSd()] || 0) + wq); buzz(6);
      if (ui.sheet && ui.sheet.wa) $('sheet').innerHTML = waHtml(); if (wq > 50) floaty('+' + wq + ' ml', rc);
      return true;
    }
    if (t.closest('[data-fgoal]')) { openGoals(); return true; }
    if ((el = t.closest('[data-fnut]'))) { openNut(el.dataset.fnut); return true; }
    if ((el = t.closest('[data-fnx]'))) { el.setAttribute('aria-expanded', String(el.getAttribute('aria-expanded') !== 'true')); buzz(4); return true; }
    if (t.closest('[data-fwao]')) { ui.sheet = { wa: true }; sheetOpen(waHtml()); return true; }
    if (t.closest('[data-dgs]')) { readDraft(); ui.ingm = true; openFsearch(); return true; }
    if (t.closest('[data-fownb]')) { var bt0 = fItem(ui.fpick.i), dr0 = { n: fName(bt0), un: bt0.u[0] ? bt0.u[0][0] : '', ug: bt0.u[0] ? bt0.u[0][1] : '', ml: bt0.ml ? 1 : 0 }; NK.forEach(function (k) { dr0[k] = bt0[k] != null ? bt0[k] : ''; }); openOwn('new', null, dr0); return true; }
    if (t.closest('[data-fbr]')) {
      if (ui.fbr && ui.fbr.i === ui.fpick.i) { ui.fbr = null; $('fbr').innerHTML = ''; document.querySelector('[data-fbr]').classList.remove('on'); return true; }
      fbrLoad(); return true;
    }
    if (t.closest('[data-fbrr]')) { fbrLoad(); return true; }
    if (t.closest('[data-fonr]')) { ui.fon = null; fonSearch(); return true; }
    if ((el = t.closest('[data-fbrp]'))) { var bx = ui.fbr && ui.fbr.r[+el.dataset.fbrp]; if (bx) pickFrom(offSave(bx)); return true; }
    if ((el = t.closest('[data-fcat]'))) { ui.fcat = el.dataset.fcat; $('fres').innerHTML = fresHtml(); $('sheet').scrollTop = 0; return true; }
    if ((el = t.closest('[data-ftab]'))) { ui.ftab = el.dataset.ftab; ui.fcat = ''; $('fres').innerHTML = fresHtml(); buzz(4); return true; }
    if ((el = t.closest('[data-famt]'))) { ui.fpick.a = +el.dataset.famt; if ($('fa')) $('fa').value = ui.fpick.a; fpickUpd(); return true; }
    if ((el = t.closest('[data-fstep]'))) { var it0 = fItem(ui.fpick.i), stp = it0.dish ? 0.5 : it0.pc ? it0.u[0][1] : 10; ui.fpick.a = Math.max(stp, Math.round((ui.fpick.a + stp * (+el.dataset.fstep)) * 10) / 10); if ($('fa')) $('fa').value = ui.fpick.a; fpickUpd(); buzz(4); return true; }
    if (t.closest('[data-fpadd]')) { var pk = ui.fpick; if (ui.ingm) ingAdd(pk.i, pk.a); else foodRef(pk.i, pk.a, pk.edit); return true; }
    if ((el = t.closest('[data-fown]'))) { openOwn(el.dataset.fown); return true; }
    if (t.closest('[data-fownsave]')) {
      var ov = function (k) { var f = parseFloat($('o-' + k).value); return isFinite(f) && f >= 0 ? Math.round(f * 10) / 10 : 0; };
      var nm = $('o-n').value.trim(); if (!nm) { toast('Name fehlt', 'bolt'); return true; }
      if (!ov('k')) { toast('kcal je 100 g eintragen', 'bolt'); return true; }
      var oid = ui.sheet.fown !== 'new' ? ui.sheet.fown : 'u' + Date.now().toString(36), o = { id: oid, n: nm.slice(0, 30), u: [] };
      NK.forEach(function (k) { o[k] = ov(k); }); var un = $('o-un').value.trim(), ug = ov('ug'); if (un && ug) o.u.push([un.slice(0, 12), ug]);
      var o0 = fOwn(oid); if (o0) { if (o0.b) o.b = o0.b; if (o0.bc) o.bc = o0.bc; o.u = o.u.concat(o0.u.slice(1)); } if (ui.sheet.bc) o.bc = ui.sheet.bc; if (ui.sheet.ml) o.ml = 1; else delete o.ml;
      var bv = $('o-b').value.trim(), bcv = $('o-bc').value.replace(/\D/g, ''); if (bv) o.b = bv.slice(0, 24); else delete o.b; if (/^\d{6,14}$/.test(bcv)) o.bc = bcv; else delete o.bc;
      if (o.bc) st.o.forEach(function (y) { if (y.id !== oid && y.bc === o.bc) delete y.bc; });
      var oi = st.o.map(function (y) { return y.id; }).indexOf(oid); if (oi >= 0) st.o[oi] = o; else st.o.push(o);
      persist(); ui.fresh = false; render(); toast('Gespeichert', 'check'); openPick(oid); return true;
    }
    if (t.closest('[data-fowndel]')) { st.o = st.o.filter(function (y) { return y.id !== ui.sheet.fown; }); persist(); closeSheet(true); ui.fresh = false; render(); toast('Lebensmittel gelöscht', 'close'); return true; }
    if (t.closest('[data-wgt]')) { openWeight(); return true; }
    if (t.closest('[data-set]')) { openSettings(); return true; }
    if (t.closest('[data-wsave]')) {
      var kg = Math.round(parseFloat($('w-v').value) * 10) / 10;
      if (!(kg >= 20 && kg <= 400)) { toast('Gewicht eintragen', 'bolt'); return true; }
      var lw = lastW(), nw = Date.now(); if (lw && daysSince(lw.t) === 0) { lw.kg = kg; lw.t = nw; } else st.w.push({ t: nw, kg: kg });
      persist(); closeSheet(true); ui.fresh = false; render(); toast(fN(kg) + ' kg', 'check'); return true;
    }
    if ((el = t.closest('[data-wdel]'))) { st.w = st.w.filter(function (y) { return y.t !== +el.dataset.wdel; }); persist(); openWeight(); ui.fresh = false; render(); return true; }
    if (t.closest('[data-fcopy]')) {
      var sd1 = fSd(), ys = foodSum(sd1 - 1).items, nn = Date.now() - (dayIdx(Date.now()) - sd1) * 864e5;
      fUndo(); ys.forEach(function (o, j) { var c = JSON.parse(JSON.stringify(o.x)); c.t = nn + j; st.e.push(c); });
      persist(); ui.fresh = false; render(); toast(ys.length + ' Einträge wie gestern', 'check', true); return true;
    }
    if ((el = t.closest('[data-fday]'))) { ui.fday = +el.dataset.fday; el.outerHTML = dayTog(); if ($('ftot')) fpickUpd(); buzz(4); return true; }
    if ((el = t.closest('[data-gmode]'))) { calcRead(); ui.gmode = el.dataset.gmode; $('sheet').innerHTML = goalsHtml(); calcUpd(); return true; }
    if ((el = t.closest('[data-csx]'))) { ui.cpr.s = el.dataset.csx; document.querySelectorAll('[data-csx]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); calcUpd(); return true; }
    if ((el = t.closest('[data-crt]'))) { ui.cpr.rt = +el.dataset.crt; document.querySelectorAll('[data-crt]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); calcUpd(); return true; }
    if ((el = t.closest('[data-ctb]'))) { ui.cpr.tb = ui.cpr.tb ? 0 : 1; el.setAttribute('aria-pressed', String(!!ui.cpr.tb)); calcUpd(); return true; }
    if ((el = t.closest('[data-cadj]'))) { ui.cpr.adj = +el.dataset.cadj; calcUpd(); toast((ui.cpr.adj ? 'Angepasst' : 'Entfernt') + ', mit „Übernehmen“ speichern', 'check'); return true; }
    if (t.closest('[data-cuse]')) { goalsSave(); return true; }
    if ((el = t.closest('[data-fde]'))) { openDishEdit(el.dataset.fde); return true; }
    if (t.closest('[data-dga]')) { readDraft(); ui.dd.ing.push({ n: '', a: '', k: '', p: '' }); $('sheet').innerHTML = dishEditHtml(); var ni = $('di-n-' + (ui.dd.ing.length - 1)); if (ni && !('ontouchstart' in window)) ni.focus(); return true; }
    if ((el = t.closest('[data-dgx]'))) { readDraft(); ui.dd.ing.splice(+el.dataset.dgx, 1); if (!ui.dd.ing.length) ui.dd.ing.push({ n: '', a: '', k: '', p: '' }); $('sheet').innerHTML = dishEditHtml(); return true; }
    if (t.closest('[data-dsave]')) { saveDish(); return true; }
    if ((el = t.closest('[data-dmf]'))) { ui.dmf = el.dataset.dmf; $('sheet').innerHTML = dishesHtml(); buzz(4); return true; }
    if (t.closest('[data-ddup]')) { readDraft(); ui.dd = JSON.parse(JSON.stringify(ui.dd)); ui.dd.id = null; ui.dd.n = (ui.dd.n + ' (Kopie)').slice(0, 30); ui.ddel = 0; $('sheet').innerHTML = dishEditHtml(); toast('Kopie – anpassen und speichern', 'cards'); return true; }
    if ((el = t.closest('[data-dpor]'))) { readDraft(); ui.dd.por = Math.max(1, ui.dd.por + +el.dataset.dpor); $('dd-por').value = ui.dd.por; $('dd-tot').innerHTML = dishTotHtml(dishTot(ui.dd)); buzz(4); return true; }
    if ((el = t.closest('[data-ddel]'))) {
      if (!ui.ddel) { ui.ddel = 1; el.innerHTML = '<small>Sicher?</small>'; el.setAttribute('aria-label', 'Wirklich löschen?'); return true; }
      st.d = st.d.filter(function (y) { return y.id !== ui.dd.id; }); persist(); ui.fresh = false; render(); toast('Gericht gelöscht', 'close'); openDishes(); return true;
    }
    if (t.closest('[data-fsave]')) {
      var qv = function (k) { var f = parseFloat($('f-' + k).value); return isFinite(f) && f >= 0 ? f : null; };
      var xq = { n: $('f-n').value.trim().slice(0, 30), k: Math.round(qv('k') || 0), p: Math.round((qv('p') || 0) * 10) / 10 };
      ['f', 'c', 'fb', 'su'].forEach(function (k) { var v = qv(k); if (v != null) xq[k] = Math.round(v * 10) / 10; });
      if (xq.k > 20000 || xq.p > 1000 || (!xq.k && !xq.p)) { toast('Wert eintragen', 'bolt'); return true; }
      var qi = ui.sheet && ui.sheet.idx != null ? ui.sheet.idx : null;
      if (ui.fqm && qi == null) {
        // Merken: eigenes Lebensmittel, dessen Portion (100 g) genau die eingetragenen Werte hat; erscheint danach in Eigene und den Vorschlägen
        if (!xq.n) { toast('Name zum Merken eintragen', 'bolt'); return true; }
        // Der Eintrag behält seine Werte (nicht eingetragene bleiben unbekannt) und verweist auf das neue Lebensmittel
        var qo = { id: 'u' + Date.now().toString(36), n: xq.n, u: [['Portion', 100]] }; NK.forEach(function (k) { qo[k] = xq[k] || 0; }); st.o.push(qo); ui.fqm = false;
        xq.r = { i: qo.id, g: 100 }; foodPush(xq, null); return true;
      }
      foodPush(xq, qi); return true;
    }
    if (t.closest('[data-fgsave]')) {
      var gg = {}; NK.forEach(function (k) { var f = Math.round(parseFloat($('g-' + k).value) || 0); if (f > 0) gg[k] = f; });
      if (!gg.k || !gg.p) { toast('kcal und Protein eintragen', 'bolt'); return true; }
      st.g = gg; persist(); closeSheet(true); ui.fresh = false; render(); toast('Ziele gespeichert', 'check'); return true;
    }
    return false;
  }
