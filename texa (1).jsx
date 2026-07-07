import React, { useState, useMemo, useEffect, useRef } from "react";

/* ============================================================
   TEXA — Textile Network & Marketplace · v2
   ------------------------------------------------------------
   Design: panna / nero inchiostro / tabacco. Tipografia oversize,
   marquee cinetico, index editoriale, mappa reale (Leaflet + OSM)
   con fallback SVG se le tile non sono raggiungibili.

   DATI: 73 fornitori reali importati da LISTA.xlsx

   SCHEMA DATI (pronto per backend / app mobile)
   Company  { id, name, category, speciality, description, tags[],
              certifications[], country, city, province, address,
              contactPerson, website, emails[], phone, lat, lng }
   RFQ      { id, companyId, product, quantity, message,
              contactName, contactEmail, createdAt, status }
   Fair     { id, name, city, focus }

   AI-READY: interpretQuery(q) → { category, materials[], keywords[] }
   Oggi keyword matching, domani stessa firma con chiamata API.
   ============================================================ */

const COMPANIES = [{"id":"cdc10798b","name":"PLASTI-MAX SPA","category":"Packaging & Display","speciality":"APPENDINI","description":"GANCI , APPENDINI , ANTITACCHEGGI","tags":["GANCI","APPENDINI","ANTITACCHEGGI"],"certifications":[],"country":"ITALIA","city":"Grumello Del Monte","province":"BG","address":"VIA GIUSEPPE MICCA, 68","contactPerson":"","website":"https://www.plastimax.com","emails":["info@plastimax.com"],"phone":"035 830340","lat":45.633,"lng":9.879},{"id":"cbf82d286","name":"CALZIFICIO BIASCO","category":"Calze & Calzetteria","speciality":"CALZE","description":"CALZE SPORT TECNICHE , DA LAVORO, Restringimento Graduale","tags":["CALZE SPORT TECNICHE","DA LAVORO","Restringimento Graduale"],"certifications":[],"country":"ITALIA","city":"San Dana","province":"LE","address":"Via A. Meucci, 9","contactPerson":"","website":"https://www.calzificiobiasco.it/it","emails":["lauralavanderie@gmail.com","info@calzificiobiasco.it"],"phone":"0833 523882","lat":39.916,"lng":18.316},{"id":"c57048087","name":"BUSI GIOVANNI s.r.l.","category":"Macchinari","speciality":"Macchine","description":"Macchine per calzetteria","tags":["Macchine per calzetteria"],"certifications":[],"country":"ITALIA","city":"Botticino Sera","province":"BS","address":"Via Giovanni Busi, 14","contactPerson":"","website":"https://www.busigiovanni.com/it","emails":["busi@busigiovanni.com"],"phone":"030 2190304","lat":45.542,"lng":10.307},{"id":"c53179ace","name":"GRUPPO ALLPACK","category":"Packaging & Display","speciality":"ESPOSITORI","description":"CROWNER , ESPOSITORI IN CARTONE","tags":["CROWNER","ESPOSITORI IN CARTONE"],"certifications":[],"country":"ITALIA","city":"Suzzara","province":"MN","address":"Via Lenin, 37/B","contactPerson":"","website":"https://www.allpack.it","emails":["c.andrea@allpack.it"],"phone":"340/2149552 0376/535612","lat":44.992,"lng":10.745},{"id":"cdd89c90b","name":"CARTIMBALLO SPA","category":"Packaging & Display","speciality":"ESPOSITORI","description":"CROWNER , ESPOSITORI IN CARTONE","tags":["CROWNER","ESPOSITORI IN CARTONE"],"certifications":[],"country":"ITALIA","city":"Falzé Di Piave","province":"TV","address":"Via I° Maggio, 30","contactPerson":"","website":"https://www.cartimballo.it","emails":["martina.gorgato@cartimballospa.it"],"phone":"0434-632363","lat":45.855,"lng":12.17},{"id":"cb6ed0bb9","name":"FILOPROGETTI srl","category":"Packaging & Display","speciality":"ESPOSITORI","description":"ESPOSITORI E GANCI IN METALLO","tags":["ESPOSITORI E GANCI IN METALLO"],"certifications":[],"country":"ITALIA","city":"Reggio Emilia","province":"RE","address":"Via Emidio Villa 13/A","contactPerson":"","website":"https://www.filoprogetti.it","emails":["Ordini@filoprogettisrl.it"],"phone":"0522/1713128","lat":44.698,"lng":10.63},{"id":"c4c8e9056","name":"Scatolifcio Medicinese S.r.l.","category":"Packaging & Display","speciality":"ESPOSITORI","description":"ESPOSITORI , POZZETTI , SCATOLE FUSTELLATE , SCATOLE","tags":["ESPOSITORI","POZZETTI","SCATOLE FUSTELLATE","SCATOLE"],"certifications":[],"country":"ITALIA","city":"Medicina","province":"BO","address":"via San Vitale ovest 302","contactPerson":"","website":"https://www.scatolificiomedicinese.com","emails":["andrea.tullini@scatolificiomedicinese.com","ordini@scatolificiomedicinese.com"],"phone":"051 851451 051 851423","lat":44.478,"lng":11.638},{"id":"c5714c08b","name":"CONSUL + S.r.l","category":"Packaging & Display","speciality":"OLOGRAMMI","description":"OLOGRAMMI","tags":["OLOGRAMMI"],"certifications":[],"country":"ITALIA","city":"Carpenedolo","province":"BS","address":"Via Enrico Fermi 2","contactPerson":"","website":"https://www.ologrammi.com","emails":["agape.vecchiolini@consulpiu.it"],"phone":"349/6183722 030/7777183","lat":45.363,"lng":10.431},{"id":"c0646ffab","name":"Scatolificio Bresciano SRL","category":"Packaging & Display","speciality":"SCATOLE","description":"SCATOLE","tags":["SCATOLE"],"certifications":[],"country":"ITALIA","city":"Fenili Belasi","province":"BS","address":"Via Trento, 154 - 25020","contactPerson":"","website":"https://www.scatolificiobresciano.it","emails":["brescianord@scatolificiobresciano.it"],"phone":"030 9745169","lat":45.41,"lng":10.1},{"id":"c1bfacbe4","name":"DECOR TEX di Coffinardi S.n.c.","category":"Stampa & Ricamo","speciality":"STAMPA SU CAPI","description":"DIGITALE , SERIGRAFICA , ANTISCIVOLO , SUBLIMATICA , MEDICALE","tags":["DIGITALE","SERIGRAFICA","ANTISCIVOLO","SUBLIMATICA","MEDICALE"],"certifications":[],"country":"ITALIA","city":"Bagnolo Mella","province":"BS","address":"Via G. Piamarta 48/50","contactPerson":"","website":"https://www.decor-tex.it","emails":["info@gruppodecortex.it","info@decor-tex.it"],"phone":"0306821559","lat":45.428,"lng":10.181},{"id":"ca3893632","name":"LITOTIPOGRAF","category":"Packaging & Display","speciality":"TIPOGRAFIA","description":"LITOGRAFIA - STAMPA DIGITALE","tags":["LITOGRAFIA - STAMPA DIGITALE"],"certifications":[],"country":"ITALIA","city":"San Zeno","province":"BS","address":"via G. Galilei, traversa seconda, 35","contactPerson":"","website":"https://litotipograf.wordpress.com","emails":["paolaf@litotipograf.191.it","paolalitotipograf@virgilio.it"],"phone":"0302160195","lat":45.492,"lng":10.216},{"id":"ce0b165fd","name":"GIORGINO Company Srl","category":"Abbigliamento & Intimo","speciality":"UNDERWEAR","description":"INTIMO UOMO , DONNA , BIMBO , PIGIAMI , HOMEWEAR","tags":["INTIMO UOMO","DONNA","BIMBO","PIGIAMI","HOMEWEAR"],"certifications":[],"country":"ITALIA","city":"Andria","province":"BT","address":"Via Barletta, 232/234","contactPerson":"","website":"https://www.giorginocompany.it","emails":["commerciale@giorginocompany.it"],"phone":"0883 556029","lat":41.227,"lng":16.295},{"id":"c0b6cde4a","name":"Calzificio Roby Roby di Busi Roberto","category":"Calze & Calzetteria","speciality":"CALZE","description":"Calze di alta qualità , sportive , spugna selezionata","tags":["Calze di alta qualità","sportive","spugna selezionata"],"certifications":[],"country":"ITALIA","city":"Botticino Sera","province":"BS","address":"Via F. Carini , 50","contactPerson":"","website":"https://www.calzificioroby.it","emails":["info@calzificiorobyroby.it"],"phone":"030 2190591","lat":45.542,"lng":10.307},{"id":"c96ebb0ae","name":"Airily","category":"Stampa & Ricamo","speciality":"STAMPA SU CAPI","description":"Stampe e applicazioni , ricamo","tags":["Stampe e applicazioni","ricamo"],"certifications":[],"country":"ITALIA","city":"Guanzate","province":"CO","address":"Via XXIV Maggio, 12/A","contactPerson":"","website":"https://www.airily.it","emails":["airily@airily.it"],"phone":"031.976515","lat":45.723,"lng":9.011},{"id":"c1d637b45","name":"Loreley","category":"Stampa & Ricamo","speciality":"STAMPA SU CAPI","description":"DIGITALE , SERIGRAFICA , ANTISCIVOLO , SUBLIMATICA , ecc","tags":["DIGITALE","SERIGRAFICA","ANTISCIVOLO","SUBLIMATICA","ecc"],"certifications":[],"country":"ITALIA","city":"Caerano San Marco","province":"TV","address":"Via Vittime del Vajont 5","contactPerson":"","website":"https://loreleysrl.it","emails":["info@loreleysrl.it"],"phone":"0423 569900","lat":45.78,"lng":12.005},{"id":"cf4c177d7","name":"Inprex","category":"Stampa & Ricamo","speciality":"STAMPA SU CAPI","description":"Componenti per calzature e abbigliamento","tags":["Componenti per calzature e abbigliamento"],"certifications":[],"country":"ITALIA","city":"Altivole","province":"TV","address":"Via della Botte, 14 - Altivole","contactPerson":"","website":"https://loreleysrl.it","emails":["info@inprex.it"],"phone":"0423 601211","lat":45.755,"lng":11.963},{"id":"cea52cb04","name":"Calzificio Dany","category":"Calze & Calzetteria","speciality":"CALZE","description":"produce calze tecniche sport","tags":["produce calze tecniche sport"],"certifications":[],"country":"ITALIA","city":"Bagnolo Mella","province":"BS","address":"Via Padre Giovanni Piamarta, 6/8, 25021","contactPerson":"","website":"https://www.calzificiodany.it","emails":["info@calzificiodany.it"],"phone":"030 6822209","lat":45.428,"lng":10.181},{"id":"c04751149","name":"Calzificio Bellafonte srl","category":"Calze & Calzetteria","speciality":"UNDERWEAR","description":"Hosiery & Seamless Underwear ( Leggings )","tags":["Hosiery & Seamless Underwear ( Leggings )"],"certifications":[],"country":"ITALIA","city":"Castel Goffredo","province":"MN","address":"Strada Pedagnolo 3/B","contactPerson":"","website":"https://www.bellafonte.com","emails":["info@bellafonte.com"],"phone":"0376 770369","lat":45.298,"lng":10.475},{"id":"cebfe276e","name":"Manifatture Ennevi di Vitale Onofrio","category":"Abbigliamento & Intimo","speciality":"UNDERWEAR","description":"INTIMO UOMO , DONNA , BIMBO","tags":["INTIMO UOMO","DONNA","BIMBO"],"certifications":[],"country":"ITALIA","city":"Andria","province":"BT","address":"S.P. Andria-Trani Km. 2,700","contactPerson":"","website":"https://www.manifatturennevi.it","emails":["direzione@manifatturennevi.it","amministrazione@manifatturennevi.it","info@manifatturennevi.it"],"phone":"0883.764468","lat":41.227,"lng":16.295},{"id":"c3da8be29","name":"Calzificio Mariani Fabiola","category":"Calze & Calzetteria","speciality":"CALZE","description":"Calzetteria, Calzificio, Calze Uomo, Calze Donna,","tags":["Calzetteria","Calzificio","Calze Uomo","Calze Donna"],"certifications":[],"country":"ITALIA","city":"Melissano","province":"LE","address":"Via G. Rossini, 98, 73040 Melissano LE","contactPerson":"","website":"","emails":["info@calzificiomariani.com"],"phone":"0833 587470","lat":39.973,"lng":18.123},{"id":"cde8a4bf8","name":"Confezioni Chapru srl","category":"Confezioni & Servizi","speciality":"Confezioni","description":"Confezioni Calze e intimo , stiro , e packaging","tags":["Confezioni Calze e intimo","stiro","e packaging"],"certifications":[],"country":"ITALIA","city":"Quinzano D'Oglio","province":"BS","address":"Via Benigno Zaccagnini,5/7","contactPerson":"","website":"","emails":["banay19@gmail.com"],"phone":"3282252573 - 3911498934","lat":45.312,"lng":10.006},{"id":"c04ed7439","name":"Confezione Calze di Lin Chunguang","category":"Confezioni & Servizi","speciality":"Confezioni","description":"Confezioni Calze , packaging","tags":["Confezioni Calze","packaging"],"certifications":[],"country":"ITALIA","city":"Casaloldo","province":"MN","address":"via Gramsci, 9","contactPerson":"","website":"","emails":[],"phone":"3335931286","lat":45.254,"lng":10.474},{"id":"c72901ffe","name":"Rotobel S.n.c.","category":"Packaging & Display","speciality":"Scotch","description":"Nastro adesivo","tags":["Nastro adesivo"],"certifications":[],"country":"ITALIA","city":"S.Martino Buon Albergo","province":"VR","address":"Via Marconi, 4","contactPerson":"","website":"https://www.rotobel.it/it-it/p/56/azienda","emails":["giovanni.colotti@libero.it","giorgia@rotobel.it"],"phone":"045.994436 - 045.994677","lat":45.421,"lng":11.093},{"id":"c27bce996","name":"Artemisia Srl","category":"Abbigliamento & Intimo","speciality":"Abbigliamento","description":"Underwear , Sportwear, Fashionwear","tags":["Underwear","Sportwear","Fashionwear"],"certifications":[],"country":"ITALIA","city":"Castel Goffredo","province":"MN","address":"Via Acquafredda, 14 L/K","contactPerson":"","website":"https://intimoartemisia.com","emails":["info@intimoartemisia.com"],"phone":"0376 771963","lat":45.298,"lng":10.475},{"id":"cd0ebc0aa","name":"CONFEZIONI LUSSO","category":"Calze & Calzetteria","speciality":"calzetteria e seamless","description":"Calze , collant , Underwear , Sportwear","tags":["Calze","collant","Underwear","Sportwear"],"certifications":[],"country":"ITALIA","city":"Castiglione Delle Stiviere","province":"MN","address":"Via Galvani 20","contactPerson":"","website":"https://www.confezionilusso.it/contact","emails":["confezioni.lusso@virgilio.it"],"phone":"0376 672073","lat":45.389,"lng":10.489},{"id":"cf355262a","name":"L.P. di Lazzari I. Pasini M. e figli s.n.c.","category":"Calze & Calzetteria","speciality":"CALZE MODA FANTASIA","description":"calze da uomo e donna in doppio e monocilindro in cotone, lana, misti cashmere, seta e altre lane pregiate, nella finezze 3 / 5 / 6 / e 8.","tags":["calze da uomo e donna in doppio e monocilindro in cotone","lana","misti cashmere","seta e altre lane pregiate","nella finezze 3 / 5 / 6 / e 8."],"certifications":[],"country":"ITALIA","city":"Vallio Terme","province":"BS","address":"Via dei Campi, 5","contactPerson":"","website":"https://lppasini.it","emails":["info@lppasini.it"],"phone":"0365 370025","lat":45.606,"lng":10.399},{"id":"c646c0d68","name":"Calzificio Pedaci","category":"Calze & Calzetteria","speciality":"CALZE SPORT","description":"calze sportive,calze sci,calze da calcio","tags":["calze sportive","calze sci","calze da calcio"],"certifications":[],"country":"ITALIA","city":"Acquarica Del Capo","province":"LE","address":"Via Pedaci, 37","contactPerson":"","website":"https://www.pedaci.com/calze","emails":["antoniopedaci@pedaci.com"],"phone":"0833 721479 - 0833 722550","lat":39.913,"lng":18.243},{"id":"c4c08454d","name":"Ciesse Casuals Abbigliamento srl (Shelsham trading Representative Italy office)","category":"Abbigliamento & Intimo","speciality":"Abbigliamento Sport","description":"menswear, womenswear and childrenswear in both woven and knits.","tags":["menswear","womenswear and childrenswear in both woven and knits."],"certifications":[],"country":"ITALIA","city":"Prato","province":"PO","address":"Via Valentini 13, 59100 Prato - Italy","contactPerson":"","website":"https://www.ciessecasuals.it/index.html","emails":["cerbai@ciessecasuals.it"],"phone":"0574 - 96.43.50","lat":43.879,"lng":11.097},{"id":"c5b98b087","name":"FILMAR","category":"Filati","speciality":"FILATI COTONIERI","description":"COTONE , FILOSCOZIA , MISCHIE","tags":["COTONE","FILOSCOZIA","MISCHIE"],"certifications":[],"country":"ITALIA","city":"Zocco","province":"BS","address":"Via A. De Gasperi 65 - 25030","contactPerson":"","website":"https://www.filmar.it","emails":[],"phone":"030 776700","lat":45.581,"lng":9.955},{"id":"cd65f853b","name":"SINA FILATI FASHION YARN s.r.l.","category":"Filati","speciality":"FILATI FASHION","description":"COTONE, FANTASIA , NYLON , TECNICI , ECC","tags":["COTONE","FANTASIA","NYLON","TECNICI","ECC"],"certifications":[],"country":"ITALIA","city":"Castiglione D. Stiviere","province":"MN","address":"Via A. Volta, 29 - 46043","contactPerson":"","website":"https://www.sinafilati.com/index.html","emails":[],"phone":"0376 1888328","lat":45.389,"lng":10.489},{"id":"cee5a3d8b","name":"CREAFIL INTERNATIONAL SRL","category":"Filati","speciality":"FILATI FASHION","description":"Chenille yarns","tags":["Chenille yarns"],"certifications":[],"country":"ITALIA","city":"Montale","province":"PT","address":"Via Guido Rossa 45/G - 51037","contactPerson":"","website":"https://www.creafilinternational.it","emails":[],"phone":"0573 558237","lat":43.934,"lng":11.02},{"id":"c8f67755c","name":"ALPES MANIFATTURA ILATI S.p.A.","category":"Filati","speciality":"FILATI FASHION","description":"Lanieri , acrillico , cotoni","tags":["Lanieri","acrillico","cotoni"],"certifications":[],"country":"ITALIA","city":"Rossano Veneto","province":"VI","address":"Via Salute, 52 - 36028","contactPerson":"","website":"https://www.alpesfilati.com","emails":["alpes@alpesfilati.com"],"phone":"0424/54420","lat":45.703,"lng":11.799},{"id":"cc2f44a03","name":"COFIL","category":"Filati","speciality":"FILATI FASHION","description":"acrillico , lane , cotoni","tags":["acrillico","lane","cotoni"],"certifications":[],"country":"ITALIA","city":"Montemurlo","province":"PO","address":"Via dell’Artigianato, 5/7/9 - 59013","contactPerson":"","website":"https://www.filaticofil.com","emails":[],"phone":"0574 650704","lat":43.926,"lng":11.037},{"id":"c6fd517e2","name":"Ilaria Manifatture Lane S.r.l.","category":"Filati","speciality":"FILATI LANIERI","description":"LANE , MOHAIR (RMS) , FASHION GENERALE","tags":["LANE","MOHAIR (RMS)","FASHION GENERALE"],"certifications":["RMS"],"country":"ITALIA","city":"Calenzano","province":"FI","address":"Via Paganelle - 50041","contactPerson":"","website":"https://www.ilaria.it/it","emails":[],"phone":"055-8876693","lat":43.865,"lng":11.165},{"id":"cccafb11b","name":"AZETA FILATI","category":"Filati","speciality":"FILATI LANIERI","description":"LANE , MOHAIR, BABY CAMMELLO , ALPACA , ECC","tags":["LANE","MOHAIR","BABY CAMMELLO","ALPACA","ECC"],"certifications":[],"country":"ITALIA","city":"Vaiano","province":"PO","address":"via F.lli Buricchi, 15","contactPerson":"","website":"https://www.azetafilati.it/contatti","emails":[],"phone":"0574 988902","lat":43.966,"lng":11.121},{"id":"c2ab24e84","name":"LANIFICIO DELL'OLIVO","category":"Filati","speciality":"FILATI LANIERI","description":"LANE , MOHAIR, Lyocell , ALPACA , ECC","tags":["LANE","MOHAIR","Lyocell","ALPACA","ECC"],"certifications":[],"country":"ITALIA","city":"Campi Bisenzio","province":"FI","address":"Via Fratelli Cervi, 84","contactPerson":"","website":"https://lanificiodellolivo.com/it","emails":[],"phone":"055 898641","lat":43.826,"lng":11.129},{"id":"c0a6d8a40","name":"DAVIFIL","category":"Filati","speciality":"FILATI NATURALI","description":"lino, canapa, juta, il cotone o l’ortica , lana","tags":["lino","canapa","juta","il cotone o l’ortica","lana"],"certifications":[],"country":"ITALIA","city":"Benna","province":"BI","address":"Via Nazario Sauro, 43 - 13871","contactPerson":"","website":"https://www.davifil.it/contatti","emails":[],"phone":"015 2558198","lat":45.514,"lng":8.126},{"id":"cb9528935","name":"EUROLAST s.rl.","category":"Filati","speciality":"FILATI SINTETICI E NATURALI","description":"DRYARN , BORGOLON , MICROLON , CREORA , Lanieri","tags":["DRYARN","BORGOLON","MICROLON","CREORA","Lanieri"],"certifications":[],"country":"ITALIA","city":"Castel Goffredo","province":"MN","address":"Via Svezia, 10","contactPerson":"","website":"https://www.eurolast.it","emails":["sergio.pinotti@eurolast.it"],"phone":"0376 771002","lat":45.298,"lng":10.475},{"id":"c0be7a393","name":"INDUSTRIA ITALIANA FILATI","category":"Filati","speciality":"FILATI FANTASIA","description":"Laniere , cotoni , nylon , seta , ecc","tags":["Laniere","cotoni","nylon","seta","ecc"],"certifications":[],"country":"ITALIA","city":"Prato","province":"PO","address":"Via del Ferro, 137 - 59100","contactPerson":"","website":"https://industriaitalianafilati.it","emails":[],"phone":"0574 64631","lat":43.879,"lng":11.097},{"id":"c9b96885a","name":"Sitip S.p.A.","category":"Filati","speciality":"Filati Tech performance","description":"Filati Tech performance","tags":["Filati Tech performance"],"certifications":[],"country":"ITALIA","city":"Cene","province":"BG","address":"Via Vall’Alta, 13","contactPerson":"","website":"https://sitip.it","emails":["info@sitip.it"],"phone":"035 736511","lat":45.78,"lng":9.831},{"id":"c3fa34d00","name":"Penn Solutions S.r.l.","category":"Tessuti","speciality":"TESSUTI TECH SPORTIVI E MEDICALI","description":"Filati riciclati , Tessuto Grip , Tessuti medicali , Sportivi => 3d e con Grip","tags":["Filati riciclati","Tessuto Grip","Tessuti medicali","Sportivi => 3d e con Grip"],"certifications":["GRS"],"country":"ITALIA","city":"Bregnano","province":"CO","address":"Via Resegone N. 1","contactPerson":"","website":"https://www.pennsolutions.eu","emails":["info@pennsolutions.it"],"phone":"031 77 89 28","lat":45.7,"lng":9.011},{"id":"c47626c23","name":"MONTICOLOR","category":"Filati","speciality":"Filati Cotonieri","description":"Filati Cotonieri","tags":["Filati Cotonieri"],"certifications":[],"country":"ITALIA","city":"Montirone","province":"BS","address":"Via Artigianale, 55","contactPerson":"","website":"https://www.monticolor.com","emails":["commerciale@monticolor.com"],"phone":"030 217 8811","lat":45.446,"lng":10.229},{"id":"cf31e648f","name":"INTERFIL TIP","category":"Filati","speciality":"naturali, artificiali e sintetici","description":"Coex , viscosa , Nylon , Riciclati","tags":["Coex","viscosa","Nylon","Riciclati"],"certifications":["GRS"],"country":"ITALIA","city":"Pieve Porto Morone","province":"PV","address":"Via Ponte Vecchio, 11","contactPerson":"Claudio","website":"https://interfiltp.it","emails":["claudio.malinverno@interfiltp.it"],"phone":"031 88 92 111","lat":45.096,"lng":9.442},{"id":"c78d5c38f","name":"Torcitura Padana Spa","category":"Filati","speciality":"Filati Sintetici e Naturali , Tech","description":"Coex , GRS riciclati , Nylon","tags":["Coex","GRS riciclati","Nylon"],"certifications":["GRS"],"country":"ITALIA","city":"Pieve Porto Morone","province":"PV","address":"Via Ponte Vecchio, 11","contactPerson":"","website":"https://www.torciturapadana.it","emails":[],"phone":"0382 78 035","lat":45.096,"lng":9.442},{"id":"ca2cd5813","name":"SIRMAX / ISOFIL","category":"Filati","speciality":"Filati Sintetici","description":"Polipropilene , poliestere , cotonieri ,","tags":["Polipropilene","poliestere","cotonieri"],"certifications":[],"country":"ITALIA","city":"Cittadella","province":"PD","address":"Viale dell'Artigianato, 42, 35013 Cittadella PD","contactPerson":"","website":"https://www.sirmax.com/it","emails":["info@sirmax.com"],"phone":"049 944 1111","lat":45.649,"lng":11.784},{"id":"c8f58e8fc","name":"PPH „LEGS” Sp. z o.o","category":"Filati","speciality":"FILATI SINTETICI E NATURALI","description":"Polipropilene , cotone , bamboo , poliestere , ecc","tags":["Polipropilene","cotone","bamboo","poliestere","ecc"],"certifications":[],"country":"ITALIA/POLONIA","city":"Aleksandrów Łódzki","province":"PL","address":"Zgierska 48/52, 95-070 Aleksandrów Łódzki","contactPerson":"Alberto Mainetti","website":"https://www.legs.com.pl","emails":["a.mainetti@legs.com.pl"],"phone":"3299853962","lat":51.82,"lng":19.303},{"id":"cd0c34bad","name":"Filtrading S.r.l. , Bosifil","category":"Filati","speciality":"FILATI SINTETICI E NATURALI","description":"Bosifil segue la parte di filati discontinui, Subbifil è l’orditura del gruppo mentre Filtrading segue la parte di filati continui","tags":["Bosifil segue la parte di filati discontinui","Subbifil è l’orditura del gruppo mentre Filtrading segue la parte di filati continui"],"certifications":[],"country":"ITALIA","city":"Cazzano S. Andrea","province":"BG","address":"Via Cav. Pietro Radici, 29 - 24026","contactPerson":"Loris Bosio","website":"http://www.filtrading.it","emails":["info@bosifil.it","info@bosiogroup.com","loris@filtrading.it"],"phone":"035 733 827","lat":45.812,"lng":9.887},{"id":"c73217b15","name":"Polipeli S.p.a.","category":"Filati","speciality":"Filati Lanieri","description":"Baby alpaca, mohair, lane , lino , alpaca , camel , ecc","tags":["Baby alpaca","mohair","lane","lino","alpaca","camel","ecc"],"certifications":[],"country":"ITALIA","city":"Prato","province":"PO","address":"Via del Ferro, 374/1","contactPerson":"Francesca","website":"http://www.polipeli.com","emails":["francesca@polipeli.com"],"phone":"574540923","lat":43.879,"lng":11.097},{"id":"c0e9beb09","name":"Casazza - Rappresentanze filati","category":"Filati","speciality":"Filati per l'industria","description":"Agente per Filati","tags":["Agente per Filati"],"certifications":[],"country":"ITALIA","city":"Aicurzio","province":"MB","address":"Via Albareda , 2","contactPerson":"Alvise Casazza","website":"","emails":["sales@casazzafilati.it"],"phone":"3458778080 - 0396800132","lat":45.638,"lng":9.406},{"id":"cd967c6f8","name":"Maglificio Corno snc","category":"Tessuti","speciality":"TESSUTI HIGH TECH","description":"poliestere, poliammide, polipropilene, carbonio e argento anche in mischia con l’elastomero tessuti tecnici per lo sport","tags":["poliestere","poliammide","polipropilene","carbonio e argento anche in mischia con l’elastomero tessuti tecnici per lo sport"],"certifications":[],"country":"ITALIA","city":"Bernareggio","province":"MB","address":"Via dell'Artiginato, 41","contactPerson":"","website":"http://www.corno.eu","emails":[],"phone":"039 680 02 30","lat":45.649,"lng":9.404},{"id":"c8724f85b","name":"Olmetex S.p.a","category":"Tessuti","speciality":"TESSUTI TECNICI E SOSTENIBILI","description":"waterproof, water-repellent , bioltex, econyl , dynema, cordura, hmpe, tpu, carbon, s teel & kevlar","tags":["waterproof","water-repellent","bioltex","econyl","dynema","cordura","hmpe","tpu"],"certifications":["GRS"],"country":"ITALIA","city":"Olmeda Di Capiago","province":"CO","address":"Via Canturina, 10","contactPerson":"/","website":"https://olmetex.it/tessuti","emails":["info@olmetex.it"],"phone":"031 46 302 11","lat":45.771,"lng":9.113},{"id":"c87012948","name":"Borgini Jersey","category":"Tessuti","speciality":"Tessuti Sportivi , Tessuti Mare , Green","description":"Carbon , silver , micromodal , polipropilene , poliestere, ecc..","tags":["Carbon","silver","micromodal","polipropilene","poliestere","ecc.."],"certifications":[],"country":"ITALIA","city":"Cassina Rizzardi","province":"CO","address":"Via alla Selva 596","contactPerson":"Andrea Lucchina","website":"https://borgini.it","emails":["andrew@borgini.it"],"phone":"337 1135285 031/883311","lat":45.75,"lng":9.031},{"id":"ce0bdc3a1","name":"Filatura Papi Fabio S.p.A.","category":"Filati","speciality":"Filati Lanieri","description":"lane , mischie interessanti , merino , cashmere , ecc","tags":["lane","mischie interessanti","merino","cashmere","ecc"],"certifications":[],"country":"ITALIA","city":"Gaggio Montano (Bo)","province":"BO","address":"Via Vivalle, 193","contactPerson":"","website":"https://www.papifabio.com","emails":["francesca.c@papifabio.com","ufficiotecnico@papifabio.com"],"phone":"0534 30206","lat":44.198,"lng":10.936},{"id":"ced82b511","name":"Filpucci S.p.A.","category":"Filati","speciality":"fili per maglieria alta gamma","description":"Lanieri ,seta , cotone , mohair, viscosa","tags":["Lanieri","seta","cotone","mohair","viscosa"],"certifications":[],"country":"ITALIA","city":"Capalle, Campi Bisenzio","province":"FI","address":"Via dei Tigli, 41","contactPerson":"","website":"https://www.filpucci.it","emails":["filpucci@filpucci.it"],"phone":"055 8969382","lat":43.844,"lng":11.14},{"id":"c43fc5eac","name":"Giorgini Silvano Filati","category":"Filati","speciality":"Filati ciniglia, filati fantasia","description":"Filati ciniglia, filati fantasia","tags":["Filati ciniglia","filati fantasia"],"certifications":[],"country":"ITALIA","city":"Quarrata","province":"PT","address":"Via Bologna, 13","contactPerson":"","website":"https://giorgini.it/prodotti","emails":["info@giorgini.it"],"phone":"0574 79 241","lat":43.848,"lng":10.979},{"id":"c7686af42","name":"Nord Filati - Martinelli Ginetto S.p.A.","category":"Filati","speciality":"Filati ciniglia, filati fantasia , wool","description":"Filati ciniglia, filati fantasia , wool","tags":["Filati ciniglia","filati fantasia","wool"],"certifications":[],"country":"ITALIA","city":"Casnigo","province":"BG","address":"Via Agro del Castello, 38","contactPerson":"","website":"https://www.martinelliginettogroup.it","emails":["info@martinelliginettogroup.it"],"phone":"035 725011","lat":45.812,"lng":9.869},{"id":"c26d69278","name":"Casa del Filato s.r.l.","category":"Filati","speciality":"Filati Lanieri e cotonieri","description":"Lana , angora , Cashmere , cotone ,seta ,viscosa","tags":["Lana","angora","Cashmere","cotone","seta","viscosa"],"certifications":[],"country":"ITALIA","city":"Seano - Carmignano","province":"PO","address":"Via Galilei, 72/74","contactPerson":"","website":"https://www.casadelfilato.com/it/filati","emails":["info@casafilato.it"],"phone":"055 - 8705983","lat":43.836,"lng":11.045},{"id":"ca9361f4b","name":"Maeko Tessuti e Filati Innovativi","category":"Tessuti","speciality":"Tessuti e filati innovativi","description":"Canapa , Rosa , Lyocell , Aloe","tags":["Canapa","Rosa","Lyocell","Aloe"],"certifications":[],"country":"ITALIA","city":"Quaregna Cerreto","province":"BI","address":"Via Nocchette, 24","contactPerson":"","website":"https://maekotessuti.com","emails":["info@maekotessuti.com","export@maekotessuti.com"],"phone":"159061322","lat":45.588,"lng":8.116},{"id":"c77c65901","name":"Tecnofilati S.r.l. - RESISTEX","category":"Filati","speciality":"Filati Tech performance","description":"Grafene , Bioceramico , Carbon , Silver","tags":["Grafene","Bioceramico","Carbon","Silver"],"certifications":[],"country":"ITALIA","city":"Medolago","province":"BG","address":"Via Bergamo 42/44,","contactPerson":"","website":"https://resistex.com/contatti","emails":["sales@tecnofilati.it","monica.alborghetti@tecnofilati.it"],"phone":"356198227","lat":45.67,"lng":9.494},{"id":"c5a234a94","name":"Opera Campi S.r.l.","category":"Tessuti","speciality":"Tessuti in Canapa alta qualità italiana","description":"Canapa e Cashmere , Canapa , ecc","tags":["Canapa e Cashmere","Canapa","ecc"],"certifications":[],"country":"ITALIA","city":"Parma","province":"PR","address":"Strada Traversetolo 73","contactPerson":"","website":"https://operacampi.com/it","emails":[],"phone":"0000000000","lat":44.801,"lng":10.328},{"id":"c9916b0ad","name":"ESSEGOMMA S.p.A","category":"Filati","speciality":"Filati","description":"Filati in Polipropilene","tags":["Filati in Polipropilene"],"certifications":[],"country":"ITALIA","city":"Misinto","province":"MB","address":"Via Don Minzoni 10","contactPerson":"","website":"https://essegomma.com/it/contatti","emails":["info@essegomma.com"],"phone":"02 96329172 - 02 96720068","lat":45.663,"lng":9.083},{"id":"c7c468803","name":"CARVICO S.p.a.","category":"Tessuti","speciality":"Tessuti Beachwear , competition , Tech , Intimo , ecc..","description":"Tessuti Beachwear , competition , Tech , Intimo , Fitness","tags":["Tessuti Beachwear","competition","Tech","Intimo","Fitness"],"certifications":[],"country":"ITALIA","city":"Carvico","province":"BG","address":"Via Don A. Pedrinelli, 96","contactPerson":"","website":"https://www.carvico.com/contatti","emails":["info@carvico.com"],"phone":"35780111","lat":45.708,"lng":9.48},{"id":"c43131bd2","name":"ASPOFIL","category":"Filati","speciality":"Filati","description":"Cotoni Makò, Mercerizzato , seta, poliestere, lurex, acrilici, filanche, fiammati","tags":["Cotoni Makò","Mercerizzato","seta","poliestere","lurex","acrilici","filanche","fiammati"],"certifications":[],"country":"ITALIA","city":"Nigoline","province":"BS","address":"Via G.Pastore, 5","contactPerson":"","website":"http://www.aspofil.it","emails":["info@aspofil.it"],"phone":"030/984378 - 030/9847182","lat":45.634,"lng":9.983},{"id":"c6a37cb00","name":"Hatfil Italy S.r.l.","category":"Filati","speciality":"Filati per rettilinea e circolare","description":"Cotoni , Cotoni Pima , Aegon , Mercerizzato , cotone/seta , cotone/cashmere","tags":["Cotoni","Cotoni Pima","Aegon","Mercerizzato","cotone/seta","cotone/cashmere"],"certifications":[],"country":"ITALIA","city":"Acquafredda","province":"BS","address":"Via Gerani, 17 - 25010","contactPerson":"","website":"https://hatfil.com","emails":["info@hatfil.it"],"phone":"030 658 69 35","lat":45.307,"lng":10.412},{"id":"c911aa193","name":"COATYARN Srl","category":"Filati","speciality":"Filati innovativi","description":"Filati innovativi ricoperti , High-Grip , high abrasion","tags":["Filati innovativi ricoperti","High-Grip","high abrasion"],"certifications":[],"country":"ITALIA","city":"Ospitaletto","province":"BS","address":"Via 1 Maggio traversa 2 , nr. 32","contactPerson":"","website":"https://www.coatyarn.com","emails":["a.pezzoli@coatyarn.com","c.parimbelli@coatyarn.com","c.finazzi@coatyarn.com"],"phone":"351 4110669 - 030 640594","lat":45.555,"lng":10.073},{"id":"c846edb49","name":"Fulgar S.p.A.","category":"Filati","speciality":"Filati in poliammide , Elastan","description":"Lycra , Q-skin , EVO , ecc","tags":["Lycra","Q-skin","EVO","ecc"],"certifications":[],"country":"ITALIA","city":"Castel Goffredo","province":"MN","address":"Strada Casaloldo, 55","contactPerson":"","website":"https://www.fulgar.com/prodotti/55/q-skin-by-fulgar","emails":["info@fulgar.com"],"phone":"0376 779900 - 0376 780850","lat":45.298,"lng":10.475},{"id":"cdc5f7e4e","name":"Aquafil S.p.A.","category":"Filati","speciality":"Filati sintetici in poliammide , polipropilene","description":"produzione di poliammide 6 e 6.6 e di Dryarn® , ECONYL® , Borgolon & Microlon","tags":["produzione di poliammide 6 e 6.6 e di Dryarn®","ECONYL®","Borgolon & Microlon"],"certifications":["GRS"],"country":"ITALIA","city":"Arco","province":"TN","address":"via Linfano, 9","contactPerson":"","website":"https://www.aquafil.com/it/contatti","emails":["info@aquafil.com","pec.aquafil@aquafil.legalmail.it"],"phone":"0464 581111 - 0464 532267","lat":45.918,"lng":10.885},{"id":"c30450493","name":"Emilcotoni SPA","category":"Filati","speciality":"Filati Cotonieri","description":"Sea Island , Ecopima , Lino , Pima","tags":["Sea Island","Ecopima","Lino","Pima"],"certifications":[],"country":"ITALIA","city":"Piacenza","province":"PC","address":"Viale della Industria, 12,","contactPerson":"","website":"https://www.emilcotoni.it/contatti","emails":["info@emilcotoni.it"],"phone":".0523.60.69.13","lat":45.052,"lng":9.693},{"id":"cf3aff4eb","name":"Pozzi Electa SPA","category":"Filati","speciality":"Filati Naturali , Artificiali , Sintetici","description":"Cammello , YAK , Crabyon , Modal Micro , Ottone , Kuralon","tags":["Cammello","YAK","Crabyon","Modal Micro","Ottone","Kuralon"],"certifications":[],"country":"ITALIA","city":"Milano","province":"MI","address":"Viale Renato Serra, 6","contactPerson":"","website":"https://www.pozzielecta.it/contatti","emails":["pozzielecta@pozzielecta.it"],"phone":"02.33.000.125","lat":45.464,"lng":9.19},{"id":"cd3b95544","name":"GI.TI.BI. Filati srl","category":"Filati","speciality":"Filatii Fantasia","description":"Filatii Fantasia","tags":[],"certifications":[],"country":"ITALIA","city":"Montemurlo","province":"PO","address":"Via Oglio 11,","contactPerson":"","website":"https://www.gitibi.it/contatti.php?lang=ita","emails":["europe@gitibi.it"],"phone":"0574 62.41.41","lat":43.926,"lng":11.037},{"id":"c24379182","name":"Fil-3 S.r.l.","category":"Filati","speciality":"Filatii Fantasia","description":"Cardati, Lane British, Lane Pettinati, Raw e Lane Vintage , puro lino, al lino tencel, filati di alta qualità","tags":["Cardati","Lane British","Lane Pettinati","Raw e Lane Vintage","puro lino","al lino tencel","filati di alta qualità"],"certifications":[],"country":"ITALIA","city":"Montemurlo","province":"PO","address":"Viale Antonio Labriola, 227","contactPerson":"","website":"https://fil3.it/it/primavera-estate-27","emails":["info@fil3.it"],"phone":"0574 652911 - 0574 653358 - 392 1003036","lat":43.926,"lng":11.037},{"id":"c45345be3","name":"Elasten Srl","category":"Filati","speciality":"Filati Elasticizzati","description":"Lavora con elastomero nudo, ricoperto oppure senza elastomero qualsiasi tipo di materiale: lino, ramie, canapa, cotone, viscosa, seta,lana e mistilana, openend, pettinati, cardati, ciniglia, open-end, pettinato, cardato, nylon, poliestere, kevlar, cordura, zylon, dynema,fibre ad alta tenacita’ ecc.)","tags":["Lavora con elastomero nudo","ricoperto oppure senza elastomero qualsiasi tipo di materiale: lino","ramie","canapa","cotone","viscosa","seta","lana e mistilana"],"certifications":[],"country":"ITALIA","city":"Prato","province":"PO","address":"Via Lungo il Ficarello, 18","contactPerson":"","website":"https://www.elasten.it/it/#contatti","emails":["info@elasten.it"],"phone":"0574 663022","lat":43.879,"lng":11.097},{"id":"c11b255c4","name":"Manifattura Italiana Cucirini Spa","category":"Stampa & Ricamo","speciality":"Filati Cucirini","description":"PER CUCITO, MAGLIERIA, RICAMO E APPLICAZIONI TECNICHE","tags":["PER CUCITO","MAGLIERIA","RICAMO E APPLICAZIONI TECNICHE"],"certifications":[],"country":"ITALIA","city":"Vallese","province":"VR","address":"Via R. Spineta, 61","contactPerson":"","website":"https://www.micspa.com/contatti","emails":[],"phone":"045 7134725","lat":45.353,"lng":11.114}];

