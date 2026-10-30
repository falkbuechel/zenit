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
    ['milch15', 'Milch 1,5 %', 47, 3.4, 1.5, 4.9, 0, 4.9, 'Glas:200|Tüte:1000'],
    ['milch35', 'Milch 3,5 %', 64, 3.3, 3.5, 4.8, 0, 4.8, 'Glas:200|Tüte:1000'],
    ['hafmil', 'Haferdrink', 45, 0.5, 1.5, 6.5, 0.8, 4, 'Glas:200|Packung:1000'],
    ['sojmil', 'Sojadrink ungesüßt', 33, 3.3, 1.8, 0.7, 0.5, 0.3, 'Glas:200|Packung:1000'],
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
    ['osaft', 'Orangensaft', 45, 0.7, 0.2, 9, 0.2, 8.5, 'Glas:200|Flasche:1000'],
    ['cola', 'Cola', 42, 0, 0, 10.6, 0, 10.6, 'Dose:330|Flasche:1500'],
    ['bier', 'Bier', 42, 0.5, 0, 3, 0, 0, 'Flasche:500|Flasche 0,33:330'],
    ['pizza', 'Pizza Margherita', 230, 10, 8, 29, 2, 3, 'Pizza:350'],
    ['doener', 'Döner', 215, 12, 10, 19, 1.5, 2, 'Stück:350'],
    ['burger', 'Cheeseburger', 260, 13, 12, 24, 1.5, 5, 'Stück:120'],
    ['pommes', 'Pommes', 290, 3.4, 15, 35, 3, 0.5, 'Portion:150'],
    ['lasag', 'Lasagne', 160, 8, 8, 13, 1, 2.5, 'Portion:350'],
    // Varianten (Light, Fettstufen) und Fast Food; Fast Food je Verkaufsportion nach Herstellerangaben (gerundet, über Nährwert-Datenbanken), ~ = Grundeinheit
    ['milch03', 'Milch 0,3 %', 35, 3.4, 0.3, 4.9, 0, 4.9, 'Glas:200|Tüte:1000'],
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
  // Unterarten je Kategorie: [Kategorie, Schlüssel, Name, Icon, ids]; setzt .sb. Reihenfolge = Abschnitte in der Suche, Index in der Kategorie = Farbton (fTone)
  var FSUB = [
    ['g', 'gfl', 'Flocken & Müsli', 'bowl', 'hafer muesli cornfl'], ['g', 'gre', 'Reis & Körner', 'rice', 'reis_r reis_g quinoa cous'], ['g', 'gnu', 'Nudeln', 'pasta', 'nud_r nud_g vknud'],
    ['g', 'gka', 'Kartoffeln', 'potato', 'kart skart'], ['g', 'gbr', 'Brot', 'bread', 'vkbrot mischbr broet toast wrap reisw'],
    ['m', 'mmi', 'Milch & Drinks', 'milk', 'milch35 milch15 milch03 hafmil sojmil'], ['m', 'mjo', 'Joghurt & Quark', 'cup', 'skyr mquark quark40 quark20 joghurt35 joghurt joghurt01 grjog grjog2 ppudd'],
    ['m', 'mka', 'Käse', 'cheese', 'huette frisch frischl gouda goudal mozz mozzl feta fetal parm'], ['m', 'mbu', 'Butter & Sahne', 'butter', 'butter halbf sahne sahnel'], ['m', 'mpr', 'Protein', 'bottle', 'whey'],
    ['e', 'eei', 'Eier', 'egg', 'ei eiklar'], ['e', 'egf', 'Geflügel', 'np', 'haehn pute'], ['e', 'efl', 'Fleisch', 'steak', 'rhack rhack5 steak schwf'], ['e', 'ewu', 'Wurst & Schinken', 'sausage', 'kschin salami salamil'],
    ['e', 'efi', 'Fisch & Meer', 'fish', 'lachs thun seela garnel'],
    ['h', 'hhu', 'Hülsenfrüchte', 'bean', 'linsen_r linsen_g kicher kidney edam'], ['h', 'hto', 'Tofu', 'tofu', 'tofu'], ['h', 'hau', 'Aufstrich', 'jar', 'hummus'],
    ['v', 'vgr', 'Grün', 'broc', 'brok spinat salat zucch gurke erbsen'], ['v', 'vfr', 'Fruchtgemüse', 'tomato', 'papr tomate avoc mais'], ['v', 'vwu', 'Wurzel, Zwiebel & Pilz', 'onion', 'karotte zwieb champ'],
    ['o', 'oap', 'Äpfel & Kiwi', 'apple', 'apfel kiwi'], ['o', 'obe', 'Beeren & Trauben', 'berry', 'beeren erdb trauben'], ['o', 'osu', 'Südfrüchte', 'banana', 'banane orange datteln'],
    ['n', 'nnu', 'Nüsse', 'nut', 'mandeln walnuss erdnuss cashew ernmus'], ['n', 'nsa', 'Samen', 'seed', 'leins chia'], ['n', 'noe', 'Öl', 'oil', 'olivoel rapsoel'],
    ['s', 'ssc', 'Schokolade', 'choc', 'zbschok mschok'], ['s', 'sri', 'Riegel', 'bar', 'priegel'], ['s', 'ssa', 'Chips', 'chips', 'chips'], ['s', 'sgu', 'Gummi & Eis', 'candy', 'gummi vaneis'], ['s', 'sau', 'Aufstrich', 'jar', 'honig marm nusscr'],
    ['d', 'dsa', 'Saft', 'glass', 'osaft'], ['d', 'dso', 'Softdrinks', 'can', 'cola colaz'], ['d', 'dbi', 'Bier', 'beer', 'bier bieraf'],
    ['f', 'fbu', 'Burger', 'burger', 'mc_bigmac mc_cheese mc_hamb bk_whop'], ['f', 'fsa', 'Sandwich', 'sandw', 'mc_chick sub_chick'], ['f', 'fch', 'Chicken', 'np', 'mc_nug kfc_strip'], ['f', 'fpo', 'Pommes', 'fries', 'mc_pom'],
    ['r', 'rpa', 'Pasta', 'pasta', 'spagb pcarb lasag'], ['r', 'rpi', 'Pizza', 'pizza', 'pizza'], ['r', 'rfl', 'Fleisch & Döner', 'steak', 'schnitz gyros steakb cwurst doener'],
    ['r', 'rbu', 'Burger & Pommes', 'burger', 'rburg burger pommes'], ['r', 'ras', 'Asiatisch & Bowls', 'bowl', 'curryr bowl sushi ramen'], ['r', 'rsa', 'Salat', 'leaf', 'csalat']
  ];
  var FSUBK = {}; FSUB.forEach(function (s) { FSUBK[s[1]] = s; s[4].split(' ').forEach(function (id) { if (FOODB[id]) FOODB[id].sb = s[1]; }); });
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
    if (!state.food.sh) state.food.sh = {};
    if (!state.food.tp) state.food.tp = [];
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
    // Gerichte in Viertel-Portionen: ¼ ½ ¾ als Zeichen, sonst Zahl mit bis zu zwei Stellen
    if (it.dish) { var fr = { 0.25: '¼', 0.5: '½', 0.75: '¾' }, w = Math.floor(a), q = Math.round((a - w) * 100) / 100; return (fr[q] ? (w ? w + ' ' : '') + fr[q] : fN2(a)) + (a === 1 ? ' Portion' : ' Portionen'); }
    var best = null, cu = fUnit(it);
    // Getränke ab ½ Liter in Litern, wenn glatt (0,5 l, 1 l, 1,5 l)
    if (!grams && it.ml && a >= 500 && a % 250 === 0) return fN(a / 1000) + ' l';
    if (!grams && cu) { var cn = a / cu[1]; if (cn >= 0.25 && cn <= 20 && Math.abs(cn * 4 - Math.round(cn * 4)) < 0.02) return fCnt(cn, cu[0]); }
    if (!grams) it.u.forEach(function (u) { var n = a / u[1]; if (n >= 0.5 && n <= 12 && Math.abs(n * 2 - Math.round(n * 2)) < 0.01 && (!best || n < best[0])) best = [n, u[0]]; });
    return best ? fCnt(best[0], best[1]) : Math.round(a) + (it.ml ? ' ml' : ' g');
  }
  // Mehrzahl der Portionsnamen („2 Scheiben“, „3 Portionen“, „2 Eier“, „2 große“); Glas, Stück, EL, Becher, Riegel bleiben
  function fPl(nm, n) {
    if (!(n > 1)) return nm;
    return nm.replace(/^(Portion|Packung)/, '$1en').replace(/^(Scheibe|Schale|Dose|Flasche|Kugel|Rippe|Hälfte|Tüte|Tasse|Schnitte|Tafel)/, '$1n').replace(/^(klein|groß|mittel)(?![a-zäöü])/, '$1e')
      .replace(/^Ei$/, 'Eier').replace(/^Pizza/, 'Pizzen').replace(/^(Filet|Bowl|Sub|~Strip|~Nugget)/, '$1s');
  }
  // Anzahl + Einheit; Namen mit Zahl vorn (9er-Box, 8 Stück) als „2× 9er-Box“
  function fCnt(n, nm) { return fHalf(n) + (/^\d/.test(nm) ? '× ' + nm : ' ' + fPl(nm, n)); }
  function fHalf(n) { var w = Math.floor(n + 0.01), q = Math.round((n - w) * 4) / 4, fr = { 0.25: '¼', 0.5: '½', 0.75: '¾' }; return fr[q] ? (w ? w : '') + fr[q] : fN(n); }
  // Haupteinheit zum Zählen (Stück, Glas, Scheibe, EL …): vorgewählte Portion, sonst die erste zählbare; große Packungen (> 400 g) und Teller/Portion zählen in Gramm
  var FCOUNT = /^(Stück|Scheibe|Glas|Becher|Dose|Filet|Kugel|Riegel|Ei|Rippe|Flasche|Packung|Hälfte|EL|TL|Messlöffel)/;
  function fUnit(it) {
    if (!it || it.dish || !it.u || !it.u.length) return null; if (it.pc) return it.u[0];
    var ok = it.u.filter(function (u) { return FCOUNT.test(u[0]) && u[1] <= 400; });
    return ok.filter(function (u) { return u[1] === it.d; })[0] || ok[0] || null;
  }
  // Schritt für ± und Wischen: Viertel-Portion beim Gericht, halbe Einheit, sonst nach der üblichen Menge (Getränke 50 ml)
  function fStep(it) {
    if (it.dish) return 0.25; var cu = fUnit(it); if (it.pc) return cu[1]; if (cu) return cu[1] <= 30 ? cu[1] : cu[1] / 2;
    var d0 = it.d || (it.u[0] ? it.u[0][1] : 100); return it.ml ? 50 : d0 >= 150 ? 25 : d0 >= 40 ? 10 : 5;
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