const CATEGORIES = [
  "Filati",
  "Tessuti",
  "Calze & Calzetteria",
  "Abbigliamento & Intimo",
  "Stampa & Ricamo",
  "Confezioni & Servizi",
  "Packaging & Display",
  "Macchinari",
];

const FAIRS = [
  { id: "f1", name: "Pitti Filati", city: "Firenze", focus: "Filati per maglieria" },
  { id: "f2", name: "Milano Unica", city: "Milano", focus: "Tessuti e accessori" },
  { id: "f3", name: "Filo", city: "Milano", focus: "Filati per tessitura" },
];

const CERT_LABELS = {
  GRS: "Global Recycled Standard",
  RWS: "Responsible Wool Standard",
  RMS: "Responsible Mohair Standard",
};

const MARQUEE = ["LINEN", "MERINO", "GRS RECYCLED", "CASHMERE", "HEMP", "SEAMLESS", "MOHAIR", "JACQUARD", "ECONYL", "PIMA COTTON", "CHENILLE", "LYOCELL", "TECH YARNS", "MADE IN ITALY"];

/* ---------- AI-ready query interpreter (MVP: keyword matching) ---------- */
const MATERIAL_HINTS = ["lino", "linen", "canapa", "hemp", "cotone", "cotton", "lana", "wool", "seta", "silk", "cashmere", "mohair", "alpaca", "viscosa", "nylon", "poliestere", "polipropilene", "riciclat", "recycled", "econyl", "dryarn", "lyocell", "bamboo", "grafene", "merino"];
const CATEGORY_HINTS = [
  [["filat", "yarn", "filo "], "Filati"],
  [["tessut", "jersey", "fabric"], "Tessuti"],
  [["calze", "calzett", "hosiery", "socks"], "Calze & Calzetteria"],
  [["intimo", "underwear", "abbigliament", "leggings", "pigiam"], "Abbigliamento & Intimo"],
  [["stampa", "ricam", "serigraf", "sublimat", "print", "embroider"], "Stampa & Ricamo"],
  [["confezion", "stiro"], "Confezioni & Servizi"],
  [["scatol", "espositor", "packaging", "appendin", "etichett"], "Packaging & Display"],
  [["macchin", "machine"], "Macchinari"],
];

function interpretQuery(q) {
  const t = q.toLowerCase();
  let category = null;
  for (const [hints, cat] of CATEGORY_HINTS) {
    if (hints.some((h) => t.includes(h))) { category = cat; break; }
  }
  const materials = MATERIAL_HINTS.filter((m) => t.includes(m));
  const keywords = t.split(/[\s,]+/).filter((w) => w.length > 2);
  return { category, materials, keywords };
}

function searchCompanies(query, activeCategory) {
  const intent = query ? interpretQuery(query) : { category: null, materials: [], keywords: [] };
  const cat = activeCategory || intent.category;
  return COMPANIES.filter((c) => {
    if (cat && c.category !== cat) return false;
    if (!query) return true;
    const hay = (c.name + " " + c.speciality + " " + c.description + " " + c.tags.join(" ") + " " + c.city + " " + c.certifications.join(" ")).toLowerCase();
    const kws = intent.keywords;
    if (kws.length === 0) return true;
    return kws.some((k) => hay.includes(k)) || intent.materials.some((m) => hay.includes(m));
  });
}

/* ---------- Mock products from real tags ---------- */
const SWATCHES = [
  "linear-gradient(135deg,#E9E2D2,#CDBFA4)",
  "linear-gradient(135deg,#E2D6C6,#B99B79)",
  "linear-gradient(135deg,#EDE8DC,#C9C2AE)",
  "linear-gradient(135deg,#E6DDD3,#A98B6C)",
  "linear-gradient(135deg,#EFEAE0,#D6C4A8)",
  "linear-gradient(135deg,#E4DCCB,#8F6B47)",
];
function mockProducts(c) {
  return c.tags.slice(0, 4).map((t, i) => ({
    id: c.id + "-p" + i,
    name: t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
    moq: "Su richiesta",
    swatch: SWATCHES[(t.length + i) % SWATCHES.length],
  }));
}

/* ---------- SVG fallback map (usata solo se Leaflet non carica) ---------- */
const MAP = { latMax: 47.3, latMin: 36.4, lngMin: 6.4, lngMax: 18.8, w: 400, h: 540 };
const px = (lng) => ((lng - MAP.lngMin) / (MAP.lngMax - MAP.lngMin)) * MAP.w;
const py = (lat) => ((MAP.latMax - lat) / (MAP.latMax - MAP.latMin)) * MAP.h;
const inItaly = (c) => c.lat >= MAP.latMin && c.lat <= MAP.latMax && c.lng >= MAP.lngMin && c.lng <= MAP.lngMax;
const ITALY = [[45.9,6.8],[46.4,8.0],[46.5,9.3],[46.9,10.5],[47.0,12.2],[46.6,13.7],[45.6,13.8],[45.4,12.5],[44.8,12.4],[44.2,12.6],[43.6,13.6],[42.5,14.3],[42.0,15.0],[41.9,16.2],[41.4,16.1],[41.1,17.0],[40.5,18.0],[40.1,18.5],[39.8,18.4],[40.0,18.0],[40.3,17.4],[40.5,16.8],[39.9,16.6],[39.0,17.2],[38.9,16.6],[37.9,16.1],[38.3,15.8],[38.9,16.2],[40.0,15.6],[40.6,14.8],[41.2,13.0],[41.9,12.2],[42.4,11.2],[43.0,10.5],[43.6,10.3],[44.1,9.8],[44.4,8.9],[43.9,8.0],[43.8,7.5],[44.4,7.0],[45.1,6.7]];
const SICILY = [[38.2,12.4],[38.3,13.4],[38.1,15.5],[37.5,15.1],[36.7,15.1],[37.1,13.3],[37.6,12.5]];
const SARDINIA = [[41.2,9.2],[40.9,9.7],[39.2,9.6],[38.9,8.9],[38.9,8.4],[40.3,8.3],[41.0,8.2],[41.2,8.9]];
const toPath = (pts) => "M" + pts.map(([la, lo]) => px(lo).toFixed(1) + " " + py(la).toFixed(1)).join(" L") + " Z";

/* ============================================================ */

export default function TexaApp() {
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [rfqOpen, setRfqOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [rfqSent, setRfqSent] = useState(false);

  const results = useMemo(() => searchCompanies(query, activeCategory), [query, activeCategory]);
  const company = useMemo(() => COMPANIES.find((c) => c.id === selectedId) || null, [selectedId]);
  const intent = useMemo(() => (query ? interpretQuery(query) : null), [query]);

  useEffect(() => { window.scrollTo(0, 0); }, [view, selectedId]);

  const goSearch = (q, cat = null) => { setQuery(q || ""); setInput(q || ""); setActiveCategory(cat); setView("results"); };
  const openCompany = (id) => { setSelectedId(id); setView("company"); setRfqSent(false); setContactOpen(false); };
  const submitRfq = (form) => {
    setRfqs((p) => [...p, { id: "rfq" + Date.now(), companyId: company.id, ...form, createdAt: new Date().toISOString(), status: "inviata" }]);
    setRfqOpen(false); setRfqSent(true);
  };

  return (
    <div className="texa">
      <Style />
      <Grain />
      <header className="hdr">
        <button className="logo" onClick={() => { setView("home"); setActiveCategory(null); setQuery(""); setInput(""); }}>TEXA</button>
        {rfqs.length > 0 && <span className="rfq-pill">{rfqs.length} RFQ</span>}
      </header>

      {view === "home" && <Home onSearch={goSearch} onCategory={(c) => goSearch("", c)} />}
      {view === "results" && (
        <Results
          input={input} setInput={setInput}
          onSubmit={() => { setQuery(input); setActiveCategory(null); }}
          results={results} intent={intent}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          hoveredId={hoveredId} setHoveredId={setHoveredId}
          onOpen={openCompany}
        />
      )}
      {view === "company" && company && (
        <CompanyPage c={company} onBack={() => setView("results")} onRfq={() => setRfqOpen(true)}
          contactOpen={contactOpen} setContactOpen={setContactOpen} rfqSent={rfqSent} />
      )}
      {rfqOpen && company && <RfqModal c={company} onClose={() => setRfqOpen(false)} onSubmit={submitRfq} />}

      <footer className="foot">
        <div className="foot-giant" aria-hidden="true">TEXA</div>
        <div className="foot-row">
          <span>Textile Network & Marketplace</span>
          <span>{COMPANIES.length} suppliers · Made in Italy</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Grain overlay ---------------- */
function Grain() {
  return (
    <svg className="grain" aria-hidden="true">
      <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" /></filter>
      <rect width="100%" height="100%" filter="url(#n)" />
    </svg>
  );
}

/* ---------------- Home ---------------- */
function Home({ onSearch, onCategory }) {
  const [q, setQ] = useState("");
  return (
    <main>
      <section className="hero">
        <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Textile network & marketplace</p>
        <h1 className="mega">
          <span className="line l1">Search less.</span>
          <span className="line l2 hollow">Source better.</span>
        </h1>
        <form className="searchbar" onSubmit={(e) => { e.preventDefault(); onSearch(q); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Linen yarn, seamless, GRS recycled…" aria-label="Search" />
          <button type="submit">Search →</button>
        </form>
        <p className="hint">
          <button className="hint-link" onClick={() => onSearch("filati di lino")}>filati di lino</button>
          <button className="hint-link" onClick={() => onSearch("calze sportive")}>calze sportive</button>
          <button className="hint-link" onClick={() => onSearch("recycled GRS")}>recycled GRS</button>
        </p>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((w, i) => <span key={i}>{w}<em>✦</em></span>)}
        </div>
      </div>

      <section className="index">
        <div className="index-head">
          <h2>Index</h2>
          <span className="index-sub">{COMPANIES.length} fornitori verificati</span>
        </div>
        {CATEGORIES.map((cat) => {
          const n = COMPANIES.filter((x) => x.category === cat).length;
          return (
            <button key={cat} className="row" onClick={() => onCategory(cat)}>
              <span className="row-name">{cat}</span>
              <span className="row-dots" aria-hidden="true" />
              <span className="row-n">{n}</span>
              <span className="row-arrow" aria-hidden="true">↗</span>
            </button>
          );
        })}
      </section>

      <section className="fairs">
        <h2>Fiere</h2>
        <div className="fair-row">
          {FAIRS.map((f) => (
            <div key={f.id} className="fair-card">
              <span className="fair-name">{f.name}</span>
              <span className="fair-meta">{f.city} — {f.focus}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ---------------- Results ---------------- */
function Results({ input, setInput, onSubmit, results, intent, activeCategory, setActiveCategory, hoveredId, setHoveredId, onOpen }) {
  const abroad = results.filter((c) => !inItaly(c));
  return (
    <main className="res">
      <form className="searchbar compact" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Linen yarn, seamless, GRS recycled…" aria-label="Search" />
        <button type="submit">Search →</button>
      </form>

      <div className="chips" role="tablist" aria-label="Categorie">
        <button className={"chip" + (!activeCategory ? " on" : "")} onClick={() => setActiveCategory(null)}>Tutte</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={"chip" + (activeCategory === c ? " on" : "")} onClick={() => setActiveCategory(activeCategory === c ? null : c)}>{c}</button>
        ))}
      </div>

      {intent && (intent.category || intent.materials.length > 0) && (
        <p className="ai-note">
          <span className="ai-dot" aria-hidden="true" />
          Ricerca interpretata{intent.materials.length > 0 && <> — materiali: <strong>{intent.materials.join(", ")}</strong></>}{intent.category && !activeCategory && <> — categoria: <strong>{intent.category}</strong></>}
        </p>
      )}

      <div className="res-grid">
        <div className="res-list">
          <p className="res-count">{results.length} risultat{results.length === 1 ? "o" : "i"}</p>
          {results.length === 0 && (
            <div className="empty">
              <p>Nessuna azienda trovata.</p>
              <p className="empty-sub">Prova con un materiale ("lino", "cotone") o una lavorazione ("ricamo", "stampa").</p>
            </div>
          )}
          {results.map((c) => (
            <article key={c.id}
              className={"card" + (hoveredId === c.id ? " hl" : "")}
              onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)}
              onClick={() => onOpen(c.id)} tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onOpen(c.id)}>
              <div className="card-top">
                <h3>{c.name}</h3>
                <span className="card-arrow" aria-hidden="true">↗</span>
              </div>
              <p className="card-desc">{c.description}</p>
              <div className="card-meta">
                <span className="pill">{c.category}</span>
                <span className="loc">{c.city}{c.province === "PL" ? " · PL" : c.province ? " (" + c.province + ")" : ""}</span>
                {c.certifications.map((cert) => <span key={cert} className="cert" title={CERT_LABELS[cert] || cert}>{cert}</span>)}
              </div>
            </article>
          ))}
        </div>

        <aside className="res-map">
          <LiveMap companies={results.filter(inItaly)} hoveredId={hoveredId} setHoveredId={setHoveredId} onOpen={onOpen} />
          {abroad.length > 0 && <p className="abroad">+{abroad.length} partner estero ({abroad.map((c) => c.city).join(", ")})</p>}
        </aside>
      </div>
    </main>
  );
}

/* ---------------- Mappa reale (Leaflet + OpenStreetMap/CARTO) ---------------- */
function LiveMap({ companies, hoveredId, setHoveredId, onOpen }) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markersRef = useRef({});
  const [status, setStatus] = useState("loading"); // loading | ready | failed

  useEffect(() => {
    let dead = false;
    const init = () => {
      if (dead || !boxRef.current || mapRef.current || !window.L) return;
      const L = window.L;
      const map = L.map(boxRef.current, { scrollWheelZoom: false, attributionControl: true });
      map.setView([43.4, 11.5], 5);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap · © CARTO", subdomains: "abcd", maxZoom: 18,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setStatus("ready");
      setTimeout(() => map.invalidateSize(), 150);
    };
    if (window.L) { init(); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload = init;
    s.onerror = () => setStatus("failed");
    document.head.appendChild(s);
    const t = setTimeout(() => { if (!window.L) setStatus("failed"); }, 7000);
    return () => { dead = true; clearTimeout(t); if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // markers
  useEffect(() => {
    const L = window.L;
    if (status !== "ready" || !L || !layerRef.current) return;
    layerRef.current.clearLayers();
    markersRef.current = {};
    companies.forEach((c) => {
      const icon = L.divIcon({ className: "", html: '<div class="lpin"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
      const m = L.marker([c.lat, c.lng], { icon }).addTo(layerRef.current);
      m.bindTooltip(c.name, { direction: "top", offset: [0, -8], className: "ltip" });
      m.on("click", () => onOpen(c.id));
      m.on("mouseover", () => setHoveredId(c.id));
      m.on("mouseout", () => setHoveredId(null));
      markersRef.current[c.id] = m;
    });
    if (companies.length > 0) {
      const b = L.latLngBounds(companies.map((c) => [c.lat, c.lng]));
      mapRef.current.fitBounds(b.pad(0.18), { maxZoom: 9 });
    }
  }, [status, companies]);

  // hover sync (list → map)
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, m]) => {
      const el = m.getElement && m.getElement();
      if (!el) return;
      const dot = el.querySelector(".lpin");
      if (dot) dot.classList.toggle("on", id === hoveredId);
    });
  }, [hoveredId, status, companies]);

  if (status === "failed") return <FallbackMap companies={companies} hoveredId={hoveredId} setHoveredId={setHoveredId} onOpen={onOpen} />;
  return (
    <div className="mapwrap">
      <div ref={boxRef} className="leaflet-box" />
      {status === "loading" && <div className="map-loading">Caricamento mappa…</div>}
    </div>
  );
}

function FallbackMap({ companies, hoveredId, setHoveredId, onOpen }) {
  return (
    <div className="mapwrap">
      <svg viewBox={"0 0 " + MAP.w + " " + MAP.h} className="svgmap" role="img" aria-label={"Mappa con " + companies.length + " aziende"}>
        <path d={toPath(ITALY)} fill="#EFE9DB" stroke="#D9D0BC" strokeWidth="1.2" strokeLinejoin="round" />
        <path d={toPath(SICILY)} fill="#EFE9DB" stroke="#D9D0BC" strokeWidth="1.2" />
        <path d={toPath(SARDINIA)} fill="#EFE9DB" stroke="#D9D0BC" strokeWidth="1.2" />
        {companies.map((c) => {
          const on = hoveredId === c.id;
          return (
            <g key={c.id} className="pin" transform={"translate(" + px(c.lng).toFixed(1) + "," + py(c.lat).toFixed(1) + ")"}
              onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)} onClick={() => onOpen(c.id)}>
              <circle r={on ? 10 : 7} fill={on ? "var(--tan)" : "rgba(20,19,16,.1)"} />
              <circle r={on ? 4.4 : 3.2} fill={on ? "#fff" : "var(--ink)"} stroke={on ? "var(--ink)" : "#fff"} strokeWidth="1.4" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- Company page ---------------- */
function CompanyPage({ c, onBack, onRfq, contactOpen, setContactOpen, rfqSent }) {
  const products = mockProducts(c);
  const initials = c.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <main className="co">
      <button className="back" onClick={onBack}>← Risultati</button>
      <div className="co-hero">
        <div className="mono" aria-hidden="true">{initials}</div>
        <div className="co-id">
          <span className="pill">{c.category}</span>
          <h1>{c.name}</h1>
          <p className="co-loc">{c.address ? c.address + ", " : ""}{c.city} {c.province && "(" + c.province + ")"} · {c.country}</p>
        </div>
        <div className="co-cta">
          <button className="btn primary" onClick={() => setContactOpen(!contactOpen)}>Contatta</button>
          <button className="btn" onClick={onRfq}>Richiedi preventivo</button>
        </div>
      </div>

      {rfqSent && <div className="ok">Richiesta inviata a {c.name}. Riceverai risposta all'email indicata.</div>}

      {contactOpen && (
        <div className="contact-panel">
          {c.contactPerson && <p><span className="k">Referente</span>{c.contactPerson}</p>}
          {c.emails.length > 0 && <p><span className="k">Email</span>{c.emails.map((e) => <a key={e} href={"mailto:" + e}>{e}</a>)}</p>}
          {c.phone && <p><span className="k">Tel</span><a href={"tel:" + c.phone.replace(/[^\d+]/g, "")}>{c.phone}</a></p>}
          {c.website && <p><span className="k">Sito</span><a href={c.website} target="_blank" rel="noreferrer">{c.website.replace(/^https?:\/\//, "")}</a></p>}
          {c.emails.length === 0 && !c.phone && !c.website && <p>Contatto disponibile tramite richiesta di preventivo.</p>}
        </div>
      )}

      <section className="co-sec">
        <h2>Specializzazione</h2>
        <p className="co-desc">{c.description}</p>
        <div className="tagrow">{c.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      </section>

      {c.certifications.length > 0 && (
        <section className="co-sec">
          <h2>Certificazioni</h2>
          <div className="tagrow">
            {c.certifications.map((cert) => (
              <span key={cert} className="cert big">{cert}<small>{CERT_LABELS[cert] || ""}</small></span>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="co-sec">
          <h2>Prodotti</h2>
          <div className="prods">
            {products.map((p) => (
              <div key={p.id} className="prod">
                <div className="prod-swatch" style={{ background: p.swatch }} aria-hidden="true" />
                <span className="prod-name">{p.name}</span>
                <span className="prod-meta">MOQ {p.moq}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

/* ---------------- RFQ modal ---------------- */
function RfqModal({ c, onClose, onSubmit }) {
  const [form, setForm] = useState({ product: "", quantity: "", message: "", contactName: "", contactEmail: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.product && form.contactName && form.contactEmail.includes("@");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Richiedi preventivo">
        <div className="modal-top">
          <h3>Richiedi preventivo</h3>
          <button className="x" onClick={onClose} aria-label="Chiudi">✕</button>
        </div>
        <p className="modal-sub">a {c.name} · {c.city}</p>
        <label>Prodotto o materiale<input value={form.product} onChange={set("product")} placeholder="Es. filato di lino Nm 12" /></label>
        <label>Quantità indicativa<input value={form.quantity} onChange={set("quantity")} placeholder="Es. 500 kg / 1.000 paia" /></label>
        <label>Messaggio<textarea rows="3" value={form.message} onChange={set("message")} placeholder="Descrivi la tua esigenza…" /></label>
        <div className="two">
          <label>Il tuo nome<input value={form.contactName} onChange={set("contactName")} placeholder="Nome e cognome" /></label>
          <label>La tua email<input type="email" value={form.contactEmail} onChange={set("contactEmail")} placeholder="nome@azienda.it" /></label>
        </div>
        <button className="btn primary wide" disabled={!valid} onClick={() => onSubmit(form)}>Invia richiesta →</button>
      </div>
    </div>
  );
}

/* ---------------- Styles ---------------- */
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
      :root{
        --panna:#F4EFE4; --card:#FBF8F1; --ink:#161511; --muted:#77705F;
        --tan:#9C6B3D; --tan-soft:#EFE3D3; --line:#DDD4C0;
      }
      *{box-sizing:border-box;margin:0}
      ::selection{background:var(--tan);color:var(--panna)}
      .texa{min-height:100vh;background:var(--panna);color:var(--ink);
        font-family:'Inter',-apple-system,sans-serif;font-size:15px;line-height:1.55;
        -webkit-font-smoothing:antialiased;position:relative;overflow-x:hidden}
      button{font-family:inherit;cursor:pointer}
      a{color:var(--tan);text-decoration:none}
      a:hover{text-decoration:underline}
      :focus-visible{outline:2px solid var(--tan);outline-offset:2px;border-radius:4px}
      h1,h2,h3,.logo,.btn,.chip,.row-name,.foot-giant{font-family:'Space Grotesk',sans-serif}

      .grain{position:fixed;inset:0;width:100%;height:100%;opacity:.05;pointer-events:none;z-index:1;mix-blend-mode:multiply}
      main,header,footer{position:relative;z-index:2}

      /* header */
      .hdr{display:flex;justify-content:space-between;align-items:center;
        padding:20px clamp(20px,5vw,64px);position:sticky;top:0;z-index:30;
        background:rgba(244,239,228,.82);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
      .logo{background:none;border:none;font-weight:700;font-size:21px;letter-spacing:.22em;color:var(--ink)}
      .rfq-pill{font-size:12px;font-weight:600;letter-spacing:.06em;color:var(--panna);background:var(--ink);
        padding:6px 13px;border-radius:100px}

      /* hero */
      .hero{max-width:1000px;margin:0 auto;padding:clamp(52px,9vh,104px) clamp(20px,5vw,64px) 44px;text-align:left}
      .eyebrow{font-size:12px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;
        color:var(--muted);margin-bottom:22px;display:flex;align-items:center;gap:10px}
      .tick{display:inline-block;color:var(--tan);animation:spin 9s linear infinite;font-size:14px}
      @keyframes spin{to{transform:rotate(360deg)}}
      .mega{font-size:clamp(46px,9.4vw,116px);font-weight:700;letter-spacing:-.045em;
        line-height:.98;text-transform:uppercase}
      .mega .line{display:block;animation:rise .7s cubic-bezier(.2,.8,.2,1) both}
      .mega .l2{animation-delay:.12s}
      .hollow{color:transparent;-webkit-text-stroke:2.5px var(--tan)}
      @media(max-width:600px){.hollow{-webkit-text-stroke:1.6px var(--tan)}}
      @keyframes rise{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}

      /* search */
      .searchbar{display:flex;align-items:stretch;max-width:620px;margin:40px 0 0;
        background:var(--card);border:2px solid var(--ink);border-radius:16px;overflow:hidden;
        transition:box-shadow .2s,transform .2s;animation:rise .7s .22s cubic-bezier(.2,.8,.2,1) both}
      .searchbar:focus-within{box-shadow:6px 6px 0 var(--tan);transform:translate(-2px,-2px)}
      .searchbar input{flex:1;border:none;background:none;font:inherit;font-size:16px;
        color:var(--ink);outline:none;padding:16px 20px;min-width:0}
      .searchbar input::placeholder{color:#A79E8A}
      .searchbar button{background:var(--ink);color:var(--panna);border:none;
        padding:0 26px;font-weight:600;font-size:15px;letter-spacing:.02em;transition:background .2s}
      .searchbar button:hover{background:var(--tan)}
      .searchbar.compact{margin:6px auto 0;max-width:100%;animation:none}
      .hint{margin-top:16px;font-size:13.5px;color:var(--muted);display:flex;gap:10px;flex-wrap:wrap;
        animation:rise .7s .3s both}
      .hint-link{background:none;border:1.5px solid var(--line);border-radius:100px;
        font:inherit;font-size:13px;color:var(--ink);padding:6px 14px;transition:all .15s}
      .hint-link:hover{border-color:var(--ink);background:var(--ink);color:var(--panna)}

      /* marquee */
      .marquee{border-top:2px solid var(--ink);border-bottom:2px solid var(--ink);
        overflow:hidden;padding:13px 0;background:var(--panna)}
      .marquee-track{display:flex;gap:0;width:max-content;animation:scroll 30s linear infinite}
      .marquee:hover .marquee-track{animation-play-state:paused}
      .marquee-track span{font-family:'Space Grotesk';font-weight:600;font-size:15px;
        letter-spacing:.18em;white-space:nowrap;display:flex;align-items:center}
      .marquee-track em{font-style:normal;color:var(--tan);margin:0 22px;font-size:12px}
      @keyframes scroll{to{transform:translateX(-50%)}}

      /* index */
      .index{max-width:1000px;margin:0 auto;padding:56px clamp(20px,5vw,64px) 8px}
      .index-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px}
      .index h2,.fairs h2{font-size:12.5px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:var(--muted)}
      .index-sub{font-size:13px;color:var(--muted)}
      .row{display:flex;align-items:center;gap:16px;width:100%;text-align:left;
        background:none;border:none;border-top:1.5px solid var(--line);
        padding:20px 8px;transition:padding .2s, background .2s, color .2s}
      .row:last-of-type{border-bottom:1.5px solid var(--line)}
      .row-name{font-size:clamp(19px,2.8vw,27px);font-weight:600;letter-spacing:-.02em;color:var(--ink);
        transition:color .2s}
      .row-dots{flex:1;border-bottom:2px dotted var(--line);transform:translateY(4px)}
      .row-n{font-family:'Space Grotesk';font-weight:600;font-size:15px;color:var(--muted)}
      .row-arrow{font-size:19px;color:var(--tan);transform:translate(0,0);transition:transform .2s}
      .row:hover{background:var(--ink);padding-left:20px;padding-right:20px}
      .row:hover .row-name{color:var(--panna)}
      .row:hover .row-n{color:var(--tan)}
      .row:hover .row-arrow{transform:translate(4px,-4px)}

      /* fairs */
      .fairs{max-width:1000px;margin:0 auto;padding:52px clamp(20px,5vw,64px) 72px}
      .fair-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:16px}
      .fair-card{background:var(--card);border:1.5px solid var(--line);border-radius:14px;
        padding:20px;display:flex;flex-direction:column;gap:4px;transition:all .18s}
      .fair-card:hover{border-color:var(--ink);transform:translateY(-3px);box-shadow:5px 5px 0 var(--tan-soft)}
      .fair-name{font-family:'Space Grotesk';font-weight:600;font-size:17px;letter-spacing:-.01em}
      .fair-meta{font-size:13.5px;color:var(--muted)}

      /* results */
      .res{padding:22px clamp(20px,5vw,64px) 64px;max-width:1280px;margin:0 auto}
      .chips{display:flex;gap:8px;overflow-x:auto;padding:16px 0 4px;scrollbar-width:none}
      .chips::-webkit-scrollbar{display:none}
      .chip{white-space:nowrap;background:none;border:1.5px solid var(--line);
        border-radius:100px;padding:7px 16px;font-size:13px;font-weight:500;color:var(--ink);transition:all .15s}
      .chip:hover{border-color:var(--ink)}
      .chip.on{background:var(--ink);border-color:var(--ink);color:var(--panna)}
      .ai-note{display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--muted);margin-top:10px}
      .ai-dot{width:7px;height:7px;border-radius:50%;background:var(--tan);box-shadow:0 0 0 4px var(--tan-soft);flex:none}
      .res-grid{display:grid;grid-template-columns:1fr 420px;gap:26px;margin-top:20px;align-items:start}
      .res-count{font-size:13px;color:var(--muted);margin-bottom:12px}
      .res-list{display:flex;flex-direction:column;gap:12px}
      .card{background:var(--card);border:1.5px solid var(--line);border-radius:16px;
        padding:18px 20px;cursor:pointer;transition:all .16s}
      .card:hover,.card.hl{border-color:var(--ink);transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--tan)}
      .card-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
      .card h3{font-size:17px;font-weight:600;letter-spacing:-.015em}
      .card-arrow{color:var(--tan);font-size:17px;opacity:0;transform:translate(-4px,4px);transition:all .18s}
      .card:hover .card-arrow,.card.hl .card-arrow{opacity:1;transform:translate(0,0)}
      .card-desc{font-size:13.5px;color:var(--muted);margin-top:6px;display:-webkit-box;
        -webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .card-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:13px;font-size:12.5px}
      .pill{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
        color:var(--tan);border:1.4px solid var(--tan);padding:4px 10px;border-radius:100px;white-space:nowrap}
      .loc{color:var(--ink);font-weight:500}
      .cert{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--panna);
        background:var(--ink);padding:4px 9px;border-radius:6px}
      .empty{background:var(--card);border:1.5px dashed var(--line);border-radius:16px;padding:36px 24px;text-align:center}
      .empty-sub{font-size:13.5px;color:var(--muted);margin-top:6px}

      /* map */
      .res-map{position:sticky;top:92px}
      .mapwrap{background:var(--card);border:2px solid var(--ink);border-radius:18px;
        overflow:hidden;position:relative}
      .leaflet-box{width:100%;height:520px}
      .svgmap{display:block;width:100%;height:auto}
      .pin{cursor:pointer}
      .map-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        font-size:13px;color:var(--muted);background:var(--card)}
      .lpin{width:14px;height:14px;border-radius:50%;background:var(--ink);border:2.5px solid var(--panna);
        box-shadow:0 0 0 1.5px var(--ink);transition:all .15s;cursor:pointer}
      .lpin.on{background:var(--tan);transform:scale(1.5);box-shadow:0 0 0 1.5px var(--tan)}
      .ltip{font-family:'Inter';font-size:12px;font-weight:600;background:var(--ink)!important;
        color:var(--panna)!important;border:none!important;border-radius:8px!important;
        box-shadow:none!important;padding:5px 10px!important}
      .ltip::before{display:none}
      .abroad{font-size:12.5px;color:var(--muted);margin-top:10px;padding:0 4px}

      /* company */
      .co{padding:24px clamp(20px,5vw,64px) 72px;max-width:900px;margin:0 auto;animation:rise .4s ease both}
      .back{background:none;border:none;font-size:14px;font-weight:500;color:var(--muted);padding:6px 0;margin-bottom:14px}
      .back:hover{color:var(--tan)}
      .co-hero{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
      .mono{width:74px;height:74px;flex:none;border-radius:16px;background:var(--ink);color:var(--panna);
        display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk';
        font-weight:700;font-size:25px;letter-spacing:.04em}
      .co-id{flex:1;min-width:230px}
      .co-id h1{font-size:clamp(25px,3.8vw,36px);font-weight:700;letter-spacing:-.03em;margin:10px 0 6px;text-transform:uppercase}
      .co-loc{font-size:13.5px;color:var(--muted)}
      .co-cta{display:flex;gap:10px;flex-wrap:wrap}
      .btn{border:2px solid var(--ink);background:var(--card);color:var(--ink);border-radius:100px;
        padding:12px 24px;font-weight:600;font-size:14.5px;transition:all .15s}
      .btn:hover{transform:translate(-2px,-2px);box-shadow:4px 4px 0 var(--tan)}
      .btn.primary{background:var(--ink);color:var(--panna)}
      .btn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
      .btn.wide{width:100%;margin-top:6px;border-radius:14px}
      .ok{margin-top:20px;background:var(--tan-soft);border:1.5px solid var(--tan);color:var(--ink);
        border-radius:12px;padding:14px 18px;font-size:14px;font-weight:500}
      .contact-panel{margin-top:20px;background:var(--card);border:1.5px solid var(--line);
        border-radius:16px;padding:20px 22px;display:flex;flex-direction:column;gap:10px;font-size:14.5px}
      .contact-panel .k{display:inline-block;width:86px;font-size:11px;font-weight:600;
        letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
      .contact-panel a{margin-right:14px;word-break:break-all}
      .co-sec{margin-top:44px}
      .co-sec h2{font-size:12.5px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;
        color:var(--muted);margin-bottom:14px}
      .co-desc{font-size:15.5px;max-width:640px}
      .tagrow{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
      .tag{font-size:13px;font-weight:500;background:none;border:1.5px solid var(--line);
        padding:6px 14px;border-radius:100px;color:var(--ink)}
      .cert.big{display:inline-flex;flex-direction:column;gap:2px;font-size:13px;padding:12px 16px;border-radius:12px}
      .cert.big small{font-size:11px;font-weight:500;letter-spacing:0;text-transform:none;color:#C9C2B0}
      .prods{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
      .prod{background:var(--card);border:1.5px solid var(--line);border-radius:14px;overflow:hidden;
        display:flex;flex-direction:column;transition:all .16s}
      .prod:hover{border-color:var(--ink);transform:translate(-2px,-2px);box-shadow:4px 4px 0 var(--tan-soft)}
      .prod-swatch{height:86px}
      .prod-name{font-size:13.5px;font-weight:600;padding:10px 12px 2px;letter-spacing:-.01em}
      .prod-meta{font-size:11.5px;color:var(--muted);padding:0 12px 12px}

      /* modal */
      .overlay{position:fixed;inset:0;background:rgba(22,21,17,.45);backdrop-filter:blur(4px);
        display:flex;align-items:center;justify-content:center;padding:20px;z-index:50;animation:fade .2s ease}
      @keyframes fade{from{opacity:0}}
      .modal{background:var(--panna);border:2px solid var(--ink);border-radius:20px;padding:26px;
        width:100%;max-width:440px;max-height:90vh;overflow-y:auto;
        box-shadow:8px 8px 0 var(--tan);animation:rise .3s ease}
      .modal-top{display:flex;justify-content:space-between;align-items:center}
      .modal h3{font-size:20px;font-weight:700;letter-spacing:-.02em;text-transform:uppercase}
      .x{background:none;border:none;font-size:15px;color:var(--muted);padding:6px}
      .modal-sub{font-size:13.5px;color:var(--muted);margin:2px 0 18px}
      .modal label{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:600;
        color:var(--muted);margin-bottom:14px;letter-spacing:.08em;text-transform:uppercase}
      .modal input,.modal textarea{border:1.5px solid var(--line);border-radius:12px;background:var(--card);
        padding:11px 14px;font:inherit;font-size:14.5px;font-weight:400;color:var(--ink);outline:none;
        transition:border-color .15s;resize:vertical;text-transform:none;letter-spacing:0}
      .modal input:focus,.modal textarea:focus{border-color:var(--ink)}
      .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}

      /* footer */
      .foot{border-top:2px solid var(--ink);background:var(--ink);color:#B7AF9C;overflow:hidden}
      .foot-giant{font-size:clamp(90px,22vw,300px);font-weight:700;letter-spacing:.04em;line-height:.78;
        color:transparent;-webkit-text-stroke:1.5px #4A463C;text-align:center;
        transform:translateY(14%);user-select:none}
      .foot-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;
        padding:18px clamp(20px,5vw,64px) 22px;font-size:12.5px;border-top:1px solid #33302A}

      /* responsive */
      @media(max-width:920px){
        .res-grid{grid-template-columns:1fr}
        .res-map{position:static;order:-1}
        .leaflet-box{height:340px}
      }
      @media(max-width:560px){
        .two{grid-template-columns:1fr}
        .searchbar button{padding:0 18px}
      }
      @media(prefers-reduced-motion:reduce){
        *,*::before,*::after{animation:none!important;transition:none!important}
      }
    `}</style>
  );
}
